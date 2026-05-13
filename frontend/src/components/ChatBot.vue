<template>
  <!-- Closed: floating bubble -->
  <button
    v-if="!isOpen"
    class="chat-bubble"
    @click="isOpen = true"
    aria-label="Open ESG Coach"
  >
    🌿
  </button>

  <!-- Open: chat panel -->
  <div v-else class="chat-panel">
    <div class="chat-header">
      <div>
        <div class="chat-title">🌿 ESG Coach</div>
        <div class="chat-subtitle">Powered by Gemini</div>
      </div>
      <button class="close-btn" @click="isOpen = false">✕</button>
    </div>

    <div class="chat-messages" ref="messagesEl">
      <div v-if="messages.length === 0" class="chat-empty">
        Ask me anything about your ESG activities!
      </div>
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message', msg.role === 'user' ? 'message-user' : 'message-assistant']"
      >
        {{ msg.content }}
      </div>
      <div v-if="isLoading" class="message message-assistant loading">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>

    <div class="chat-footer">
      <div class="chat-counter">{{ remainingMessages }} / 20 messages remaining today</div>
      <div v-if="error" class="chat-error">{{ error }}</div>
      <div class="chat-input-row">
        <input
          v-model="input"
          @keydown.enter.prevent="sendMessage"
          placeholder="Ask something..."
          :disabled="isLoading || remainingMessages === 0"
          class="chat-input"
          maxlength="500"
        />
        <button
          @click="sendMessage"
          :disabled="!input.trim() || isLoading || remainingMessages === 0"
          class="send-btn"
        >
          ↑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';

const isOpen = ref(false);
const messages = ref([]);
const input = ref('');
const isLoading = ref(false);
const remainingMessages = ref(20);
const error = ref(null);
const messagesEl = ref(null);

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isLoading.value || remainingMessages.value === 0) return;

  error.value = null;
  messages.value.push({ role: 'user', content: text });
  input.value = '';
  isLoading.value = true;

  await nextTick();
  scrollToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      },
      body: JSON.stringify({
        message: text,
        history: messages.value.slice(-7, -1),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || 'Something went wrong. Please try again.';
      return;
    }

    messages.value.push({ role: 'assistant', content: data.reply });
    remainingMessages.value = data.remainingMessages;
  } catch {
    error.value = 'Something went wrong. Please try again.';
  } finally {
    isLoading.value = false;
    await nextTick();
    scrollToBottom();
  }
}

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
}
</script>

<style scoped>
.chat-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3d8b40;
  border: none;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}
.chat-bubble:hover { transform: scale(1.1); }

.chat-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 320px;
  height: 420px;
  background: white;
  border-radius: 12px 0 0 0;
  box-shadow: -4px -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #3d8b40;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.chat-title { color: white; font-weight: bold; font-size: 14px; }
.chat-subtitle { color: rgba(255, 255, 255, 0.7); font-size: 11px; }
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
  line-height: 1;
}
.close-btn:hover { opacity: 1; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chat-empty { color: #999; font-size: 13px; text-align: center; margin-top: 20px; }

.message {
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 85%;
  word-wrap: break-word;
}
.message-user {
  background: #3d8b40;
  color: white;
  border-radius: 12px 12px 2px 12px;
  align-self: flex-end;
}
.message-assistant {
  background: #f0f0f0;
  color: #333;
  border-radius: 12px 12px 12px 2px;
  align-self: flex-start;
}
.loading span {
  animation: blink 1.2s infinite;
  font-size: 20px;
}
.loading span:nth-child(2) { animation-delay: 0.2s; }
.loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.chat-footer {
  padding: 8px 12px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.chat-counter { font-size: 11px; color: #999; text-align: right; }
.chat-error { font-size: 12px; color: #e53e3e; }
.chat-input-row { display: flex; gap: 6px; }
.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.chat-input:focus { border-color: #3d8b40; }
.chat-input:disabled { background: #f5f5f5; }
.send-btn {
  background: #3d8b40;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}
.send-btn:disabled { background: #ccc; cursor: not-allowed; }
.send-btn:not(:disabled):hover { background: #4caf50; }
</style>
