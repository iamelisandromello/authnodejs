const mongoose       = require('mongoose');
const crypto         = require('crypto');
const User           = mongoose.model('User');

const RespostaClass  = require('../classes/responseClass');
const authService    = require('../services/auth-service');
const userModel      = require('../models/User');

exports.findUser = async(email, callback) => {
   User.findOne({email}, callback)
}

exports.homeAction = async(req, res) => { 
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
   let resposta = new RespostaClass();
   var token = req.headers['authorization'] || req.body.token || req.query.token || req.headers['x-access-token'];
   token = token.slice(7, token.length);     // Remove Bearer from string   }

   const data = await authService.decodeToken(token);
   const id_user = data.id;

   const result = await User.findOne({ _id: id_user })
   .then(user => {
      if(user)
      {
         console.log("found user");
         return user;
      } else
      {
         console.log("user not found");
         return user;
      }
   }).catch(
      err => console.log("something went wrong")
   );
   if(result == undefined){
      console.log('Id not found');
      resposta.erro   = true;
      resposta.msg    = "Password or Invalid User";
   }
   else
   {
      const newToken = await authService.generateToken({
         id    : result._id,
         email : result.email,
         name  : result.name,
         roles : result.roles
      });
      resposta.msg  = 'Refresh JWT successfully performed';
      resposta.dados = ({ 
                        id: result._id,
                        name: result.name,
                        email: result.email,
                        roles: result.roles,
                        token: newToken 
                        });
   }
   resp.json(resposta);
}

exports.recoveryAction = async(req, resp) =>
{ 
   let resposta = new RespostaClass();
   await this.findUser(req.body.email, async(err, doc) => 
   {
      if (err || !doc) {
         resposta.erro   = true;
         resposta.msg    = "User not found";
      }
      else {
         doc.resetPasswordToken = crypto.randomBytes(20).toString('hex');
         doc.resetPasswordExpires = Date.now() + 360000;//1hora 
         await doc.save();

         const resetLink = `http://${req.headers.host}/users/reset/${doc.resetPasswordToken}`;
         //ToDo: enviar o e-mail

         resposta.msg  = 'We sent you an email with instructions';
         resposta.dados = ({ 
                           link: resetLink
                           });
      }
      resp.json(resposta);
   });   
}

exports.recoveryToken = async(req, resp) =>
{
   let resposta = new RespostaClass();
   const user = await  User.findOne({
      resetPasswordToken   : req.params.token,
      resetPasswordExpires : { $gt: Date.now() }
   }).exec();

   if (!user) {
      resposta.erro   = true;
      resposta.msg    = "Expired link or invalid user";
   }
   else {
      resposta.msg  = 'Redirect to password change screen';
      resposta.dados = ({ 
                        id: 'teste'
                        });
   }

   resp.json(resposta);   
}

exports.recoveryTokenAction = async(req, resp) =>
{
   
   let resposta = new RespostaClass();
   const user = await  User.findOne({
      resetPasswordToken   : req.params.token,
      resetPasswordExpires : { $gt: Date.now() }
   }).exec();

   if (!user)
   {
      resposta.erro   = true;
      resposta.msg    = "Expired link or invalid user";
      console.log('Not User: ' + resposta.msg );
      resp.json(resposta);
   }
   else if(req.body.password != req.body['password-confirm'])
   {
      resposta.erro   = true;
      resposta.msg    = "Passwords do not match";
      console.log('No Match: ' + resposta.msg );
      resp.json(resposta);
   }
   else
   {
      user.setPassword(req.body.password, async ()=>
      {
         resposta.msg   = "Password changed successfully";
         resposta.dados = ({ 
            id    : user._id,
            name  : user.name,
            email : user.email,
            roles : user.roles
         });
         console.log('Success: ' + resposta.msg );
         await user.save();
         resp.json(resposta);
      });  
   }
}