import { DB_NAME } from "../constant.js"
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?appName=Cluster0&replicaSet=atlas-s44awb-shard-0&ssl=true&authSource=admin`)
        console.log(`MongoDB connected to the localHost Hosted by ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error ", error)
        process.exit(1)
    }
}

export default connectDB
