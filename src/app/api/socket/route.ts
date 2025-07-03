import { Server } from "socket.io";
import { NextApiRequest } from "next";

let io: Server | null = null;

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: any, res: any) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // Mesajı diğer kullanıcıya ilet
      socket.on("message", (data) => {
        // data: { to, from, content, sentAt }
        io?.to(String(data.to)).emit("message", data);
      });
      // Odaya katılma (kullanıcı id'si ile)
      socket.on("join", (userId) => {
        socket.join(String(userId));
      });
      // Mesaj iletildi bildirimi
      socket.on("delivered", (data) => {
        // data: { to, messageId }
        io?.to(String(data.to)).emit("delivered", data);
      });
      // Mesaj okundu bildirimi
      socket.on("seen", (data) => {
        // data: { to, messageId }
        io?.to(String(data.to)).emit("seen", data);
      });
      // Yazıyor bildirimi
      socket.on("typing", (data) => {
        // data: { to, from }
        io?.to(String(data.to)).emit("typing", data);
      });
      // Mesaj düzenlendi bildirimi
      socket.on("edited", (data) => {
        // data: { to, messageId, content }
        io?.to(String(data.to)).emit("edited", data);
      });
      // Mesaj silindi bildirimi
      socket.on("deleted", (data) => {
        // data: { to, messageId }
        io?.to(String(data.to)).emit("deleted", data);
      });
    });
  }
  res.end();
}
