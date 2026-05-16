import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTodoStatusLabel } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const todos = await db.todo.findMany({
      orderBy: { createdAt: "desc" },
      include: { meeting: { select: { title: true } } },
    });

    const data = todos.map((t) => ({
      "待办内容": t.content,
      "负责人": t.assignee,
      "截止日期": t.dueDate,
      "状态": getTodoStatusLabel(t.status),
      "所属会议": t.meeting?.title || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "待办事项");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="todos_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
