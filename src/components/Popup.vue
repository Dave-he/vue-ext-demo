<template>
  <div class="popup-container">
    <div class="popup-header">
      <h2>Extension Popup</h2>
    </div>
    
    <div class="popup-content">
      <div class="feature-card">
        <h3>Quick Actions</h3>
        <button @click="openOptions" class="btn btn-primary">
          Open Options
        </button>
        <button @click="openHelp" class="btn">
          Help
        </button>
      </div>
      
      <div class="status-card">
        <h3>Status</h3>
        <div class="status-item">
          <span>Extension:</span>
          <span :class="{ active: extensionEnabled }">
            {{ extensionEnabled ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
        <div class="status-item">
          <span>Version:</span>
          <span>{{ version }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const extensionEnabled = ref(false)
const version = ref('1.0.0')

onMounted(async () => {
  // 获取扩展状态
  const result = await chrome.storage.sync.get(['enabled'])
  extensionEnabled.value = result.enabled
  
  // 获取版本信息
  const manifest = chrome.runtime.getManifest()
  version.value = manifest.version
})

const openOptions = () => {
  chrome.runtime.openOptionsPage()
}

const openHelp = () => {
  window.open('https://github.com/your-repo/vue-ts-extension', '_blank')
}
</script>

<style scoped>
.popup-container {
  width: 300px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
}

.popup-header h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.popup-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-card, .status-card {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.feature-card h3, .status-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  margin-right: 8px;
}

.btn:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.btn-primary:hover {
  background: #1565c0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.status-item span:first-child {
  font-weight: 500;
}

.status-item .active {
  color: #2e7d32;
  font-weight: bold;
}
</style>