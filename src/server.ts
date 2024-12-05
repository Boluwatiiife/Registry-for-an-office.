import config from "config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

// Load environment variables
dotenv.config({ path: "./src/.env" });
// console.log(process.env.MONGODB_LOCAL);
// console.log(process.env.PORT);

// let server: Server;

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.log(err.message);
  console.log("uncaught Exception occured! Shutting down...");

  server.close(() => {
    process.exit(1);
  });
});

// connect to the database
mongoose
  .connect(process.env.MONGODB_LOCAL as string)
  .then(() => {
    console.log("database connection is successful!...");
  })
  .catch((err: Error) => {
    console.error("Error during DB connection:", err.message);
  });

//create and start the server
const port: number = parseInt(process.env.PORT || "3070", 10);
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

//Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error(err.message);
  console.log("Unhandled rejection occurred! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
