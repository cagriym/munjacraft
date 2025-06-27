import { Server } from "socket.io";
import { NextApiRequest } from "next";

let io: Server | null = null;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: any) {
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
    });
  }
  res.end();
}
