const express = require("express");
const app = express();
const cors = require('cors');
const userRouter = require("./routes/user");
const { StatusCodes } = require("./utils");
const CustomErrorResponse = require("./utils/customApiErrorResponse");


app.use(cors({
    origin:'*',
    credentials:true
}));
app.use(express.json({
    limit:'16kb'
}));

app.use(express.static("public"))

app.get("/", function(req,res){
    res.status(200).json({
        message:'Success'
    })
   

});
app.use('/api/v1/user',userRouter);



app.use("*",function(_req,res){
    res.status(StatusCodes.NOT_FOUND).end("Route Not Found")  

});

app.use(function(error,_req,res,_next){
    
    if(error instanceof CustomErrorResponse){
        res.status(error.statusCode).json({
            success:error.success,
            message:error.message
        })
    }
    else{

          res.status(500).json({
            success:false,
            message:'Internal Server Error',
            message02:error.message
          })
    }
})

module.exports = app