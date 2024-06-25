import mongoose from "mongoose";

const connectedDB = async () => {
    try{
        const connectionInstance = await mongoose.connect( `${process.env.MONGO_URL}`)
    } catch(err){
        console.log("error while connecting database",err)
        process.exit(1)
    }
}

export default connectedDB