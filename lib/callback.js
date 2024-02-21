const axios = require('axios');
const qs = require('qs');
const mysql = require('mysql');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mask_link'
  });
  
  // Connect to the database
  db.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });

const appConfig = require('../config.json');

async function callback(req, res) {
    //  return res.json({ data: req.query });

    const data = qs.stringify({
        'client_id': appConfig.clientId,
        'client_secret': appConfig.clientSecret,
        'grant_type': 'authorization_code',
        'code': req.query.code,
        'user_type': 'Location',
        'redirect_uri': 'http://localhost:3000/oauth/callback' 
    });
      
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://services.leadconnectorhq.com/oauth/token',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
    };


try {
    const response = await axios.request(config);
    
    // Check if response.data is defined before accessing userId
    const userId = response.data && response.data.userId;
    const access_token = response.data && response.data.access_token;
  
    if (!userId || !access_token) {
      throw new Error('userId or access_token is undefined');
    }
  
    console.log('Received access_token:', access_token);
    console.log('Received userId:', userId);
  
    // Insert or update data into MySQL database
    const sql = `
      INSERT INTO tokens (access_token, user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE access_token = VALUES(access_token)
    `;
    db.query(sql, [access_token, userId], (err, result) => {
      if (err) {
        console.error('Error inserting/updating data into MySQL:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log('Data inserted/updated into MySQL');
      
      if (response.status === 200) {
          // Redirect to your PHP page with the user ID and access token as query parameters
          res.redirect(`http://localhost/auth-test/?userId=${userId}&accessToken=${access_token}`);
      } else {
          // Handle other status codes if needed
          res.status(500).send('Error: Unexpected response status');
      }
    });
  } catch (error) {
    console.error('Error fetching data from external service:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
     
}

module.exports = callback;
