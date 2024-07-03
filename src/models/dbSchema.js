const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const UserRegistrationSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        unique:true,  
    },
    fullName:{
        type: String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true,
        enum:['user','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    profileId:{
        type:String,
        required:true,
        default:'no_id'
    }
},{timestamps:true});

const UserPurchaseSchema = new mongoose.Schema({
    purchasedItem:{
        type:String,
        required:true,
    },
    quantity:{
            type:String,
            required:true
        
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    day:{
       type:String,
       required:true
    },
    month:{
        type:String,
        required:true
     },
     year:{
        type:String,
        required:true
     },
    notes:{
        type:String,
         required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
});

UserRegistrationSchema.pre('save', async function(next){

    if(!this.isModified('password')){
        next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword 
     
    } catch (error) {
        next(error)
    }

})


const User = mongoose.model('User',UserRegistrationSchema);
const Purchase = mongoose.model('Purchase',UserPurchaseSchema);

module.exports = {
    User,
    Purchase
}