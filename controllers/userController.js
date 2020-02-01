const mongoose       = require('mongoose');
const User           = mongoose.model('User');
const RespostaClass  = require('../classes/responseClass');
const authService    = require('../services/auth-service');

exports.loginAction = async(req, res) => { 
   res.send('Controller User...'); 
}

exports.registerAction = async (req, resp) => 
{
   let resposta   = new RespostaClass();
   const newUser  = new User (req.body);
   newUser.roles  =   'user';

   User.register(newUser, req.body.password, async (error, retorno) => {
      if(error) {
         resposta.erro   = true;
         resposta.msg    = "Ocorreu um Erro";
         console.log('erro: ', error);
      }

      req.login(retorno, ()=>{});

      const token = await authService.generateToken({
         id    : req.user._id,
         email : req.user.email,
         name  : req.user.name,
         roles : req.user.roles
      });

      resposta.dados = ({ 
                           id: retorno._id,
                           name: retorno.name,
                           email: retorno.email,
                           roles: retorno.roles,
                           token: token  
                        });
      
      resposta.msg   = "Cadastro efetuado com Sucesso";
      resp.json(resposta); //converte o objeto de retorno em json
   });

}

exports.loginAction = async(req, resp) => 
{ 
   let resposta = new RespostaClass();
   const auth = User.authenticate();

   auth(req.body.email, req.body.password, async (error, result) => 
   {
      if(!result) {
         resposta.erro   = true;
         resposta.msg    = "Senha ou Usuário Inválidos";
         console.log('erro: ', error);
      }
      else
      {
         req.login(result, ()=>{});

         const token = await authService.generateToken({
            id    : req.user._id,
            email : req.user.email,
            name  : req.user.name,
            roles : req.user.roles
         });

         resposta.msg  = 'Autenticaçao Realizada pelo Passport';
         resposta.dados = ({
                              id: req.user._id,
                              name: req.user.name, 
                              email: req.user.email,
                              roles: req.user.roles,
                              token: token  
                           });
      }
      resp.json(resposta); //converte o objeto de retorno em json
   });

}

exports.refreshAction = async(req, resp) =>
{    
   const resposta = new RespostaClass();
   var token = req.headers['authorization'] || req.body.token || req.query.token || req.headers['x-access-token'];
   token = token.slice(7, token.length);     // Remove Bearer from string   }

   const data = await authService.decodeToken(token);
   const id_user = data.id;

   const result = await User.findOne({ _id: id_user })
   .then(user => {
      if(user) {
         console.log("found user");
         return user;
      } else {
         console.log("user not found");
         return user;
      }
   }).catch(
      err => console.log("something went wrong")
   );

   if(result == undefined){
      console.log('Id not found');
   }
   else {
      const newToken = await authService.generateToken({
         id    : result._id,
         email : result.email,
         name  : result.name,
         roles : result.roles
      });
      resposta.msg  = 'Refresh JWT realizado com sucesso';
      resposta.dados = ({ id: result._id, name: result.name, email: result.email, roles: result.roles, token: newToken });
   }
   resp.json(resposta); //converte o objeto de retorno em json
}

