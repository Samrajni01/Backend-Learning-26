import mongoose , {Schema} from "mongoose"
//special package:mongoose-aggregate//json//bcrypt
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {username:{
       type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
       type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        //match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"]
       
    },password:{
        type:String,
        required:[true,"password is reuired"],
       
       
    },fullname:{
        
        type:String,
        required:true,
        trim:true,
        index:true
     },
     avatar:{
        
        type:String,
        default:""
       
       
     },
     coveredimage:{
        
         type:String,
         default:""
       
       
     },watchedhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
     ],
     refreshtoken:{
         type:String,
     }











},{timestamps:true})

userSchema.pre("save",async function(){
    if(!this.isModified("password")) return ;

    this.password= await bcrypt.hash(this.password,10)
    


});
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password , this.password)
}
userSchema.methods.generateAccessToken=function(){

    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken=function(){



      return jwt.sign(
        {
            _id:this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}



export const User=mongoose.model("User",userSchema)