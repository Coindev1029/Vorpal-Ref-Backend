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

