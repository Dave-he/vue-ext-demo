<template>
  <div class="ollama-chat">
    <div class="chat-header">
      <h3>Ollama Chat</h3>
      <button class="settings-btn" @click="openSettings" title="Settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <p>Start a conversation with Ollama</p>
        <p class="hint">Make sure Ollama is running at {{ serverUrl }}</p>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        <div class="message-content">{{ msg.content }}</div>
      </div>

      <div v-if="streaming" class="message assistant streaming">
        <div class="message-content">{{ streamingContent }}</div>
      </div>
    </div>

    <div class="chat-input">
      <textarea
        v-model="inputMessage"
        placeholder="Type your message..."
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="streaming || loading"
        rows="3"
      ></textarea>
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="!inputMessage.trim() || streaming || loading"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && !streaming" class="loading-indicator">
      Connecting to Ollama...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { OllamaService, ChatMessage } from '../services/ollamaService'

interface Props {
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

const emit = defineEmits<{
  (e: 'openSettings'): void
}>()

const messagesContainer = ref<HTMLElement>()
const inputMessage = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const streaming = ref(false)
const streamingContent = ref('')
const error = ref('')
const serverUrl = ref('http://localhost:11434')
const currentModel = ref('llama3.2')

let ollamaService: OllamaService | null = null

onMounted(async () => {
  await loadSettings()
  scrollToBottom()
})

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['ollamaServerUrl', 'ollamaModel'])

    if (result.ollamaServerUrl) {
      serverUrl.value = result.ollamaServerUrl as string
    }
    if (result.ollamaModel) {
      currentModel.value = result.ollamaModel as string
    }

    ollamaService = new OllamaService({
      serverUrl: serverUrl.value,
      model: currentModel.value
    })

    await testConnection()
  } catch (e) {
    error.value = 'Failed to load settings'
    console.error('Load settings error:', e)
  }
}

async function testConnection() {
  if (!ollamaService) return

  try {
    const connected = await ollamaService.testConnection()
    if (!connected) {
      error.value = `Cannot connect to Ollama at ${serverUrl.value}. Make sure Ollama is running.`
    } else {
      error.value = ''
    }
  } catch (e) {
    error.value = 'Failed to connect to Ollama server'
  }
}

async function sendMessage() {
  const content = inputMessage.value.trim()
  if (!content || streaming.value || loading.value) return

  const userMessage: ChatMessage = { role: 'user', content }
  messages.value.push(userMessage)
  inputMessage.value = ''
  loading.value = true
  error.value = ''
  streamingContent.value = ''

  await nextTick()
  scrollToBottom()

  try {
    if (!ollamaService) {
      await loadSettings()
      if (!ollamaService) {
        throw new Error('Ollama service not initialized')
      }
    }

    const response = await ollamaService.chat(
      messages.value,
      (chunk) => {
        streaming.value = true
        streamingContent.value += chunk
        nextTick(() => scrollToBottom())
      }
    )

    if (response) {
      messages.value.push({ role: 'assistant', content: response })
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to get response from Ollama'
    console.error('Chat error:', e)
  } finally {
    loading.value = false
    streaming.value = false
    streamingContent.value = ''
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function openSettings() {
  emit('openSettings')
}

watch(() => props.compact, () => {
  nextTick(() => scrollToBottom())
})
</script>

<style scoped>
.ollama-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.settings-btn {
  padding: 6px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 40px 20px;
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  margin-top: 8px;
  font-size: 12px;
}

.message {
  max-width: 85%;
  border-radius: 12px;
  padding: 10px 14px;
}

.message.user {
  align-self: flex-end;
  background: #0066cc;
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: #f0f0f0;
  color: #333;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.message.assistant.streaming {
  background: #e8f4fd;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e5e5e5;
  background: #fafafa;
}

.chat-input textarea {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #0066cc;
}

.chat-input textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  align-self: flex-end;
  padding: 10px;
  background: #0066cc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0052a3;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 8px 16px;
  background: #ffeaea;
  color: #c62828;
  font-size: 13px;
}

.loading-indicator {
  padding: 8px 16px;
  background: #e8f4fd;
  color: #0066cc;
  font-size: 13px;
  text-align: center;
}
</style>
