# Manga Drama Studio — 产品需求文档 (PRD)

> AI漫剧自动化制作平台
> 版本：v1.0 | 创建日期：2026-03-12

---

## 1. 产品概述

### 1.1 产品定位

Manga Drama Studio 是一个 **AI 驱动的漫剧/短剧全流程自动化制作平台**。用户输入故事文本或创意简报，平台通过 6 个 AI Agent 协作，自动完成从前期设定、剧本撰写、分镜规划、图片/视频生成到最终成片的完整制作流程。

### 1.2 目标用户

| 用户类型 | 场景 | 核心诉求 |
|---------|------|---------|
| 个人创作者 | 将网文/小说改编为竖屏漫剧 | 零技术门槛，一键生成 |
| 自媒体团队 | 批量生产短剧内容 | 提高效率，降低人力成本 |
| MCN机构 | 规模化漫剧内容生产 | 多项目并行，质量可控 |
| 独立开发者 | 构建自己的 AI 视频生产线 | 灵活的 Provider 配置和 API |

### 1.3 核心价值主张

- **端到端自动化**：从文本到成片，一个平台完成
- **人机协作**：4 个关键审批门（Gate），人工把关质量
- **多 Provider 支持**：图片/视频/音频/文本均可自由切换底层 AI 服务商
- **精细控制**：支持单面板级别的重新生成、候选媒体选择、版本回退
- **专业级工作流**：融合虚拟片场、Video Prompt 转写、Insert Shot 等影视制作方法论

### 1.4 产品边界（MVP 范围）

**包含**：
- 项目管理（创建/配置项目）
- 资产管理（角色/场景/道具的设定与出图）
- 剧本编辑与自动生成
- 分镜规划与编辑
- AI 图片/视频/音频生成
- 流水线执行与实时监控
- 质量审查与单面板重生成

**不包含（后续版本）**：
- 用户认证与多租户
- 计费系统
- 浏览器端时间线剪辑
- 全局资产库（跨项目复用）
- 移动端适配

---

## 2. 制作流水线

### 2.1 统一流水线（16 Stage, 5 Phase）

平台的核心是一条 16 阶段的自动化流水线，由 6 个 AI Agent 协作完成，中间设置 4 个人工审批门。

```
Phase I: Pre-Production（前期设定）
  Stage 1  全局设定 ──────── Writer Agent
  Stage 2  实体提取 ──────── Writer Agent
  Stage 3  资产设计 ──────── Artist Agent（并行）
  ──── GATE 1: 创意审批 ────

Phase II: Script（剧本制作）
  Stage 4  集剧本 ─────────── Writer Agent
  Stage 5  分镜规划 ────────── Director Agent
  ──── GATE 2: 分镜审批 ────

Phase III: Visual Production（视觉制作）
  Stage 6  分镜图生成 ──────── Artist Agent（per-panel 并行）
  Stage 7  尾帧图生成 ──────── Artist Agent（仅首尾帧模式）
  Stage 8  Video Prompt 转写 ── Director Agent
  Stage 9  分镜视频生成 ────── Video Agent

Phase IV: Audio & Sync（音频同步）
  Stage 10 语音合成 ────────── Audio Agent
  Stage 11 对口型同步 ─────── Video Agent
  ──── GATE 3: 制作审批 ────

Phase V: Post-Production（后期制作）
  Stage 12 音频混合 ────────── Audio Agent
  Stage 13 视频合成 ────────── Video Agent
  Stage 14 质量检查 ────────── QA Agent
  ──── GATE 4: 终审 ────
```

### 2.2 Agent 角色定义

| Agent | 职责 | 负责 Stage |
|-------|------|-----------|
| **Writer Agent** | 故事创作、世界观设定、角色/场景/道具提取、剧本撰写 | 1, 2, 4 |
| **Director Agent** | 分镜规划（镜头拆解、转场审查、Insert Shot、表演指导、虚拟片场）、Video Prompt 转写 | 5, 8 |
| **Artist Agent** | 角色/场景/道具视觉设计、分镜图生成、尾帧图生成 | 3, 6, 7 |
| **Video Agent** | 分镜视频生成、对口型同步、最终视频合成 | 9, 11, 13 |
| **Audio Agent** | 语音合成（TTS + 情绪控制）、音频混合 | 10, 12 |
| **QA Agent** | 三轮质量检查（技术/视觉/叙事） | 14 |

