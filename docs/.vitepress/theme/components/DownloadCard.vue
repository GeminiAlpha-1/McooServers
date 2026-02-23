<script setup lang="ts">
import { computed } from 'vue'

interface DownloadItem {
  name: string
  url: string
  description?: string
}

interface Props {
  downloads: DownloadItem[]
}

const props = defineProps<Props>()

const macaronColors = [
  'rgba(255, 182, 193, 0.25)',
  'rgba(173, 216, 230, 0.25)',
  'rgba(144, 238, 144, 0.25)',
  'rgba(255, 218, 185, 0.25)',
  'rgba(221, 160, 221, 0.25)',
  'rgba(175, 238, 238, 0.25)',
  'rgba(255, 255, 224, 0.25)',
  'rgba(230, 230, 250, 0.25)',
]

const getRandomColor = (index: number) => {
  return macaronColors[index % macaronColors.length]
}

const getIcon = (url: string) => {
  if (url.includes('github.com') || url.includes('gh-proxy')) {
    return 'github'
  } else if (url.includes('gitee.com')) {
    return 'gitee'
  } else if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    return 'bilibili'
  } else if (url.includes('baidu.com') || url.includes('pan.baidu')) {
    return 'baidu'
  } else if (url.includes('qm.qq.com') || url.includes('qq.com')) {
    return 'qq'
  } else if (url.includes('cloudflare') || url.includes('ipfs')) {
    return 'cloud'
  }
  return 'download'
}

const getBtnText = (url: string) => {
  if (url.includes('qm.qq.com') || url.includes('qq.com')) {
    return '立即前往'
  }
  return '立即下载'
}
</script>

<template>
  <div v-if="downloads && downloads.length > 0" class="download-section">
    <div 
      v-for="(item, index) in downloads" 
      :key="index" 
      class="download-card"
      :style="{ backgroundColor: getRandomColor(index) }"
    >
      <div class="download-icon">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
      <div class="download-content">
        <div class="download-header">
          <span class="download-name">{{ item.name }}</span>
        </div>
        <p v-if="item.description" class="download-desc">{{ item.description }}</p>
        <a :href="item.url" class="download-btn" target="_blank">
          <span>{{ getBtnText(item.url) }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.download-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 1.5rem 0;
}

.download-card {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: none;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.download-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  color: var(--vp-c-text-1);
}

.download-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.download-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.download-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);

  &::before {
    display: none !important;
  }
}

.download-desc {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.15);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: fit-content;
  border: none;

  &:hover {
    background: rgba(0, 0, 0, 0.25);
    transform: translateY(-1px);
  }

  svg {
    flex-shrink: 0;
  }

  &::before {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .download-card {
    padding: 12px 16px;
    gap: 12px;
  }

  .download-icon {
    width: 40px;
    height: 40px;
  }

  .download-name {
    font-size: 1rem;
  }
}
</style>
