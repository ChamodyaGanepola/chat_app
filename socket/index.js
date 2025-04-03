import { Server } from 'socket.io';

// Create a new instance of Socket.IO attached to the existing HTTP server
export const io = new Server(8800, {
  cors: {
    origin: "http://localhost:5173", // The frontend URL you are using
  },
});

let activeUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  // Add new user to the active users list
  socket.on('new-user-add', (newUserId) => {
    if (!activeUsers.some(user => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log('New User Connected', activeUsers);
    }

    // Send active users to the newly connected user
    io.emit('get-users', activeUsers);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    console.log('User Disconnected', activeUsers);
    io.emit('get-users', activeUsers);
  });

  socket.on('create-chat', (chatData) => {
    const { members } = chatData;  // Use correct variable name
    console.log("New chat created:", chatData);

    // Find the sender in activeUsers list
    const sender = activeUsers.find(user => members.includes(user.userId));

    if (sender) {
        io.to(sender.socketId).emit('create-chat', chatData);
    }
});


// Send message to a specific user
socket.on('send-message', (data) => {
  const { receiverId } = data;
  const user = activeUsers.find(user => user.userId === receiverId);

  if (user) {
    console.log('Sending message to: ', receiverId);
    io.to(user.socketId).emit('receive-message', data);
  }
});
});

// Export io as default
export default io;
