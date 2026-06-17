<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { avatars as allAvatars } from 'virtual:mrds-data'

const bvNumber = ref('')
const workName = ref('')
const resourceType = ref<'redstone' | 'building'>('redstone')
const authorName = ref('')
const gameId = ref('')
const authorLink = ref('')
const workDescription = ref('')
const license = ref('CC BY-NC-SA 4.0')

const images = ref<{ src: string; alt: string }[]>([{ src: '', alt: '' }])
const downloads = ref<{ url: string; description: string }[]>([{ url: '', description: '' }])

const addImage = () => {
  if (images.value.length < 5) {
    images.value.push({ src: '', alt: '' })
  }
}

const removeImage = (index: number) => {
  if (images.value.length > 1) {
    images.value.splice(index, 1)
  }
}

const addDownload = () => {
  downloads.value.push({ url: '', description: '' })
}

const removeDownload = (index: number) => {
  if (downloads.value.length > 1) {
    downloads.value.splice(index, 1)
  }
}

/* ----- 游戏 ID 实时补全 ----- */
// 最大展示数量(超过 1 排省略)
const MAX_SUGGESTIONS = 8

// 实时匹配:前缀匹配 (case-insensitive)
const suggestions = computed(() => {
  const q = gameId.value.trim().toLowerCase()
  if (!q) return allAvatars  // 空输入显示全部
  return allAvatars.filter((a) => a.gameId.toLowerCase().startsWith(q))
})

// 候选面板可见性
const showSuggestions = ref(false)
const highlightedIndex = ref(0)

// 限制可见数量
const visibleSuggestions = computed(() => suggestions.value.slice(0, MAX_SUGGESTIONS))
const hasMore = computed(() => suggestions.value.length > MAX_SUGGESTIONS)

// 是否完全匹配(在预设列表里)
const hasMatch = computed(() => {
  return gameId.value.trim() !== '' && suggestions.value.some((a) => a.gameId === gameId.value.trim())
})

// 选中(点击 / Tab / Enter)
function selectGameId(id: string) {
  gameId.value = id
  showSuggestions.value = false
}

// 键盘导航
function onGameIdKeydown(e: KeyboardEvent) {
  const list = visibleSuggestions.value
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!showSuggestions.value) {
      showSuggestions.value = true
    } else if (list.length > 0) {
      highlightedIndex.value = (highlightedIndex.value + 1) % list.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (list.length > 0) {
      highlightedIndex.value = (highlightedIndex.value - 1 + list.length) % list.length
    }
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (showSuggestions.value && list.length > 0) {
      e.preventDefault()
      selectGameId(list[highlightedIndex.value].gameId)
    }
  } else if (e.key === 'Escape') {
    showSuggestions.value = false
  }
}

// 点击候选项
function onSuggestionClick(id: string) {
  selectGameId(id)
}

// 鼠标进入高亮
function onSuggestionHover(index: number) {
  highlightedIndex.value = index
}

// 失焦延迟关闭(防止点不到)
function onGameIdBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 监听 gameId 变化:输入时自动开,清空时关
// 修复:点候选后手动设 showSuggestions = false,清空再输入没 watch 就开不回去
watch(gameId, (newVal) => {
  showSuggestions.value = newVal.trim() !== ''
})

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const generateMarkdown = () => {
  const now = new Date()
  const dateStr = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' + 
    String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0') + ':' + 
    String(now.getSeconds()).padStart(2, '0')
  const tag = resourceType.value === 'redstone' ? '红石' : '建筑'
  const cleanDesc = workDescription.value.replace(/\n/g, ' ').replace(/<br>/g, ' ').trim()
  const desc = cleanDesc.length > 150 
    ? cleanDesc.substring(0, 150) + '...' 
    : cleanDesc

  let md = '---\n'
  md += `title: ${workName.value}\n`
  md += `date: ${dateStr}\n`
  md += 'permalink: \n'
  md += 'categories:\n'
  md += '  - 资源\n'
  md += 'tags:\n'
  md += `  - ${tag}\n`
  md += `description: ${desc}\n`
  md += 'author:\n'
  md += `  name: ${authorName.value}\n`
  md += `  link: ${authorLink.value}\n`
  md += '---\n\n'

  if (bvNumber.value) {
    md += `<BiliVideo bv="${bvNumber.value}" />\n\n`
  }

  const validImages = images.value.filter(img => img.src.trim())
  if (validImages.length > 0) {
    md += '<ImageGallery :images="[\n'
    validImages.forEach((img, index) => {
      md += `  { src: '${img.src}', alt: '${img.alt || `图片${index + 1}`}' },\n`
    })
    md += ']" />\n\n'
  }

  md += `<AuthorCard \n`
  md += `  avatar="${avatarPath.value}" \n`
  md += `  name="${authorName.value}" \n`
  md += `  link="${authorLink.value}" \n`
  md += `  subtitle="${gameId.value}"\n`
  md += `  license="${license.value}" \n`
  md += '>\n'
  md += '  <template #description>\n'
  const descLines = workDescription.value.split('\n')
  descLines.forEach(line => {
    if (line.trim()) {
      md += `    ${line.trim()}<br>\n`
    } else {
      md += '    <br>\n'
    }
  })
  md += '  </template>\n'
  md += '</AuthorCard>\n\n'

  md += '## 作品下载\n\n'
  md += '<DownloadCard :downloads="[\n'
  const validDownloads = downloads.value.filter(d => d.url.trim())
  validDownloads.forEach(download => {
    const name = getDownloadName(download.url)
    md += `  { name: '${name}', url: '${download.url}', description: '${download.description}' },\n`
  })
  md += ']" />\n'

  return md
}

