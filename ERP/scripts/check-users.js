import mongoose from "mongoose";
import { User } from "../src/models/users.models.js";
import { DB_NAME } from "../src/constant.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?appName=Cluster0&replicaSet=atlas-s44awb-shard-0&ssl=true&authSource=admin`);
        console.log("Connected to MongoDB");

        const userCount = await User.countDocuments();
        console.log(`Total Users: ${userCount}`);

        if (userCount > 0) {
            const admins = await User.find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } });
            console.log(`Admins found: ${admins.length}`);
            admins.forEach(admin => {
                console.log(`- ${admin.name} (${admin.email}) [${admin.role}]`);
            });
        } else {
            console.log("No users found in the database.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
