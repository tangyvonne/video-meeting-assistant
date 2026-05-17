"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { getStatusLabel, getStatusColor, getPlatformLabel, getTodoStatusLabel, getTodoStatusColor } from "@/lib/utils";
import { OnboardingGuide } from "@/components/OnboardingGuide";

interface Meeting {
  id: string; title: string; date: string; startTime: string; endTime: string;
  duration: number; host: string; attendees: string; link?: string | null;
  platform: string; status: string; agenda?: string | null;
  documents: Document[];
  transcriptions: Transcription[];
  todos: Todo[];
  minutes: Minutes | null;
}
interface Document { id: string; fileName: string; filePath: string; fileSize: number; fileType: string; uploadedAt: string; }
interface Transcription { id: string; content: string; isHighlighted: boolean; createdAt: string; }
interface Todo { id: string; meetingId: string; content: string; assignee: string; dueDate: string; status: string; }
interface Minutes { id: string; meetingId: string; summary?: string | null; highlights?: string | null; content?: string | null; }

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState("pre");
  const [loading, setLoading] = useState(true);

  // Pre-meeting state
  const [agenda, setAgenda] = useState("");
  const [uploading, setUploading] = useState(false);

  // In-meeting state
  const [transcriptInput, setTranscriptInput] = useState("");
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);

  // Todo form state
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoForm, setTodoForm] = useState({ content: "", assignee: "", dueDate: "" });

  // Minutes
  const [generatingMinutes, setGeneratingMinutes] = useState(false);

  const fetchMeeting = useCallback(async () => {
    const res = await fetch(`/api/meetings/${params.id}`);
    const json = await res.json();
    if (json.data) {
      setMeeting(json.data);
      setAgenda(json.data.agenda || "");
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchMeeting(); }, [fetchMeeting]);

  const handleGuideStepChange = useCallback((step: number) => {
    if (step === 4) setActiveTab("pre");
    else if (step === 5) setActiveTab("in");
    else if (step === 6) setActiveTab("post");
  }, []);

  // ---- Pre-meeting ----
  const handleSaveAgenda = async () => {
    await fetch(`/api/meetings/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agenda }),
    });
    fetchMeeting();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("meetingId", params.id as string);
    formData.append("file", file);
    await fetch("/api/documents", { method: "POST", body: formData });
    setUploading(false);
    fetchMeeting();
  };

  // ---- In-meeting ----
  const handleAddTranscript = async () => {
    if (!transcriptInput.trim()) return;
    await fetch("/api/transcriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: params.id, content: transcriptInput }),
    });
    setTranscriptInput("");
    fetchMeeting();
  };

  const handleHighlight = async (id: string, current: boolean) => {
    await fetch(`/api/transcriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHighlighted: !current }),
    });
    fetchMeeting();
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoForm.content || !todoForm.assignee || !todoForm.dueDate) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: params.id, ...todoForm }),
    });
    setTodoForm({ content: "", assignee: "", dueDate: "" });
    setShowTodoForm(false);
    fetchMeeting();
  };

  // ---- Post-meeting ----
  const handleEndMeeting = async () => {
    await fetch(`/api/meetings/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    fetchMeeting();
  };

  const handleGenerateMinutes = async () => {
    setGeneratingMinutes(true);
    const res = await fetch("/api/minutes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: params.id }),
    });
    const json = await res.json();
    if (json.data) {
      router.push(`/meeting/${params.id}/minutes`);
    }
    setGeneratingMinutes(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!meeting) return <div className="text-center py-20 text-gray-400">会议不存在</div>;

  const [year, month, day] = meeting.date.split("-");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          返回会议列表
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <Badge className={getStatusColor(meeting.status)}>{getStatusLabel(meeting.status)}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>{parseInt(month)}月{parseInt(day)}日 {meeting.startTime}-{meeting.endTime} ({meeting.duration}分钟)</span>
              <span>负责人：{meeting.host}</span>
              <span>参会人：{meeting.attendees}</span>
              <span>{getPlatformLabel(meeting.platform)}</span>
              {meeting.link && (
                <a href={meeting.link} target="_blank" className="text-primary-600 hover:underline">入会链接</a>
              )}
            </div>
          </div>
          {meeting.status === "ongoing" && (
            <Button variant="danger" onClick={handleEndMeeting}>结束会议</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "pre", label: "会前准备" },
          { key: "in", label: "会中助手" },
          { key: "post", label: "会后跟进" },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      >
        {/* Tab 1: Pre-meeting */}
        <TabPanel data-tab="pre">
          <div className="space-y-6">
            {/* Checklist */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">设备调试清单</h2>
              <ChecklistItem label="摄像头正常工作" />
              <ChecklistItem label="麦克风声音清晰" />
              <ChecklistItem label="扬声器音量适中" />
              <ChecklistItem label="网络连接稳定" />
              <ChecklistItem label="会议软件已更新到最新版" />
            </div>

            {/* Agenda */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">会议议程</h2>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={4}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="1. 议题一&#10;2. 议题二&#10;3. 议题三"
              />
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={handleSaveAgenda}>保存议程</Button>
              </div>
            </div>

            {/* Documents */}
            <div id="documents-section" className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">相关资料</h2>
                <label className="cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 text-sm px-3 py-1.5">
                  {uploading ? "上传中..." : "上传文件"}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif" />
                </label>
              </div>
              {meeting.documents.length === 0 ? (
                <p className="text-sm text-gray-400">暂无文件，支持上传 Word、PDF、PPT、图片</p>
              ) : (
                <div className="space-y-2">
                  {meeting.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileIcon type={doc.fileType} />
                        <span className="text-sm text-gray-700">{doc.fileName}</span>
                        <span className="text-xs text-gray-400">({(doc.fileSize / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            const btn = document.getElementById(`star-btn-${doc.id}`);
                            if (btn) { btn.textContent = "转存中..."; (btn as HTMLButtonElement).disabled = true; }
                            try {
                              await fetch("/api/favorite-files", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  sourceDocumentId: doc.id,
                                  meetingTitle: meeting.title,
                                  meetingId: meeting.id,
                                }),
                              });
                              if (btn) btn.textContent = "已转存";
                            } catch {
                              if (btn) { btn.textContent = "转存失败"; (btn as HTMLButtonElement).disabled = false; }
                            }
                          }}
                          id={`star-btn-${doc.id}`}
                          className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded transition-colors"
                        >
                          转存至重要文件
                        </button>
                        <a href={doc.filePath} download={doc.fileName} className="text-primary-600 text-sm hover:underline">
                          下载
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Tab 2: In-meeting */}
        <TabPanel data-tab="in">
          <div id="in-meeting-tab" className="space-y-6">
            {/* Transcription */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">实时转写</h2>
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={transcriptInput}
                  onChange={(e) => setTranscriptInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddTranscript(); }}
                  placeholder="输入转写内容，按回车发送..."
                />
                <Button size="sm" onClick={handleAddTranscript}>发送</Button>
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {meeting.transcriptions.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">转写内容将在这里显示...</p>
                ) : (
                  meeting.transcriptions.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTranscript(selectedTranscript === t.id ? null : t.id)}
                      className={`group flex items-start gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        t.isHighlighted
                          ? "bg-yellow-50 border border-yellow-200"
                          : selectedTranscript === t.id
                          ? "bg-primary-50 border border-primary-100"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                        {new Date(t.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{t.content}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleHighlight(t.id, t.isHighlighted); }}
                        className={`shrink-0 text-xs px-2 py-1 rounded transition-opacity ${
                          t.isHighlighted
                            ? "bg-yellow-300 text-yellow-800"
                            : "opacity-0 group-hover:opacity-100 bg-gray-100 text-gray-600 hover:bg-yellow-100"
                        }`}
                      >
                        {t.isHighlighted ? "已标记" : "标记重点"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Todo Quick Add */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">待办事项</h2>
                <Button size="sm" onClick={() => setShowTodoForm(true)}>添加待办</Button>
              </div>
              {meeting.todos.length === 0 ? (
                <p className="text-sm text-gray-400">暂无待办</p>
              ) : (
                <div className="space-y-2">
                  {meeting.todos.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className={getTodoStatusColor(t.status)}>{getTodoStatusLabel(t.status)}</Badge>
                        <span className="text-sm text-gray-700">{t.content}</span>
                      </div>
                      <span className="text-xs text-gray-400">{t.assignee} · {t.dueDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* Tab 3: Post-meeting */}
        <TabPanel data-tab="post">
          <div id="post-meeting-tab" className="space-y-6">
            {/* Minutes */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">会议纪要</h2>
                {meeting.minutes ? (
                  <Button size="sm" variant="secondary" onClick={() => router.push(`/meeting/${params.id}/minutes`)}>
                    查看/编辑纪要
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleGenerateMinutes} disabled={generatingMinutes}>
                    {generatingMinutes ? "生成中..." : "生成会议纪要"}
                  </Button>
                )}
              </div>
              {meeting.minutes ? (
                <p className="text-sm text-gray-500">纪要已生成，点击查看或编辑</p>
              ) : (
                <p className="text-sm text-gray-400">
                  {meeting.status === "completed"
                    ? "点击生成按钮，自动聚合转写重点和待办事项生成纪要"
                    : "会议结束后可生成纪要"}
                </p>
              )}
            </div>

            {/* Post-meeting todos */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">待办事项 ({meeting.todos.length})</h2>
              {meeting.todos.length === 0 ? (
                <p className="text-sm text-gray-400">暂无待办</p>
              ) : (
                <div className="space-y-2">
                  {meeting.todos.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className={getTodoStatusColor(t.status)}>{getTodoStatusLabel(t.status)}</Badge>
                        <span className="text-sm text-gray-700">{t.content}</span>
                      </div>
                      <span className="text-xs text-gray-400">{t.assignee} · 截止 {t.dueDate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabPanel>
      </Tabs>

      {/* Todo Form Dialog */}
      <Dialog open={showTodoForm} onClose={() => setShowTodoForm(false)} title="添加待办事项">
        <form onSubmit={handleAddTodo} className="space-y-4">
          <Input label="待办内容" id="todoContent" value={todoForm.content} onChange={(e) => setTodoForm({ ...todoForm, content: e.target.value })} required />
          <Input label="负责人" id="todoAssignee" value={todoForm.assignee} onChange={(e) => setTodoForm({ ...todoForm, assignee: e.target.value })} required />
          <Input label="截止日期" id="todoDue" type="date" value={todoForm.dueDate} onChange={(e) => setTodoForm({ ...todoForm, dueDate: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowTodoForm(false)}>取消</Button>
            <Button type="submit">添加</Button>
          </div>
        </form>
      </Dialog>

      <OnboardingGuide
        stepRange={[4, 6]}
        onStepChange={handleGuideStepChange}
        onNavigate={(nextStep) => {
          if (nextStep > 6) {
            // 引导全部完成，回到首页
            router.push("/");
          }
        }}
      />
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-2 py-1.5 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
      <span className={`text-sm ${checked ? "text-gray-400 line-through" : "text-gray-700"}`}>{label}</span>
    </label>
  );
}

function FileIcon({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    "application/pdf": "text-red-500",
    "application/msword": "text-blue-500",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "text-blue-500",
    "application/vnd.ms-powerpoint": "text-orange-500",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "text-orange-500",
  };
  const iconMap: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOC",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPT",
  };
  const isImage = type.startsWith("image/");

  if (isImage) {
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    );
  }

  return (
    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center ${colorMap[type] || "text-gray-500"}`}>
      {iconMap[type] || "?"}
    </span>
  );
}
