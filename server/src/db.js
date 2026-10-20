import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
}
