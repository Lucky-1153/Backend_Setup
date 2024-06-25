import mongoose from 'mongoose'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.models.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

const generateAccessAndRefreshToken = async function(userId){
    try{
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
    } catch(err){
        throw new ApiError(303, "something went wrong while generating refresh Token")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    //take details from the frontedn
    //validation -> not empty
    //check if user doesn't exist in databse via email/username
    //upload avtar on cloudinary
    //create user instance in database
    //remove password and refreshToken from response
    //check for user creation
    //return res
    const {fullName, userName, email, password} = req.body

    // if(fullName !== ""){
    //     throw new ApiError("201", "Full name not find")
    // }

    if( [fullName, userName, email, password].some((field) => field?.trim() === "")){
        throw new ApiError("201","Enter the Details")
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })

    if(existedUser)
        throw new ApiError("202", "User already exist")

    const avtaarLocalPath = req.files?.avtaar[0]?.path
    const coverImgLocalPath = req.files?.coverImg[0]?.path

    if(!coverImgLocalPath)
        throw new ApiError('203', "coverImg file is required")

    if(!avtaarLocalPath)
        throw new ApiError('203', "Avtaar file is required")

    const avtaar = await uploadOnCloudinary(avtaarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)

    ///
    if([avtaar,coverImg].some((field) => field === ""))
        throw new ApiError('204', "unable to upload images on cloudinary")
    // if(!avtaar)
    //     throw new ApiError('204', "unable to upload images on cloudinary")

    const user  =  await User.create({
        fullName,
        avtaar: avtaar,
        coverImg: coverImg || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    //way to unselect specific fieds
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser)
        throw new ApiError(500, "Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfuly")
    )
})

const loginUser = asyncHandler( async(req,res) => {
    //get the userName and password
    //check not empty username adn password
    //search the username in database
    //password check
    //throw error if not find
    //generate the tokens
    //send the cookie

    const {userName, password} = req.body

    if(!userName || !password)
        throw new ApiError(301, "username or password not find")

    const user = await User.findOne({
        $or: [{userName}]
    })

    if(!user)
        throw new ApiError(302, "user not find")

    const passwordCheck = await user.isPasswordCorrect(password)

    if(!passwordCheck)
        throw new ApiError(303, "password inccorect")

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfuly"
        )
    )


})

const logoutUser  = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined //this remove field from the document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secore: true
    }

    console.log('hey')


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User Logged Out")
    )
})

const refreshAccessToken = asyncHandler( async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken

    if(!incomingRefreshToken)
        throw new ApiError(401, "unauthorized Request")

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id)

        if(!user)
            throw new ApiError(401, "Invalid refresh Token")

        if( incomingRefreshToken !== user?.refreshToken?._id)
            throw new ApiError(401, "Refresh token is expired or used")

        const options ={
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)


        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch(error){
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})

export  {
    registerUser,
    loginUser,
    logoutUser
}