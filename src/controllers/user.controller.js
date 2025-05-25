import { asynchandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadonclodinay } from  "../utils/cloudinary.js"
import {apiResponse} from "../utils/ApiResponse.js"

//4.
const genrateAcessAndRefreshToken=async(userId) =>{
  try {
      const user=await User.findById(userId)
   const accessToken =  user.generrateAccessToken();
  const refreshToken=  user.generrateRefreshToken();
 
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

              //login

    //Rquest body-data
    //username or email-login
    //find the user
    //check tha password
    //acces and refresh token genrate and send user
    //send cookies 
    //res user 
    
    
              // login 

    const loginUser = asynchandler(async (req, res) => {
      
      //1.
      const{email,username,password}=req.body

      if(!username || !email)
      {
        throw new ApiError(400,"Username and email is Required..!")
      }
      
      //2.
       const user= User.findOne({
          $or: [{username}, {email}]
        })
          
        if(!user){
          throw new ApiError(404,"User does not exist..!")
        }

        //3.
       const isPasswordvalid= await user.isPasswordCorrect(password);
       
       if (!isPasswordvalid) {
         throw new ApiError(404, "Invalid Password..!");
       }

       //4.
    const {accessToken,refreshToken}=await genrateAcessAndRefreshToken(user._id)       

    const loggedInUser=User.findById(user._id).select(" -passwors -refreshToken")

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
const logoutUser=asynchandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {
             refreshToken:undefined
            }   
     },
    {
        new:true
     }
     );
    })
     const options = {
        httpOnly: true,
         secure: true,
     };
      
     return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
         new ApiError( 200,{}, "User logOut  Successfully"
         )
       );
  });



export {registerUser,loginUser,logoutUser}