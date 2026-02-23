<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'

interface PhotoItem {
  src: string
  alt?: string
}

interface Category {
  name: string
  photos: PhotoItem[]
}

interface Props {
  categories?: Category[]
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [
    {
      name: '默认',
      photos: [
        { src: 'https://image.rseg.club/api/images/2026-02-17_01.23.47.png', alt: '照片1' },
        { src: 'https://image.rseg.club/api/images/2026-02-17_01.23.49.png', alt: '照片2' },
        { src: 'https://image.rseg.club/api/images/2026-02-17_01.25.01.png', alt: '照片3' },
      ]
    }
  ]
})

const activeCategory = ref(0)

const currentPhotos = computed(() => {
  return [...(props.categories[activeCategory.value]?.photos || [])].reverse()
})

const setCategory = (index: number) => {
  activeCategory.value = index
  displayedCount.value = 45
}

const masonryRef = ref<HTMLElement | null>(null)
const displayedCount = ref(45)
const BATCH_SIZE = 30
const PRELOAD_THRESHOLD = 20

const displayedPhotos = computed(() => {
  return currentPhotos.value.slice(0, displayedCount.value)
})

const hasMore = computed(() => {
  return displayedCount.value < currentPhotos.value.length
})

const getRandomHeight = () => {
  const heights = [180, 220, 260, 300, 340]
  return heights[Math.floor(Math.random() * heights.length)]
}

const photoItems = ref<{ src: string; alt?: string; height: number; left: number; top: number }[]>([])
const masonryHeight = ref(400)
const containerOffsetX = ref(0)

const distributePhotos = () => {
  if (!masonryRef.value) return
  
  const containerWidth = masonryRef.value.offsetWidth
  if (containerWidth === 0) return
  
  const CARD_WIDTH = 260
  const gap = 16
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (CARD_WIDTH + gap)))
  const columnHeights = new Array(columns).fill(0)
  
  const totalContentWidth = columns * CARD_WIDTH + (columns - 1) * gap
  const offsetX = (containerWidth - totalContentWidth) / 2
  containerOffsetX.value = offsetX
  
  photoItems.value = displayedPhotos.value.map((photo) => {
    const minHeight = Math.min(...columnHeights)
    const minColumn = columnHeights.indexOf(minHeight)
    
    const photoHeight = getRandomHeight()
    const left = minColumn * (CARD_WIDTH + gap) + offsetX
    const top = columnHeights[minColumn]
    
    columnHeights[minColumn] += photoHeight + gap
    
    return {
      src: photo.src,
      alt: photo.alt,
      height: photoHeight,
      left,
      top
    }
  })
  
  masonryHeight.value = Math.max(...columnHeights)
}

const handleScroll = () => {
  if (!hasMore.value) return
  
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  const remaining = currentPhotos.value.length - displayedCount.value
  
  if (remaining <= PRELOAD_THRESHOLD) {
    displayedCount.value = Math.min(displayedCount.value + BATCH_SIZE, currentPhotos.value.length)
    nextTick(() => {
      distributePhotos()
    })
  } else if (scrollTop + clientHeight >= scrollHeight - 100) {
    displayedCount.value = Math.min(displayedCount.value + BATCH_SIZE, currentPhotos.value.length)
    nextTick(() => {
      distributePhotos()
    })
  }
}

onMounted(() => {
  const initGallery = () => {
    if (masonryRef.value && masonryRef.value.offsetWidth > 0) {
      distributePhotos()
    } else {
      requestAnimationFrame(initGallery)
    }
  }
  requestAnimationFrame(initGallery)
  window.addEventListener('resize', distributePhotos)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', distributePhotos)
  window.removeEventListener('scroll', handleScroll)
})

watch(activeCategory, () => {
  nextTick(() => {
    distributePhotos()
  })
})

watch(() => props.categories, () => {
  displayedCount.value = 45
  nextTick(() => {
    distributePhotos()
  })
}, { deep: true })

watch(displayedCount, () => {
  nextTick(() => {
    distributePhotos()
  })
})

const showLightbox = ref(false)
const currentImage = ref('')

const openLightbox = (src: string) => {
  currentImage.value = src
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}
</script>

<template>
  <div class="photo-gallery">
    <div class="gallery-header" :style="{ paddingLeft: containerOffsetX + 'px' }">
      <h1 class="gallery-title">用图片记录生活</h1>
      <p class="gallery-subtitle">每一张图片都是一个故事，一段回忆，一种情感的表达。</p>
    </div>

    <div v-if="categories.length > 1" class="category-tabs" :style="{ paddingLeft: containerOffsetX + 'px' }">
      <button 
        v-for="(category, index) in categories" 
        :key="index"
        :class="['tab-btn', { active: activeCategory === index }]"
        @click="setCategory(index)"
      >
        {{ category.name }}
      </button>
    </div>

    <div class="masonry-wrapper">
      <div ref="masonryRef" :style="{ height: masonryHeight + 'px' }">
        <div 
          v-for="(photo, index) in photoItems" 
          :key="index" 
          class="photo-item"
          :style="{ width: '260px', height: photo.height + 'px', left: photo.left + 'px', top: photo.top + 'px' }"
          @click="openLightbox(photo.src)"
        >
          <img :src="photo.src" :alt="photo.alt || 'photo'" loading="lazy" />
        </div>
      </div>

      <div v-if="hasMore" class="loading-hint">
        <span>往下划动加载更多...</span>
      </div>
      <div v-else class="loading-hint">
        <span>已经到底啦~</span>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showLightbox" class="lightbox" @click="closeLightbox">
        <img :src="currentImage" alt="preview" class="lightbox-img" />
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.photo-gallery {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-header {
  text-align: left;
  margin-top: 40px;
  margin-bottom: 32px;
}

.gallery-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 20px 0;
}

.gallery-subtitle {
  font-size: 1.3rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 2.8;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 8px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: var(--vp-c-text-1);
    border-color: var(--vp-c-brand);
  }

  &.active {
    color: #fff;
    background: var(--vp-c-brand);
    border-color: var(--vp-c-brand);
  }
}

.masonry-wrapper {
  position: relative;
  width: 100%;
  min-height: 100px;
  overflow: hidden;
}

.photo-item {
  position: absolute;
  width: 260px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

:global(.dark) .photo-item:hover {
  box-shadow: 0 0 25px rgba(64, 158, 255, 0.35);
}

.loading-hint {
  text-align: center;
  padding: 20px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.lightbox-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 40px;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
}
</style>
