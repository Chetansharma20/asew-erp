import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    // unit: {
    //     type: String,
    //     required: true
    // },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: null
    }
})

export const Item = mongoose.model("Item", itemSchema)