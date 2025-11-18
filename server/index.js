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

// Listen only when running locally
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
// app.listen(PORT, (err)=>{
//     if(!err){
//         console.log(`Server is running on ${PORT}`);
//     }
// })

module.exports = app;
