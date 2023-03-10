const express = require('express');
const app = express();

// Allow Cross-Origin Resource Sharing (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Connected');
});

app.post('/api', (req, res) => {
    res.send('Good');
  });

// Start server
const port = 3176;
app.listen(port, () => console.log(`Server running on port ${port}`));