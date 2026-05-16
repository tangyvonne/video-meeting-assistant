import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const meetings = await db.meeting.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { _count: { select: { todos: true, documents: true } } },
    });
    return NextResponse.json({ data: meetings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const meeting = await db.meeting.create({ data: body });
    return NextResponse.json({ data: meeting }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
