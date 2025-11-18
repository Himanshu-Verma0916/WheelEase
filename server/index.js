const express = require('express');
const app = express();
require('dotenv').config();
const User =require('./models/userModel');
const dbConnect = require('./config/dbConnection');

dbConnect();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Server is working perfectly');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
