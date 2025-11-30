import { Server } from "socket.io";

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://apna-video-call-frontend-zzgp.onrender.com",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join Room
    socket.on("join-room", (roomId, username) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      console.log(`User ${socket.id} (${username}) joined room ${roomId}`);

      socket.to(roomId).emit("user-connected", {
        userId: socket.id,
        username: username,
      });
    });

    // Offer
    socket.on("offer", ({ offer, to, username }) => {
      io.to(to).emit("offer", { offer, from: socket.id, username });
    });

    // Answer
    socket.on("answer", ({ answer, to, username }) => {
      io.to(to).emit("answer", { answer, from: socket.id, username });
    });

    // ICE Candidate
    socket.on("ice-candidate", ({ candidate, to }) => {
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    // Chat message
    socket.on("chat-message", ({ message, sender, socketId }) => {
      if (!socket.roomId) return;

      io.to(socket.roomId).emit("chat-message", {
        sender,
        message,
        socketId,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-disconnected", socket.id);
      }
    });
  });

  return io;
};
