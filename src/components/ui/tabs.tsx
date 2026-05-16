"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  children: React.ReactNode;
}

export function Tabs({ tabs, active, onChange, children }: TabsProps) {
  const childrenArr = React.Children.toArray(children);
  return (
    <div>
      <div className="flex border-b border-gray-200 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              active === tab.key
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {childrenArr.find((c: any) => c.props?.["data-tab"] === active)}
      </div>
    </div>
  );
}

export function TabPanel({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <div {...props}>{children}</div>;
}