### 2.3 审批门（Gate）机制

| Gate | 位置 | 审批内容 | 用户操作 |
|------|------|---------|---------|
| **GATE 1** | 资产设计完成后 | 角色外观、场景风格、道具状态是否符合创意意图 | 通过 / 修改反馈后重做 |
| **GATE 2** | 分镜规划完成后 | 镜头节奏、叙事逻辑、转场设计是否合理 | 通过 / 修改反馈后重做 |
| **GATE 3** | 音频同步完成后 | 图片/视频/配音质量，可选择单面板重新生成 | 通过 / 选择面板重新生成 |
| **GATE 4** | 质量检查完成后 | 最终成片终审，确认或返回修改 | 通过发布 / 返回修改 |

Gate 实现方式：LangGraph `interrupt()` 暂停流水线，用户通过前端提交决策后 `Command(resume=...)` 恢复执行。

---

## 3. 功能需求

### 3.1 项目管理

#### FR-3.1.1 项目 CRUD

- 创建项目时设置：标题、类型（玄幻/都市/言情...）、描述
- 项目配置：
  - 画幅尺寸（默认 1080×1920 竖屏 9:16）
  - 默认面板数量（默认 20）
  - 全局风格前缀（如 "modern chinese anime style, cel shading"）
  - **Per-step 模型选择**：每个阶段可独立选择 AI 模型
    - 分析模型（Writer Agent 用）
    - 图片模型（Artist Agent 用）
    - 视频模型（Video Agent 用）
    - 角色模型（角色出图专用）
    - 分镜模型（分镜出图专用）
    - 配音模型（Audio Agent 用）
- 项目状态：init → in_progress → completed
- 项目预算上限设置

#### FR-3.1.2 项目仪表盘

- 显示项目下所有集的进度
- 显示已消耗预算 / 预算上限
- 快速跳转到各功能模块

### 3.2 资产管理

#### FR-3.2.1 角色管理

**角色基础信息**：
- 姓名（中/英）、性别、年龄段
- 角色重要性分级：S/A/B/C/D
  - S级：绝对主角（180-220字描述）
  - A级：核心配角（150-180字）
  - B级：重要配角（120-150字）
  - C级：次要角色（80-120字）
  - D级：群众演员（50-80字）
- 原型（archetype）、人格标签
- 服装华丽度（1-5级，由身份决定）
- 基础外貌描述
- 视觉关键词（JSON 数组）

**多外观状态（Appearance）**：
- 每个角色可有多个外观状态（如"日常"、"战斗"、"觉醒"）
- 每个外观包含：标签、描述、Prompt 修饰词、已选参考图
- 主外观（id=0）为完整描述，子外观（id≥1）只描述视觉变化部分

**AI 出图规则**：
- 面部特征占描述 40%+
- 禁止描写：皮肤颜色、眼睛颜色、唇色、表情姿态、背景环境、抽象气质
- 鞋子必填
- 出图类型：全身标准图、三视图（正/侧/背）、表情变体

**角色一致性保障**：
- 三视图使用相同 seed
- 固定角色锚点描述
- 支持 LoRA 模型路径绑定
- 支持面部嵌入（face embedding）路径
- 支持语音预设绑定

#### FR-3.2.2 场景管理

**场景基础信息**：
- 名称（中文 "地点_时间/状态"）
- 空间描述（前景/中景/背景三层）
- 配色基调
- 关键装置清单（SET 编号）

**虚拟片场**：
- ASCII 平面图（定位图）
- 灯光预设（JSON，L1/L2/L3 光源位置+色温）
- 色板（JSON，Hex 色值数组）
- 空间结构（JSON，尺寸参数）

