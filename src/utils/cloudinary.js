import { v2  as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});


const uploadclodinay=async (localFilepath)=>{
  try {
     if(!localFilepath) return null
    
     //upload file Method
     const response=await cloudinary.uploader.upload(localFilepath,{
        resource_type:"auto"})

        //file has been uploaded Succesfully !!
        console.log("File Upload SuccesFully !!",response.url)
        return response


  } catch (error) {
    fs.unlinkSync(localFilepath)//remove temp file from server, if filed
    return null
  }
}

export{cloudinary}



