import express from "express";
import bodyParser from "body-parser"; // Middleware to parse incoming request bodies (JSON, form data)
import cors from "cors"; // Middleware to allow cross-origin requests (frontend <-> backend)
import dotenv from "dotenv"; // Loads environment variables from .env file
import mongoose from "mongoose"; // MongoDB object modeling tool
import http from "http";

// Import route handlers
import AuthRoute from './route/authRoute.js';
import UserRoute from './route/userRoute.js';
import ChatRoute from './route/chatRoute.js';
import MessageRoute from './route/messageRoute.js';

// Import the socket instance from the socket setup file
import { io } from '../socket/index.js'; 
// Initialize the express application
const app = express();

// Create an HTTP server because need to integrate Socket.IO with the same server.
const server = http.createServer(app);

// Middleware setup
// Parses incoming JSON requests. Limit = 30mb for large payloads (like images, files).
app.use(bodyParser.json({ limit: "30mb", extended: true }));
// Parses URL-encoded data (e.g., form submissions). Same 30mb size limit.
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// Enables Cross-Origin Resource Sharing. This allows the frontend  to access the backend
app.use(cors());
// Serves static files from "public" folder
app.use(express.static('public')); 

// Specifically serve images from the "images" folder at `/images` route. Example: http://localhost:5000/images/myphoto.jpg
app.use('/images', express.static('images'));

// Load environment variables from .env file
dotenv.config();
// Define server port 
const PORT = process.env.PORT || 5000; // Default to port 5000 if not specified
//const PORT =  5000
// MongoDB connection string from environment variable
const CONNECTION = process.env.MONGODB_CONNECTION;

// Connect to MongoDB
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

// Mount API routes. Each route file handles related endpoints.
app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/chat', ChatRoute);
app.use('/message', MessageRoute);

// Attach Socket.IO server to the HTTP server so real-time features (like chat messages) can run alongside API requests.
io.listen(server); 