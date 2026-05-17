import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await db.favoriteFile.findUnique({ where: { id: params.id } });
    if (!file) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    // 删除物理文件
    try {
      await unlink(path.join(process.cwd(), "public", file.filePath));
    } catch { /* 文件可能已被删除 */ }

    await db.favoriteFile.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