**四方位视图（Scene View）**：
- 每个场景最多 4 个方位视图（N/S/E/W）
- 分级策略：
  - 5+ 个镜头的核心场景 → 4 方位
  - 3-4 个镜头的重要场景 → 2 方位（N+S）
  - 1-2 个镜头的次要场景 → 1 方位（N）
- 方位锚定规则：
  - 宫殿/大殿 → 面向主座/龙椅为北
  - 客厅/房间 → 面向主墙为北
  - 街道 → 沿主要行进方向为北
- 空间自洽校验：北面右侧物体 = 东面靠近镜头处物体；光源方向四视图一致

**场景出图规则**：
- 场景图不能出现有名有姓的角色
- 每个方向 100-150 字描述
- Prompt 公式：`[全局前缀] + [场景描述] + [三层空间] + [方向视角] + [灯光氛围] + [风格限定]`

#### FR-3.2.3 道具管理

**道具基础信息**：
- 名称、别名、分类（weapon/document/artifact/container/token/tool/consumable/other）
- 道具重要性分级：S/A/B/C
- 视觉描述（优先级：整体形态 40% → 颜色纹理 → 关键细节 → 尺寸参照）
- 关联角色、出现场景

**三问判断法（是否需要提取道具）**：
1. 需要单独制作视觉资产（参考图）吗？
2. 在多个镜头中出现、需要外观一致吗？
3. 外观前后不一致，观众会注意到吗？
→ 至少一个"是"则提取

**多状态（Prop State）**：
- 每个道具可有多个状态（如退婚书的"卷起"/"展开"/"手持"）
- 记录：物理变化、组合变化、升级变化
- 不记录：临时特效、使用动作、位置移动

**出图规则**：
- 每个状态独立出图
- 禁止描写：抽象能力、非视觉属性、使用效果
- Prompt 公式：`[全局前缀] + [道具描述] + [状态] + [材质细节] + object only on neutral background`

### 3.3 剧本系统

#### FR-3.3.1 剧本自动生成

- 输入：全局设定 + 单集剧情概要
- 输出：标准影视剧本格式
  - 场景头：内景/外景 + 地点 + 时间
  - 场景描述：环境氛围、空间布局
  - 动作（action）：角色行为、镜头暗示
  - 对话（dialogue）：角色名 + 情绪提示 + 台词
  - 画外音（voiceover）：旁白、独白

**核心原则**：
- 15 秒 ≈ 1 个分镜
- 对话必须有说话者独立镜头
- 情绪高潮前置画面描述
- 禁止纯文字信息 dump
- 每集 1.5-2 分钟时长
- 结尾有钩子

#### FR-3.3.2 剧本编辑器

- 支持手动编辑自动生成的剧本
- 实体自动链接（角色名/场景名/道具名高亮可点击）
- 实时字数和预估时长统计

### 3.4 分镜系统

#### FR-3.4.1 分镜自动规划

**Director Agent 分镜规划包含 4 个子任务**：

**5a. 镜头拆解**（19 字段 + 机位验证）：
- 每格分镜字段：编号、名称、景别（shot_type）、机位角度（camera_angle）、镜头运动（camera_movement）、机位位置描述（camera_position_desc）、时长
- 内容字段：动作、氛围、情绪、对话、旁白、表演指导（acting_notes）
- 关联：角色列表（含外观ID）、道具列表（含状态ID）、场景+方位
- 核心比例：每 15 个字符 ≈ 1 个镜头

**5b. 转场审查 + Insert Shot**：
- 逐对审查所有相邻分镜转场
- 三类 Insert Shot：
  - 动作过渡（0.8-1.5s）：肢体动作连接两个空间
  - 反应过渡（0.8-1.2s）：角色微反应连接因果
  - 冲击过渡（0.8-1.5s）：物理冲击强化转折感
- Insert Shot 使用小数编号（如 P5.5）
- 保留刻意设计的硬切（SMASH-CUT、CONTRAST CUT）

**5c. 表演指导**（5 种场景类型）：
- daily：自然松弛，微表情
- emotion：细腻层次，眼神戏
- action：爆发力强，动作干脆
- epic：庄重仪式感
- suspense：紧绷警觉
- 禁止抽象情绪词 → 改用可见表现（表情、肢体、微动作）

