const { User, Purchase } = require("../models/dbSchema");
const { StatusCodes,  generateOtp, storeRegisterBody } = require("../utils");
const CustomErrorResponse = require("../utils/customApiErrorResponse");
const sendMailToUser = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");
const {getSignedURL,getSignedURLToUpload} = require("../utils/s3GetterSetter");




async function doesUserIsLegit(req,res,next){
    const{email} = req.body
   
    const {randomOtpGenerated,specialUserId} = generateOtp(req.body, req.body.username ? 'registrar':'forgotpass')
    try {
       
     const response = await sendMailToUser(email,randomOtpGenerated);
       console.log(response);
    
        if(response?.rejected?.length == 0){
            
             setTimeout(() =>{
                 
                storeRegisterBody.delete(specialUserId);
             
             },1000*60);  

            res.status(StatusCodes.OK).json({
                success:true,
                data:{
                    message:"Otp sent to your Email Successfully, please verify",
                    sec_id :specialUserId
                }
            });

            

        }
          else{
            next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,`Email Server is not working please send a email to the mailId  specified in the home page`))
          }

    } catch (error) {
        next( new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error.message || "Something Went wrong while verifying, please try again"))
    }
}
async function registerNewUser(req,res,next){
    const{otp,sec_id} = req.body;
    
    if(!sec_id){
        next(new CustomErrorResponse(StatusCodes.INVALID,"Something Went Wront , register once again"));
        return;
       
    }

    const storedBody = storeRegisterBody.get(sec_id);
    if(!storedBody ){
        next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"otp timeOut please register once again "));
        return;
    }

    try {

       if(storedBody?.otp === otp){
            await User.create({
                username:storedBody.username,
                email:storedBody.email,
                fullName:storedBody.fullName,
                password:storedBody.password
            });
             storeRegisterBody.delete(sec_id);
        

            res.status(StatusCodes.CREATED).json({
                success:true,
                data:{
                    message:"Account created Successfully"
                }
            }) 
            
       }
       else{
          next(new CustomErrorResponse(StatusCodes.INVALID,"Invalid otp , please try again"))
       }
    } catch (error) {
     
          next( new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while creating your account, please try again"))
    }
}

function issueAuthToken(req,res,next){
    try {
     
      const token = jwt.sign({userId:req?.userId},process.env.JWT_SECRET_KEY,{expiresIn:process.env.JWT_SECRET_EXPIRY})
    
      res.status(StatusCodes.OK).json({
        success:true,
        data:{
            auth_token : token,
            message:"Logged in Successfully"
        }
      })
      
    } catch (error) {
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"something went wrong while logging in , please try after some time"))
    }
}

async function updateUserPasswordByMail(req,res,next){
    const{sec_id,password} = req.body;

    if(!sec_id){
        next(new CustomErrorResponse(StatusCodes.INVALID,"Something Went Wront , please verify email again"));

        return;
       
    }
    const email = storeRegisterBody.get(sec_id);
    
    if(!email){
        next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"Something gone wrong, please verify email again"));
        return;
    }
  
    try {
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
           
            await User.findOneAndUpdate({
                email:email,
                
            },{password:hashedPassword});

             storeRegisterBody.delete(sec_id);
            res.status(StatusCodes.OK).json({
                success:true,
                data:{
                    message:"Password Updated Successfully"
                }
            }) 
       
    } catch (error) {
        next( new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while processing you request, please try again"))
    }
}
async function updatePassword(req,res,next){
    const userId = req.userId;
    const{password} = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

         await User.findByIdAndUpdate({
            _id:userId
         },{password:hashedPassword});

          res.status(StatusCodes.OK).json({
            success:true,
            data:{
                message:'Password Updated Successfully'
            }
          })
    } catch (error) {
        next( new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while processing you request, please try again"))  
    }
}
async function giveSignedURL(req,res,next){
    const{filename,fileType} = req.body;
 
 
   if(!filename || !fileType){
     next(new CustomErrorResponse(StatusCodes.INVALID,"please upload a file"));
     return;
 
   }
   try {
    
     const signedUrl = await getSignedURLToUpload(filename,fileType);
     if(!signedUrl){
         next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR," not able to upload to file , please try after sometime"));
         return;
     }
        res.status(StatusCodes.OK).json({
         success:true,
         signedUrl:signedUrl
        });
        
 
      
       
   } catch (error) {
       console.log(error.message);
       next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,`something went wrong, while processing your request , try after sometime`))    
   }
   
 }

 async function putProfileName(req,res,next){
    const{filename} = req.body;
    const userId = req.userId;
    try {
           await User.findByIdAndUpdate({_id:userId},{profileId:filename});
           res.status(StatusCodes.OK).json({
            success:true,
            data:{
                message:"profile update Successfully"
            }
           })
    } catch (error) {
           next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"failed to update profile try after sometime"))
    }
}
async function deleteUser(req,res,next){
    const userId = req.userId;
   
    try {
          const doPurchasesExist = await Purchase.findOne({
              userId:userId
          });

          if(doPurchasesExist){
            next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"delete all the purchases in order to delete you account"))
          }
          else{
                    await User.deleteOne({
                        _id:userId
                    });

                    res.status(StatusCodes.OK).json({
                        success:true,
                        data:{
                            message:"Account Deleted Successfully"
                        }
                    })
          }
    } catch (error) {
       
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"something went wrong, while proceeding your request , try after sometime"))    
    }
}

