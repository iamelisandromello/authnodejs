const mongoose       = require('mongoose');
const crypto         = require('crypto');
const User           = mongoose.model('User');

const RespostaClass  = require('../classes/responseClass');
const authService    = require('../services/auth-service');
const mailService    = require('../services/mail-service');

//Functions
exports.findUser = async(email, callback) => {
   User.findOne({email}, callback)
}

exports.findId = async(id, callback) => {
   User.findOne({_id:id}, callback)
}

exports.clearLink = async(id) => 
{
   let status = false;
   await User.findOne({_id:id})
   .then(async(user) => {
      user.resetPasswordExpires  = null;
      user.resetPasswordToken    = null;
      await user.save()
      .then(() => {
         console.log('Reset Password Recovery link.');
         status = true;
      })
      .catch(() => {
         console.log('It was not possible to complete the request.');
         status = false;
      });
   })
   .catch((err) => {
      console.log('User not found.');
      status = false;
   });
   console.log('Closed Proccess Clear: ' + status);
   return status;
}

exports.prepareResponse = function(callback, id, msg)
{
   let response = new RespostaClass();
   if(!id){
      response.erro   = true;
      response.msg    = msg;
      callback(
         response
      );
   }
   else {
      User.findOne({_id:id})
      .then((dados) => {
         response.msg      = msg;
         response.dados    = ({
            id    : dados._id,
            name  : dados.name, 
            email : dados.email,
            roles : dados.roles
         });
         callback(
            response
         );
      })
      .catch(() => {
         response.erro   = true;
         response.msg    = "It was not possible to complete the request";
         callback(
            response
         );
      });
   }
}

//Actions
exports.homeAction = async(req, res) => { 
   res.send('Controller User...'); 
}

exports.registerAction = async (req, resp) => 
{
   const newUser  = new User (req.body);
   newUser.roles  =   'user';

   User.register(newUser, req.body.password, async (error, retorno) => {
      if(error) {
         this.prepareResponse(function(resposta) {
            console.log('erro: ', resposta.msg);
            resp.json(resposta);
         }, id = null, "An error has occurred");
      }
      else {
         req.login(retorno, ()=>{});

         const token = await authService.generateToken({
            id    : req.user._id,
            email : req.user.email,
            name  : req.user.name,
            roles : req.user.roles
         });
   
         this.prepareResponse(function(resposta) {
            console.log(resposta.msg);
            resposta.dados['token'] = token;
            resp.json(resposta);
         }, req.user._id, 'Registration successfully Complete.' );         
      }
   });
}

