import { prisma } from "@/lib/prisma";

export default async function IsteklerPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">İletişim İstekleri</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Ad</th>
              <th className="px-4 py-2 border">E-posta</th>
              <th className="px-4 py-2 border">Mesaj</th>
              <th className="px-4 py-2 border">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td className="px-4 py-2 border">{msg.id}</td>
                <td className="px-4 py-2 border">{msg.name}</td>
                <td className="px-4 py-2 border">{msg.email}</td>
                <td className="px-4 py-2 border">{msg.message}</td>
                <td className="px-4 py-2 border">
                  {new Date(msg.createdAt).toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
