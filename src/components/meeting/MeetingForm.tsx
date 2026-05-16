"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface MeetingFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  host: string;
  attendees: string;
  link: string;
  platform: string;
  agenda: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: MeetingFormData) => void;
  initial?: Partial<MeetingFormData>;
  onParseLink?: (link: string) => Promise<{ platform: string; title: string } | null>;
}

const defaultForm: MeetingFormData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  duration: 60,
  host: "",
  attendees: "",
  link: "",
  platform: "other",
  agenda: "",
};

export function MeetingForm({ open, onClose, onSave, initial, onParseLink }: Props) {
  const [form, setForm] = useState<MeetingFormData>({ ...defaultForm, ...initial });
  const [parsing, setParsing] = useState(false);

  const handleChange = (field: keyof MeetingFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleParse = async () => {
    if (!form.link || !onParseLink) return;
    setParsing(true);
    const result = await onParseLink(form.link);
    if (result) {
      setForm((prev) => ({
        ...prev,
        platform: result.platform,
        title: result.title || prev.title,
      }));
    }
    setParsing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setForm(defaultForm);
  };

  const platformOptions = [
    { value: "tencent", label: "腾讯会议" },
    { value: "feishu", label: "飞书" },
    { value: "dingtalk", label: "钉钉" },
    { value: "other", label: "其他" },
  ];

  return (
    <Dialog open={open} onClose={onClose} title={initial?.title ? "编辑会议" : "新建会议"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="会议主题" id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} required />
          </div>
          <Input label="日期" id="date" type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} required />
          <Input label="负责人" id="host" value={form.host} onChange={(e) => handleChange("host", e.target.value)} required />
          <Input label="开始时间" id="startTime" type="time" value={form.startTime} onChange={(e) => handleChange("startTime", e.target.value)} required />
          <Input label="结束时间" id="endTime" type="time" value={form.endTime} onChange={(e) => handleChange("endTime", e.target.value)} required />
          <Input label="预计时长（分钟）" id="duration" type="number" value={form.duration} onChange={(e) => handleChange("duration", parseInt(e.target.value))} required />
          <Input label="参会人（逗号分隔）" id="attendees" value={form.attendees} onChange={(e) => handleChange("attendees", e.target.value)} required />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input label="会议链接" id="link" value={form.link} onChange={(e) => handleChange("link", e.target.value)} placeholder="粘贴会议链接后可自动解析" />
          </div>
          <Button type="button" variant="secondary" onClick={handleParse} disabled={parsing || !form.link}>
            {parsing ? "解析中..." : "解析"}
          </Button>
        </div>

        <Select label="会议平台" id="platform" options={platformOptions} value={form.platform} onChange={(e) => handleChange("platform", e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会议议程</label>
          <textarea
            id="agenda"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            value={form.agenda}
            onChange={(e) => handleChange("agenda", e.target.value)}
            placeholder="1. 议题一&#10;2. 议题二"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    </Dialog>
  );
}
