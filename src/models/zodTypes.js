const z = require("zod");

const UserSignupType = z.object({
    username:z.string().min(6,{message:"Username should be mininmum of 6 Characters"}).trim(),
    email:z.string().email().trim(),
    fullName:z.string().min(6,{message:'fullName should be mininmum of 6 Characters'}),
    password:z
    .string()
    .min(8,{message:"Password must be at least 8 characters long"})
    .refine((password) => /[A-Z]/.test(password),{message:"Password must contain at least 1 Uppercase letter"})
    .refine((password) => /[^a-zA-Z0-9]/.test(password),{message:"Password must contain at least 1 special character"})
    .refine((password) => /\d.*\d/.test(password),{message:"Password must contain 2 numbers"})
    
});
const UserSigninType = z.object({
    email:z.string().min(1),
    password:z.string().min(1)
});

const UserPurchaseType = z.object({
   purchasedItem:z.string().min(2),
   quantity:z.string().min(1),
   price:z.number().min(1),
   category:z.string(),
   dateOfPurchase:z.string().date({message:'date is required'}),
   notes:z.string().optional()
});

const UserUpdateType = z.object({
    password:z
    .string()
    .min(8,{message:"Password must be at least 8 characters long"})
    .refine((password) => /[A-Z]/.test(password),{message:"Password must contain at least 1 Uppercase letter"})
    .refine((password) => /[^a-zA-Z0-9]/.test(password),{message:"Password must contain at least 1 special character"})
    .refine((password) => /\d.*\d/.test(password),{message:"Password must contain 2 numbers"})
    
});

module.exports = {
    UserSignupType,
    UserSigninType,
    UserUpdateType,
    UserPurchaseType
}