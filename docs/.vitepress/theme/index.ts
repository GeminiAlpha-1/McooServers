import Teek from "vitepress-theme-teek";
import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";
import Linkcard from "./components/Linkcard.vue";
import Mermaid from "./components/Mermaid.vue";
import TeamMembers from "./components/TeamMembers.vue";
import BiliVideo from "./components/BiliVideo.vue";
import ImageGallery from "./components/ImageGallery.vue";
import AuthorCard from "./components/AuthorCard.vue";
import DownloadCard from "./components/DownloadCard.vue";
import SubmissionForm from "./components/SubmissionForm.vue";
import PhotoGallery from "./components/PhotoGallery.vue";
import MRDSGrid from "./components/MRDSGrid.vue";

import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css";
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css";
import "vitepress-theme-teek/theme-chalk/tk-nav.css";
import "vitepress-theme-teek/theme-chalk/tk-aside.css";
import "vitepress-theme-teek/theme-chalk/tk-doc-h1-gradient.css";
import "vitepress-theme-teek/theme-chalk/tk-table.css";
import "vitepress-theme-teek/theme-chalk/tk-mark.css";
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css";
import "vitepress-theme-teek/theme-chalk/tk-index-rainbow.css";
import "vitepress-theme-teek/theme-chalk/tk-banner-desc-gradient.css";
import "vitepress-theme-teek/theme-chalk/tk-home-card-hover.css";
import "vitepress-theme-teek/theme-chalk/tk-fade-up-animation.css";

import "./styles/code-bg.scss";
import "./styles/iframe.scss";
import "./styles/custom-banner.scss";
import "./styles/blur.css";
import "./styles/mermaid.scss";
import "./styles/img-card-16x9.scss";
import "./styles/scrollbar-stable.scss";
import "./style/link.css";
import "./style/marker.css";

export default {
  extends: Teek,
  Layout: TeekLayoutProvider,
  enhanceApp({ app }: { app: any }) {
    app.component('Linkcard', Linkcard);
    app.component('Mermaid', Mermaid);
    app.component('TeamMembers', TeamMembers);
    app.component('BiliVideo', BiliVideo);
    app.component('ImageGallery', ImageGallery);
    app.component('AuthorCard', AuthorCard);
    app.component('DownloadCard', DownloadCard);
    app.component('SubmissionForm', SubmissionForm);
    app.component('PhotoGallery', PhotoGallery);
    app.component('MRDSGrid', MRDSGrid);

    // 全站屏蔽右键菜单(放过可交互元素: input/textarea/a/button/contenteditable)
    // 效果:
    //   - 文字段落 / 装饰 / 图片右键不出菜单(防误触)
    //   - 输入框可以粘贴/拼写检查
    //   - 链接/按钮右键可以"在新窗口打开"
    // 拖拽图片到新 tab 也屏蔽(纯图片,不影响其他)
    // 绕过可能:disable JS、查看源代码、PrintScreen —— 真正防护靠 CDN Referer 白名单
    if (typeof document !== 'undefined') {
      const blockEvents = () => {
        document.addEventListener(
          'contextmenu',
          (e) => {
            const target = e.target as HTMLElement | null;
            if (target?.matches('input, textarea, [contenteditable], a, button')) return;
            e.preventDefault();
            return false;
          },
          true,
        );
        document.addEventListener(
          'dragstart',
          (e) => {
            const target = e.target as HTMLElement | null;
            if (target?.tagName === 'IMG') {
              e.preventDefault();
              return false;
            }
          },
          true,
        );
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', blockEvents, { once: true });
      } else {
        blockEvents();
      }
    }
  },
};
