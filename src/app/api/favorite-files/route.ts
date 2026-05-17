import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const folderId = req.nextUrl.searchParams.get("folderId");
    const where = folderId ? { folderId } : {};
    const files = await db.favoriteFile.findMany({
      where,
      include: { folder: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 从会议转存文件
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { sourceDocumentId, meetingTitle, meetingId, folderId } = body;

      if (sourceDocumentId && meetingTitle) {
        // 查找源文件
        const sourceDoc = await db.document.findUnique({ where: { id: sourceDocumentId } });
        if (!sourceDoc) {
          return NextResponse.json({ error: "源文件不存在" }, { status: 404 });
        }

        // 复制物理文件
        const srcPath = path.join(process.cwd(), "public", sourceDoc.filePath);
        const ext = sourceDoc.fileName.split(".").pop() || "";
        const newName = `${crypto.randomUUID()}.${ext}`;
        const destDir = path.join(process.cwd(), "public", "uploads", "favorites");
        await mkdir(destDir, { recursive: true });
        const destPath = path.join(destDir, newName);

        try {
          const { copyFile } = await import("fs/promises");
          await copyFile(srcPath, destPath);
        } catch {
          return NextResponse.json({ error: "复制文件失败" }, { status: 500 });
        }

        const file = await db.favoriteFile.create({
          data: {
            fileName: sourceDoc.fileName,
            filePath: `/uploads/favorites/${newName}`,
            fileSize: sourceDoc.fileSize,
            fileType: sourceDoc.fileType,
            sourceTitle: meetingTitle,
            sourceMeetingId: meetingId || null,
            folderId: folderId || null,
          },
        });
        return NextResponse.json({ data: file }, { status: 201 });
      }
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 直接上传文件
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "favorites");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    const record = await db.favoriteFile.create({
      data: {
        fileName: file.name,
        filePath: `/uploads/favorites/${fileName}`,
        fileSize: buffer.length,
        fileType: file.type,
        folderId: folderId || null,
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
