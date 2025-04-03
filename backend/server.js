import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";

// Import routes
import AuthRoute from './route/authRoute.js';
import UserRoute from './route/userRoute.js';
import ChatRoute from './route/chatRoute.js';
import MessageRoute from './route/messageRoute.js';

// Import the socket instance from the socket setup file
import { io } from '../socket/index.js'; 

const app = express();

// Create an HTTP server to support Socket.IO
const server = http.createServer(app);

// Middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(express.static('public')); // Serve static images
app.use('/images', express.static('images'));

dotenv.config();
const PORT = process.env.PORT || 5000; // Default to port 5000 if not specified
const CONNECTION = process.env.MONGODB_CONNECTION;

mongoose
  .connect(CONNECTION)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    // Start the server after DB connection
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => console.log(`Error connecting to MongoDB: ${error}`));

// Use the routes
app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/chat', ChatRoute);
app.use('/message', MessageRoute);

// Attach Socket.IO to the server
io.listen(server); // Now the Socket.IO server is listening on the same server