**5d. 虚拟片场分配**：
- 每格分镜标注：可见片场元素（JSON）、灯光方向
- Prompt 拼接公式：`[全局前缀] | [该机位可见片场元素] | [灯光方向] | [角色锚点+表情] | [镜头语言]`

**机位验证（每个 panel 出图前必查）**：

| 机位类型 | 相机位置 | 能看到 | 不能看到 |
|---------|---------|--------|---------|
| 俯拍（>45°朝下） | 正上方 | 地面、人头顶 | 人正脸 |
| 斜俯拍（15-45°） | 高空斜角 | 全貌+前侧 | 某些情况看不到正脸 |
| 平视 | 与被摄体同高 | 正面/侧面 | 人头顶、地面俯视 |
| 仰拍 | 低于被摄体 | 下颌、天空 | 头顶和发型 |
| 越肩（OTS） | 肩后 | 另一角色正脸 | 近端角色正脸 |

#### FR-3.4.2 分镜编辑器

- 面板网格视图（缩略图）
- 14 维度详情侧边栏（点击面板展开）
- 拖拽排序、Insert Shot 插入
- 单面板重新生成（图片/视频/配音独立重做）
- 候选媒体画廊（同一面板多个候选，选择最佳）

#### FR-3.4.3 生成模式决策

每个面板自动或手动选择生成模式：

| 模式 | 适用场景 | 输入 |
|------|---------|------|
| **单帧图生视频**（默认） | 表情变化、简单动作、环境微动 | 首帧图 + 动作 prompt |
| **首尾帧** | 姿态大变化、空间位移、道具状态变化 | 首帧图 + 尾帧图 + 过渡 prompt |
| **纯文生视频** | 无法用静帧表达的特效/抽象画面 | 完整 prompt（含角色外貌） |

**首尾帧硬性限制**：
- 首尾帧之间只改变一个维度（姿态/位置/道具状态）
- 差异度大的面板标记为"需拆段"
- 景别和镜头角度必须保持一致

### 3.5 Video Prompt 转写

> 画面描述 ≠ Video Prompt。画面描述是中文导演笔记（给人看），Video Prompt 是英文关键词（给 AI 看）。

#### FR-3.5.1 角色视觉映射表

每个项目维护一张"角色名 → 英文外貌描述"的映射表：

```
角色名    | 形象  | Video Prompt 描述
沈渊（初始）| 形象0 | young man, messy black hair, grey hemp robe with tea stains, thin build
沈渊（觉醒）| 形象1 | young man, dark gold patterns on face, golden slit pupils, ...
```

#### FR-3.5.2 六条转写规则

| # | 规则 | 示例 |
|---|------|------|
| 1 | 角色名 → 外貌描述 | "云傲天" → "thin tall young man in dark purple robe" |
| 2 | 情绪标签 → 可见动作 | "[嘲讽]" → "sneering, head tilted back, lips curled" |
| 3 | 隐含镜头 → 显式声明 | （没写运动）→ "static camera" |
| 4 | 中文叙事 → 英文关键词 | "满堂哄笑的大殿" → "grand hall filled with laughing crowd" |
| 5 | 多动作 → 单焦点 | 多个动作 → 拆段或只保留主动作 |
| 6 | 空间模糊 → 明确方位 | "身后仆人" → "two servants in background stepping forward" |

#### FR-3.5.3 首帧图模式特殊规则

- **有首帧图** → prompt 只写动作 + 镜头运动 + 环境氛围，删除所有角色外貌描述
- **无首帧图**（纯文生视频）→ prompt 按完整公式写，包含角色外貌

### 3.6 AI 生成

#### FR-3.6.1 图片生成

- 角色参考图生成（全身图、三视图、表情变体）
- 场景图生成（四方位视图）
- 道具图生成（多状态）
- 分镜图生成（per-panel 并行）
- 尾帧图生成（仅首尾帧模式面板）

#### FR-3.6.2 视频生成

- 单帧图生视频（默认模式）
- 首尾帧模式
- 纯文生视频
- 链式续接（截帧传递 / Seedance 续接 / 可灵链式）
- 每段视频只做一个动作（硬性限制）

