import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessandRefreshTokens = async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}

    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const registeredUser = asyncHandler(async (req, res) => {
//getting use details from frontened
console.log("REQ.BODY =>", req.body);
console.log("REQ.FILES =>", req.files);

    const { username, email, password, fullname } = req.body;
    console.log("email", email);
    //checking validation

    if (
        //Required fields validation
        [username, email, password, fullname].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    //email verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    //checks  user already exist
    const existeduser=await User.findOne({
        $or:[{email},{username}]
    })
    if(existeduser){
        throw new ApiError(409,"This username or email already exists")

    }
    //upload images on cloudinary
    const avatarlocalpath=req.files?.avatar?.[0]?.path || null;
    const coverimagelocalpath=req.files?.coveredimage?.[0]?.path || null;
    //if(!avatarlocalpath){
       // throw new ApiError(400,"Avatar file is required")

   // }
   const avatar= avatarlocalpath ? await uploadOnCloudinary(avatarlocalpath) : null;
   const coverimage=coverimagelocalpath ? await uploadOnCloudinary(coverimagelocalpath) : null;
    //if(!avatar){
       //  throw new ApiError(400,"Avatar file is required")

    
   // }
    //create new object
    const user=await User.create({
        fullname,
        avatar:avatar?.url || "",
        coverimage:coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    //password nd refreshtoken is removed
    const createdUser=await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    //check for user creation
    if(!createdUser){
         throw new ApiError(400,"Something went wrong,please try again")


    }
    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
    
})

    
    


    





 

   

//})


//LOGIN//

//take data from req.body

const loginUser=asyncHandler(async (req,res)=>{
 const{username ,email,password}=req.body;
 if(!username && !email){
    throw new ApiError(400,"Username or email is required")
 }
 //checl if uusernme or email exist
 const user=await User.findOne({
    $or: [{username},{email}]
    })

    if(!user){
         throw new ApiError(404,"User doesnot exist")
 
    }
    //now check for password if anyone email or usernme exist
    const ispasswordvalid=await user.isPasswordCorrect(password)
     if(!ispasswordvalid){
         throw new ApiError(404,"Invalid user credentials")
 
    }
    //if password matched then send tokens
    const {accessToken,refreshToken}=await generateAccessandRefreshTokens(user._id)
    const loggeduser=await User.findById(user._id).
    select("-password -refreshtoken")
    /*or use this intead of db call
    const safeUser = user.toObject();
delete safeUser.password;
delete safeUser.refreshToken;
*/



//send cookies
const option={
    httpOnly:true,
    secure:true
}
return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
    new ApiResponse(
        200,{
            user:loggeduser,
            accessToken,
            refreshToken,
        },"user logged in successfully"
    )
)




})

//LOGOUT
const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined

        }
    },{
            new : true
        }
    )

    const options={
       httpOnly:true,
    secure:true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"User logged out")
    )
})

//generting regreshtoken
    const refreshAccessToken=asyncHandler(async (req,res)=>{
        const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
             throw new ApiError(401,"unauthorised request")
        }
       try {
         const decodedToken=jwt.verify(
             incomingRefreshToken,
             process.env.REFRESH_TOKEN_SECRET
         )
         const user=User.findById(decodedToken?._id)
 
         if(!user){
              throw new ApiError(401,"Invalid refreshToken")
         }
         if(incomingRefreshToken!== user?.refreshToken){
            
               throw new ApiError(401,"Invalid refreshToken")
         }
         const options={
             httpOnly:true,
             secure:true
         }
         const{accessToken,newrefreshToken}=await generateAccessandRefreshTokens(user._id)
         return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newrefreshToken,options).
         json(
             new ApiResponse(
                 200,{accessToken,refreshToken:newrefreshToken},
                 "Access Token refreshed"
 
                 
             )
         )
     
 
 
         
 
     
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
       } catch (error) {
        throw new ApiError(401,"invalid refreshToken")
        
       }
    })



export { registeredUser,loginUser,logoutUser,refreshAccessToken } 
