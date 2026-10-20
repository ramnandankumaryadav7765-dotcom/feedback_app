import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { connectToDatabase } from "./db.js";
import { Feedback } from "./models/Feedback.js";

const app = express();
const port = process.env.PORT || 3000;
const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));

// Let the backend read JSON sent by the browser.
app.use(express.json());

// Serve the frontend files from the public folder.
app.use(express.static(publicDirectory));

app.get("/api/feedback", async (_request, response) => {
  try {
    const entries = await Feedback.find().sort({ createdAt: -1 }).limit(100);
    response.json(entries.map(toPublicFeedback));
  } catch (error) {
    console.error("Could not load feedback:", error.message);
    response.status(500).json({ error: "Could not load feedback." });
  }
});

app.post("/api/feedback", async (request, response) => {
  const { name, email, message, instagram, linkedin } = request.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof message !== "string" || !message.trim()
  ) {
    return response.status(400).json({ error: "Please enter a name, valid email address, and message." });
  }

  const isValidOptionalUrl = (value) => {
    if (value === undefined || value === "") return true;
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  };

  if (!isValidOptionalUrl(instagram) || !isValidOptionalUrl(linkedin)) {
    return response.status(400).json({ error: "Social links must be valid web addresses." });
  }

  try {
    const entry = await Feedback.create({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      instagram: instagram?.trim() || "",
      linkedin: linkedin?.trim() || "",
    });

    response.status(201).json(toPublicFeedback(entry));
  } catch (error) {
    console.error("Could not save feedback:", error.message);
    response.status(500).json({ error: "Could not save feedback." });
  }
});

function toPublicFeedback(entry) {
  return {
    id: entry._id.toString(),
    name: entry.name,
    message: entry.message,
    instagram: entry.instagram,
    linkedin: entry.linkedin,
    createdAt: entry.createdAt.toISOString(),
  };
}

try {
  await connectToDatabase();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Feedback app running on port ${port}`);
  });
} catch (error) {
  console.error("Could not start the server:", error.message);
  process.exit(1);
}
