import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meeting = await db.meeting.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        transcriptions: { orderBy: { createdAt: "asc" } },
        todos: { orderBy: { createdAt: "desc" } },
        minutes: true,
      },
    });
    if (!meeting) return NextResponse.json({ error: "会议不存在" }, { status: 404 });
    return NextResponse.json({ data: meeting });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const meeting = await db.meeting.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ data: meeting });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.meeting.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { success: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
