"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MeetingCard } from "@/components/meeting/MeetingCard";
import { MeetingForm } from "@/components/meeting/MeetingForm";
import { Button } from "@/components/ui/button";
import { getMeetingGroup } from "@/lib/utils";
import { OnboardingGuide } from "@/components/OnboardingGuide";

interface Meeting {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  host: string;
  attendees: string;
  link?: string | null;
  platform: string;
  status: string;
  isSample?: boolean;
  _count: { todos: number; documents: number };
}

const groupLabels: Record<string, string> = {
  today: "今日会议",
  future: "未来会议",
  past: "历史会议（一周内）",
  missed: "已逾期未参加",
};

const groupColors: Record<string, string> = {
  today: "border-l-primary-500 bg-primary-50/50",
  future: "border-l-blue-400",
  past: "border-l-gray-300",
  missed: "border-l-red-400 bg-red-50/30",
};

export default function HomePage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    future: true,
    past: true,
    missed: true,
  });

  const fetchMeetings = useCallback(async () => {
    const res = await fetch("/api/meetings");
    const json = await res.json();
    setMeetings(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleCreate = async (data: any) => {
    await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchMeetings();
  };

  const handleParseLink = async (link: string) => {
    const res = await fetch("/api/meetings/parse-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link }),
    });
    const json = await res.json();
    return json.data || null;
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    fetchMeetings();
  };

  const toggleGroup = (group: string) => {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const grouped = meetings.reduce((acc: Record<string, Meeting[]>, m) => {
    const group = getMeetingGroup(m.date, m.status);
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {});

  const groupOrder = ["today", "missed", "future", "past"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会议列表</h1>
          <p className="text-sm text-gray-500 mt-1">管理和追踪你的所有视频会议</p>
        </div>
        <div className="flex gap-2" id="create-btn">
          <Button onClick={() => setShowForm(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建会议
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-gray-500 mb-4">暂无会议，点击上方按钮创建第一个会议</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const list = grouped[group];
            if (!list || list.length === 0) return null;
            const isCollapsed = !!collapsed[group];
            return (
              <div key={group} id={group === "today" ? "today-group" : undefined}>
                <button
                  onClick={() => toggleGroup(group)}
                  className={`w-full flex items-center gap-2 border-l-4 rounded-l px-3 py-1 mb-3 transition-colors hover:bg-gray-50 ${groupColors[group] || ""}`}
                >
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <h2 className="text-sm font-semibold text-gray-700">
                    {groupLabels[group] || group}
                    <span className="ml-2 text-gray-400 font-normal">({list.length})</span>
                  </h2>
                </button>
                {!isCollapsed && (
                  <div className="space-y-2" id={group === "today" ? "first-meeting-card" : undefined}>
                    {list.map((m) => (
                      <MeetingCard key={m.id} {...m} onDelete={handleDelete} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <MeetingForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleCreate}
        onParseLink={handleParseLink}
      />

      <OnboardingGuide
        stepRange={[0, 3]}
        onNavigate={(nextStep) => {
          // 第5步开始需要跳转到会议详情页
          if (nextStep >= 4) {
            const todayMeetings = grouped["today"] || [];
            const firstMeeting = todayMeetings[0];
            if (firstMeeting) {
              router.push(`/meeting/${firstMeeting.id}?guide=1`);
            }
          }
        }}
      />
    </div>
  );
}
