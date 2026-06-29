<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive :include="['FeedView']">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>

<script setup>
// App.vue agora é apenas o ponto de entrada.
// Toda lógica de auth, feed e perfil foi movida para as views/rotas.
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0500; }
</style>