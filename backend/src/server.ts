import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database";
import { taskRouter } from "./task.routes";
import { requestLogger } from "./logger.middleware";
import { errorHandler } from "./error.middleware";

// Initialize dotenv
dotenv.config();

const { ATLAS_URI } = process.env;

// Exit if MongoDB URI is not defined
if (!ATLAS_URI) {
  console.error(
    "No ATLAS_URI environment variable has been defined in config.env"
  );
  process.exit(1);
}

// Connect to MongoDB and start the server once connected
connectToDatabase(ATLAS_URI)
  .then(() => {
    const app = express();
    
    app.use(cors());
    app.use(requestLogger);
    app.use("/tasks", taskRouter);
    app.use(errorHandler);

    // start the Express server
    app.listen(5200, () => {
      console.log(`Server running at http://localhost:5200...`);
    });
  })
  .catch((error) => console.error(error));