const {v4:uuidv4} = require("uuid")
const otpGenerator = require("otp-generator")
const StatusCodes = {
    OK:200,
    BAD_REQUEST:400,
    CONFLICT:409,
    NOT_FOUND:404,
    UNAUTHORIZED:401,
    FORBIDDEN:403,
    CREATED:201,
    INTERNAL_SERVER_ERROR:500,
    INVALID:411

}

const storeRegisterBody = new Map();

function generateOtp(payload,type){
    
    const randomOtpGenerated = otpGenerator.generate(6,{upperCaseAlphabets:false,specialChars:false, lowerCaseAlphabets:false});

    const specialUserId = uuidv4();

      if(type === 'registrar'){
        storeRegisterBody.set(specialUserId,{username:payload.username,email:payload.email,password:payload.password,fullName:payload.fullName,otp:randomOtpGenerated});
      }
      else{
      
        storeRegisterBody.set(specialUserId,{email:payload.email,otp:randomOtpGenerated})
      }

   

    return{randomOtpGenerated,specialUserId}
}

module.exports = {
    StatusCodes,
    storeRegisterBody,
    generateOtp
}