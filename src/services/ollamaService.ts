// Ollama API Service
// Handles communication with Ollama server

export interface OllamaConfig {
  serverUrl: string
  model: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OllamaResponse {
  message: ChatMessage
  done: boolean
}

export class OllamaService {
  private config: OllamaConfig

  constructor(config: OllamaConfig) {
    this.config = config
  }

  async chat(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
    const url = `${this.config.serverUrl}/api/chat`

    const body = {
      model: this.config.model,
      messages: messages,
      stream: !!onChunk
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (onChunk && response.body) {
        return this.handleStreamingResponse(response.body, onChunk)
      } else {
        const data = await response.json()
        return data.message?.content || ''
      }
    } catch (error) {
      console.error('Ollama API error:', error)
      throw error
    }
  }

  private async handleStreamingResponse(
    body: ReadableStream,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.message?.content) {
            fullResponse += data.message.content
            onChunk(data.message.content)
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }

    return fullResponse
  }

  async listModels(): Promise<string[]> {
    const url = `${this.config.serverUrl}/api/tags`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.models?.map((m: { name: string }) => m.name) || []
    } catch (error) {
      console.error('Failed to list models:', error)
      return []
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.config.serverUrl}/api/tags`
      const response = await fetch(url, { method: 'GET' })
      return response.ok
    } catch {
      return false
    }
  }

  updateConfig(config: Partial<OllamaConfig>) {
    this.config = { ...this.config, ...config }
  }
}

// Helper function to create service from storage
export async function createOllamaService(): Promise<OllamaService | null> {
  try {
    const result = await chrome.storage.sync.get(['ollamaServerUrl', 'ollamaModel'])

    const serverUrl = result.ollamaServerUrl as string || 'http://localhost:11434'
    const model = result.ollamaModel as string || 'llama3.2'

    return new OllamaService({ serverUrl, model })
  } catch (error) {
    console.error('Failed to create Ollama service:', error)
    return null
  }
}
