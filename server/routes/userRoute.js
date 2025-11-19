<<<<<<< HEAD
const express = require('express');
const { clerkWebHooks } = require('../controllers/userController');
const userRouter = express.Router();

userRouter.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebHooks);

module.exports =userRouter;

=======
const express = require('express');
const { clerkWebHooks, sendSOS } = require('../controllers/userController');
const authUser = require('../middleware/userAuth');
const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebHooks);

userRouter.post('/sos',authUser, sendSOS);

module.exports =userRouter;
>>>>>>> 2f08537 (updating commit)
