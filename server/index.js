const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const User =require('./models/userModel');
const connectDb = require('./config/dbConnection');
const userRouter = require('./routes/userRoute');

connectDb();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/user', userRouter);


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
