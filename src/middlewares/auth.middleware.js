import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"

export const jwtVerify = asyncHandler(async (req, _, next) => {
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log(token)
        if(!token){
            throw new ApiError(201, "unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user)
            throw new ApiError(204,"invalid access token")
        
        req.user = user
        next()
    } catch(err){
        throw new ApiError(401, err?.message || "Invalid access token")
    }
})