require('dotenv').config({
   path:'variables.env'
});

const app = require('./app');

app.set('port', process.env.PORT || 9999);   
const server = app.listen(app.get('port'), () => {
   console.log("Run APP Express ata port: " + server.address().port);
});