import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET_KEY 
});

const uploadOnCloudinary = async(localFilePath) => {
    try{    
        let response = await cloudinary.uploader.upload(localFilePath)
        console.log("file uploaded on Cloudinary :",response.url)
        fs.unlinkSync(localFilePath)
        return response.url
    } catch(err){
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}