import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const meetingId = req.nextUrl.searchParams.get("meetingId");
    if (!meetingId) return NextResponse.json({ error: "缺少meetingId" }, { status: 400 });

    const minutes = await db.minutes.findUnique({ where: { meetingId } });
    return NextResponse.json({ data: minutes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();
    if (!meetingId) return NextResponse.json({ error: "缺少meetingId" }, { status: 400 });

    const existing = await db.minutes.findUnique({ where: { meetingId } });
    if (existing) return NextResponse.json({ data: existing });

    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: {
        transcriptions: { where: { isHighlighted: true } },
        todos: true,
      },
    });
    if (!meeting) return NextResponse.json({ error: "会议不存在" }, { status: 404 });

    const highlights = meeting.transcriptions
      .map((t) => `- ${t.content}`)
      .join("\n");

    const todoList = meeting.todos
      .map((t) => `- [${t.status === "done" ? "x" : " "}] ${t.content} (@${t.assignee}, 截止: ${t.dueDate})`)
      .join("\n");

    const content = `# ${meeting.title} — 会议纪要

## 基本信息
- 日期：${meeting.date}
- 时间：${meeting.startTime} - ${meeting.endTime}
- 主持人：${meeting.host}
- 参会人：${meeting.attendees}
- 平台：${meeting.platform}
${meeting.link ? `- 链接：${meeting.link}` : ""}

## 会议概要
_待补充..._

## 重点内容
${highlights || "_无标记重点_"}

## 待办事项
${todoList || "_无待办事项_"}
`;

    const minutes = await db.minutes.create({
      data: {
        meetingId,
        summary: "",
        highlights,
        content,
      },
    });

    return NextResponse.json({ data: minutes }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
