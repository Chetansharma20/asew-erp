import mongoose from "mongoose"

const followupSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true
    },

    followupDate: {
      type: Date,
      default: Date.now
    },

    remarks: {
      type: String,
      trim: true
    },

    nextFollowupDate: {
      type: Date
    },

    orderStatus: {
      type: String,
      enum: ["ORDER_WON", "ORDER_LOSS", "FOLLOW_UP"],
      required: true
    }
  },
  {
    collection: "followups",
    timestamps: true
  }
);

export const Followup = mongoose.model("Followup", followupSchema);
