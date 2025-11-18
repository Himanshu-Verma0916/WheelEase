const express = require('express');
const { clerkWebHooks } = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/webhooks' ,clerkWebHooks );

module.exports =userRouter;
