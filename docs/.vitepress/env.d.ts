/// <reference types="vitepress" />

/**
 * MRDS 虚拟模块类型声明
 * 配合 theme/plugins/mrds-data-loader.ts 使用
 * 组件里 `import { data } from 'virtual:mrds-data'` 时能拿到类型
 */
declare module 'virtual:mrds-data' {
  export interface MRDSAuthor {
    name: string
    avatar: string
    link: string
    subtitle: string
  }

  export interface MRDSItem {
    id: string
    title: string
    link: string
    cover: string
    description: string
    category: string
    tags: string[]
    date: string
    author: MRDSAuthor
  }

  /** 作者头像信息(用于投稿表单游戏 ID 实时补全) */
  export interface MRDSAvatar {
    gameId: string
    avatar: string
  }

  export const data: MRDSItem[]
  export const avatars: MRDSAvatar[]
}
