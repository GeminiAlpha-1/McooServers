<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  avatar: string
  name: string
  link?: string
  subtitle?: string
  license?: string
}

const props = withDefaults(defineProps<Props>(), {
  link: '#',
  subtitle: '',
  license: ''
})

const macaronColors = [
  { bg: 'rgba(255, 182, 193, 0.25)', bgEnd: 'rgba(255, 182, 193, 0.05)' },
  { bg: 'rgba(173, 216, 230, 0.25)', bgEnd: 'rgba(173, 216, 230, 0.05)' },
  { bg: 'rgba(144, 238, 144, 0.25)', bgEnd: 'rgba(144, 238, 144, 0.05)' },
  { bg: 'rgba(255, 218, 185, 0.25)', bgEnd: 'rgba(255, 218, 185, 0.05)' },
  { bg: 'rgba(221, 160, 221, 0.25)', bgEnd: 'rgba(221, 160, 221, 0.05)' },
  { bg: 'rgba(175, 238, 238, 0.25)', bgEnd: 'rgba(175, 238, 238, 0.05)' },
  { bg: 'rgba(255, 255, 224, 0.25)', bgEnd: 'rgba(255, 255, 224, 0.05)' },
  { bg: 'rgba(230, 230, 250, 0.25)', bgEnd: 'rgba(230, 230, 250, 0.05)' },
]

const randomColor = computed(() => {
  const index = Math.floor(Math.random() * macaronColors.length)
  return macaronColors[index]
})
</script>

<template>
  <div class="author-card" :style="{ background: `linear-gradient(180deg, ${randomColor.bg} 0%, ${randomColor.bgEnd} 100%)` }">
    <div class="avatar">
      <img :src="avatar" :alt="name" />
    </div>
    <div class="content">
      <a v-if="link" :href="link" class="name" target="_blank">{{ name }}</a>
      <span v-else class="name">{{ name }}</span>
      <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
      <div v-if="$slots.description" class="description">
        <slot name="description" />
      </div>
      <span v-if="license" class="license">许可证：{{ license }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.author-card {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: none;
  margin: 1.5rem 0;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.avatar {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--vp-c-brand);
  }

  &::before {
    display: none !important;
  }
}

.subtitle {
  display: block;
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.description {
  margin: 8px 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.license {
  display: inline-block;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

@media (max-width: 640px) {
  .author-card {
    padding: 12px 16px;
    gap: 12px;
  }

  .avatar {
    width: 48px;
    height: 48px;
  }

  .name {
    font-size: 1rem;
  }

  .description {
    font-size: 0.9rem;
  }
}
</style>
