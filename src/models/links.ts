require('dotenv').config();
import { runQuery as Q } from './connection';
import { GenerateLink } from '../generateLink';

function IsWrongString ( arg ) {
  if (!arg) return true
  if (arg.indexOf(";") > -1) return true
  if (arg.indexOf(" ") > -1) return true

  return false
}

// Trying to add an address if it's not exists
async function SetupBalances (owner) {

  if (IsWrongString(owner)) return null
  
  const addOwnerQuery = `INSERT INTO balances (address, balance_scheduled, balance_available, balance_withdrawn)
   VALUES ( '${owner.toLowerCase()}', 0, 0, 0) ON CONFLICT (address) DO NOTHING;`;

  const r = await Q(addOwnerQuery, false);

  return r ? true : false;
}

//New link generation, returns new link
async function AddNewLink ( owner, reward1 = 90, reward2 = 10 ) {
   if (IsWrongString(owner)) return null
   if (typeof(reward1) !== 'number' || typeof(reward2) !== 'number'  || ( reward2 + reward1 > 100)) return null

   const CheckQuery = `select count(*) from referral_owner where address = '${owner}';`;

   const CheckAddrExists = await Q(CheckQuery)

   if (CheckAddrExists && CheckAddrExists[0].count !== '0') {
      return ""
   }

   const newLink = GenerateLink(owner)
   const linkAddQuery = `INSERT INTO referral_owner(address, link_key, value_primary, value_secondary) VALUES('${owner}', '${newLink}', '${reward1}', '${reward2}');`

   await Q(linkAddQuery)

   try {
      SetupBalances (owner)  
   } catch (e) {
     console.log(e.message)
   }

   return newLink
}

//Registering a new referral. Only one referral link to address, 
//returns true is it was registered, false if not
async function RegisterReferral ( address, link ) {

   if( IsWrongString ( address ) || IsWrongString ( link )) return {
      result: false,
      error: "Incorrect entry"
   }
   
   const CheckQuery = `select count(*) from address_to_referral where address = '${address}';`
   const CheckOwnerQuery = `select address from referral_owner where link_key = '${link}';`
   const addQuery = `INSERT INTO address_to_referral(address, link_key) VALUES ('${address}', '${link}');`
   const checkResult = await Q(CheckQuery)
   const checkOwnerResult = await Q(CheckOwnerQuery)

   if (checkOwnerResult && checkOwnerResult[0]) {
     const addr = checkOwnerResult[0].address
     if (addr.toLowerCase() === address.toLowerCase()) {
       return  {
        result: false,
        error: "Link owner cannot add a himself"
       }
     }
   }

   if (checkResult && checkResult[0]) {

     if (checkResult[0].count === '0') {

        const additionResult = await Q(addQuery, false)
        if (additionResult) {
          return {
            result: true,
            error: "",
            message: "Client succseefully registered"
          }
        } else {
          return false
        }
     } else {
       return  {
        result: false,
        error: "Client is already registered"
       }
     }
   } else {
     return {
       result: false,
       error: "Failed to connect with database"
      }
   }

}

async function GetLinksByOwner (owner : string) {

  if (IsWrongString ( owner )) return []
  
   const getterQuery = `SELECT address, link_key, value_primary, value_secondary FROM referral_owner WHERE address = '${owner}';`

   const links = await Q(getterQuery)

   return links || []
}

async function GetRefCount ( link: any ) {
   
   const countQuery = `SELECT COUNT(*) from address_to_referral WHERE link_key = '${link}';`;

   const countRequest = await Q(countQuery)

   return countRequest || [{ count : 0 }]
}

export {
     IsWrongString,
     SetupBalances,
     AddNewLink,
     RegisterReferral,
     GetLinksByOwner,
     GetRefCount
}