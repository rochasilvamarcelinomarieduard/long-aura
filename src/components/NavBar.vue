<template>
  <nav class="navbar">
    <div class="navbar-content">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="text" placeholder="Pesquisar" v-model="search" />
      </div>
      <div class="nav-links">
        <router-link to="/" class="menu-item">Para você</router-link>
        <a href="#">Loja</a>
        <button class="login-btn">Entrar</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from "vue"
const search = ref("")
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
.navbar {
  width: 100%; background: #0a0404;
  border-bottom: 1px solid #2a1008;
  position: fixed; top: 0; left: 0; z-index: 1000;
}
.navbar-content {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 32px;
}
.search-container {
  display: flex; align-items: center; gap: 8px;
  background: #1a0c0a; border: 1px solid #3a1810;
  border-radius: 30px; padding: 8px 16px; width: 340px;
  transition: border-color .2s;
}
.search-container:focus-within { border-color: #ff2d55; }
.search-icon { fill: #7a4030; flex-shrink: 0; }
.search-container input {
  background: transparent; border: none; outline: none;
  color: #fff0ea; flex: 1; font-size: 14px; font-family: 'DM Sans', sans-serif;
}
.search-container input::placeholder { color: #7a4030; }
.nav-links { display: flex; align-items: center; gap: 20px; }
.nav-links a, .menu-item {
  text-decoration: none; color: #c08070;
  font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
  transition: color .2s;
}
.nav-links a:hover, .menu-item:hover { color: #fff0ea; }
.menu-item.router-link-active { color: #ff8c42; }
.login-btn {
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  border: none; padding: 8px 20px; border-radius: 8px;
  color: #fff; font-weight: 700; cursor: pointer;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  transition: opacity .2s, transform .2s;
  box-shadow: 0 0 16px rgba(255,45,85,.3);
}
.login-btn:hover { opacity: .88; transform: translateY(-1px); }
</style>