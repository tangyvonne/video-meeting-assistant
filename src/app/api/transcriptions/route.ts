import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get("meetingId");
    if (!meetingId) return NextResponse.json({ error: "缺少meetingId" }, { status: 400 });
    const transcriptions = await db.transcription.findMany({
      where: { meetingId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: transcriptions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { meetingId, content } = await req.json();
    if (!meetingId || !content) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }
    const transcription = await db.transcription.create({
      data: { meetingId, content },
    });
    return NextResponse.json({ data: transcription }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
