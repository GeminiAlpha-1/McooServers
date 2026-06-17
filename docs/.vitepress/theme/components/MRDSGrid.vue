<script setup lang="ts">
/**
 * MRDSGrid — 资源展示网格组件
 *
 * 设计原则:
 * 1. build time 一次性同步渲染所有卡片 → 首屏 HTML 完整,符合 VP 原生速度
 * 2. 客户端 JS 只负责切 display + 同步 URL hash,不重新生成 DOM
 * 3. 永远不用 ClientOnly,首屏不依赖 JS 即可看到内容
 *
 * 阶段 1: 通过 props 接数据(测试用)
 * 阶段 2: 内部改用 virtual:mrds-data 虚拟模块,数据来自 frontmatter
 */
import { computed, onMounted, ref, watch } from 'vue'
import { data as mrdsData } from 'virtual:mrds-data'

export interface Resource {
  id: string
  title: string
  link: string
  cover: string
  description?: string
  author?: {
    name: string
    avatar?: string
    link?: string
  }
  category?: string
  tags?: string[]
  date?: string
}

const props = withDefaults(
  defineProps<{
    /** 资源列表。不传则默认从 virtual:mrds-data 虚拟模块读(阶段 2+) */
    data?: Resource[]
    /** 每页显示几个,默认 12(3×4 桌面 / 2×6 移动) */
    perPage?: number
  }>(),
  {
    perPage: 12,
    data: () => mrdsData as unknown as Resource[],
  },
)

/* ---------- 客户端状态 ---------- */
const query = ref('')
const currentCategory = ref<string | null>(null)
const currentPage = ref(1)

/* ---------- 派生数据 ---------- */
/** 提取所有出现过的分类(去重) */
const categories = computed(() => {
  const set = new Set<string>()
  for (const r of props.data) {
    if (r.category) set.add(r.category)
  }
  return Array.from(set)
})

/** 搜索 + 分类过滤后的资源(分页前) */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return props.data.filter((r) => {
    if (currentCategory.value && r.category !== currentCategory.value) return false
    if (!q) return true
    // 搜索:title / description / author.name
    const haystack = [
      r.title,
      r.description ?? '',
      r.author?.name ?? '',
      ...(r.tags ?? []),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.perPage)))

/**
 * 关键:判断某个资源当前是否应可见
 * - 必须在当前过滤结果中
 * - 必须落在当前分页范围
 * - 第一页图片 eager,其他页 lazy(加快首屏)
 */
const visibleIds = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  const end = start + props.perPage
  const ids = new Set<string>()
  for (let i = start; i < end && i < filtered.value.length; i++) {
    ids.add(filtered.value[i].id)
  }
  return ids
})

const visibleCount = computed(() => visibleIds.value.size)

function isVisible(item: Resource): boolean {
  return visibleIds.value.has(item.id)
}

