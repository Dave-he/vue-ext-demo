<template>
  <div class="settings-page">
    <h1>Ollama Settings</h1>

    <div class="form-group">
      <label for="serverUrl">Ollama Server URL</label>
      <input
        id="serverUrl"
        v-model="settings.serverUrl"
        type="text"
        placeholder="http://localhost:11434"
      >
      <p class="hint">The URL where your Ollama server is running</p>
    </div>

    <div class="form-group">
      <label for="model">Default Model</label>
      <input
        id="model"
        v-model="settings.model"
        type="text"
        placeholder="llama3.2"
      >
      <p class="hint">The model to use for chat (e.g., llama3.2, codellama, mistral)</p>
    </div>

    <button class="save-btn" @click="saveSettings" :disabled="saving">
      {{ saving ? 'Saving...' : 'Save Settings' }}
    </button>

    <div v-if="statusMessage" :class="['status', statusType]">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface OllamaSettings {
  serverUrl: string
  model: string
}

const settings = reactive<OllamaSettings>({
  serverUrl: 'http://localhost:11434',
  model: 'llama3.2'
})

const saving = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

onMounted(async () => {
  try {
    const result = await chrome.storage.sync.get(['ollamaServerUrl', 'ollamaModel'])
    if (result.ollamaServerUrl) {
      settings.serverUrl = result.ollamaServerUrl as string
    }
    if (result.ollamaModel) {
      settings.model = result.ollamaModel as string
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
})

async function saveSettings() {
  saving.value = true
  statusMessage.value = ''

  try {
    await chrome.storage.sync.set({
      ollamaServerUrl: settings.serverUrl,
      ollamaModel: settings.model
    })

    statusMessage.value = 'Settings saved successfully!'
    statusType.value = 'success'
  } catch (error) {
    statusMessage.value = 'Failed to save settings'
    statusType.value = 'error'
    console.error('Save error:', error)
  } finally {
    saving.value = false

    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.settings-page {
  padding: 8px;
}

h1 {
  font-size: 20px;
  margin-bottom: 24px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #0066cc;
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #0052a3;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status {
  margin-top: 16px;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.status.success {
  background: #e6f7e6;
  color: #2e7d32;
}

.status.error {
  background: #ffeaea;
  color: #c62828;
}
</style>