const getDownloadName = (url: string) => {
  if (url.includes('github.com') && !url.includes('gh-proxy')) {
    return 'Github'
  } else if (url.includes('gh-proxy')) {
    return 'Github 加速'
  } else if (url.includes('gitee.com')) {
    return 'Gitee'
  } else if (url.includes('pan.baidu.com') || url.includes('baidu.com')) {
    return '百度网盘'
  } else if (url.includes('qm.qq.com') || url.includes('qq.com')) {
    return 'Mcoo 大型咕咕集散中心'
  } else if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    return 'B站视频'
  }
  return '下载链接'
}

const downloadMd = () => {
  const markdown = generateMarkdown()
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${workName.value || '作品'}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const isValid = computed(() => {
  const hasValidImages = images.value.some(img => img.src.trim())
  const hasValidDownloads = downloads.value.some(d => d.url.trim())
  
  return workName.value.trim() &&
         authorName.value.trim() && 
         gameId.value.trim() && 
         authorLink.value.trim() && 
         workDescription.value.trim() &&
         hasValidImages &&
         hasValidDownloads
})
</script>

<template>
  <div class="submission-form">
    <div class="form-section">
      <h3>作品信息</h3>
      <div class="form-group">
        <label>作品名 <span class="required">*</span></label>
        <input 
          v-model="workName" 
          type="text" 
          placeholder="输入作品名称"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label>资源类型 <span class="required">*</span></label>
        <select v-model="resourceType" class="form-input">
          <option value="redstone">红石</option>
          <option value="building">建筑</option>
        </select>
      </div>
    </div>

    <div class="form-section">
      <h3>B站视频（可选）</h3>
      <input 
        v-model="bvNumber" 
        type="text" 
        placeholder="输入BV号，如：BV1yccMzmEB4"
        class="form-input"
      />
    </div>

    <div class="form-section">
      <h3>作者信息</h3>
      <div class="form-group">
        <label>作者名 <span class="required">*</span></label>
        <input 
          v-model="authorName" 
          type="text" 
          placeholder="输入作者名称"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label>游戏ID <span class="required">*</span></label>
        <input
          v-model="gameId"
          type="text"
          placeholder="输入游戏ID，用于匹配头像（输入首字母实时补全）"
          class="form-input"
          autocomplete="off"
          @focus="showSuggestions = true"
          @blur="onGameIdBlur"
          @keydown="onGameIdKeydown"
        />
        <!-- 候选面板(实时补全) -->
        <div v-if="showSuggestions && gameId.trim()" class="avatar-suggestions">
          <div v-if="suggestions.length === 0" class="avatar-empty">
            无结果
          </div>
          <div v-else class="avatar-grid">
            <div
              v-for="(item, i) in visibleSuggestions"
              :key="item.gameId"
              class="avatar-item"
              :class="{ highlighted: i === highlightedIndex, matched: item.gameId === gameId.trim() }"
              @mousedown.prevent
              @click="onSuggestionClick(item.gameId)"
              @mouseenter="onSuggestionHover(i)"
            >
              <img
                :src="item.avatar"
                :alt="item.gameId"
                draggable="false"
                @error="handleAvatarError"
              />
              <span class="avatar-gameid">{{ item.gameId }}</span>
            </div>
            <div v-if="hasMore" class="avatar-more">...</div>
          </div>
        </div>
        <!-- 已选中预览(完全匹配时显示) -->
        <p v-if="hasMatch" class="avatar-preview">
          头像预览：<img :src="`/mcoo/${gameId.trim()}.png`" :alt="gameId" @error="handleAvatarError" />
        </p>
      </div>
      <div class="form-group">
        <label>作者个人主页链接 <span class="required">*</span></label>
        <input 
          v-model="authorLink" 
          type="url" 
          placeholder="输入作者个人主页链接"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label>许可证 <span class="required">*</span></label>
        <select v-model="license" class="form-input">
          <option value="CC BY-NC-SA 4.0">CC BY-NC-SA 4.0（署名-非商业性使用-相同方式共享）</option>
          <option value="CC BY-SA 4.0">CC BY-SA 4.0（署名-相同方式共享）</option>
          <option value="CC BY-NC 4.0">CC BY-NC 4.0（署名-非商业性使用）</option>
          <option value="CC BY 4.0">CC BY 4.0（署名）</option>
          <option value="MIT">MIT</option>
          <option value="GPL-3.0">GPL-3.0</option>
          <option value="All Rights Reserved">保留所有权利</option>
        </select>
      </div>
    </div>

    <div class="form-section">
      <h3>轮播图 <span class="required">*</span>（最多5张）</h3>
      <div v-for="(img, index) in images" :key="index" class="image-input-group">
        <input 
          v-model="img.src" 
          type="url" 
          placeholder="图片链接"
          class="form-input"
        />
        <input 
          v-model="img.alt" 
          type="text" 
          placeholder="图片名称（可选）"
          class="form-input"
        />
        <button 
          v-if="images.length > 1" 
          @click="removeImage(index)" 
          class="btn-remove"
          type="button"
        >
          ×
        </button>
      </div>
      <button 
        v-if="images.length < 5" 
        @click="addImage" 
        class="btn-add"
        type="button"
      >
        + 添加图片
      </button>
    </div>

    <div class="form-section">
      <h3>作品介绍 <span class="required">*</span></h3>
      <textarea 
        v-model="workDescription" 
        placeholder="输入作品介绍，支持换行"
        class="form-textarea"
        rows="6"
      ></textarea>
    </div>

    <div class="form-section">
      <h3>下载链接 <span class="required">*</span></h3>
      <div v-for="(download, index) in downloads" :key="index" class="download-input-group">
        <input 
          v-model="download.url" 
          type="url" 
          placeholder="下载链接"
          class="form-input"
        />
        <input 
          v-model="download.description" 
          type="text" 
          placeholder="链接描述"
          class="form-input"
        />
        <button 
          v-if="downloads.length > 1" 
          @click="removeDownload(index)" 
          class="btn-remove"
          type="button"
        >
          ×
        </button>
      </div>
      <button 
        @click="addDownload" 
        class="btn-add"
        type="button"
      >
        + 添加下载链接
      </button>
    </div>

    <div class="form-actions">
      <button 
        @click="downloadMd" 
        class="btn-download"
        :disabled="!isValid"
        type="button"
      >
        📥 下载 MD 文件
      </button>
      <p v-if="!isValid" class="hint">请填写所有必填项后才能下载</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.submission-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.form-section {
  margin-bottom: 24px;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--vp-c-text-1);
  }
}

