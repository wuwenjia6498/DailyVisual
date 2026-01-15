# TASK: 开发 DailyVisual (团队协作版)

**角色设定**：
你是一名精通 Next.js 14+ (App Router)、Tailwind CSS 和 Supabase 的全栈开发专家。

**项目目标**：
构建 "DailyVisual" —— 一个团队共享的视觉日志 Web 应用。
**适用平台**：Web 应用（必须完全适配桌面端和移动端）。
**设计风格**：极简主义、黑白配色、高对比度 (Minimalist B&W)。

---

## 核心需求 (Core Requirements)

1.  **认证体系 (仅限管理员预设)**：
    * 应用是封闭的 (Private)。只有预先创建的用户才能登录。
    * **登录页**：简单的 邮箱/密码 表单。**不要**包含“注册”链接。
    * **用户身份**：每条记录必须显示是谁发布的（显示昵称/Display Name）。

2.  **响应式布局 (Mobile & Desktop)**：
    * **桌面端**：左右分栏。左侧侧边栏 (日历) + 右侧内容流。
    * **移动端**：单栏布局。顶部导航栏 (日期选择器) + 下方内容流。底部右下角悬浮按钮 (FAB) 用于“添加记录”。

## 技术栈 (Tech Stack)

* **框架**：Next.js 14+ (App Router)
* **样式**：Tailwind CSS + Shadcn/UI (需初始化)
* **后端**：Supabase (Auth, Database, Storage)
* **日期处理**：date-fns
* **图标库**：Lucide React

---

## 1. 数据库设计 (Supabase SQL)

请生成 SQL 脚本以便我在 Supabase SQL Editor 中运行。需包含以下结构：

* **表 `profiles` (用户资料)**：
    * `id` (uuid, 主键, 关联 auth.users)
    * `display_name` (text, 例如 "Alice", "老张")
    * `avatar_url` (text, 可选)
    * *说明*：需要考虑如何通过 Trigger 自动创建，或者允许为管理员预设的用户手动插入资料。

* **表 `entries` (日志条目)**：
    * `id` (uuid, 主键)
    * `user_id` (uuid, 外键关联 profiles.id)
    * `content` (text, 日志文本)
    * `date` (date, YYYY-MM-DD)
    * `created_at` (timestamptz)

* **表 `images` (图片)**：
    * `id` (uuid, 主键)
    * `entry_id` (uuid, 外键关联 entries.id)
    * `url` (text, 图片访问链接)
    * `storage_path` (text, 存储路径)

* **RLS 策略 (Row Level Security)**：
    * **SELECT (查看)**：所有已登录用户 (Authenticated) 可查看所有数据（全员共享）。
    * **INSERT (发布)**：所有已登录用户可发布内容。
    * **UPDATE/DELETE (管理)**：用户只能修改或删除**自己 (user_id = auth.uid())** 的数据。

---

## 2. 分步开发计划 (Step-by-Step Plan)

请按照以下阶段进行代码编写：

**阶段 1: 设置与认证 (Setup & Auth)**
* 创建 `.env.local` 模板。
* 初始化 Supabase Client (`utils/supabase/server.ts` 和 `client.ts`)。
* 创建一个极简的 **登录页面 (`/login`)**。
* 创建 **Middleware** 保护所有路由（未登录用户强制重定向到 `/login`）。

**阶段 2: 布局与导航 (Responsive Layout)**
* 创建 `DashboardLayout`。
* **桌面端**：侧边栏包含日历组件 (Shadcn Calendar)。
* **移动端**：响应式 Header，显示当前选中日期。在移动端提供下拉或模态框来切换日期。

**阶段 3: 内容流展示 (The Feed / Read View)**
* 获取选中日期的所有 entries。
* 以卡片形式展示条目：
    * **头部**：发布者昵称 + 时间。
    * **主体**：文本内容 (自动识别 URL)。
    * **图片**：网格视图。点击图片可放大查看 (Lightbox 效果)。
    * **底部**：复制文本按钮、下载图片按钮。

**阶段 4: 内容发布 (Content Entry / Write View)**
* **触发入口**：
    * 桌面端：Header 区域的 "添加记录" 按钮。
    * 移动端：右下角固定的悬浮按钮 (FAB)。
* **表单交互 (Dialog/Drawer)**：
    * 文本域输入内容。
    * 图片上传器 (桌面端拖拽，移动端点击选择)。
    * **关键逻辑**：先上传图片到 Supabase Storage -> 获取 Public URL -> 作为一个事务将文本和图片 URL 写入数据库。

---

## 执行指令 (Action)

1.  首先，请直接提供 **SQL 脚本**，包含建表语句和 RLS 策略，以便我配置数据库。
2.  其次，请告诉我如何在没有注册页面的情况下，在 Supabase Dashboard **手动创建用户和 Profile** 用于测试。
3.  等待我的确认后，再开始编写阶段 1 的代码。