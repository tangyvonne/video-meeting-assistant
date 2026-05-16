import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { link } = await req.json();
    if (!link) return NextResponse.json({ error: "缺少链接" }, { status: 400 });

    let platform = "other";
    let title = "";

    if (link.includes("meeting.tencent.com")) {
      platform = "tencent";
      title = "腾讯会议";
    } else if (link.includes("meeting.bytedance.com") || link.includes("feishu.cn")) {
      platform = "feishu";
      title = "飞书会议";
    } else if (link.includes("meeting.dingtalk.com")) {
      platform = "dingtalk";
      title = "钉钉会议";
    }

    return NextResponse.json({ data: { platform, title: title || "未识别会议" } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
