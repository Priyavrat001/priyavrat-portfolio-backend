const mongoose = require('mongoose');
require('dotenv').config()

const url = process.env.MONGO_URL

const connectToMongo = ()=>{
   mongoose.connect(url).then(()=>console.log("MongoDB is connected")).catch(error=>console.log(error))
}

module.exports = connectToMongo;