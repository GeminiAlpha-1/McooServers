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
import "./styles/image-viewer-egg.scss";
import "./style/link.css";
import "./style/marker.css";

/* ------------------------------------------------------------------ */
/* 图片查看器彩蛋(Teek ImageViewer)                                   */
/* ------------------------------------------------------------------ */
// 按住任一旋转按钮 → 越转越快 → 累计 720° (2 圈) → 飞走 + 渐显提示
// 短按 (< 2 圈) → 松手回弹
// 纯全局监听,不碰 Teek 源码
function setupImageViewerEasterEgg() {
  const INITIAL_SPEED = 50; // 度/秒,起步要慢(让用户看清方向)
  const ACCELERATION_PER_SECOND = 1.7; // 每秒速度倍率(1.7 加速,10s 后到 14000°/s 螺旋桨级)
  const EGG_TRIGGER_DELAY = 3000; // ms,长按 3 秒才进入彩蛋
  const EGG_DURATION = 10000; // ms,转 10 秒后飞走(强制时长,不依赖松手)
  const FLY_AWAY_ANIMATION = 800; // ms
  const TIP_DISPLAY_DURATION = 3000; // ms

  type EggState = {
    direction: number
    totalRotation: number
    lastFrameTime: number
    startTime: number
    rafId: number | null
    isFadingOut: boolean
    originalTransition: string
  } | null

  let eggState: EggState = null
  let mousedownTime: number | null = null
  let eggModeActive = false
  let eggTriggerTimer: number | null = null

  function getViewerImg(): HTMLElement | null {
    return document.querySelector('.tk-image-viewer__canvas img')
  }

  function getViewerWrapper(): HTMLElement | null {
    return document.querySelector('.tk-image-viewer__wrapper')
  }

  function getToolbarIcons(): HTMLElement[] {
    const toolbar = document.querySelector('.tk-image-viewer__actions')
    if (!toolbar) return []
    return Array.from(toolbar.querySelectorAll('.tk-icon'))
  }

  // Teek ImageViewer 工具栏顺序已确认:
  //   idx 0: zoomIn
  //   idx 1: zoomOut
  //   idx 2: originalSize
  //   idx 3: refreshLeft (anticlockwise, -1)
  //   idx 4: refreshRight (clockwise, +1)
  //   idx 5: close
  const DIRECTION_BY_IDX: Record<number, number> = {
    3: -1,
    4: 1,
  }
  function getDirection(icon: HTMLElement): number {
    const icons = getToolbarIcons()
    const idx = icons.indexOf(icon)
    if (idx in DIRECTION_BY_IDX) return DIRECTION_BY_IDX[idx]
    return 0
  }

  function startEgg(direction: number) {
    if (direction === 0) return

    const img = getViewerImg()
    if (!img) return

    // 锁定 viewer 防止用户乱点
    const wrapper = getViewerWrapper()
    if (wrapper) wrapper.style.pointerEvents = 'none'

    const startTime = performance.now()
    eggState = {
      direction,
      totalRotation: 0,
      lastFrameTime: startTime,
      startTime,
      rafId: null,
      isFadingOut: false,
      originalTransition: img.style.transition,
    }

    // 关闭 transition 以便实时跟随
    img.style.transition = 'none'

    const frame = () => {
      if (!eggState) return

      const now = performance.now()
      const dt = (now - eggState.lastFrameTime) / 1000 // 秒
      eggState.lastFrameTime = now

      // 速度随时间指数增长(每秒 × 1.7)
      const elapsed = (now - eggState.startTime) / 1000
      const speed = INITIAL_SPEED * Math.pow(ACCELERATION_PER_SECOND, elapsed)

      // 旋转增量
      const delta = speed * dt
      eggState.totalRotation += delta * eggState.direction

      // 更新 transform
      const cur = getViewerImg()
      if (cur) cur.style.transform = `rotate(${eggState.totalRotation}deg)`

      // 满 EGG_DURATION 后飞走(强制时长,不依赖累计角度)
      if (elapsed * 1000 >= EGG_DURATION) {
        flyAway()
        return
      }

      eggState.rafId = requestAnimationFrame(frame)
    }

    eggState.rafId = requestAnimationFrame(frame)
  }

  function flyAway() {
    if (!eggState || eggState.isFadingOut) return
    eggState.isFadingOut = true

    const img = getViewerImg()
    if (!img) return

    // 取消 CSS transition(避免减速诡异行为),用 Web Animations API 直接控制
    img.style.transition = 'none'
    const startRotation = eggState.totalRotation
    const endRotation = startRotation + 15000 // 多转 15000° = 18750°/s,比彩蛋末速还快

    const animation = img.animate(
      [
        { transform: `rotate(${startRotation}deg)`, offset: 0 },
        { transform: `translateY(-150vh) rotate(${endRotation}deg)`, offset: 1 },
      ],
      {
        duration: FLY_AWAY_ANIMATION,
        easing: 'linear',
        fill: 'forwards',
      },
    )

    // 飞走后渐显提示
    setTimeout(() => {
      const tip = document.createElement('div')
      tip.className = 'mrds-fly-tip'
      tip.textContent = '您的图片飞走啦~'
      document.body.appendChild(tip)
      requestAnimationFrame(() => tip.classList.add('show'))

      // 3s 后关闭 viewer
      setTimeout(() => {
        animation.cancel()
        tip.remove()
        const closeBtn = document.querySelector('.tk-image-viewer__close') as HTMLElement | null
        if (closeBtn) closeBtn.click()
        else {
          // fallback
          const wrapper = getViewerWrapper()
          if (wrapper) wrapper.style.display = 'none'
        }
        const w = getViewerWrapper()
        if (w) w.style.pointerEvents = ''
        eggState = null
      }, TIP_DISPLAY_DURATION)
    }, 600)
  }

  function stopEgg() {
    if (!eggState) return
    if (eggState.isFadingOut) return // 已经在飞走模式

    if (eggState.rafId) cancelAnimationFrame(eggState.rafId)

    const img = getViewerImg()
    if (img) {
      img.style.transition = 'transform 0.4s ease-out'
      img.style.transform = 'rotate(0deg)'
      // transition 结束后清掉 inline style,让 Teek 内部状态恢复控制
      setTimeout(() => {
        if (img) img.style.transition = eggState?.originalTransition ?? ''
      }, 400)
    }

    const wrapper = getViewerWrapper()
    if (wrapper) wrapper.style.pointerEvents = ''

    eggState = null
  }

  // 全局 mousedown 监听(capture phase)
  // 设计:不 preventDefault → 短按(< 200ms)click 自然触发,Teek 处理 90° 旋转
  //       长按(≥ 200ms)进入彩蛋,接管 transform
  document.addEventListener(
    'mousedown',
    (e) => {
      const target = e.target as HTMLElement
      const icon = target.closest('.tk-image-viewer__actions .tk-icon') as HTMLElement | null
      if (!icon) return

      const direction = getDirection(icon)
      if (direction === 0) return // 不是旋转按钮

      mousedownTime = performance.now()

      // 200ms 后还按着 → 进入彩蛋模式
      eggTriggerTimer = window.setTimeout(() => {
        if (mousedownTime === null) return
        eggModeActive = true
        startEgg(direction)
      }, EGG_TRIGGER_DELAY)
    },
    true,
  )

  document.addEventListener('mouseup', () => {
    if (mousedownTime === null) return

    if (eggTriggerTimer !== null) {
      clearTimeout(eggTriggerTimer)
      eggTriggerTimer = null
    }

    if (eggModeActive && eggState) {
      stopEgg()
    }

    mousedownTime = null
    eggModeActive = false
  })

  document.addEventListener('mouseleave', () => {
    if (mousedownTime === null) return
    if (eggTriggerTimer !== null) {
      clearTimeout(eggTriggerTimer)
      eggTriggerTimer = null
    }
    if (eggModeActive && eggState) {
      stopEgg()
    }
    mousedownTime = null
    eggModeActive = false
  })

  // 移动端兼容
  document.addEventListener(
    'touchstart',
    (e) => {
      const touch = e.touches[0]
      if (!touch) return
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null
      const icon = target?.closest('.tk-image-viewer__actions .tk-icon') as HTMLElement | null
      if (!icon) return

      const direction = getDirection(icon)
      if (direction === 0) return

      mousedownTime = performance.now()
      eggTriggerTimer = window.setTimeout(() => {
        if (mousedownTime === null) return
        eggModeActive = true
        startEgg(direction)
      }, EGG_TRIGGER_DELAY)
    },
    { passive: true },
  )

  document.addEventListener('touchend', () => {
    if (mousedownTime === null) return
    if (eggTriggerTimer !== null) {
      clearTimeout(eggTriggerTimer)
      eggTriggerTimer = null
    }
    if (eggModeActive && eggState) {
      stopEgg()
    }
    mousedownTime = null
    eggModeActive = false
  })
}

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

        // ===== 图片查看器彩蛋 =====
        // 按住任一旋转按钮 → 越转越快 → 累计 720° (2 圈) → 飞走 + 渐显提示
        // 短按 (< 2 圈) → 松手回弹
        // 不碰 Teek 源码,纯全局 mousedown 监听 + 直接接管 img.transform
        setupImageViewerEasterEgg();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', blockEvents, { once: true });
      } else {
        blockEvents();
      }
    }
  },
};
