const mongoose = require('mongoose');

require('dotenv').config({
   path:'variables.env'
});

//DATABASE CONNECTION
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise; //INFORMA AO BD QUE PODE UTILIZAR ECMASCRIPT6 [PROMISSE, ASYNC...]
mongoose.connection.on('error', (error)=>{
   console.error("Erro: " + error.message);
});

const app = require('./app');

app.set('port', process.env.PORT || 9999);   
const server = app.listen(app.get('port'), () => {
   console.log("Run APP Express ata port: " + server.address().port);
});