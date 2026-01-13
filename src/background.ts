// 背景脚本
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details)
  
  // 设置默认配置
  chrome.storage.sync.set({
    enabled: true,
    theme: 'light'
  })
})

// 处理来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExtension') {
    chrome.storage.sync.get(['enabled'], (result) => {
      const newState = !result.enabled
      chrome.storage.sync.set({ enabled: newState })
      sendResponse({ enabled: newState })
    })
    return true
  }
  
  if (request.action === 'saveData') {
    chrome.storage.sync.set({ data: request.data })
    sendResponse({ success: true })
    return true
  }
})

// 定时任务示例
setInterval(() => {
  chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled) {
      console.log('Extension is active')
    }
  })
}, 60000)