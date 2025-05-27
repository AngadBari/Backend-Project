import { asynchandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadonclodinay } from  "../utils/cloudinary.js"
import {apiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//4.
const generateAcessAndRefreshToken=async(userId) =>{
  try {
      const user=await User.findById(userId)
   const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
 
  user.refreshToken=refreshToken
  await user.save({validateBeforeSave:false})

  return {accessToken , refreshToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrong genrating Access and Refresh Token..!")
  }
}


  //get user details from frontend
  //validation-not empty
  //check if user already exist:username ,email
  //check for image,check fro avataer
  //upload them cloudinary avataer
  //create user object -create entry in DB
  // remove passowed and refresh token  from responese
  //check for user craetion
  //retrun response

  const registerUser = asynchandler(async (req, res) => {

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
      [fullName, email, username, password].some(
        (fields) => fields?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All Fields are requried..!! ");
    }

    //User already Hai Ya Nahi

    const existUsre = await User.findOne({
      $or: [{ email }, { password }],
    });

    if (existUsre) {
      throw new ApiError(409, "User is already Register..!");
    }

    //Image uploding(Handling...)

    const avatarLocalpath = req.files?.avatar[0]?.path;
    console.log("avatarLocalpath", avatarLocalpath);
    //const coverImageLocalpath = req.files?.coverImage[0]?.path;
    //console.log("coverImageLocalpath", coverImageLocalpath);
    //console.log("req.files:", req.files);
    let coverImageLocalpath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      coverImageLocalpath = req.files.coverImage[0].path;
    }

    if (!avatarLocalpath) {
      throw new ApiError(400, "Avatar file is required..!");
    }

    const avatar = await uploadonclodinay(avatarLocalpath);
    const coverImage = await uploadonclodinay(coverImageLocalpath);

    if (!avatar) {
      throw new ApiError(400, "Avatar file is required..!");
    }

    //Create user Object
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    //Remove password and Refresh Token
    const createdUser = await User.findById(user._id).select(
      " -password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Somethong went wrong while register ..!");
    }

    //response
    return res
      .status(201)
      .json(new apiResponse(200, createdUser, "User Register Successfully..!"));

             
  });
      
      
      //login

    //Rquest body-data
    //username or email-login
    //find the user
    //check tha password
    //acces and refresh token genrate and send user
    //send cookies 
    //res user 
    
    
              // login 

    const logInUser = asynchandler(async (req, res) => {
      
      //1.
      const{email,username,password}=req.body

      if(!username && !email)
      {
        throw new ApiError(400,"Username and email is Required..!")
      }
      
      //2.
       const user= await User.findOne({
          $or: [{username}, {email}]
        })
          
        if(!user){
          throw new ApiError(404,"User does not exist..!")
        }

        //3.
       const isPasswordvalid = await user.isPasswordCorrect(password);
       
       if (!isPasswordvalid) {
         throw new ApiError(404, "Invalid Password..!");
       }

       //4.
    const {accessToken,refreshToken}=await generateAcessAndRefreshToken(user._id)       

    const loggedInUser = await User.findById(user._id).select(
      " -password -refreshToken"
    );

    //5.
    const options={
      httpOnly:true,
      secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiError(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User loggedIn Successfully"
      )
    )

    });


           //logOut
     const logoutUser = asynchandler(async (req, res) => {
          await User.findByIdAndUpdate(
               req.user._id,
               { $set: { refreshToken: undefined } },
               { new: true }
             );

             const options = {
               httpOnly: true,
               secure: true,
             };

       return res
            .status(200)
            .cookie("accessToken", "", { ...options, maxAge: 0 })
            .cookie("refreshToken", "", { ...options, maxAge: 0 })
            .json(new apiResponse(200, {}, "User logged out successfully!"));
           });
    

  //Refresh And Access Token end point 

  const refreshAccessToken=asynchandler(async(req,res )=>{
    const incomingrefreshToken=req.cookies.refreshToken ||req.body.refreshToken

    if(!incomingrefreshToken)
    {
      throw new ApiError(401,"Unauthorized request..!")
    }

   try {
     const decodedToken=jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
 
 
     const user=await User.findById(decodedToken?._id)
     
     if (!user) {
       throw new ApiError(401, "Invaild refreshToken..!");
     }
 
     if (incomingrefreshToken !== user?.refreshToken) {
       throw new ApiError(401, " RefreshToken is Use..!");
  
     }
    
     const options=
     {
       httpOnly:true,
       secure:true
     }
 
    const {accessToken,newrefreshToken}= await generateAcessAndRefreshToken(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken,newrefreshToken)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
       new ApiError(
         200,
         {
           accessToken,newrefreshToken
         },
         "Access Token Refresh"
 
       )
     )
 
   } catch (error) {
    throw new ApiError(401,"Unauthorized request")
   }
  })

  const changeCurrentPassword = asynchandler(async (req, res) => {
    
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
      throw new ApiError(400,"Password is wrong..!")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200,{},"Password Change SucessFully.."))
  });

  const getCurrentUsre=asynchandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,{},"Current User Fetched Successfully"))
  })
  

  const updateAccountDetails=asynchandler(async(req,res)=>{
    const {fullName, email}=req.body

    if(!(fullName || email))
    {
      throw new ApiError(400,"All fields are required.!")
    }
     User.findByIdAndUpdate(
      req.user?._id,
      {
        $set:{
          fullName,
          email:email,


        }
      },
      {
        new:true
      }
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user ,"Account Details update Succesfuly.."))

  })

 const updateUserAvatar=asynchandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  
  if(!avatarLocalPath){
    throw new ApiError(404,"Avatar file is missing")
  }
  const avatar=await uploadonclodinay(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(404,"Avater file is not Upload")

  }
   
  const user=await User.findById(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {
      new:true
    }
  ).select("-password")

  return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar Image Updated SuccesFully"));

 })

 const updateUsercoverImage = asynchandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path;

   if (!coverImageLocalPath) {
     throw new ApiError(404, "CoverImage file is missing");
   }
   const coverImage = await uploadonclodinay(coverImageLocalPath);

   if (!coverImage.url) {
     throw new ApiError(404, "CoverImage file is not Upload");
   }

  const user= await User.findById(
     req.user?._id,
     {
       $set: {
         coverImage: coverImage.url
       },
     },
     {
       new: true,
     }
   ).select("-password");
   return res
     .status(200)
     .json(new apiResponse(200, user, "Cover Image Updated SuccesFully"));
 });

export {
  registerUser,
  logInUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUsre,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
};