exports.loginAction = async(req, resp) => 
{ 
   const auth = User.authenticate();

   auth(req.body.email, req.body.password, async (error, result) => 
   {
      if(!result) {
         this.prepareResponse(function(resposta) {
            console.log('erro: ', resposta.msg);
            resp.json(resposta);
         }, id = null, "Password or Invalid User");
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

         this.prepareResponse(function(resposta) {
            console.log(resposta.msg);
            resposta.dados['token'] = token;
            resp.json(resposta);
         }, req.user._id, 'Passport Authentication.' );
      }
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
   await this.findUser(req.body.email, async(err, user) => 
   {
      if (err || !user) {
         this.prepareResponse(function(resposta) {
            console.log(resposta.msg);
            resp.json(resposta);
         }, id = null, "User not found");
      }
      else
      {
         user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
         user.resetPasswordExpires = Date.now() + 3600000;//1hora 
         await user.save();

         const resetLink = `http://${req.headers.host}/users/reset/${user.resetPasswordToken}`;
         const text = `Recuperar a senha com link: ${resetLink}`;
         /*const html = `Recuperando a Senha</br>
         Para cadastrar uma nova Senha clique 
         <a href="${resetLink}">
            aqui
         </a>
         `;  */
         const html = `<div style="font-family:&quot;
         Helvetica Neue&quot;
         ,&quot;Roboto&quot;,arial,sans-serif;
         font-size:15px;
         line-height:20px;
         background:#ffffff;
         border-radius:4px;
         padding:20px;
         text-align:left;
         margin-left:10px;margin-right:10px">
            <p style="margin:1em 0;
            font-family:&quot;
            Helvetica Neue&quot;
            ,&quot;Roboto&quot;
            ,arial,sans-serif;
            font-size:15px;
            line-height:20px">
               Dear ${user.name},
            </p>
            <p style="margin:1em 0;
            font-family:&quot;
            Helvetica Neue&quot;
            ,&quot;Roboto&quot;
            ,arial,sans-serif;
            font-size:15px;
            line-height:20px">
               We received a request for your authNodeJs account.
            </p>
            <div style="font-family:&quot;
            Helvetica Neue&quot;
            ,&quot;Roboto&quot;
            ,arial,sans-serif;
            font-size:15px;
            line-height:20px;
            color:#6ab750">
               <a href="${resetLink}" style="color:#6ab750;
               font-weight:bold;
               display:inline-block;
               border-radius:0px;
               text-decoration:none;
               padding:8px 12px;
               text-align:center;
               text-transform:uppercase;
               letter-spacing:1px;
               font-size:9pt;
               border:1px solid #6ab750;
               width:31%">
                  Reset Password
               </a>    
            </div>
            <div style="font-family:&quot;
            Helvetica Neue&quot;
            ,&quot;Roboto&quot;
            ,arial,sans-serif;
            font-size:15px;
            line-height:20px;
            word-wrap:break-word">
               <p style="margin:1em 0;
               font-family:&quot;Helvetica Neue&quot;
               ,&quot;Roboto&quot;
               ,arial,sans-serif;
               font-size:15px;
               line-height:20px">
                  If you ignore this message, your password won't be changed.
               </p>
               <p style="margin:1em 0;
               font-family:&quot;
               Helvetica Neue&quot;
               ,&quot;Roboto&quot;
               ,arial,sans-serif;
               font-size:15px;
               line-height:20px">
                  If you didn't initiate this process, you can safely ignore this message. We take your privacy very
                  seriously at YouVersion. You can review our complete Privacy Policy at 
                     <a href="https://www.auhtnodejs.com/privacy" style="color:#0784c8;
                     word-break:break-all" target="_blank">
                     https://www.authnodejscom/privacy
                  </a>.
               </p>
               <p style="margin:1em 0;
               font-family:&quot;
               Helvetica Neue&quot;
               ,&quot;Roboto&quot;
               ,arial,sans-serif;
               font-size:15px;
               line-height:20px
               ;margin-bottom:0">
                  The authNodeJs Team
               </p>
            </div>
         </div>`;
         mailService.send({
            to:user.email,
            subject:'Resetting Your authNodeJs Password',
            html,
            text
         }).catch(err => console.error(err));

         resposta.msg  = 'We sent you an email with instructions';
         resposta.dados = ({ 
                           link: resetLink
                           });
         resp.json(resposta);
      }
   });
}

exports.recoveryToken = async(req, resp) =>
{
   const user = await  User.findOne({
      resetPasswordToken   : req.params.token,
      resetPasswordExpires : { $gt: Date.now() }
   }).exec();

   if (!user) {
      this.prepareResponse(function(resposta) {
         console.log(resposta.msg);
         resp.json(resposta);
      }, id = null, "Expired link or invalid user");
   }
   else {
      this.prepareResponse(function(resposta) {
         console.log(resposta.msg);
         resp.json(resposta);
      }, user._id, 'Redirect to password change screen' );
   }  
}

exports.recoveryTokenAction = async(req, resp) =>
{
   const user = await  User.findOne({
      resetPasswordToken   : req.params.token,
      resetPasswordExpires : { $gt: Date.now() }
   }).exec();

   if (!user)
   {
      this.prepareResponse(function(resposta) {
         console.log(resposta.msg);
         resp.json(resposta);
      }, id = null, "Expired link or invalid user");
   }
   else if(req.body.password != req.body['password-confirm'])
   {
      this.prepareResponse(function(resposta) {
         console.log(resposta.msg);
         resp.json(resposta);
      }, id = null, "Passwords do not match");
   }
   else
   {
      user.setPassword(req.body.password)
      .then(
         async () => {
            await user.save();
            this.clearLink(user._id)
            .then(() => {
               this.prepareResponse(function(resposta) {
                  console.log(resposta.msg);
                  resp.json(resposta);
               }, user._id, 'Executado teste de callback.' );                   
            })
         }
      )
      .catch(
         () => {
            this.prepareResponse(function(resposta) {
               console.log(resposta.msg);
               resp.json(resposta);
            }, id = null, "Something went wrong'");
         }
      );
   }
}