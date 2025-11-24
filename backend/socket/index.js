import { Server } from "socket.io";
//Array to track connected users (userId + socketId).
let activeUsers = [];

export const setupSocket = (server) => {
  //Creates a Socket.IO server attached to the HTTP server
  const io = new Server(server, {
    cors: { origin: "*" } 
  });

  //Triggered whenever a new client connects.
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Event received from client when user logs in.
    socket.on("new-user-add", (newUserId) => {
      if (!activeUsers.some(u => u.userId === newUserId)) {
        //Adds user to activeUsers array
        activeUsers.push({ userId: newUserId, socketId: socket.id });
      }
      //Emits updated online user list to all connected clients.
      io.emit("get-users", activeUsers);
    });

    // Triggered automatically when a client disconnects.
    socket.on("disconnect", () => {
      //Removes user from activeUsers.
      activeUsers = activeUsers.filter(u => u.socketId !== socket.id);
      // Broadcasts updated list.
      io.emit("get-users", activeUsers);
    });

 //.........need to remove no need....
    // Create chat
    socket.on("create-chat", (chatData) => {
      const { members } = chatData;
      //Finds the recipient in activeUsers.
      const receiver = activeUsers.find(u => members.includes(u.userId));
      if (receiver) {
      //Sends the chat only to that user’s socket
        io.to(receiver.socketId).emit("create-chat", chatData);
      }
    });

    // Send message
    socket.on("send-message", (data) => {
      const { receiverId } = data;
      //Finds the receiver socket.
      const user = activeUsers.find(u => u.userId === receiverId);
      //Emits the message only to that socket (real-time delivery).
      if (user) io.to(user.socketId).emit("receive-message", data);
    });
    //............................
  });

 // Expose a getter for controllers
  io.getActiveUsers = () => activeUsers;
  //Allows you to use io.emit in controllers for server-side events.
  return io;
};
