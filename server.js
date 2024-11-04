// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));


// https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender#answer-10099325
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("pohybKameneClient" /* <—— název eventu, který posílá klient */, (moveData) => {
    socket.broadcast.emit("pohybKameneServer" /* <—— Název eventu, který posílá server */, moveData);
  });

  socket.on("capture", (captureData) => {
    socket.broadcast.emit("captureServer", captureData);
  })

  socket.on("reset", () => {
    io.emit("reset");
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on("win", (winner) => {
    io.emit("win", (winner));
  });

  socket.on("switchPlayer", (data) => {
    io.emit("switchPlayerServer", (data));
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
