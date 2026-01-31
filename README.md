# Mcoo 墨客小筑

<p align="center">
  <img src="docs/public/logo2.svg" alt="Mcoo Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Mcoo 墨客小筑 官方网站</strong>
</p>

<p align="center">
  <a href="https://www.mcoo.top">🌐 访问官网</a>
  ·
  <a href="https://github.com/GeminiAlpha-1/McooServers">🐙 GitHub</a>
</p>

---

## 关于 Mcoo

Mcoo 墨客小筑是一个基于 **Minecraft Java版** 的原版生存服务器，采用 Fabric 1.21 驱动。

我们的理念是保持《纯净》的游戏体验，仅使用不改变原版机制的优化模组，让每一位玩家都能享受最原汁原味的 Minecraft 乐趣。

### 服务器特色

- 🎮 **原版生存** - 不改变原版机制的纯正生存体验
- 🔒 **正版验证** - 采用正版验证，保障游戏安全
- 🛡️ **白名单防熊** - 保护每位玩家的游戏体验
- 🤝 **克制管理** - 日常管理不干扰正常游戏
- 🎉 **轻松氛围** - 长期游玩的"甜品服"定位

### 核心成员

这里记录着一群冒险者的故事——从 2018 年的夏天开始，他们因 Minecraft 相识，在方块世界里并肩同行，留下了无数珍贵的回忆。

---

## 网站技术栈

本项目是基于 [VitePress](https://vitepress.dev/) + [Teek 主题](https://vp.teek.top/) 构建的静态网站。

### 主要特性

- 📝 **Markdown 内容管理** - 轻松编写和维护文档
- 🎨 **Teek 主题** - 轻量、简洁、高效的 VitePress 主题
- 📱 **响应式设计** - 完美适配各种设备
- 🌙 **深色模式** - 护眼舒适的阅读体验
- 🚀 **静态部署** - 快速、稳定、易于维护

---

## 快速开始

### 环境要求

- Node.js 18+
- pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm docs:dev
```

访问 `http://localhost:5173` 查看本地站点。

### 构建生产版本

```bash
pnpm docs:build
```

构建产物位于 `docs/.vitepress/dist` 目录。

### 预览构建产物

```bash
pnpm docs:preview
```

---

## 项目结构

```
McooServers/
├── docs/
│   ├── .vitepress/           # VitePress 配置
│   │   ├── config.ts         # VitePress 主配置
│   │   ├── teekConfig.ts     # Teek 主题配置
│   │   └── theme/            # 主题自定义
│   ├── 001.Mcoo/             # Mcoo 相关内容
│   │   ├── 001.公告/         # 服务器公告
│   │   └── 002.徽章/         # 徽章活动
│   ├── 002.开发/             # 开发文档
│   ├── @pages/               # 自定义页面
│   ├── public/               # 静态资源
│   └── index.md              # 首页
├── package.json
└── pnpm-lock.yaml
```

---

## 部署到 Cloudflare Pages

本项目已配置好 Cloudflare Pages 部署。

### 自动部署（推荐）

将 GitHub 仓库连接至 Cloudflare Pages，设置如下：

- **构建设置**: None（使用框架预设）
- **框架预设**: VitePress
- **构建命令**: `pnpm docs:build`
- **输出目录**: `docs/.vitepress/dist`
- **根目录**: `/docs`

### 手动部署

1. 安装 Cloudflare Wrangler：

```bash
npm install -g wrangler
```

2. 登录 Cloudflare：

```bash
wrangler login
```

3. 部署：

```bash
pnpm docs:build
wrangler pages deploy docs/.vitepress/dist --project-name=mcoo-servers
```

---

## 徽章系统

Mcoo 服务器拥有丰富的徽章系统，记录着玩家们的荣耀时刻。

### 长期徽章

- 🏛️ **天空即为极限...吗？** - 参与天空博物馆建设
- 🎖️ **Mcoo 贡献者徽章** - 参与徽章征集或建议征集
- ⛏️ **致密金镐** - 下界合金镐挖掘量满 10 万
- ⛏️ **致密金铲铲** - 下界合金铲挖掘量满 50 万 / 计分板总挖掘量满 100 万
- 📚 **鸦羽录者** - 参与 Mcoo 档案馆编辑

### 限时徽章

- 🏠 **不要返航，这里不是家** - 参与末地村民工程建设
- 🎆 **2026 新年快乐！！！** - 参与跨年活动
- ❄️ **72K 纯冰** - 参与 72K 刷冰机建设
- 🚀 **Faster Than Light** - 参与地狱枢纽工程
- 💿 **银河唱片机** - 参与服务器唱片全收集计划
- 🌌 **云天明的小宇宙** - 参与青铜尊号中继站建设
- 🎃 **奇怪的南瓜派** - 万圣夜活动

更多徽章正在持续更新中~

---

## 交流与支持

- 📧 **问题反馈**: [GitHub Issues](https://github.com/GeminiAlpha-1/McooServers/issues)
- 💬 **加入我们**: 通过官网联系管理组

---

## 许可证

本项目基于 MIT 许可证开源。

---

<p align="center">
  <img src="docs/public/blog/bg1.webp" alt="Mcoo Banner" width="100%">
</p>

<p align="center">
  <sub>Made with ❤️ by Mcoo Team</sub>
</p>
