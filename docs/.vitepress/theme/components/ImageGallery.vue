<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  images: {
    src: string
    alt?: string
  }[]
}

const props = defineProps<Props>()

const activeIndex = ref(0)
const showArrows = ref(false)

const prev = () => {
  activeIndex.value = activeIndex.value === 0 ? props.images.length - 1 : activeIndex.value - 1
}

const next = () => {
  activeIndex.value = activeIndex.value === props.images.length - 1 ? 0 : activeIndex.value + 1
}
</script>

<template>
  <div v-if="images && images.length > 0" class="image-gallery">
    <div 
      class="main-image"
      @mouseenter="showArrows = true"
      @mouseleave="showArrows = false"
    >
      <img 
        :src="images[activeIndex].src" 
        :alt="images[activeIndex].alt || 'gallery image'"
      />
      
      <div v-if="images.length > 1" class="arrow arrow-left" :class="{ visible: showArrows }" @click="prev">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </div>
      
      <div v-if="images.length > 1" class="arrow arrow-right" :class="{ visible: showArrows }" @click="next">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </div>
    </div>
    
    <div class="thumbnails">
      <div
        v-for="(img, index) in images" 
        :key="index"
        class="thumbnail"
        :class="{ active: index === activeIndex }"
      >
        <img :src="img.src" :alt="img.alt || `thumbnail ${index}`" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-gallery {
  width: 100%;
  margin: 1.5rem 0;
}

.main-image {
  width: 100%;
  position: relative;
  padding-bottom: 56.25%;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0);

  @media (prefers-color-scheme: dark) {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 255, 255, 0.2);
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  &.visible {
    opacity: 1;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.arrow-left {
  left: 10px;
}

.arrow-right {
  right: 10px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.5;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
  
  &.active {
    opacity: 1;
    border-color: var(--vp-c-brand);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@media (max-width: 640px) {
  .thumbnail {
    width: 60px;
    height: 45px;
  }
  
  .arrow {
    width: 32px;
    height: 32px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
