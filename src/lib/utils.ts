import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${month}月${day}日 ${timeStr}`;
}

export function getMeetingGroup(dateStr: string, status: string): "today" | "future" | "past" | "missed" {
  const today = new Date().toISOString().split("T")[0];
  if (status === "missed") return "missed";
  if (dateStr === today) return "today";
  if (dateStr > today) return "future";
  return "past";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    upcoming: "即将开始",
    ongoing: "进行中",
    completed: "已完成",
    missed: "已逾期",
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    upcoming: "bg-primary-100 text-primary-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-500",
    missed: "bg-red-100 text-red-600",
  };
  return map[status] || "bg-gray-100 text-gray-500";
}

export function getTodoStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "未开始",
    in_progress: "进行中",
    done: "已完成",
    overdue: "已逾期",
  };
  return map[status] || status;
}

export function getTodoStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-gray-100 text-gray-500",
    in_progress: "bg-yellow-100 text-yellow-700",
    done: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-600",
  };
  return map[status] || "bg-gray-100 text-gray-500";
}

export function getPlatformLabel(platform: string): string {
  const map: Record<string, string> = {
    tencent: "腾讯会议",
    feishu: "飞书",
    dingtalk: "钉钉",
    other: "其他",
  };
  return map[platform] || platform;
}
