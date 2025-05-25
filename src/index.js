//require('dotenv').config({path:'./env'})-->wast way
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import app from "./app.js";

dotenv.config({
    path:'./.env'
})



connectDB()
  .then(() => {
    app.listen(process.env.port || 3001, () => {
      console.log(`Server is running at port ${process.env.port || 3001}...`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Error", err);
  });

//1st Method 
 
/*
import express from "express"
const app =express()

(async()=>{
 try{
     mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
     app.on("error",(error)=>{
        console.log("ERROR:",error)
     })

     app.listen(process.env.port,()=>{
        console.log(`App is listen on port ${process.env.port}`)
     })
 }
 catch(eror){
  console.log("ERROR:",eror)
  throw err
 }

})()*/