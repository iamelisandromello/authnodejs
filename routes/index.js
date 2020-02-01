const userController = require('../controllers/userController');
const express = require('express');
const authService    = require('../services/auth-service');

//Routes
const router = express.Router();
router.get('/', (req, res)=>{
   res.send('Hello World - NodeJs');
});

router.post('/users/login', userController.loginAction);
router.post('/users/register', userController.registerAction);
router.post('/users/refresh', authService.authorize, userController.refreshAction);
module.exports = router;