<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import mermaid from 'mermaid';

const props = defineProps<{
  code: string;
}>();

const container = ref<HTMLElement | null>(null);

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

async function renderChart() {
  if (!container.value) return;
  
  try {
    const { svg } = await mermaid.render(`mermaid-${Date.now()}`, props.code);
    container.value.innerHTML = svg;
  } catch (e) {
    container.value.innerHTML = `<pre class="mermaid-error">${e}</pre>`;
  }
}

onMounted(() => {
  renderChart();
});

watch(() => props.code, () => {
  renderChart();
});
</script>

<template>
  <div ref="container" class="mermaid-container"></div>
</template>

<style scoped>
.mermaid-container {
  text-align: center;
  margin: 20px 0;
}

.mermaid-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

.mermaid-error {
  color: #ff4757;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 4px;
}
</style>
