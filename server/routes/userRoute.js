const express = require('express');
const { clerkWebHooks } = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebHooks);

module.exports =userRouter;

