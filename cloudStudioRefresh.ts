/**
 * cloudStudioRefresh.ts
 *
 * 一个 Deno 脚本，使用 Deno.cron 每分钟访问 cloudstudio.net
 * 以尝试刷新特定页面。
 *
 * 用法:
 * deno run --allow-net cloudStudioRefresh.ts
 *
 * 重要提示：你必须使用来自活动浏览器会话的最新有效值
 * 更新 Cookie 以及可能的 X-XSRF-Token，此脚本才能工作。
 */

// 从 CloudStudio 获取数据的函数
async function fetchCloudStudio(): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] 正在访问 https://cloudstudio.net/a/26623736458117120/edit...`);

    const headers = new Headers();
    headers.append('content-length', '0');
    headers.append('cache-control', 'max-age=0');
    headers.append('sec-ch-ua', '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"');
    headers.append('sec-ch-ua-mobile', '?0');
    headers.append('sec-ch-ua-platform', '"Windows"');
    headers.append('origin', 'https://cloudstudio.net');
    headers.append('content-type', 'application/x-www-form-urlencoded');
    headers.append('upgrade-insecure-requests', '1');
    headers.append('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36');
    headers.append('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
    headers.append('sec-fetch-site', 'cross-site');
    headers.append('sec-fetch-mode', 'navigate');
    headers.append('sec-fetch-dest', 'iframe');
    headers.append('sec-fetch-storage-access', 'active');
    headers.append('referer', 'https://cloudstudio.net/');
    headers.append('accept-encoding', 'gzip, deflate, br, zstd');
    headers.append('accept-language', 'zh-CN,zh;q=0.9');
    headers.append('priority', 'u=0, i');
    headers.append('Cookie', 'cloudstudio-editor-session=');

    console.log(`正在发送的请求头:`);
    for (const [key, value] of headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // 设置超时时间为 30 秒
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://f096f070e9864942bb68eec91f95a7c8.ap-shanghai.cloudstudio.club/?mode=edit", {
        headers: headers,
        method: 'POST',
        // Deno 的 fetch 默认会跟随重定向。
        // redirect: 'follow' // 默认行为
        signal: controller.signal
      });

    console.log(`响应状态: ${response.status} ${response.statusText}`);
    console.log(`响应 URL (重定向后): ${response.url}`);
    console.log(`响应头: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);

    if (response.ok) {
      const text = await response.text();
      console.log(`内容长度: ${text.length} 字符`);
      // console.log(`响应的前 1000 个字符: ${text.substring(0, 1000)}...`);

      // 检查响应 URL 是否是你期望的成功“跳转”后的 URL
      if (response.url === "")) {
        // 或者最终的目标 URL 应该是什么
        console.log("请求成功，并且似乎已到达目标页面或相关资源。\n");
      } else {
        console.log("请求成功，但最终 URL 与预期不同。请检查重定向。\n");
      }
    } else {
      const errorText = await response.text();
      console.error(`错误: ${response.status} ${response.statusText}`);
      console.error(`错误响应体 (前 500 字符): ${errorText.substring(0, 500)}\n`);
      fetchCloudStudio();
    }
    } finally {
      // 清除超时定时器
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`请求超时（30秒）: 重新尝试请求\n`);
    } else {
      console.error(`发生异常: ${error.message}\n`);
    }
    // 无论是超时还是其他错误，都重试请求
    setTimeout(() => fetchCloudStudio(), 1000); // 等待1秒后重试
  }
}

// 初始化时立即获取一次
console.log("启动 CloudStudio 刷新脚本");
console.log("将每分钟访问一次 CloudStudio");
console.log("按 Ctrl+C 停止\n");

// 执行初始获取
fetchCloudStudio();

// 设置 cron 任务每分钟运行一次
Deno.cron("CloudStudio Refresh", "* * * * *", () => {
  return fetchCloudStudio();
});



