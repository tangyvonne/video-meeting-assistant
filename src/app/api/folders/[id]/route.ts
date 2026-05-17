import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.folder.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
