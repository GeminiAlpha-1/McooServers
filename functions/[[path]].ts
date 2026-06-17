// functions/[[path]].ts
// Cloudflare Pages Function: SPA fallback for VitePress permalinks
//
// 机制:
//   1. 让 Pages 先查静态资源(走 context.next())
//   2. 如果是 404,判断是不是真资源文件
//      - 有扩展名(图片/CSS/JS):保持 404(真找不到)
//      - 无扩展名(permalink 路径):fallback 到 index.html 返 200
//   3. Vue Router 客户端接管,根据 URL 渲染对应页面
//
// 优先级:Functions > _redirects > 404.html
//         (这个文件会替代 _redirects 的作用,且更可靠)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequest: any = async (context: any) => {
  const url: URL = new URL(context.request.url)

  // 1. 让 Pages 查找静态资源
  const response: Response = await context.next()

  // 2. 找到了(200/304/etc),直接返回
  if (response.status !== 404) return response

  // 3. 路径看起来是资源文件(有后缀)→ 真找不到,保持 404
  //    例子:/assets/foo.css, /foo.png, /favicon.ico, /sitemap.xml
  if (/\.[a-zA-Z0-9]+$/.test(url.pathname)) return response

  // 4. 路径无扩展名 → 视为 SPA 路由,fallback 到 index.html
  //    例子:/mrds, /mcdr/redstone/008, /chajian/001
  return context.env.ASSETS.fetch(new URL('/index.html', url))
}
