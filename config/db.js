const mongoose = require('mongoose')
const { db } = require('../models/user')
    const dbConfig = require('./dbconfig')

const connectDB = async() =>{
    try{
        const conn = await mongoose.connect(dbConfig.database)
        console.log('MongoDB Connected: ' + conn.connection.host)

    }
    catch(err){
        console.log(err)
        process.exit(1)
    }
}
module.exports= connectDB 
