<template>
  <div class="login-page">
    <AuthCard @autenticado="onAutenticado" />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '@/auth.js'
import AuthCard from '@/components/AuthCard.vue'

const router = useRouter()

function onAutenticado() {
  router.push('/home')
}

watch(() => authState.user, (user) => {
  if (user) router.push('/home')
})
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>