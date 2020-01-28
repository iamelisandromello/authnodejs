const userController = require('../controllers/userController');
const express = require('express');

//Routes
const router = express.Router();
router.get('/', (req, res)=>{
   res.send('Hello World - NodeJs');
});

router.post('/users/login', userController.loginAction);


module.exports = router;