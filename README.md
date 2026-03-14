# Manga Drama Studio

AI 驱动的漫剧/短剧全流程自动化制作平台。用户输入故事文本或创意简报，平台通过多个 AI Agent 协作，自动完成从前期设定、剧本撰写、分镜规划、图片/视频生成到最终成片的完整流程。

## 项目结构

```
manga-drama-studio/
├── packages/
│   ├── frontend/          # React + TypeScript + Tailwind CSS
│   └── backend/           # FastAPI + SQLAlchemy + LangGraph
├── docs/
│   └── PRD.md             # 产品需求文档
└── Makefile
```

## 核心功能

- **项目管理** — 创建、配置和管理多个漫剧项目
- **资产仓库** — 角色、场景、道具的设定与管理
- **剧本编辑** — AI 辅助的剧本撰写与编辑
- **分镜编排** — 可视化分镜规划与编辑
- **AI 生成** — 图片/视频/音频多 Provider 支持
- **版本对比** — 不同版本的可视化对比

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Tailwind CSS 4, React Router, TanStack Query, Zustand |
| 后端 | Python 3.12+, FastAPI, SQLAlchemy (async), LangGraph |
| 数据库 | SQLite (开发) / PostgreSQL (生产) |
| 任务队列 | arq + Redis |

## 快速开始

### 前置要求

- Node.js >= 18
- [uv](https://docs.astral.sh/uv/) (Python 包管理器)

### 安装依赖

```bash
make install
```

### 启动开发环境

```bash
make dev
```

前端默认运行在 `http://localhost:5173`，后端运行在 `http://localhost:8000`。

### 其他命令

```bash
make frontend    # 仅启动前端
make backend     # 仅启动后端
make build       # 构建前端生产包
make test        # 运行测试
make clean       # 清理构建产物
```

## 文档

详细的产品需求文档见 [docs/PRD.md](docs/PRD.md)。

## License

MIT
