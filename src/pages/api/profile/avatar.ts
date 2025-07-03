import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import formidable, { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, nextAuthConfig);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: "Yetkisiz" });
    }
    const form = new IncomingForm({
      multiples: false,
      uploadDir: path.join(process.cwd(), "public", "uploads"),
      keepExtensions: true,
      filename: (name: any, ext: any, part: any, form: any) => {
        return (
          Date.now() +
            "-" +
            part.originalFilename?.replace(/[^a-zA-Z0-9.]/g, "_") ||
          "avatar" + ext
        );
      },
    });
    const data = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    let file = data.files.file;
    if (Array.isArray(file)) file = file[0];
    if (!file) {
      console.error("Dosya nesnesi yok:", data.files);
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }
    const filePath = file.filepath || file.path;
    if (!filePath) {
      console.error("filePath yok:", file);
      return res.status(400).json({ error: "Dosya yolu bulunamadı" });
    }
    const filename = path.basename(filePath);
    const avatarUrl = `/uploads/${filename}`;
    await prisma.user.update({
      where: { email: session.user.email },
      data: { avatar: avatarUrl },
    });
    return res.status(200).json({ success: true, avatar: avatarUrl });
  } catch (error: any) {
    console.error("API POST /api/profile/avatar error:", error);
    return res
      .status(500)
      .json({ error: "Sunucu hatası: " + (error?.message || error) });
  }
}
