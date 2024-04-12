import { WithdrawRevenue } from "../database/withdraw";
import { GetBalances } from "../database/balances";
import { AddNewLink, RegisterReferral, GetLinksByOwner, GetRefCount } from "../database/links";

export const ReferralApiDefault = async (req, res) => {

  const postData = req.body;


  if (!postData || !postData.action) {
    res.status(400).send(JSON.stringify({
      error: 'Action is not specified'
    }));
    res.end()
    return;
  }
  
  switch(postData.action) {
     case "CreateLink":
      if (!postData.owner || !postData.reward1 || !postData.reward2) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "newLink",
        result: await AddNewLink(postData.owner, postData.reward1, postData.reward2)
      }));
     break;
     case "RegisterReferral":
      if ( !postData.client || !postData.link ) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "register",
        result: await RegisterReferral ( postData.client, postData.link )
      }));
     break;
     case "GetLinksByOwner":
      if ( !postData.owner ) {
        res.status(400).send(JSON.stringify({
          error: 'Some of required params is missing'
        }));
        res.end()
        return;
      }
      res.status(200).send(JSON.stringify({
        creation: "getLinks",
        result: await GetLinksByOwner ( postData.owner ),
        warn: "Deprecated. Please request from /api/getlinksbyowner/0x1e... as a get param"
      }));
    break;
     default:
        res.status(200).send(JSON.stringify({
          condition: 'Default'
        }));
        res.end()
     break;
  }
}

export const GetLinksByOwnerResponse = async (req, res) => {

  if (!req.params.id) {
    res.status(400).send(JSON.stringify({
      error : "User id is wrong or not specified"
   }));
   return;
  }

  const userId = req.params.id.toLowerCase()
  const links = await GetLinksByOwner ( userId )
   res.status(200).send(JSON.stringify({
      links : links
   }));
}

export const GetOwnerDataResponse = async (req, res) => {

  if (!req.params.id) {
    res.status(400).send(JSON.stringify({
      error : "User id is wrong or not specified"
   }));
   return;
  }

  const userId = req.params.id.toLowerCase()
  const links = await GetLinksByOwner ( userId )
  const balances = await GetBalances ( userId )

  let refCount = 0

  for (let v = 0; v < links.length; v++) {
    const response = await GetRefCount (links[v].link_key)

    refCount += Number(response[0].count)
  }

   res.status(200).send(JSON.stringify({
      links : links,
      refCount: refCount,
      balanceScheduled: balances.balanceSheduled || 0,
      balanceAvailable: balances.balanceAvailable || 0
   }));
}

export const WithdrawRewardAction = async (req, res) => {

  res.setHeader('Access-Control-Request-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

    const postData = req.body;

    if (!postData || !postData.address || !postData.signature) {
      res.status(400).send(JSON.stringify({
        success: false,
        message: 'Post data wrong or not readable'
      }));
      return false
    }
    console.log("Wait for processing")
    const withdrawmsg = await WithdrawRevenue(postData.address, postData.signature)

    res.status(withdrawmsg.success ? 200 : 400).send(JSON.stringify(withdrawmsg));
}