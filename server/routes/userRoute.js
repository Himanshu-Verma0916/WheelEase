const express = require('express');
const { clerkWebHooks, sendSOS } = require('../controllers/userController');
const authUser = require('../middleware/userAuth');
const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebHooks);

userRouter.post('/sos',authUser, sendSOS);

module.exports =userRouter;