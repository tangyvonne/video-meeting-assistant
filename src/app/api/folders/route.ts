import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const folders = await db.folder.findMany({
      include: { _count: { select: { files: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: folders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }
    const folder = await db.folder.create({ data: { name: name.trim() } });
    return NextResponse.json({ data: folder }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
