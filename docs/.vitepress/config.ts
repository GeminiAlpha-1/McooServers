import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { teekConfig } from "./teekConfig";
import { withMermaid } from 'vitepress-plugin-mermaid';

const description = [
  "欢迎来到 Mcoo 墨客小筑 官方网站",
  "Mcoo服务器基于 Fabric 1.21 的原版生存玩法运行，仅使用不改变原版机制的优化模组，保证纯净体验",
  "采用正版验证 + 白名单防熊，日常管理克制，不干扰正常游戏，整体氛围轻松友好，是一台偏长期游玩的原版「甜品服」",
].toString();

export default withMermaid(
  defineConfig({
    extends: teekConfig,
    title: "Mcoo 墨客小筑",
    description: description,
    cleanUrls: false,
    lastUpdated: true,
    lang: "zh-CN",
    mermaid: {
    },
    mermaidPlugin: {
      class: "mermaid my-class",
    },
    head: [
      [
        "link",
        { rel: "icon", type: "image/svg+xml", href: "/logo2.svg" },
      ],
      ["link", { rel: "icon", type: "image/png", href: "/logo2.png" }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:locale", content: "zh-CN" }],
      ["meta", { property: "og:title", content: "Teek | VitePress Theme" }],
      ["meta", { property: "og:site_name", content: "Teek" }],
      ["meta", { property: "og:image", content: "" }],
      ["meta", { property: "og:url", content: "" }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { name: "description", content: description }],
      ["meta", { name: "author", content: "Teek" }],
      ["meta", { name: "keywords", content: description }],
    ],
    markdown: {
      lineNumbers: true,
      image: {
        lazyLoading: true,
      },
      container: {
        tipLabel: "提示",
        warningLabel: "警告",
        dangerLabel: "危险",
        infoLabel: "信息",
        detailsLabel: "详细信息",
      },
    },
    sitemap: {
      hostname: "https://mcoo.top",
      transformItems: (items) => {
        const permalinkItemBak: any[] = [];
        const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig
          .permalinks;
        items.forEach((item) => {
          const permalink = permalinks?.map[item.url];
          if (permalink)
            permalinkItemBak.push({ url: permalink, lastmod: item.lastmod });
        });
        return [...items, ...permalinkItemBak];
      },
    },
    themeConfig: {
      logo: "/logo2.svg",
      darkModeSwitchLabel: "主题",
      sidebarMenuLabel: "菜单",
      returnToTopLabel: "返回顶部",
      lastUpdatedText: "上次更新时间",
      outline: {
        level: [2, 4],
        label: "本页导航",
      },
      docFooter: {
        prev: "上一页",
        next: "下一页",
      },
      nav: [
        { text: "首页", link: "/" },
        { text: "归档页", link: "/archives" },
        { text: "Mcoo 图床", link: "https://imghub.mcoo.top/" }
      ],
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/GeminiAlpha-1/McooServers",
        },
      ],
      search: {
        provider: "local",
      },
      editLink: {
        text: "在 GitHub 上编辑此页",
        pattern:
          "https://github.com/GeminiAlpha-1/McooServers/blob/master/docs/:path",
      },
    },
    vite: {
      plugins: [
        llmstxt() as any,
      ],
    },
  })
);
