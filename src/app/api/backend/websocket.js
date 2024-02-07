import { Server as WebSocketServer } from "ws";

export default function handler(req, res) {
  if (res.socket.server.ws) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const wsServer = new WebSocketServer({ noServer: true });
    res.socket.server.ws = wsServer;

    wsServer.on("connection", (socket) => {
      socket.on("message", (message) => {
        // Handle incoming messages
        console.log(message);
      });
    });

    res.socket.server.on("upgrade", (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, (socket) => {
        wsServer.emit("connection", socket, request);
      });
    });
  }
  res.end();
}
