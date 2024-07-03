const nodemailer = require("nodemailer");
const{google} = require("googleapis")

async function sendMailToUser(email,randomOtpGenerated){
     // SETTING UP GOOGLE API
     const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID,process.env.OAUTH_CLIENT_SECRET,process.env.OAUTH_REDIRECT_URI);
     oAuth2Client.setCredentials({refresh_token:process.env.OAUTH_REFRESH_TOKEN});

   try {
    
    const access_token = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            type:'OAuth2',
            user:process.env.AUTHOR_MAIL,
            clientId:process.env.OAUTH_CLIENT_ID,
            clientSecret:process.env.OAUTH_CLIENT_SECRET,
            refreshToken:process.env.OAUTH_REFRESH_TOKEN,
            accessToken:access_token
        }
    });
    const mailOptions = {
        from:process.env.AUTHOR_MAIL,
        to:email,
        subject:'One-time Verification Code',
        text:`verify your Identity`,
        html:`<strong style='padding:20px; font-size:16px ; box-shadow: 2px 2px 2px red ; width:100px ; height:100px'><h2>Your OTP is ${randomOtpGenerated}</h2><p>Do not share this OTP with anyone</p></strong>`
    }
    const response = await transporter.sendMail(mailOptions);
   
    return response;
   } catch (error) {
      return error
   }
}
module.exports = sendMailToUser