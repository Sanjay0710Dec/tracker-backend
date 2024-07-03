const express = require('express');
const { verifySignupPayloadType, doesUserAlreadyExist, verifySignInPayloadType, doUserRegistered, verifyUserExist, authenticateUser, verifyUserPurchasePayload, verifyUpdatePayloadType, verifyOtpToChangePassword } = require('../middleware/user.middleware');
const { registerNewUser, doesUserIsLegit, issueAuthToken, updateUserPasswordByMail, giveSignedURL, registerUserPurchase, getUserPurchases, deleteUser, deleteUserPurchases, deleteUserPurchase, getUserDetails, updatePassword, getUserProfile, getUserMonthlyExpenses, putProfileName } = require('../controllers/user.controller');

const {upload} = require("../middleware/multer.middleware")

const userRouter = express.Router();

userRouter.route('/verifyUser').post(verifySignupPayloadType,doesUserAlreadyExist,doesUserIsLegit)
userRouter.route('/signup').post(registerNewUser);
userRouter.route('/login').post(verifySignInPayloadType,doUserRegistered,issueAuthToken)
userRouter.route('/forgotpass').put(verifyUserExist,doesUserIsLegit);
userRouter.route('/verify-otp').put(verifyOtpToChangePassword);
userRouter.route('/changepass').put(updateUserPasswordByMail);

// Auth routes that user can access only if they are logged in.

userRouter.route('/auth/signedUrl').put(authenticateUser,giveSignedURL);
userRouter.route('/auth/profilename').put(authenticateUser,putProfileName);
userRouter.route('/auth/updatepass').put(authenticateUser,verifyUpdatePayloadType,updatePassword)
userRouter.route('/auth/details').get(authenticateUser,getUserDetails)
userRouter.route('/auth/profile').get(authenticateUser,getUserProfile)
userRouter.route('/auth/delete-account').delete(authenticateUser,deleteUser)
userRouter.route('/auth/purchasedItem').post(authenticateUser,verifyUserPurchasePayload,registerUserPurchase)
userRouter.route('/auth/purchases').get(authenticateUser,getUserPurchases);
userRouter.route('/auth/year-expenses').get(authenticateUser,getUserMonthlyExpenses)
userRouter.route('/auth/delete-all-user-purchases').delete(authenticateUser,deleteUserPurchases)
userRouter.route('/auth/delete-single-user-purchase/:purchaseId').delete(authenticateUser,deleteUserPurchase)



     









module.exports = userRouter