.form-group {
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.95rem;
    color: var(--vp-c-text-2);
  }
  
  .required {
    color: #e74c3c;
  }
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.95rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--vp-c-brand);
  }
  
  &::placeholder {
    color: var(--vp-c-text-3);
  }
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.95rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  
  &:focus {
    outline: none;
    border-color: var(--vp-c-brand);
  }
  
  &::placeholder {
    color: var(--vp-c-text-3);
  }
}

.image-input-group,
.download-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  
  .form-input {
    flex: 1;
  }
}

.btn-add {
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--vp-c-brand);
  background: transparent;
  border: 1px dashed var(--vp-c-brand);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--vp-c-brand-soft);
  }
}

.btn-remove {
  padding: 8px 14px;
  font-size: 1rem;
  color: #e74c3c;
  background: transparent;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(231, 76, 60, 0.1);
  }
}

.avatar-preview {
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    vertical-align: middle;
    margin-left: 8px;
    object-fit: cover;
  }
}

/* 游戏 ID 实时补全面板 */
.avatar-suggestions {
  margin-top: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.avatar-empty {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  text-align: center;
  padding: 8px 0;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  border: 1px solid transparent;

  &:hover,
  &.highlighted {
    background: var(--vp-c-brand-soft);
    border-color: var(--vp-c-brand);
  }

  &.matched {
    border-color: var(--vp-c-brand);
    background: var(--vp-c-brand-soft);
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    // 防图片触发 Chrome 的图片查看器 / native 行为
    pointer-events: none;
    -webkit-user-drag: none;
  }
}

.avatar-gameid {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

.avatar-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-3);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 0 4px;
  user-select: none;
}

@media (max-width: 640px) {
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.form-actions {
  text-align: center;
  margin-top: 32px;
}

.btn-download {
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: var(--vp-c-brand);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    background: var(--vp-c-brand-dark);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.hint {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .image-input-group,
  .download-input-group {
    flex-direction: column;
  }
  
  .submission-form {
    padding: 16px;
  }
}
</style>
