import { Server } from 'socket.io';

// Create a new instance of Socket.IO attached to the existing HTTP server.Attach CORS so only the frontend at localhost:5173 can connect
export const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173", // The frontend URL 
  },
});

// Array to track currently active users
let activeUsers = [];

// Listen for new client connections
io.on('connection', (socket) => {
  //socket.id is a Unique identifier for each connected client.
  console.log('A user connected: ', socket.id);

  // Adds a new user to the active list and broadcasts the online users
  socket.on('new-user-add', (newUserId) => {
    // Only add if the user is not already in activeUsers
    if (!activeUsers.some(user => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log('New User Connected', activeUsers);
    }

    // Broadcast the updated active user list to all connected clients
    io.emit('get-users', activeUsers);
  });

  // Removes users from the active list when they leave.
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    console.log('User Disconnected', activeUsers);
    io.emit('get-users', activeUsers);
  });

  
  // Emits newly created chat to relevant users in real time.
  socket.on('create-chat', (chatData) => {
    const { members } = chatData;  
    console.log("New chat created:", chatData);

    // Find the sender in activeUsers list
    const sender = activeUsers.find(user => members.includes(user.userId));

    if (sender) {
      // Send the new chat to that user's socket only
        io.to(sender.socketId).emit('create-chat', chatData);
    }
});


// Sends messages directly to the receiver’s socket.
socket.on('send-message', (data) => {
  const { receiverId } = data;
  const user = activeUsers.find(user => user.userId === receiverId);

  if (user) {
    console.log('Sending message to: ', receiverId);
    io.to(user.socketId).emit('receive-message', data);
  }
});
});

export default io;
