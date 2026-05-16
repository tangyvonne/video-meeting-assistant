"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { getTodoStatusLabel, getTodoStatusColor } from "@/lib/utils";

interface Todo {
  id: string;
  meetingId: string;
  content: string;
  assignee: string;
  dueDate: string;
  status: string;
  meeting: { title: string; date: string } | null;
}

const statusFilters = [
  { value: "", label: "全部" },
  { value: "pending", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "done", label: "已完成" },
  { value: "overdue", label: "已逾期" },
];

const statusOptions = [
  { value: "pending", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "done", label: "已完成" },
  { value: "overdue", label: "已逾期" },
];

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    const url = filter ? `/api/todos?status=${filter}` : "/api/todos";
    const res = await fetch(url);
    const json = await res.json();
    setTodos(json.data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTodos();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/todos/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchTodos();
  };

  const handleExport = () => {
    window.open("/api/todos/export", "_blank");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">待办事项</h1>
          <p className="text-sm text-gray-500 mt-1">跨会议管理所有待办任务</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          导出 Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === sf.value
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Todo List */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : todos.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">暂无待办事项</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">待办内容</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-24">负责人</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">截止日期</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-28">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 w-32">所属会议</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todos.map((todo) => (
                <tr key={todo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{todo.content}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{todo.assignee}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{todo.dueDate}</td>
                  <td className="px-4 py-3">
                    <select
                      value={todo.status}
                      onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {todo.meeting ? (
                      <Link href={`/meeting/${todo.meetingId}`} className="text-xs text-primary-600 hover:underline">
                        {todo.meeting.title}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(todo.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} title="确认删除">
        <p className="text-sm text-gray-600 mb-4">确定要删除这个待办事项吗？此操作不可撤销。</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>取消</Button>
          <Button variant="danger" onClick={handleDelete}>确认删除</Button>
        </div>
      </Dialog>
    </div>
  );
}
