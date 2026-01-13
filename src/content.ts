import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './components/App.vue'

// 创建应用实例
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 挂载到页面
const mountPoint = document.createElement('div')
mountPoint.id = 'vue-extension-root'
document.body.appendChild(mountPoint)

app.mount('#vue-extension-root')

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selection = window.getSelection()?.toString()
    sendResponse({ text: selection })
  }
  return true
})

console.log('Vue extension content script loaded')