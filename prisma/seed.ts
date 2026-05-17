import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function today(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

async function main() {
  const count = await db.meeting.count();
  if (count > 0) {
    console.log("已有数据，跳过播种");
    return;
  }

  // ==================== 示例会议 1：今日 ====================
  const m1 = await db.meeting.create({
    data: {
      title: "Q2 产品评审会议",
      date: today(0),
      startTime: "10:00",
      endTime: "11:30",
      duration: 90,
      host: "张三",
      attendees: "李四,王五,赵六",
      link: "https://meeting.tencent.com/dm/example1",
      platform: "tencent",
      status: "upcoming",
      isSample: true,
      agenda: "1. 需求评审\n2. 原型演示\n3. 排期确认",
    },
  });

  await db.document.createMany({
    data: [
      { meetingId: m1.id, fileName: "Q2产品需求文档.pdf", filePath: "/uploads/dev/sample.pdf", fileSize: 245760, fileType: "application/pdf" },
      { meetingId: m1.id, fileName: "竞品分析.xlsx", filePath: "/uploads/dev/sample.xlsx", fileSize: 102400, fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    ],
  });

  // ==================== 示例会议 2：今日（新增） ====================
  const m5 = await db.meeting.create({
    data: {
      title: "网站设计评审",
      date: today(0),
      startTime: "14:00",
      endTime: "15:00",
      duration: 60,
      host: "李四",
      attendees: "张三,王五,设计师小陈",
      link: "https://meeting.tencent.com/dm/example5",
      platform: "tencent",
      status: "upcoming",
      isSample: true,
      agenda: "1. 首页改版方案\n2. 配色优化\n3. 移动端适配",
    },
  });

  await db.document.create({
    data: { meetingId: m5.id, fileName: "首页改版设计稿.pdf", filePath: "/uploads/dev/sample-design.pdf", fileSize: 350000, fileType: "application/pdf" },
  });

  await db.todo.createMany({
    data: [
      { meetingId: m5.id, content: "收集首页反馈意见", assignee: "设计师小陈", dueDate: today(2), status: "in_progress" },
      { meetingId: m5.id, content: "更新组件库配色", assignee: "王五", dueDate: today(3), status: "pending" },
    ],
  });

  // ==================== 示例会议 3：未来 ====================
  const m2 = await db.meeting.create({
    data: {
      title: "技术架构升级方案讨论",
      date: today(2),
      startTime: "14:00",
      endTime: "16:00",
      duration: 120,
      host: "李四",
      attendees: "张三,王五,钱七",
      link: "https://meeting.bytedance.com/example2",
      platform: "feishu",
      status: "upcoming",
      isSample: true,
      agenda: "1. 当前架构痛点\n2. 升级方案对比\n3. 迁移计划",
    },
  });

  await db.document.create({
    data: { meetingId: m2.id, fileName: "架构升级方案.pptx", filePath: "/uploads/dev/sample.pptx", fileSize: 512000, fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  });

  // ==================== 示例会议 4：已逾期 ====================
  const m3 = await db.meeting.create({
    data: {
      title: "周进度同步会",
      date: today(-3),
      startTime: "09:30",
      endTime: "10:00",
      duration: 30,
      host: "王五",
      attendees: "张三,李四,赵六,钱七",
      link: "https://meeting.dingtalk.com/example3",
      platform: "dingtalk",
      status: "missed",
      isSample: true,
      agenda: "1. 上周进度回顾\n2. 本周计划对齐",
    },
  });

  // ==================== 示例会议 5：已完成 ====================
  const m4 = await db.meeting.create({
    data: {
      title: "客户需求沟通会",
      date: today(-1),
      startTime: "15:00",
      endTime: "16:30",
      duration: 90,
      host: "赵六",
      attendees: "张三,李四,客户A,客户B",
      link: "https://meeting.tencent.com/dm/example4",
      platform: "tencent",
      status: "completed",
      isSample: true,
      agenda: "1. 客户需求概述\n2. 可行性分析\n3. 下一步行动\n4. 时间节点确认",
    },
  });

  await db.transcription.createMany({
    data: [
      { meetingId: m4.id, content: "客户提出了三个核心需求：报表导出、权限管理、移动端适配", isHighlighted: true },
      { meetingId: m4.id, content: "技术层面确认报表导出可以在两周内完成", isHighlighted: true },
      { meetingId: m4.id, content: "权限管理的需求比较复杂，需要进一步评估", isHighlighted: false },
      { meetingId: m4.id, content: "客户要求下周五前给出完整的技术方案和报价", isHighlighted: true },
      { meetingId: m4.id, content: "移动端适配涉及UI重构，建议分阶段实施", isHighlighted: false },
      { meetingId: m4.id, content: "会议总结：本次沟通高效，客户需求明确，下周一开始执行", isHighlighted: false },
    ],
  });

  await db.todo.createMany({
    data: [
      { meetingId: m4.id, content: "输出完整技术方案文档", assignee: "张三", dueDate: today(3), status: "in_progress" },
      { meetingId: m4.id, content: "完成报表导出功能原型", assignee: "李四", dueDate: today(5), status: "pending" },
      { meetingId: m4.id, content: "评估权限管理方案可行性", assignee: "王五", dueDate: today(4), status: "pending" },
      { meetingId: m4.id, content: "制作项目报价单", assignee: "赵六", dueDate: today(1), status: "done" },
      { meetingId: m1.id, content: "准备产品评审演示材料", assignee: "张三", dueDate: today(0), status: "pending" },
      { meetingId: m2.id, content: "收集各模块架构痛点", assignee: "钱七", dueDate: today(1), status: "pending" },
      { meetingId: m2.id, content: "准备升级方案对比表", assignee: "李四", dueDate: today(1), status: "in_progress" },
    ],
  });

  await db.minutes.create({
    data: {
      meetingId: m4.id,
      summary: "与客户A、B就新项目需求进行了深入沟通，三方在核心功能和交付时间上达成初步一致。",
      highlights: "- 客户提出了三个核心需求：报表导出、权限管理、移动端适配\n- 技术层面确认报表导出可以在两周内完成\n- 客户要求下周五前给出完整的技术方案和报价",
      content: `# 客户需求沟通会 — 会议纪要

## 基本信息
- 日期：${today(-1)}
- 时间：15:00 - 16:30
- 主持人：赵六
- 参会人：张三, 李四, 客户A, 客户B
- 平台：腾讯会议

## 会议概要
与客户A、B就新项目需求进行了深入沟通，三方在核心功能和交付时间上达成初步一致。

## 重点内容
- 客户提出了三个核心需求：报表导出、权限管理、移动端适配
- 技术层面确认报表导出可以在两周内完成
- 客户要求下周五前给出完整的技术方案和报价

## 待办事项
- [x] 制作项目报价单 (@赵六, 截止: ${today(1)})
- [ ] 输出完整技术方案文档 (@张三, 截止: ${today(3)})
- [ ] 评估权限管理方案可行性 (@王五, 截止: ${today(4)})
- [ ] 完成报表导出功能原型 (@李四, 截止: ${today(5)})
`,
    },
  });

  console.log("示例数据播种完成！共创建 5 个示例会议");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