async function getUserDetails(req,res,next){
    const userId = req.userId;
   
    try {
        const userDetails = await User.findById({
            _id:userId
        });
        res.status(StatusCodes.OK).json({
            success:true,
            data:{
                user:{
                    username:userDetails.username,
                    email:userDetails.email,
                    fullName:userDetails.fullName,
                }
            }
        });
    } catch (error) {
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"something went wrong, while proceeding your request , try after sometime"))   
    }
}
async function getUserProfile(req,res,next){
    const userId = req.userId;
    try {
        const userDetails = await User.findById({
            _id:userId
        });
        const signedUrl = await getSignedURL(userDetails.profileId);
        if(!signedUrl){
            next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,'not able to fetch the profile at this time, please try after some time'));
            return;
        }
        res.status(StatusCodes.OK).json({
            success:true,
             data:{
                user:{
                    profileUrl:signedUrl
                }
             }
        }) 
    } catch (error) {
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"something went wrong, while proceeding your request , try after sometime"))   
    }
}
// Purchase starts here..
async function registerUserPurchase(req,res,next){
    const{purchasedItem,quantity,price,category,dateOfPurchase,notes} = req.body;
    const userId = req.userId;
  
    
    try {
        const splitDateOfPurchase = dateOfPurchase.split("-");
        let modifiedMonth;
         if(Number(splitDateOfPurchase[1]) < 10){
            modifiedMonth = Number(splitDateOfPurchase[1].split('')[1]) - 1;

         }
         else{
            modifiedMonth = Number(splitDateOfPurchase[1]) - 1;
         }
        await Purchase.create({
              purchasedItem:purchasedItem,
              quantity:quantity,
              price:price,
              category:category,
              day:splitDateOfPurchase[2],
              month:modifiedMonth, 
              year:splitDateOfPurchase[0],
              notes:notes ? notes : 'Nothing',
              userId:userId,
            
        })
  
        res.status(StatusCodes.CREATED).json({
             success:true,
             data:{
                message:'Expense Added SuccessFully'
             }
        })
    } catch (error) {
        console.log(error.message)
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR,"something went wrong while processing your request, please try after sometime"))
    }

}

async function  getUserPurchases(req,res,next){
    const{toget,month,year,offset} = req.query;
    const userId = req.userId;
    try {
        const aggregationPipeline = [
            {
                $match:{
                    userId:new mongoose.Types.ObjectId(userId),
                  
                }
            },
            {
                $match:{
                     month:month,
                     year:year
                }
            },
            {
                $sort:{
                    day:1
                }
            },
            {
                $skip: offset * 10
            },
            {
                $limit:10
            },
            {
                $project:{userId:0,__v:0}
            }
        ]
         if(toget !== 'all'){
            aggregationPipeline.splice(1,0,{
                $match:{
                    category:toget
                }
            })
         }
        const userPurchases  =  await Purchase.aggregate(aggregationPipeline);
    
              res.status(StatusCodes.OK).json({
                success:true,
                data:{
                    userPurchases:userPurchases
                }
              });
     
        
    } catch (error) {
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while proceeding your request, please try after some time"))
    }
}
async function getUserMonthlyExpenses(req,res,next){
    const {year} = req.query;
 
    const userId = req.userId;
    if(!year){
        next(new CustomErrorResponse(StatusCodes.BAD_REQUEST,"unable to proceed with your request , Inputs Missing"));
        return ;
    }

   try {
        const aggregationPipeline = [
            {
               $match:{
                userId:new mongoose.Types.ObjectId(userId),
                year:year
               } 
            },
             
            {
                $group:{
                    _id:'$month',
                    expenses:{
                        $sum:'$price'
                    }
                }
            },
            {
                $sort:{
                    _id:1
                }
            }

        ]
       const expensesOfUserMonthlyWise = await Purchase.aggregate(aggregationPipeline);
     
       res.status(StatusCodes.OK).json({
          success:true,
          data:{
              YearExpenses:expensesOfUserMonthlyWise

          }
       })
   } 
   catch (error) {

    next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while proceeding your request, please try after some time"))
   }
}
async function deleteUserPurchases(req,res,next){
    const userId = req.userId;
    try {
           await Purchase.deleteMany({
             userId:userId
           });
           res.status(StatusCodes.OK).json({
            success:true,
               data:{
                  message:"purchases deleted successfully"
               }
           })
    } catch (error) {
         
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while proceeding your request, please try after some time"))   
    }
}
async function deleteUserPurchase(req,res,next){
      const {purchaseId} = req.params

    try {
           await Purchase.findByIdAndDelete({
              _id:purchaseId
           });
           res.status(StatusCodes.OK).json({
            success:true,
               data:{
                  message:"purchasedItem deleted successfully"
               }
           })
    } catch (error) {
         
        next(new CustomErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "something went wrong while proceeding your request, please try after some time"))   
    }
}


module.exports = {
    registerNewUser,
    doesUserIsLegit,
    issueAuthToken,
    updateUserPasswordByMail,
    updatePassword,
    deleteUser,
    giveSignedURL,
    putProfileName,
    registerUserPurchase,
    getUserPurchases,
    getUserMonthlyExpenses,
    deleteUserPurchases,
    deleteUserPurchase,
    getUserDetails,
    getUserProfile
}