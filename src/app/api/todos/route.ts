import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get("meetingId");
    const status = req.nextUrl.searchParams.get("status");
    const where: any = {};
    if (meetingId) where.meetingId = meetingId;
    if (status) where.status = status;

    const todos = await db.todo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { meeting: { select: { title: true, date: true } } },
    });
    return NextResponse.json({ data: todos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const todo = await db.todo.create({ data: body });
    return NextResponse.json({ data: todo }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