**按分镜类型自动选择工具**：

| 分镜类型 | 推荐工具 | 模式 |
|---------|---------|------|
| 对话镜头 | Seedance | 单帧 |
| 表情微动 | Seedance | 单帧 |
| 姿态变化 | Kling | 首尾帧 |
| 道具动作 | Kling | 首尾帧 |
| 场景转场 | Kling / Vidu | 首尾帧 |
| 环境氛围 | Vidu | 单帧 |
| 循环视频 | Vidu | 首尾帧 |
| 特效/觉醒 | Seedance | 纯文生 |
| 链式长镜头 | Kling / Seedance | 链式续接 |

#### FR-3.6.3 语音合成

- 基于角色的声线绑定（voice_preset_id）
- 情绪控制（emotion + emotion_strength 0.1-0.5）
- 15 秒声线克隆
- 多音字替换处理

**情绪强度参考**：

| 情绪类型 | 强度 | 示例 |
|---------|------|------|
| 平静/陈述 | 0.1-0.15 | "好的，我知道了" |
| 普通对话 | 0.15-0.2 | "你今天怎么来了？" |
| 惊讶/意外 | 0.25-0.3 | "什么？！" |
| 生气/愤怒 | 0.3-0.35 | "你给我滚出去！" |
| 咆哮/嘶吼 | 0.4-0.5 | "我要杀了你！！！" |

#### FR-3.6.4 对口型同步

- Wav2Lip 对口型
- 说话者必须有嘴部可见镜头
- 情感强度与画面情绪匹配

### 3.7 后期合成

#### FR-3.7.1 音频混合

- 对白响度：-16 LUFS
- BGM 响度：-24 LUFS
- 音效响度：-20 LUFS
- 自动混音平衡

#### FR-3.7.2 视频合成

- FFmpeg 拼接所有分镜视频
- 转场效果（硬切为主，特殊转场按设计）
- 字幕叠加
- LUT 调色统一（抹平不同 AI 工具的风格差异）

#### FR-3.7.3 质量检查（QA Agent）

三轮自动检查：
1. **技术检查**：分辨率、帧率、音画同步、响度标准
2. **视觉检查**：角色一致性、场景连贯性、色调统一
3. **叙事检查**：节奏、情绪曲线、转场逻辑、结尾钩子

输出：6 维质量报告 + 问题列表

### 3.8 流水线执行与监控

#### FR-3.8.1 流水线执行

- 一键启动全流水线执行
- 支持从任意 Stage 恢复执行
- 单面板级别的重新生成（不影响其他面板）
- 自动重试（最多 3 次）
- 多 Provider 降级（主 Provider 失败自动切换备用）

#### FR-3.8.2 实时监控

- SSE 实时推送执行进度
- 每个 Stage 的状态可视化（pending/running/completed/failed/waiting_gate）
- 每个 Step 的 Provider、耗时、成本
- Gate 等待时的决策界面
- 总预算消耗追踪

#### FR-3.8.3 运行时追踪

每次执行记录：
- **PipelineRun**：整体执行状态、总成本
- **PipelineStep**：每个 Stage 的状态、重试次数
- **StepAttempt**：每次尝试的 Provider、模型、耗时、成本、错误信息
- **RunEvent**：SSE 事件序列（step_started, step_completed, gate_waiting, error 等）

### 3.9 媒体资产管理

#### FR-3.9.1 统一 MediaObject

所有生成的媒体（图片/视频/音频）统一管理：
- 类型：image / video / audio
- 用途：character_ref / scene_view / prop_state / panel_frame / panel_lastframe / panel_video / voice_clip / lipsync_video / final_mix / final_video
- 元信息：provider、model、prompt、seed、cost
- 版本追踪：parent_id（自引用），支持 undo/redo
- 候选选择：is_selected 标记当前使用版本

---

## 4. 多 Provider 架构

### 4.1 Provider 类型

