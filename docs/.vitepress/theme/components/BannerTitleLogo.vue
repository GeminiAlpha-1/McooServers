<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div class="banner-title-with-logo">
    <img 
      src="/logo.svg" 
      alt="Logo" 
      class="banner-logo"
    />
    <h1 class="banner-title">{{ name }}</h1>
  </div>
</template>

<style scoped>
.banner-title-with-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.banner-logo {
  height: 60px;
  width: auto;
  object-fit: contain;
  vertical-align: middle;
}

.banner-title {
  margin: 0;
  font-size: 3.2rem;
  font-weight: 600;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .banner-title-with-logo {
    flex-direction: column;
    gap: 8px;
  }
  
  .banner-logo {
    height: 60px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
}
</style>
