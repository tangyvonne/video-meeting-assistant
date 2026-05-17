"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface GuideStep {
  step: number;
  total: number;
  target: string;       // element id or "center"
  title: string;
  desc: string;
  style: React.CSSProperties;
}

const allSteps: Omit<GuideStep, "step" | "total">[] = [
  {
    target: "create-btn",
    title: "从这里开始",
    desc: "点击这里创建你的第一个会议，支持链接导入，一键解析会议信息。",
    style: { top: "72px", right: "16px" },
  },
  {
    target: "first-meeting-card",
    title: "查看会议详情",
    desc: "点击任意会议卡片，进入详情页。里面按开会流程分成三个 Tab：会前准备 → 会中助手 → 会后跟进。",
    style: { top: "130px", left: "276px" },
  },
  {
    target: "sidebar-files",
    title: "重要文件区",
    desc: "会议资料集中存放。可以建文件夹、直接上传，从会议转存的文件会标注来源。",
    style: { top: "158px", left: "218px" },
  },
  {
    target: "sidebar-todos",
    title: "待办总览",
    desc: "所有会议的待办都在这里。按状态筛选、修改进度、一键导出 Excel。",
    style: { top: "196px", left: "218px" },
  },
  {
    target: "documents-section",
    title: "会前准备",
    desc: "在这里上传会议资料，一键转存到重要文件区，方便以后查找。",
    style: { top: "360px", left: "280px" },
  },
  {
    target: "in-meeting-tab",
    title: "会中助手",
    desc: "开会时记下重点内容并高亮，随时添加待办事项，指派负责人和截止日期。",
    style: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  },
  {
    target: "post-meeting-tab",
    title: "会后跟进",
    desc: "结束会议后自动生成纪要，汇总所有重点内容和待办事项，一目了然。",
    style: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  },
];

interface OnboardingGuideProps {
  /** 此页面负责的步骤范围 [start, end]（从 0 开始） */
  stepRange: [number, number];
  /** 进入下一步时回调（可用于跨页面导航） */
  onNavigate?: (nextStep: number) => void;
  /** 步骤切换时回调（可用于同步 UI，如切换 Tab） */
  onStepChange?: (step: number) => void;
}

export function OnboardingGuide({ stepRange, onNavigate, onStepChange }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("meetmate_guide_seen");
    if (seen) return;

    const saved = localStorage.getItem("meetmate_guide_step");
    const savedStep = saved ? parseInt(saved) : 0;

    // 如果已完成的步骤超出了此页面的范围，直接显示此页面的第一步
    if (savedStep > stepRange[1]) {
      // 跳到下一个页面去处理
      onNavigate?.(savedStep);
      return;
    }

    if (savedStep >= stepRange[0] && savedStep <= stepRange[1]) {
      setCurrentStep(savedStep);
    } else if (savedStep < stepRange[0]) {
      // 还没到这一步，不显示
    }
    setReady(true);
  }, [stepRange, onNavigate]);

  const totalSteps = 7;

  // 通知父组件步骤变化
  useEffect(() => {
    if (currentStep >= 0) onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const dismiss = () => {
    localStorage.setItem("meetmate_guide_seen", "1");
    localStorage.removeItem("meetmate_guide_step");
    setCurrentStep(-1);
  };

  const next = () => {
    const nextStep = currentStep + 1;
    if (nextStep >= totalSteps) {
      dismiss();
      return;
    }
    localStorage.setItem("meetmate_guide_step", String(nextStep));

    // 如果下一步超出了此页面范围，交给 onNavigate 处理
    if (nextStep > stepRange[1]) {
      setCurrentStep(-1);
      onNavigate?.(nextStep);
      return;
    }

    setCurrentStep(nextStep);
  };

  // 不显示的情况
  if (!ready || currentStep < 0 || currentStep < stepRange[0] || currentStep > stepRange[1]) {
    return null;
  }

  const guide = allSteps[currentStep];
  if (!guide) return null;

  const stepData: GuideStep = { ...guide, step: currentStep + 1, total: totalSteps };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={dismiss} />
      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-primary-200 p-5 w-72 pointer-events-auto"
        style={stepData.style}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
            {stepData.step}
          </span>
          <span className="text-xs text-gray-400">
            {stepData.step} / {stepData.total}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{stepData.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{stepData.desc}</p>
        <div className="flex justify-between items-center mt-4">
          <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600">
            跳过
          </button>
          <Button size="sm" onClick={next}>
            {stepData.step < stepData.total ? "下一步" : "知道了"}
          </Button>
        </div>
      </div>
    </div>
  );
}