| 类型 | 已规划 Provider | 优先级 |
|------|----------------|--------|
| **Text** | OpenRouter（任何 OpenAI 兼容 LLM） | P0 |
| **Image** | Seedream（火山引擎）、FLUX Kontext | P1 |
| **Video** | Seedance、Kling、Vidu、Runway Gen-4 | P1-P2 |
| **Audio** | Fish-Speech、ElevenLabs | P1-P2 |

### 4.2 路由策略

| 策略 | 说明 |
|------|------|
| cost_first | 优先选择成本最低的 Provider |
| quality_first | 优先选择质量评分最高的 Provider |
| fallback_chain | 按优先级顺序尝试，失败自动降级 |
| ab_test | A/B 测试模式，随机分配 |

### 4.3 项目级 Model Override

每个项目可以为每个阶段指定特定的模型，覆盖全局默认：
- `analysis_model`：文本分析（Writer/Director Agent）
- `image_model`：图片生成
- `video_model`：视频生成
- `character_model`：角色出图（可能用不同于普通图片的模型）
- `storyboard_model`：分镜出图
- `voice_model`：语音合成

### 4.4 Provider 管理

- 查看所有已配置 Provider 及状态
- 更新 Provider 配置（API Key、Base URL、默认模型等）
- 测试 Provider 连通性

---

## 5. 数据模型

### 5.1 模型总览（15 张表）

```
┌─────────────────────────────────────────────────────┐
│ Project                                              │
│  ├── Episode (1:N)                                   │
│  │    └── Panel (1:N)                                │
│  │         ├── VoiceLine (1:N)                       │
│  │         └── MediaObject (1:N, via purpose)        │
│  ├── Character (1:N)                                 │
│  │    └── CharacterAppearance (1:N)                  │
│  ├── Scene (1:N)                                     │
│  │    └── SceneView (1:N, max 4: N/S/E/W)           │
│  └── Prop (1:N)                                      │
│       └── PropState (1:N)                            │
│                                                      │
│ PipelineRun (独立)                                    │
│  ├── PipelineStep (1:N)                              │
│  │    └── StepAttempt (1:N)                          │
│  └── RunEvent (1:N, SSE 事件源)                       │
└─────────────────────────────────────────────────────┘
```

### 5.2 关键模型字段

**Panel**（核心模型，30+ 字段）：

| 分类 | 字段 |
|------|------|
| 标识 | panel_number (Float, 支持 Insert Shot 小数编号), title, status |
| 镜头 | shot_type, camera_angle, camera_movement, camera_position_desc, duration |
| 内容 | action, atmosphere, emotion, dialogue, narration, acting_notes, scene_type |
| 虚拟片场 | visible_set_elements (JSON), lighting_direction |
| Prompt | image_prompt, video_prompt (英文), video_mode (single_frame/first_last/text_only), recommended_tool |
| 关联 | characters (JSON), props (JSON), scene_id, episode_id |
| 媒体 | selected_image_id, selected_video_id, lip_sync_media_id |
| Insert | is_insert_shot, insert_type (action/reaction/impact) |

---

## 6. API 设计

### 6.1 资源 CRUD

```
POST   /api/v1/projects                    创建项目
GET    /api/v1/projects                    项目列表
GET    /api/v1/projects/:id                项目详情
PUT    /api/v1/projects/:id                更新项目
DELETE /api/v1/projects/:id                删除项目

POST   /api/v1/projects/:id/characters     创建角色
GET    /api/v1/projects/:id/characters     角色列表
PUT    /api/v1/characters/:id              更新角色
DELETE /api/v1/characters/:id              删除角色

POST   /api/v1/characters/:id/appearances  添加外观
GET    /api/v1/characters/:id/appearances  外观列表

POST   /api/v1/projects/:id/scenes         创建场景
GET    /api/v1/projects/:id/scenes         场景列表
POST   /api/v1/scenes/:id/views            添加方位视图
GET    /api/v1/scenes/:id/views            方位视图列表

POST   /api/v1/projects/:id/props          创建道具
GET    /api/v1/projects/:id/props          道具列表
POST   /api/v1/props/:id/states            添加道具状态
GET    /api/v1/props/:id/states            状态列表

POST   /api/v1/projects/:id/episodes       创建集
GET    /api/v1/projects/:id/episodes       集列表
GET    /api/v1/episodes/:eid               集详情
PUT    /api/v1/episodes/:eid               更新集

POST   /api/v1/episodes/:eid/panels        创建面板
GET    /api/v1/episodes/:eid/panels        面板列表（排序）
PUT    /api/v1/panels/:id                  更新面板
DELETE /api/v1/panels/:id                  删除面板
POST   /api/v1/panels/:id/insert-after     插入面板（小数编号）
POST   /api/v1/panels/:id/voice-lines      添加配音行
GET    /api/v1/panels/:id/voice-lines      配音行列表
```

