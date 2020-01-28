const mongoose       = require('mongoose');
const User           = mongoose.model('User');
const RespostaClass  = require('../classes/responseClass'); 

exports.loginAction = async(req, res) => { 
   res.send('Controller User...'); 
}

exports.registerAction = (req, resp) => { 

   let resposta   = new RespostaClass();
   const newUser  = new User (req.body);
   newUser.roles  =   'user';

   User.register(newUser, req.body.password, (error, retorno) => {
      if(error) {
         resposta.erro   = true;
         resposta.msg    = "Ocorreu um Erro";
         console.log('erro: ', error);
      }

      resposta.msg    = "Cadastro efetuado com Sucesso";
      resp.json(resposta); //converte o objeto de retorno em json
   });

}