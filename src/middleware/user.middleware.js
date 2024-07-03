const { User } = require("../models/dbSchema");
const { UserSignupType, UserSigninType, UserPurchaseType, UserUpdateType } = require("../models/zodTypes");
const { StatusCodes, storeRegisterBody } = require("../utils");
const CustomErrorResponse = require("../utils/customApiErrorResponse");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const {v4:uuidv4} = require("uuid")


function verifySignupPayloadType(req,_res,next){
   const response = UserSignupType.safeParse(req.body);
   if(response.success){
      next();
   } else{
      throw new CustomErrorResponse(StatusCodes.BAD_REQUEST, response.error.errors[0].message)
   }
}


async function doesUserAlreadyExist(req,_res,next){
    const{username,email} = req.body;
  
 try {
       const doUserExist = await User.findOne({
           '$or':[{username:username},{email:email}]
       });
      if(doUserExist){
         if(doUserExist.username = username){
             next(new CustomErrorResponse(StatusCodes.CONFLICT,'user with specified username alredady exist'))
         }
         else{
            next(new CustomErrorResponse(StatusCodes.CONFLICT,'user with specified email already exist'))
         }
      }
      else{
        next();
      } 
 } catch (error) {
   
    next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, 'something went wrong while verifying,please try after sometime'))
 }
}

function verifySignInPayloadType(req,_res,next){
   const response = UserSigninType.safeParse(req.body);
  if(response.success){
     next()
  }
  else{
   throw new CustomErrorResponse(StatusCodes.BAD_REQUEST,"inputs missing")
  }
}
function verifyUpdatePayloadType(req,_res,next){
   const response = UserUpdateType.safeParse(req.body);
   if(response.success){
      next();
   }
   else{
      throw new CustomErrorResponse(StatusCodes.BAD_REQUEST,response.error.errors[0].message);
   }
}

async function doUserRegistered(req,_res,next){
   const{email,password} = req.body;

   try {
      const response = await User.findOne({
         email:email
      });
   
      if(response){
         const isCorrectPassword = await bcrypt.compare(password,response.password);
         if(isCorrectPassword){
            req.userId = response._id;
            next();
         }

         else{
            next(new CustomErrorResponse(StatusCodes.INVALID,"Invalid password"))
         }
      }

      else{
         next(new CustomErrorResponse(StatusCodes.UNAUTHORIZED,"please Signup"))
      }
   } 
   catch (error) {
      next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong, please try after some time"))
   }
}

async function verifyUserExist(req,res,next){
  const{email} = req.body;

  try {
      if(email){
         const doUserExist =  await User.findOne({
            email:email
         });

            if(doUserExist){
                 next();
            }
            else{
               next(new CustomErrorResponse(StatusCodes.INVALID,"please Signup"))
            }
      }
      else{
         next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"please provide valid email"))   
      }
  } 
  catch (error) {
   next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"Something Went Wrong, please try after some time"))
  } 
}
function verifyOtpToChangePassword(req,res,next){
    const{otp,sec_id} = req.body;
    if(!sec_id){
       next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,'please verify email once again'));
       return;
    }
    const payload = storeRegisterBody.get(sec_id);

    if(!payload){
      next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,'please verify email once again'));
    }
    else{
               if(payload.otp === otp){
                          const specialUserId = uuidv4();
                        
                          storeRegisterBody.set(specialUserId,payload.email);
                          res.status(StatusCodes.OK).json({
                              success:true,
                              data:{
                                  message:'Verified',
                                  sec_id:specialUserId
                              }
                          })
               }
               else{
                    next(new CustomErrorResponse(StatusCodes.INVALID,"Invalid otp, please verify  email once again"));
               }

    }
}
function authenticateUser(req,_res,next){
  
   const {authorization} = req?.headers
  
   
   if(!authorization){
  
      throw new CustomErrorResponse(StatusCodes.UNAUTHORIZED,"please login");
     
   }

   const originalToken = authorization.split(" ")[1];


   const decodePayload = jwt.verify(originalToken,process.env.JWT_SECRET_KEY);
    

   if(decodePayload){
 
         req.userId = decodePayload.userId;
         next();
   }
   else{
       
        throw new CustomErrorResponse(StatusCodes.UNAUTHORIZED,"please login");
   }
 
}
function verifyUserPurchasePayload(req,_res,next){

   const response = UserPurchaseType.safeParse(req.body);
   if(response.success){
      next();
   }
   else{
        next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"missing inputs"))
   }
}
module.exports = {
   verifySignupPayloadType,
    doesUserAlreadyExist,
    verifySignInPayloadType,
    doUserRegistered,
    verifyUserExist,
    verifyOtpToChangePassword,
    authenticateUser,
    verifyUserPurchasePayload,
    verifyUpdatePayloadType
}