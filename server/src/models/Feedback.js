import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Hidden from ordinary queries so the public feedback list cannot expose it.
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      select: false,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    instagram: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    linkedin: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
