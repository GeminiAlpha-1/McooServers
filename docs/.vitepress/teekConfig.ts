import { defineTeekConfig } from "vitepress-theme-teek/config";
import { version } from "vitepress-theme-teek/es/version";

export const teekConfig = defineTeekConfig({
  teekHome: true,
  vpHome: false,
  loading: "Welcome to Mcoo ...",
  wallpaper: {
    enabled: true,
    hideBanner: true
  },
  footerInfo: {
    theme: {
      name: `Theme By Teek@${version}`,
    },
    copyright: {
      createYear: 2020,
      suffix: "Mcoo 墨客小筑",
    },
    customHtml: "<span id=\"runtime\"></span>",
    topMessage: []
  },
  docAnalysis: {
    createTime: "2025-03-09",
    statistics: {
      provider: "busuanzi"
    }
  },
  // 站点分析配置
  siteAnalytics: [
    { provider: "google", options: { id: "G-E4KK2M4V47" } },
    { provider: "baidu", options: { id: "a8cc7d1a22ec067b8b4bb0e237953a66" } },
  ],
  friendLink: {
    list: [
      {
        name: "MineTale日志站",
        desc: "由Mcoo定期更新的每周周报",
        avatar: "/minetale.svg",
        link: "https://minetale.top"
      },
      {
        name: "MC百科",
        desc: "最大的Minecraft中文MOD百科",
        avatar: "/creeper.svg",
        link: "https://www.mcmod.cn"
      }
    ]
  },
  homeCardSort: ["topArticle", "category", "tag", "friendLink", "docAnalysis"],
  post: {
    showCapture: true,
    coverImgMode: "full"
  },
  banner: {
    name: "Mcoo 墨客小筑",
    bgStyle: "fullImg",
    imgSrc: [
      "/blog/bg1.webp"
    ],
    textColor: "#ffffff",
    description: "欢迎回家！我的朋友！\n下滑可查看更多内容 ↓"
  },
  articleBanner: {
    enabled: true, // 是否启用单文章页 Banner
    showCategory: true, // 是否展示分类
    showTag: true, // 是否展示标签
    defaultCoverImg: "/blog/bg1.webp", // 默认封面图
    defaultCoverBgColor: "", // 默认封面背景色，优先级低于 defaultCoverImg
  },
  toComment: {
    enabled: false
  },
  codeBlock: {
    overlay: true,
    copiedDone: (TkMessage: any) => TkMessage.success("复制成功！"),
  },
  themeEnhance: {
    themeColor: {
      append: [
        {
          label: "博客扩展主题",
          tip: "博客扩展主题",
          options: [
            {
              label: "紫罗兰",
              value: "violet",
              color: "#7166f0"
            },
            {
              label: "珊瑚粉",
              value: "coral-pink",
              color: "#ff6b6b"
            },
            {
              label: "天蓝",
              value: "sky-blue",
              color: "#00bbf9"
            },
            {
              label: "蓝绿",
              value: "blue-green",
              color: "#00f5d4"
            },
            {
              label: "石板灰",
              value: "slate-gray",
              color: "#708090"
            },
            {
              label: "粉红",
              value: "pink",
              color: "#f15bb5"
            },
            {
              label: "黄绿",
              value: "yellow-green",
              color: "#8ac926"
            },
            {
              label: "橙红",
              value: "orange-red",
              color: "#ff9e6b"
            }
          ]
        }
      ]
    }
  },
  author: { name: "Mcoo 管理组", link: "https://space.bilibili.com/3690988828625493?spm_id_from=333.337.0.0" },
  articleShare: { enabled: true },
  vitePlugins: {
    sidebarOption: {
      initItems: false,
    },
  },
});
