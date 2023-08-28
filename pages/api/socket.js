import { Server } from "socket.io";

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);

  // Event handler for client connections
  io.on("connection", (socket) => {
    // Event handler for client disconnections
    socket.on("disconnect", () => {
      console.log("A client disconnected.");
    });
  });

  res.socket.server.io = io;
  res.end();
}