### 6.2 AI 生成

```
POST   /api/v1/panels/:id/generate-image        生成分镜图
POST   /api/v1/panels/:id/regenerate-image       重新生成分镜图
POST   /api/v1/panels/:id/generate-lastframe     生成尾帧图
POST   /api/v1/panels/:id/generate-video         生成分镜视频
POST   /api/v1/panels/:id/regenerate-video       重新生成视频
POST   /api/v1/panels/:id/generate-voice         生成配音
POST   /api/v1/panels/:id/generate-lipsync       生成对口型视频
POST   /api/v1/panels/:id/undo-regenerate        撤销重新生成

POST   /api/v1/characters/:id/generate-image     生成角色图
POST   /api/v1/scenes/:id/views/generate         生成场景方位图
POST   /api/v1/props/:id/generate-image           生成道具图
```

### 6.3 流水线执行

```
POST   /api/v1/runs                        创建执行
GET    /api/v1/runs/:id                    查询状态
POST   /api/v1/runs/:id/cancel             取消执行
GET    /api/v1/runs/:id/stream             SSE 实时事件流
GET    /api/v1/runs/:id/events?afterSeq=N  轮询回退
POST   /api/v1/gates/:gateId/decision      提交 Gate 决策
       Body: {decision, feedback?, regeneration_targets?}
```

### 6.4 Provider 管理

```
GET    /api/v1/settings/providers               列出已配置 Provider
PUT    /api/v1/settings/providers/:name          更新配置
POST   /api/v1/settings/providers/:name/test     测试连接
```

---

## 7. 前端页面

### 7.1 页面清单

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| 项目列表 | `/projects` | 项目卡片、状态标签、进度条 |
| 项目设置 | `/projects/:id/setup` | per-step 模型选择、风格、画幅、预算 |
| 资产编辑器 | `/projects/:id/assets` | 角色（多外观）+ 场景（四方位）+ 道具（多状态），卡片式布局 |
| 剧本编辑器 | `/projects/:id/episodes/:eid/script` | 标准剧本格式编辑，实体高亮 |
| 分镜编辑器 | `/projects/:id/episodes/:eid/storyboard` | 面板网格 + 14 维度侧栏 + 拖拽排序 + 单面板重生成 |
| 流水线监控 | `/projects/:id/pipeline` | SSE 实时进度 + Gate 决策界面 + 成本追踪 |
| 质量审查 | `/projects/:id/episodes/:eid/review` | 脚本 vs 成品对比、QA 问题列表、一键重生成 |
| 时间线编辑器 | `/projects/:id/episodes/:eid/timeline` | 多轨（视频/音频/BGM/字幕）、裁剪、混音（Phase 5） |

### 7.2 设计原则

- TailwindCSS + shadcn/ui 组件库
- 响应式布局（桌面优先）
- SSE 驱动的实时更新（流水线监控页）
- 乐观更新 + 错误回退
- Zustand 状态管理

---

## 8. 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 后端 | Python FastAPI (async) | 异步性能好，AI 生态最丰富 |
| Agent 编排 | LangGraph | 自带状态管理/条件路由/人工审批(interrupt)/断点恢复 |
| 前端 | React + Vite + TypeScript + TailwindCSS | 现代化、构建快、类型安全 |
| 数据库 | SQLite（开发）/ PostgreSQL（生产） | 开发零配置，生产支持并发写入/JSON 运算/全文搜索 |
| ORM | SQLAlchemy 2.0 (async) + Alembic | 成熟的异步 ORM + 迁移管理 |
| 任务队列 | Redis + Arq | 异步任务执行（视频生成等长任务） |
| 实时通信 | SSE (Server-Sent Events) | 单向推送够用，比 WebSocket 简单 |
| 视频处理 | FFmpeg | 行业标准，拼接/转场/字幕/调色 |
| 包管理 | uv (Python) / npm (Frontend) | uv 性能极佳 |

