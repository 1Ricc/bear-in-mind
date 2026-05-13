<template>
  <router-view />
  <ChatBot />
</template>

<script setup>
import ChatBot from '@/components/ChatBot.vue';
</script>

<style>
/* Только самые базовые глобальные стили */
body, html {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #4A7FA7;
  overflow: hidden;
}
</style>