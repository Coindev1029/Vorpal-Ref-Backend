
Referral cabinet. Using for get the referral link, watching and withdrawing revenue


Deploy:

1. You must have installed PostgreSQL on your server

2. Install dependencies:

   npm install

3. Create .env file in the root folder with content the same as in .env.example (copy & rename)

4. Fill values in .env file (db user, db password etc.)

3. Create required db structure:

   npm run createtables
   
4. Fill nessesary values in recently created table common_data:

   INSERT INTO common_data (key, value) VALUES 
   ('referral_public_key', '0xyourcoinaddress'),
   ('referral_private_key', 0xyourprivatekey);

5. Run tour app:

   npm start

Requests: 

API_URL = https://staging-api.vorpal.finance/

Get:

1. Links: 

 {API_URL}api/getlinksbyowner/{id}, id - ERC20 address

2. User data:

 {API_URL}api/getownerdata/{id}, id - ERC20 address

Post:

3. Create link :

 {API_URL}api, body: 
 {
   action: "CreateLink",
   owner:  '0x123123123123123123123123123123', // ERC20 address
   reward1 : 90,
   reward2: 10  //  reward1,  reward2  - not nessesary but must be not larger than 100 summary if exists
 }

 Displaying only one link per address

4. Register referral

 {API_URL}api, body: 
 {
   action: "RegisterReferral",
   client:  '0x123123123123123123123123123123', // ERC20 address, must not be a link's owner
   link: 'fdlfk3lklk45kl4l3' // Referral link id
 }

5. Withdraw:
 
 {API_URL}api/withdraw, body: 
 {
   address: '0x123123123123123123123123123123', // Link's owner
   signature:  '0x123123123123123123123123123123123123123123', // Row of signed message by owner< wessage: withdraw_{timestamp}
   /* timestamp - 1st second of current hour */
 }
