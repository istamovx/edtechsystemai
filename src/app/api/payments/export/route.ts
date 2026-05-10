import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireTenant, canViewFinance } from "@/lib/session";

export async function GET(req: Request) {
  const user = await requireTenant();
  if (!canViewFinance(user.role)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? "";

  const where: any = { tenantId: user.tenantId };
  if (month) where.forMonth = month;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { student: { select: { fullName: true, phone: true } } },
  });

  const rows = payments.map((p, i) => ({
    "№": i + 1,
    "Sana": new Date(p.createdAt).toLocaleDateString("uz-UZ"),
    "F.I.SH": p.student.fullName,
    "Telefon": p.student.phone ?? "",
    "Summa": Number(p.amount),
    "Usul": p.method,
    "Holat": p.status,
    "Oy uchun": p.forMonth ?? "",
    "Izoh": p.note ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws, "To'lovlar");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `tolovlar_${month || new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
