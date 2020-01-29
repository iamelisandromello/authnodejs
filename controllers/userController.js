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
      resposta.dados = ({ id: retorno._id, name: retorno.name,  email: retorno.email, roles: retorno.roles });
      resposta.msg   = "Cadastro efetuado com Sucesso";
      resp.json(resposta); //converte o objeto de retorno em json
   });

}

exports.loginAction = async(req, resp) => { 
   
   let resposta = new RespostaClass();
   const auth = User.authenticate();

   auth(req.body.email, req.body.password, async (error, result) => {
      
      if(!result) {
         resposta.erro   = true;
         resposta.msg    = "Senha ou Usuário Inválidos";
         console.log('erro: ', error);
      }
      else {
         req.login(result, ()=>{});

         resposta.msg  = 'Autenticaçao Realizada pelo Passport';
         resposta.dados = ({ id: req.user._id, name: req.user.name,  email: req.user.email, roles: req.user.roles });
      }
      resp.json(resposta); //converte o objeto de retorno em json
   });

}