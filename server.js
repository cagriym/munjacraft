const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("message", (data) => {
      io.to(String(data.to)).emit("message", data);
      io.to(String(data.from)).emit("message", data);
    });
    socket.on("join", (userId) => {
      socket.join(String(userId));
    });
    socket.on("delivered", (data) => {
      io.to(String(data.to)).emit("delivered", data);
    });
    socket.on("seen", (data) => {
      io.to(String(data.to)).emit("seen", data);
    });
    socket.on("typing", (data) => {
      io.to(String(data.to)).emit("typing", data);
    });
    socket.on("edited", (data) => {
      io.to(String(data.to)).emit("edited", data);
    });
    socket.on("deleted", (data) => {
      io.to(String(data.to)).emit("deleted", data);
    });
  });

  server.listen(3000, "0.0.0.0", () => {
    console.log("Server ready on http://0.0.0.0:3000");
  });
});
