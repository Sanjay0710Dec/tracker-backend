const mongoose = require("mongoose")
const connectToDB = async function(){
  try {
    const isConnected = await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
    console.log("the connection",isConnected.connection.host)
    return isConnected.connection.host;

  } catch (error) {
    console.log("MONGODB Connection FAILED ", error.message);
     throw new Error(error.message);
  }
}

module.exports = connectToDB;