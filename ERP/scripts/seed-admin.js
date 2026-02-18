import mongoose from "mongoose";
import { User } from "../src/models/users.models.js";
import { DB_NAME } from "../src/constant.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?appName=Cluster0&replicaSet=atlas-s44awb-shard-0&ssl=true&authSource=admin`);
        console.log("Connected to MongoDB");

        const adminExists = await User.findOne({
            role: { $in: ["ADMIN", "SUPER_ADMIN"] }
        });

        if (adminExists) {
            console.log(`Admin user already exists: ${adminExists.email}`);
            process.exit(0);
        }

        const superAdmin = await User.create({
            name: "System Administrator",
            email: "admin@example.com",
            phone: "0000000000",
            password: "admin123", // User should change this immediately
            role: "SUPER_ADMIN",
            status: "ACTIVE",
            isActive: true
        });

        console.log("Super Admin created successfully!");
        console.log("------------------------------------------------");
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Password: admin123`);
        console.log("------------------------------------------------");
        console.log("PLEASE CHANGE THIS PASSWORD IMMEDIATELY AFTER LOGGING IN");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
