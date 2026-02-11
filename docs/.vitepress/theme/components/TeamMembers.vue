<script setup lang="ts">
interface Member {
  name: string
  avatar: string
  title: string
  role: 'admin' | 'member'
  active: boolean
  links: {
    platform: 'github' | 'bilibili' | 'qq' | 'wechat' | 'youtube' | 'weibo' | 'aifadian'
    url: string
  }[]
}

const props = defineProps<{
  title: string
  description?: string
  members: Member[]
}>()

const iconMap: Record<string, string> = {
  github: '/icons/github.svg',
  bilibili: '/icons/bilibili.svg',
  qq: '/icons/QQ.svg',
  wechat: '/icons/wechat.svg',
  youtube: '/icons/youtube.svg',
  weibo: '/icons/weibo.svg',
  aifadian: '/icons/aifadian.svg',
}
</script>

<template>
  <div class="team-section">
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="description" class="section-desc" v-html="description.replace(/\n/g, '<br>')"></p>
    <div class="member-grid">
      <div
        v-for="(member, index) in members"
        :key="index"
        class="member-card"
        :class="{
          'is-admin': member.role === 'admin',
          'is-inactive': member.active === false
        }"
      >
        <div class="card-inner">
          <div class="avatar-wrapper">
            <img :src="member.avatar" :alt="member.name" class="avatar" />
          </div>
          <div class="member-info">
            <h3 class="member-name">{{ member.name }}</h3>
            <p class="member-title">{{ member.title }}</p>
            <div class="member-links">
              <a
                v-for="link in member.links"
                :key="link.platform"
                :href="link.url"
                target="_blank"
                class="link-icon"
                :title="link.platform"
              >
                <img :src="iconMap[link.platform]" :alt="link.platform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-section {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--vp-c-text-1);
  text-align: center;
}

.section-desc {
  color: var(--vp-c-text-2);
  margin-bottom: 24px;
  text-align: center;
}

.member-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1200px;
}

.member-card {
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: all 0.3s ease;
  opacity: 1;
}

.member-card.is-inactive {
  opacity: 0.5;
  filter: grayscale(50%);
}

.member-card.is-inactive:hover {
  opacity: 0.7;
}

.card-inner {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-wrapper {
  margin-bottom: 12px;
  position: relative;
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.member-card.is-admin .avatar {
  width: 100px;
  height: 100px;
}

.member-card:not(.is-admin) .avatar {
  width: 80px;
  height: 80px;
}

.member-info {
  width: 100%;
}

.member-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--vp-c-text-1);
}

.member-title {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin: 0 0 12px 0;
}

.member-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  transition: all 0.3s ease;
}

.link-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(var(--vp-c-brand-rgb), 0.15);
}

.member-card:hover .avatar {
  transform: scale(1.05);
}

.member-card:hover .link-icon {
  background: var(--vp-c-brand-soft);
}

.member-card:hover .link-icon img {
  filter: brightness(1.1);
}

@media (max-width: 640px) {
  .member-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .member-card.is-admin .avatar {
    width: 80px;
    height: 80px;
  }

  .member-card:not(.is-admin) .avatar {
    width: 64px;
    height: 64px;
  }
}
</style>
