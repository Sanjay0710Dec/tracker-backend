const dotenv = require("dotenv");
const serverless = require('serverless-http');
dotenv.config({
    path:".env"
});

const app = require("./src/app");
const connectToDB = require("./src/db/index");


// connectToDB().then(function(){
//     app.listen(process.env.PORT,function(){
//         console.log('running')
//     })
// }).catch(function(error){
//     console.log(error.message)
// })
module.exports.handler = async (event,context) =>{
    try {
        const db = await connectToDB();
        return serverless(app)(event,context);
    } catch (error) {
        return {
            statusCode:500,
            body:JSON.stringify({error:'Internal server error'})
        }
    }
}