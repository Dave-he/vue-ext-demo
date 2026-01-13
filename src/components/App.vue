<template>
  <div class="vue-extension-app">
    <div class="header">
      <h1>Vue TS Extension</h1>
      <div class="status-indicator" :class="{ active: isActive }">
        {{ isActive ? 'Active' : 'Inactive' }}
      </div>
    </div>
    
    <div class="content">
      <p>This is a Vue.js extension built with TypeScript and Vite.</p>
      
      <div class="controls">
        <button @click="toggleExtension" class="btn">
          {{ isActive ? 'Disable' : 'Enable' }}
        </button>
        
        <button @click="getSelection" class="btn btn-secondary">
          Get Selection
        </button>
        
        <button @click="saveData" class="btn btn-primary">
          Save Data
        </button>
      </div>
      
      <div v-if="selection" class="selection">
        <h3>Selected Text:</h3>
        <p>{{ selection }}</p>
      </div>
      
      <div v-if="savedData" class="data">
        <h3>Saved Data:</h3>
        <pre>{{ JSON.stringify(savedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isActive = ref(false)
const selection = ref('')
const savedData = ref<any>(null)

onMounted(async () => {
  // 从 Chrome 存储获取状态
  const result = await chrome.storage.sync.get(['enabled'])
  isActive.value = result.enabled ?? true
})

const toggleExtension = async () => {
  isActive.value = !isActive.value
  
  // 保存到 Chrome 存储
  await chrome.storage.sync.set({ enabled: isActive.value })
  
  // 通知背景脚本
  await chrome.runtime.sendMessage({
    action: 'toggleExtension'
  })
}

const getSelection = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSelection'
    })
    selection.value = response.text
  } catch (error) {
    console.error('Error getting selection:', error)
  }
}

const saveData = async () => {
  const data = {
    timestamp: new Date().toISOString(),
    message: 'Hello from Vue Extension!'
  }
  
  savedData.value = data
  
  await chrome.runtime.sendMessage({
    action: 'saveData',
    data
  })
}
</script>

<style scoped>
.vue-extension-app {
  width: 320px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 10px;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background: #f0f0f0;
  color: #666;
}

.status-indicator.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.content p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border-color: #ddd;
}

.selection, .data {
  margin-top: 20px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #eee;
}

.selection h3, .data h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.selection p {
  margin: 0;
  font-size: 13px;
  color: #333;
}

.data pre {
  margin: 0;
  font-size: 12px;
  color: #666;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #eee;
}
</style>