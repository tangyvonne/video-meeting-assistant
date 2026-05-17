"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Folder {
  id: string;
  name: string;
  _count?: { files: number };
}

interface FavoriteFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  sourceTitle?: string | null;
  sourceMeetingId?: string | null;
  folderId?: string | null;
}

function getFileIcon(type: string) {
  if (type.includes("pdf")) return "📄";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("presentation") || type.includes("powerpoint")) return "📊";
  if (type.includes("sheet") || type.includes("excel")) return "📈";
  if (type.includes("image")) return "🖼";
  return "📎";
}

export default function FilesPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FavoriteFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [starring, setStarring] = useState<Record<string, boolean>>({});

  const fetchFolders = useCallback(async () => {
    const res = await fetch("/api/folders");
    const json = await res.json();
    setFolders(json.data || []);
  }, []);

  const fetchFiles = useCallback(async () => {
    const params = selectedFolder ? `?folderId=${selectedFolder}` : "";
    const res = await fetch(`/api/favorite-files${params}`);
    const json = await res.json();
    setFiles(json.data || []);
  }, [selectedFolder]);

  useEffect(() => { fetchFolders(); fetchFiles(); }, [fetchFolders, fetchFiles]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    setNewFolderName("");
    setShowNewFolder(false);
    fetchFolders();
  };

  const handleDeleteFolder = async (id: string) => {
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (selectedFolder === id) setSelectedFolder("");
    fetchFolders();
    fetchFiles();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (selectedFolder) formData.append("folderId", selectedFolder);
    await fetch("/api/favorite-files", { method: "POST", body: formData });
    setUploading(false);
    fetchFiles();
    fetchFolders();
  };

  const handleDeleteFile = async (id: string) => {
    await fetch(`/api/favorite-files/${id}`, { method: "DELETE" });
    fetchFiles();
    fetchFolders();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">重要文件</h1>
          <p className="text-sm text-gray-500 mt-1">集中管理会议资料和常用文件</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 text-sm px-4 py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {uploading ? "上传中..." : "上传文件"}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif" />
          </label>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 左侧：文件夹 */}
        <div className="w-[220px] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-700">文件夹</h2>
            <button
              onClick={() => setShowNewFolder(!showNewFolder)}
              className="text-primary-600 hover:bg-primary-50 p-1 rounded transition-colors"
              title="新建文件夹"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {showNewFolder && (
            <div className="mb-2 flex gap-1">
              <input
                className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                placeholder="文件夹名称"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
              />
              <button onClick={handleCreateFolder} className="text-primary-600 hover:bg-primary-50 px-2 py-1 rounded text-sm font-medium">
                确定
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedFolder("")}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                selectedFolder === "" ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              全部文件
            </button>
            {folders.map((folder) => (
              <div key={folder.id} className="group flex items-center">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`flex-1 text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    selectedFolder === folder.id ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.56.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
                  </svg>
                  {folder.name}
                  {folder._count && (
                    <span className="text-xs text-gray-400 ml-auto">{folder._count.files}</span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-1 shrink-0 transition-all"
                  title="删除文件夹"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：文件列表 */}
        <div className="flex-1 min-w-0">
          {files.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p>暂无文件，上传或从会议中转存</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.fileName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        {file.sourceTitle && (
                          <span className="flex items-center gap-1 text-primary-600">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            来源：
                            {file.sourceMeetingId ? (
                              <Link href={`/meeting/${file.sourceMeetingId}`} className="hover:underline">
                                {file.sourceTitle}
                              </Link>
                            ) : (
                              file.sourceTitle
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={file.filePath}
                      download={file.fileName}
                      className="text-primary-600 text-sm hover:underline"
                    >
                      下载
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
