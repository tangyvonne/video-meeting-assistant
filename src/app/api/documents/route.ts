import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get("meetingId");
    const where = meetingId ? { meetingId } : {};
    const documents = await db.document.findMany({ where, orderBy: { uploadedAt: "desc" } });
    return NextResponse.json({ data: documents });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const meetingId = formData.get("meetingId") as string;
    const file = formData.get("file") as File | null;

    if (!meetingId || !file) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png",
      "image/jpeg",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "不支持的文件格式" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    const document = await db.document.create({
      data: {
        meetingId,
        fileName: file.name,
        filePath: `/uploads/${fileName}`,
        fileSize: buffer.length,
        fileType: file.type,
      },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
