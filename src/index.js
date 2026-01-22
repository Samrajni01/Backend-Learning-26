import dotenv from "dotenv"
import connectDB from './db/config.js'
import { app } from "./app.js"
dotenv.config({
    path: '/.env'
})



connectDB()
.then(()=>{


    app.on("error",(error)=>{
            console.log("ERROR",error);

          throw error;  
           
         })
    app.listen(process.env.PORT || 8000 , ()=>{
        
        console.log(`server is running at port :${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGODB connectiom failed!!!",error);
    
})




















/*function connectDB(){}
connectDB()*/

/*( async()=>{
    try{
         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         app.on("error",(error)=>{
            console.log("ERROR",error);

          throw error;  
           
         })
         app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
         })

    }
    catch(error){
        console.log("ERROR",error)
        throw error;
    }
})*/


