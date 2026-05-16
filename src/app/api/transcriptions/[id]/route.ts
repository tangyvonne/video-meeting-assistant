import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const transcription = await db.transcription.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ data: transcription });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
