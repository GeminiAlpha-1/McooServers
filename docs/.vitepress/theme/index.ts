import Teek from "vitepress-theme-teek";
import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";
import Linkcard from "./components/Linkcard.vue";
import Mermaid from "./components/Mermaid.vue";
import TeamMembers from "./components/TeamMembers.vue";

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
import "./style/link.css";

export default {
  extends: Teek,
  Layout: TeekLayoutProvider,
  enhanceApp({ app }: { app: any }) {
    app.component('Linkcard', Linkcard);
    app.component('Mermaid', Mermaid);
    app.component('TeamMembers', TeamMembers);
  },
};
