import mongooes, { Schema } from "mongoose"
import jwt from "jsonwebtoken"//token
import bcrypt from "bcrypt"//Hash Passowrd


const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,//couldinary url
      require: true,
    },
    coverImage:{
        type:String,//couldinary url

    },
    watchHistory:{
         type:mongooes.Schema.Types.ObjectId,
         ref:"Video"
    },
    password:{
        type:String,
        require:[true,'Password is Required !!'],
        unique:true,
    },
    refreshToken:{
         type:String,
    }
  },
  { timestamps }
);


//Hoock 
userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next()
     
    this.password=bcrypt.hash(this.password,10)
    next()
     
})

userSchema.methods.isPasswordCorrect=async function (password) {
  return await  bcrypt.compare(password,this.password)
}//for check password

//JWT Token HOW ACCCESS And Refresh

//1.Access Token...
userSchema.methods.generrateAccessToken=function(){
    jwt.sign(
      {
        //playload
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      }
    );
}

//2.Refresh Token...
userSchema.methods.generrateRefreshToken = function () {
  jwt.sign(
    {
      //playload
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );

};



export const User= mongooes.model("User",userSchema)