function shouldEagerLoad(item: Resource): boolean {
  // 第一页的前 4 张图片 eager(浏览器视口内),其余 lazy
  if (currentPage.value !== 1) return false
  const idx = filtered.value.findIndex((r) => r.id === item.id)
  return idx >= 0 && idx < 4
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === currentPage.value) return
  currentPage.value = p
  // 滚到顶部工具栏
  if (typeof window !== 'undefined') {
    document.querySelector('.mrds-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function setCategory(cat: string | null) {
  currentCategory.value = cat
  currentPage.value = 1
}

function clearAll() {
  query.value = ''
  currentCategory.value = null
  currentPage.value = 1
}

/* ---------- URL hash 同步(客户端) ---------- */
function readHash() {
  if (typeof window === 'undefined') return
  const h = window.location.hash.replace(/^#/, '')
  if (!h) return
  const params = new URLSearchParams(h)
  const q = params.get('q')
  const cat = params.get('cat')
  const p = Number(params.get('page') ?? '1')
  if (q) query.value = q
  if (cat) currentCategory.value = cat
  if (!Number.isNaN(p) && p >= 1) currentPage.value = p
}

function writeHash() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams()
  if (query.value) params.set('q', query.value)
  if (currentCategory.value) params.set('cat', currentCategory.value)
  if (currentPage.value !== 1) params.set('page', String(currentPage.value))
  const s = params.toString()
  // 用 history.replaceState 避免污染浏览历史
  const url = s ? `#${s}` : window.location.pathname + window.location.search
  window.history.replaceState(null, '', url)
}

onMounted(() => {
  readHash()
})

watch([query, currentCategory, currentPage], () => {
  writeHash()
})
</script>

<template>
  <div class="mrds-grid">
    <!-- 顶部工具栏 -->
    <div class="mrds-toolbar">
      <div class="mrds-search">
        <svg class="mrds-search-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
        <input
          v-model="query"
          type="search"
          placeholder="搜索资源(标题 / 简介 / 作者 / 标签)..."
          class="mrds-search-input"
        />
        <button v-if="query" class="mrds-search-clear" @click="query = ''" aria-label="清空搜索">×</button>
      </div>

      <div v-if="categories.length > 0" class="mrds-categories">
        <button
          class="mrds-cat"
          :class="{ active: currentCategory === null }"
          @click="setCategory(null)"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          class="mrds-cat"
          :class="{ active: currentCategory === cat }"
          @click="setCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="mrds-meta">
      <span v-if="filtered.length !== data.length">
        找到 <strong>{{ filtered.length }}</strong> / {{ data.length }} 个资源
        <button v-if="query || currentCategory" class="mrds-clear-all" @click="clearAll">清除筛选</button>
      </span>
      <span v-else>共 {{ data.length }} 个资源</span>
    </div>

    <!-- 卡片网格(v-for 一次性渲染所有,首屏 HTML 完整;v-show 只切 display) -->
    <div class="mrds-items">
      <a
        v-for="item in data"
        :key="item.id"
        :href="item.link"
        class="mrds-card"
        :class="{ 'mrds-card-hidden': !isVisible(item) }"
        :data-category="item.category ?? ''"
      >
        <div class="mrds-card-cover">
          <img
            :src="item.cover"
            :alt="item.title"
            :loading="shouldEagerLoad(item) ? 'eager' : 'lazy'"
            :fetchpriority="shouldEagerLoad(item) ? 'high' : 'auto'"
            decoding="async"
            width="800"
            height="450"
          />
          <span v-if="item.category" class="mrds-card-badge">{{ item.category }}</span>
        </div>
        <div class="mrds-card-body">
          <h3 class="mrds-card-title">{{ item.title }}</h3>
          <p v-if="item.description" class="mrds-card-desc">{{ item.description }}</p>
          <div v-if="item.author" class="mrds-card-author">
            <img
              v-if="item.author.avatar"
              :src="item.author.avatar"
              :alt="item.author.name"
              class="mrds-avatar"
              loading="lazy"
              width="24"
              height="24"
            />
            <span class="mrds-author-name">
              {{ item.author.name }}
              <span v-if="item.author.subtitle" class="mrds-author-subtitle">{{ item.author.subtitle }}</span>
            </span>
            <span v-if="item.date" class="mrds-date">{{ item.date }}</span>
          </div>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-if="filtered.length === 0" class="mrds-empty">
      <p>没有找到匹配的资源</p>
      <button class="mrds-clear-all" @click="clearAll">清除筛选</button>
    </div>

    <!-- 分页 -->
    <nav v-if="totalPages > 1" class="mrds-pagination" aria-label="分页">
      <button
        class="mrds-page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        ← 上一页
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="mrds-page-num"
        :class="{ active: currentPage === p }"
        @click="goToPage(p)"
      >
        {{ p }}
      </button>
      <button
        class="mrds-page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页 →
      </button>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.mrds-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ---------- 工具栏 ---------- */
.mrds-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.mrds-search {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.mrds-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--vp-c-text-3);
  pointer-events: none;
}

.mrds-search-input {
  width: 100%;
  height: 42px;
  padding: 0 36px 0 42px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &::placeholder {
    color: var(--vp-c-text-3);
  }

  &:focus {
    outline: none;
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
  }
}

.mrds-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 20px;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;

  &:hover {
    background: var(--vp-c-divider);
    color: var(--vp-c-text-1);
  }
}

.mrds-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mrds-cat {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-text-1);
  }

  &.active {
    background: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    color: #fff;
  }
}

/* ---------- 元信息 ---------- */
.mrds-meta {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-bottom: 16px;

  strong {
    color: var(--vp-c-brand-1);
    font-weight: 600;
  }
}

.mrds-clear-all {
  margin-left: 12px;
  padding: 0 8px;
  height: 22px;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

/* ---------- 卡片网格 ---------- */
.mrds-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.mrds-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: inherit;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    border-color: var(--vp-c-brand-1);
  }

  /* v-show 替代方案:用 class 控制,不破坏 SSR DOM */
  &.mrds-card-hidden {
    display: none;
  }
}

.mrds-card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--vp-c-gutter);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
}

.mrds-card:hover .mrds-card-cover img {
  transform: scale(1.05);
}

.mrds-card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 11px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.mrds-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 16px;
}

.mrds-card-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mrds-card-desc {
  flex: 1;
  font-size: 13px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mrds-card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.mrds-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.mrds-author-name {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.mrds-author-subtitle {
  margin-left: 4px;
  font-weight: 400;
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.mrds-date {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.8;
}

/* ---------- 空状态 ---------- */
.mrds-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--vp-c-text-3);

  p {
    margin: 0 0 16px;
    font-size: 15px;
  }
}

/* ---------- 分页 ---------- */
.mrds-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 24px 0 60px;
  flex-wrap: wrap;
}

.mrds-page-btn,
.mrds-page-num {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-text-1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.mrds-page-num.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
</style>
