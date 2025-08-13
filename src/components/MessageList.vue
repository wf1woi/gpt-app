<template>
  <div class="chat-body" ref="wrap">
    <template v-for="m in messages" :key="m.id">
      <MessageItem :role="m.role" :content="m.content" :time="m.time" />
    </template>
    <div v-if="typing" class="typing" style="margin:12px 0">
      <el-skeleton :rows="1" animated style="width: 180px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MessageItem from './MessageItem.vue'
import type { ChatMessage } from '@/store/chat'

const props = defineProps<{ messages: ChatMessage[]; typing?: boolean }>()

const wrap = ref<HTMLElement>()
watch(() => props.messages.length, async () => {
  await nextTick()
  if (wrap.value) wrap.value.scrollTop = wrap.value.scrollHeight
})
</script>
