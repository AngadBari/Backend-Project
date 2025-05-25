import { asynchandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadonclodinay } from  "../utils/cloudinary.js"
import {apiResponse} from "../utils/ApiResponse.js"


const registerUser=asynchandler(async(req ,res)=>{
  //get user details from frontend
  //validation-not empty
  //check if user already exist:username ,email
  //check for image,check fro avataer
  //upload them cloudinary avataer
  //create user object -create entry in DB
  // remove passowed and refresh token  from responese
  //check for user craetion
  //retrun response

  const { fullName, email, password, username } = req.body;
  console.log("username:", username);

  //all data you give postman or body that display not specfic or
  // console.log("Request body:", req.body);

  // That one method to check validation one by one
  /* if(fullName ==="")
    {
        throw new ApiError(400,"Fullname is requried..!")
    }*/

  // That one method to validtion at Oneces

  if (
    [fullName , email , username , password].some((fields)=>fields?.trim() ==="")
  ) {
    throw new ApiError(400, "All Fields are requried..!! ");
  }

//User already Hai Ya Nahi 

const existUsre=await User.findOne({
    $or:[{ email },{ password }]
})

if(existUsre){
  throw new ApiError(409,"User is already Register..!")
}

//Image uploding(Handling...)

const avatarLocalpath=req.files?.avatar[0]?.path
console.log("avatarLocalpath",avatarLocalpath)
//const coverImageLocalpath = req.files?.coverImage[0]?.path;
//console.log("coverImageLocalpath", coverImageLocalpath);
//console.log("req.files:", req.files);
let coverImageLocalpath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
{
  coverImageLocalpath=req.files.coverImage[0].path
}



if(!avatarLocalpath){
    throw new ApiError(400,"Avatar file is required..!")
}

const avatar =await uploadonclodinay(avatarLocalpath)
const coverImage = await uploadonclodinay(coverImageLocalpath);



if(!avatar){
    throw new ApiError(400, "Avatar file is required..!");
}

//Create user Object
const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url ||"",
    email,
    password,
    username:username.toLowerCase()
})


//Remove password and Refresh Token
 const createdUser = await User.findById(user._id).select(
   " -password -refreshToken"
 );

 if(!createdUser)
 {
    throw new ApiError(500,"Somethong went wrong while register ..!")
 }

 //response
 return res.status(201).json(
    new apiResponse(200,createdUser,"User Register Successfully..!")
 )

})



export {registerUser}