---

## 9. 非功能需求

### 9.1 性能

- 流水线执行期间，SSE 延迟 < 1s
- 单面板图片生成 < 30s（取决于 Provider）
- 单面板视频生成 < 120s（取决于 Provider）
- 前端首屏加载 < 3s

### 9.2 可靠性

- Provider 调用自动重试（最多 3 次）
- Provider 失败自动降级到备用 Provider
- 流水线中断后可从断点恢复
- 媒体版本追踪，支持撤销重新生成

### 9.3 可扩展性

- Provider 层基于 ABC 抽象，新 Provider 只需实现接口
- Agent 层基于 LangGraph，新 Stage 只需添加 Node
- 前端页面独立路由，可独立开发

### 9.4 安全性

- API Key 存储在环境变量或加密配置中，不暴露到前端
- CORS 白名单限制
- Provider API Key 不在 API 响应中返回

---

## 10. 实施路线图

| 阶段 | 时间 | 目标 | 产出 |
|------|------|------|------|
| **Phase 0** | Week 1-2 | 基础搭建 | 空应用可启动，CRUD 可用 |
| **Phase 1** | Week 3-4 | Provider 层 | 可通过 API 生成图片/视频/音频 |
| **Phase 2** | Week 5-7 | Pipeline 核心 | 全自动流水线 + SSE + Gate |
| **Phase 3** | Week 8-10 | 前端 MVP | 浏览器中可用的完整制作工作流 |
| **Phase 4** | Week 11-12 | 精细控制 | 单面板重生成、版本管理、QA |
| **Phase 5** | Week 13-14 | 时间线后期 | 浏览器内完整后期能力 |
| **Phase 6** | Week 15+ | 商业化 | 计费、多租户、Docker 部署 |

---

## 11. 关键架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| Panel 替代 Shot | 14+ 维度，Float 编号 | 支持 Insert Shot 小数编号，信息密度满足影视制作需求 |
| 统一 MediaObject | 替代分散的 Image/Video/Audio 表 | parent_id 支持版本链，is_selected 支持候选选择 |
| Video Prompt 独立 Stage | Stage 8 专门做中→英转写 | "画面描述 ≠ video prompt"，6 条转写规则需专门 LLM 推理 |
| LangGraph 编排 | 替代 YAML DAG | 自带状态管理/条件路由/人工审批/断点恢复 |
| SSE 替代 WebSocket | 单向推送 | 流水线进度是单向推送场景，SSE 更简单可靠 |

---

## 12. 验收标准

### 12.1 Phase 0 验收（已完成 ✅）

- [x] 后端启动，15 个表自动创建
- [x] CRUD API：Project / Character / Scene / Episode 全部可用
- [x] 前端构建通过，页面可访问
- [x] Git 仓库初始化并推送

### 12.2 MVP 验收（Phase 3 完成时）

- [ ] 输入一段小说文本（如"万古第一废体"第 1 集）
- [ ] 自动生成：全局设定 → 角色/场景/道具 → 剧本 → 分镜（20 格）
- [ ] GATE 1 通过后，自动生成角色图、场景图
- [ ] GATE 2 通过后，自动生成分镜图、视频、配音
- [ ] GATE 3 通过后，自动合成最终视频
- [ ] 全程可在浏览器中操作和监控
- [ ] 最终产出：1.5 分钟的竖屏漫剧视频

### 12.3 E2E 验收

- [ ] 从创意简报到成片的全自动流水线耗时 < 30 分钟（不含 Gate 等待）
- [ ] 成片质量与手动工作流产出可比
- [ ] 单面板重新生成功能正常
- [ ] Provider 降级和重试机制正常
