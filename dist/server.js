"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
// Load environment variables
dotenv_1.default.config({ path: "./config.env" });
console.log(process.env.MONGODB_LOCAL);
// let server: Server;
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(err.message);
    console.log("uncaught Exception occured! Shutting down...");
    server.close(() => {
        process.exit(1);
    });
});
// connect to the database
mongoose_1.default
    .connect("mongodb://127.0.0.1:27017/opolohub" /*process.env.MONGODB_LOCAL as string*/)
    .then(() => {
    console.log("database connection is successful!...");
})
    .catch((err) => {
    console.error("Error during DB connection:", err.message);
});
//create and start the server
const port = parseInt(process.env.PORT || "3070", 10);
const server = app_1.default.listen(port, () => {
    console.log(`Server started on port ${port}...`);
});
//Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error(err.message);
    console.log("Unhandled rejection occurred! Shutting down...");
    server.close(() => {
        process.exit(1);
    });
});
console.log("helloo");
//# sourceMappingURL=server.js.map