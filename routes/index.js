const express = require('express');

//Routes
const router = express.Router();
router.get('/', (req, res)=>{
   res.send('Hello World - NodeJs');
});

router.get('/login', (req, res)=>{
   res.send('Página de Login');
});
module.exports = router;