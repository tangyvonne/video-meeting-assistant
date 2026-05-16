# CLAUDE.md — 视频会议助手项目指引

## 项目简介

「视频会议助手」是一个面向办公场景的网页应用，聚焦会前准备与会后跟进，帮助用户管理视频会议、生成纪要、跟踪待办。

**技术栈**：Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + Prisma + SQLite

## 标准文件索引

所有项目规范文档位于 `docs/` 目录，开发前请先查阅相关标准：

| 文档 | 路径 | 何时查阅 |
|------|------|----------|
| 需求规格说明书 | [docs/01-需求规格说明书.md](docs/01-需求规格说明书.md) | 理解功能需求 |
| 技术选型与架构 | [docs/02-技术选型与架构.md](docs/02-技术选型与架构.md) | 技术决策、目录结构 |
| UI设计规范 | [docs/03-UI设计规范.md](docs/03-UI设计规范.md) | UI开发、颜色/字体/布局 |
| 数据库设计 | [docs/04-数据库设计.md](docs/04-数据库设计.md) | 数据模型、Prisma Schema |
| API接口规范 | [docs/05-API接口规范.md](docs/05-API接口规范.md) | API开发、请求/响应格式 |
| 开发阶段划分 | [docs/06-开发阶段划分.md](docs/06-开发阶段划分.md) | 当前阶段任务和验收标准 |
| 部署运维指南 | [docs/07-部署运维指南.md](docs/07-部署运维指南.md) | 部署上线、环境配置 |

## 开发工作流

1. **开始每日工作前**：查看 `开发日志/` 中最新的日志，了解当前进度和待办。
2. **开发阶段遵循**：`docs/06-开发阶段划分.md` 定义了 7 个阶段的详细任务和验收标准。
3. **每日收工时**：更新 `开发日志/YYYY-MM-DD.md`，记录本日完成、问题和待办。

## 开发约定

- 所有数据交互通过 Next.js API Routes（`src/app/api/`），前端不直接访问数据库
- UI 组件使用 shadcn/ui（`src/components/ui/`），保持设计规范一致性
- 数据库操作通过 Prisma 客户端（`src/lib/db.ts`）
- 文件上传存储在 `public/uploads/` 目录
- 颜色体系参考 `docs/03-UI设计规范.md` 中的色值定义

## 关键命令

```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 生产构建
npx prisma studio    # 查看/编辑数据库
npx prisma migrate dev --name <name>  # 数据库迁移
```
