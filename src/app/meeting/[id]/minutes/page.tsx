"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function MinutesPage() {
  const params = useParams();
  const router = useRouter();
  const [minutes, setMinutes] = useState<any>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [meetingRes, minutesRes] = await Promise.all([
        fetch(`/api/meetings/${params.id}`),
        fetch(`/api/minutes?meetingId=${params.id}`),
      ]);
      const mJson = await meetingRes.json();
      const minJson = await minutesRes.json();
      setMeeting(mJson.data);
      if (minJson.data) {
        setMinutes(minJson.data);
        setContent(minJson.data.content || "");
        setSummary(minJson.data.summary || "");
      } else {
        // Try to generate
        const genRes = await fetch("/api/minutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId: params.id }),
        });
        const genJson = await genRes.json();
        if (genJson.data) {
          setMinutes(genJson.data);
          setContent(genJson.data.content || "");
          setSummary(genJson.data.summary || "");
        }
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!minutes) return;
    setSaving(true);
    await fetch(`/api/minutes/${minutes.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, summary }),
    });
    setSaving(false);
    alert("保存成功");
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div>
      <button onClick={() => router.push(`/meeting/${params.id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        返回会议详情
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {meeting?.title} — 会议纪要
        </h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存修改"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">会议概要</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="简要总结会议内容..."
          />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">完整纪要</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono"
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
