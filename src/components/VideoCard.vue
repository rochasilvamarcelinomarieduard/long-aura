<template>
  <div class="video-card">
    <div class="player-wrap">
      <video
        :ref="el => { videoEl = el; $emit('set-ref', el) }"
        :src="video.url"
        loop muted playsinline
        class="player"
        @click="onClickVideo"
      />

      <!-- Áudio da música — toca junto com o vídeo -->
      <audio
        ref="audioMusica"
        :src="video.somUrl || ''"
        loop
        preload="none"
      />

      <transition name="fade-quick">
        <div v-if="paused" class="pause-overlay">
          <div class="play-btn-circle">
            <svg viewBox="0 0 24 24" fill="white" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </transition>

      <div class="grad-top" />
      <div class="grad-bottom" />

      <div class="video-meta">
        <div class="meta-author">
          <div class="avatar-ring" @click.stop="abrirPerfil(video.userId)">
            <img :src="video.avatar" class="meta-avatar clickable" />
          </div>
          <div class="author-info">
            <strong class="author-name clickable" @click.stop="abrirPerfil(video.userId)">
              @{{ video.username }}
            </strong>
          </div>
          <button
            v-if="!ehMeuVideo"
            class="btn-follow"
            :class="{ following: video.seguindo }"
            :disabled="video.loadingSeguir"
            @click.stop="$emit('seguir')"
          >
            <span v-if="video.loadingSeguir" class="dot-loader"><span/><span/><span/></span>
            <template v-else>
              <svg v-if="!video.seguindo" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              {{ video.seguindo ? 'Seguindo' : 'Seguir' }}
            </template>
          </button>
        </div>

        <p class="meta-desc">{{ video.descricao }}</p>

        <div class="meta-music" @click.stop="abrirAudio">
          <div class="music-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <div class="music-ticker-wrap">
            <span class="music-ticker">
              {{ video.somNome || video.musica }} · {{ video.somArtista || video.username }} ·
              {{ video.somNome || video.musica }} · {{ video.somArtista || video.username }}
            </span>
          </div>
        </div>

        <div v-if="video.republicado" class="repost-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          Você republicou
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" :class="{ playing: playing }" />
      </div>
    </div>

    <!-- Action buttons -->
    <div class="actions-panel">
      <button class="action-btn" @click="$emit('curtir')">
        <div class="action-icon" :class="{ liked: video.curtido }">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path v-if="video.curtido" fill="#ff2d55" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            <path v-else fill="white" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
          </svg>
        </div>
        <span class="action-label" :class="{ liked: video.curtido }">{{ fmt(video.likes) }}</span>
      </button>

      <button class="action-btn" @click="$emit('abrir-comentarios')">
        <div class="action-icon" :class="{ active: comentariosAberto }">
          <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <span class="action-label" :class="{ active: comentariosAberto }">{{ fmt(video.totalComentarios) }}</span>
      </button>

      <button class="action-btn" @click="$emit('republicar')">
        <div class="action-icon" :class="{ reposted: video.republicado }">
          <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
        </div>
        <span class="action-label" :class="{ reposted: video.republicado }">{{ fmt(video.reposts) }}</span>
      </button>

      <button class="action-btn" @click="$emit('compartilhar')">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </div>
        <span class="action-label">Enviar</span>
      </button>

      <div class="disc-wrap">
        <div class="disc-ring" :class="{ spin: playing }">
          <img :src="video.avatar" class="disc-img" />
        </div>
        <div class="disc-center-dot" />
      </div>
    </div>

    <!-- MODAL DE ÁUDIO -->
    <teleport to="body">
      <transition name="overlay-fade">
        <div v-if="audioAberto" class="audio-overlay" @click.self="fecharAudio">
          <transition name="modal-slide">
            <div v-if="audioAberto" class="audio-modal">
              <div class="modal-handle" />

              <audio
                ref="audioEl"
                :src="video.somUrl"
                preload="none"
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onMeta"
                @ended="onEnded"
              />

              <div class="modal-header">
                <div class="modal-header-left">
                  <div class="modal-cover">
                    <img v-if="video.avatar" :src="video.avatar" class="modal-cover-img" />
                    <svg v-else viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                  <div class="modal-track-info">
                    <p class="modal-track-name">{{ video.somNome || video.musica }}</p>
                    <p class="modal-track-author">{{ video.somArtista || ('@' + video.username) }}</p>
                  </div>
                </div>
                <button class="modal-close" @click="fecharAudio">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>

              <div class="modal-player">
                <div class="player-bar-row">
                  <span class="player-time">{{ audioTimeFormatted }}</span>
                  <div class="player-bar" @click="buscarAudio">
                    <div class="player-fill" :style="{ width: audioProgress + '%' }">
                      <div class="player-thumb" />
                    </div>
                  </div>
                  <span class="player-time">{{ audioDurationFormatted }}</span>
                </div>
                <div class="player-controls">
                  <button class="ctrl-side" @click="reiniciarAudio">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button class="ctrl-main" @click="toggleAudio">
                    <svg v-if="!audioPlaying" viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </button>
                  <button class="ctrl-side" @click="audioFavoritado = !audioFavoritado" :class="{ 'ctrl-fav-active': audioFavoritado }">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path v-if="audioFavoritado" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      <path v-else d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                    </svg>
                  </button>
                </div>
                <button class="btn-usar-som" @click="$emit('usar-som', video.musica); fecharAudio()">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                  Usar este som
                </button>
              </div>

              <div class="modal-divider">
                <span class="modal-divider-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="vertical-align:-2px; margin-right:5px"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>
                  {{ fmt(videosComSom.length) }} vídeos com este som
                </span>
              </div>

              <div class="videos-grid-wrap">
                <div v-if="loadingVideos" class="grid-loading">
                  <div v-for="i in 9" :key="i" class="grid-skeleton" />
                </div>
                <div v-else-if="videosComSom.length" class="videos-grid">
                  <div
                    v-for="v in videosComSom"
                    :key="v.id"
                    class="grid-item"
                    @click="$emit('abrir-video-som', v); fecharAudio()"
                  >
                    <img :src="v.thumbnail" class="grid-thumb" />
                    <div class="grid-overlay">
                      <span class="grid-views">
                        <svg viewBox="0 0 24 24" fill="white" width="11" height="11"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {{ fmt(v.likes) }}
                      </span>
                    </div>
                    <div v-if="v.id === video.id" class="grid-current-badge">
                      <svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      Atual
                    </div>
                  </div>
                </div>
                <div v-else class="grid-empty">
                  <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.2)" width="40" height="40"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  <p>Nenhum vídeo encontrado</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- MODAL DE PERFIL -->
    <teleport to="body">
      <transition name="overlay-fade">
        <div v-if="perfilAberto" class="audio-overlay" @click.self="fecharPerfil">
          <transition name="modal-slide">
            <div v-if="perfilAberto" class="audio-modal perfil-modal">
              <div class="modal-handle" />

              <div class="perfil-cover">
                <div class="perfil-cover-pattern" />
                <button class="modal-close perfil-close-btn" @click="fecharPerfil">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
                <div class="perfil-avatar-wrap">
                  <img v-if="perfilUsuario?.avatar" :src="perfilUsuario.avatar" class="perfil-avatar-img" />
                  <div v-else class="perfil-avatar-placeholder">{{ perfilIniciais }}</div>
                </div>
              </div>

              <div class="perfil-info-row">
                <div class="perfil-names">
                  <p class="perfil-display-name">
                    <span v-if="loadingPerfil" class="skel-line skel-name" />
                    <template v-else>{{ perfilUsuario?.nome ?? perfilUsuario?.username }}</template>
                  </p>
                  <p class="perfil-username">
                    <span v-if="loadingPerfil" class="skel-line skel-user" />
                    <template v-else>@{{ perfilUsuario?.username }}</template>
                  </p>
                </div>
                <div v-if="!ehMeuPerfil" class="perfil-actions">
                  <button class="perfil-btn-msg" title="Mensagem" @click="$emit('mensagem-perfil', perfilUsuario)">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  </button>
                  <button
                    class="perfil-btn-seguir"
                    :class="{ following: perfilUsuario?.seguindo }"
                    :disabled="loadingSeguirPerfil"
                    @click="toggleSeguirPerfil"
                  >
                    <span v-if="loadingSeguirPerfil" class="dot-loader"><span/><span/><span/></span>
                    <template v-else>
                      <svg v-if="!perfilUsuario?.seguindo" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      {{ perfilUsuario?.seguindo ? 'Seguindo' : 'Seguir' }}
                    </template>
                  </button>
                </div>
              </div>

              <div class="perfil-stats">
                <div class="perfil-stat-item">
                  <span class="perfil-stat-value">
                    <span v-if="loadingPerfil" class="skel-line skel-stat" />
                    <template v-else>{{ fmt(perfilUsuario?.seguidores) }}</template>
                  </span>
                  <span class="perfil-stat-label">Seguidores</span>
                </div>
                <div class="perfil-stat-item">
                  <span class="perfil-stat-value">
                    <span v-if="loadingPerfil" class="skel-line skel-stat" />
                    <template v-else>{{ fmt(perfilUsuario?.seguindoCount) }}</template>
                  </span>
                  <span class="perfil-stat-label">Seguindo</span>
                </div>
                <div class="perfil-stat-item">
                  <span class="perfil-stat-value">
                    <span v-if="loadingPerfil" class="skel-line skel-stat" />
                    <template v-else>{{ fmt(perfilUsuario?.curtidas) }}</template>
                  </span>
                  <span class="perfil-stat-label">Curtidas</span>
                </div>
              </div>

              <p v-if="perfilUsuario?.bio && !loadingPerfil" class="perfil-bio">{{ perfilUsuario.bio }}</p>

              <div class="modal-divider">
                <span class="modal-divider-label">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="vertical-align:-2px; margin-right:5px"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  {{ fmt(videosDoPerfilCarregados.length) }} vídeos
                </span>
              </div>

              <div class="videos-grid-wrap">
                <div v-if="loadingVideosPerfil" class="grid-loading">
                  <div v-for="i in 9" :key="i" class="grid-skeleton" />
                </div>
                <div v-else-if="videosDoPerfilCarregados.length" class="videos-grid">
                  <div
                    v-for="v in videosDoPerfilCarregados"
                    :key="v.id"
                    class="grid-item"
                    @click="$emit('abrir-video-perfil', v); fecharPerfil()"
                  >
                    <img :src="v.thumbnail" class="grid-thumb" />
                    <div class="grid-overlay">
                      <span class="grid-views">
                        <svg viewBox="0 0 24 24" fill="white" width="11" height="11"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {{ fmt(v.likes) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="grid-empty">
                  <svg viewBox="0 0 24 24" fill="rgba(255,255,255,.2)" width="40" height="40"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  <p>Nenhum vídeo encontrado</p>
                </div>
              </div>

              <button class="btn-ver-perfil" @click="$emit('ir-para-perfil', perfilUsuario?.username); fecharPerfil()">
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                Ver perfil completo
              </button>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { authState } from '@/auth.js'

// ── Props & Emits ──
const props = defineProps({
  video:             Object,
  paused:            Boolean,
  playing:           Boolean,
  comentariosAberto: Boolean,
  videosDoSom: {
    type:    Array,
    default: null,
  },
})

const emit = defineEmits([
  'set-ref', 'toggle-play', 'curtir', 'abrir-comentarios',
  'republicar', 'compartilhar', 'seguir', 'ir-para-perfil',
  'usar-som', 'abrir-video-som', 'buscar-videos-som',
  'buscar-usuario-perfil',
  'buscar-videos-perfil',
  'seguir-perfil',
  'mensagem-perfil',
  'abrir-video-perfil',
])

// ── Referência ao áudio da música ──
const audioMusica = ref(null)
const videoEl     = ref(null)

// Guarda referência do elemento que tem os listeners para poder remover depois
let _videoElComListeners = null

// ── Funções nomeadas para poder remover os listeners depois ──
function onVideoPlay()  { tocarAudioMusica() }
function onVideoPause() { pararAudioMusica() }

function pararAudioMusica() {
  const el = audioMusica.value
  if (!el) return
  try { el.pause() } catch {}
}

function tocarAudioMusica() {
  const el = audioMusica.value
  if (!el || !props.video?.somUrl) return
  if (props.video?.somTrechoInicio) {
    el.currentTime = props.video.somTrechoInicio
  }
  el.play().catch(() => {})
}

function onClickVideo() {
  emit('toggle-play')
}

// Quando o elemento de vídeo muda: remove listeners antigos, adiciona novos
watch(videoEl, (novoEl, antigoEl) => {
  if (antigoEl && _videoElComListeners === antigoEl) {
    antigoEl.removeEventListener('play',  onVideoPlay)
    antigoEl.removeEventListener('pause', onVideoPause)
    _videoElComListeners = null
  }
  if (!novoEl) return
  novoEl.addEventListener('play',  onVideoPlay)
  novoEl.addEventListener('pause', onVideoPause)
  _videoElComListeners = novoEl
})

// Sincroniza o áudio quando a prop `playing` muda (troca de vídeo no scroll)
watch(() => props.playing, (tocando) => {
  if (tocando) tocarAudioMusica()
  else pararAudioMusica()
})

// Quando a URL do som muda, para e recarrega
watch(() => props.video?.somUrl, (novaUrl) => {
  pararAudioMusica()
  const el = audioMusica.value
  if (!el) return
  if (novaUrl) {
    el.load()
    if (props.playing) {
      el.addEventListener('canplay', () => tocarAudioMusica(), { once: true })
    }
  }
})

// Limpa tudo ao desmontar o componente
onUnmounted(() => {
  if (_videoElComListeners) {
    _videoElComListeners.removeEventListener('play',  onVideoPlay)
    _videoElComListeners.removeEventListener('pause', onVideoPause)
    _videoElComListeners = null
  }
  pararAudioMusica()
})

// ── Estado — Modal de Áudio ──
const audioAberto      = ref(false)
const audioPlaying     = ref(false)
const audioFavoritado  = ref(false)
const audioProgress    = ref(0)
const audioDuration    = ref(30)
const audioCurrentTime = ref(0)
const loadingVideos    = ref(false)
const videosComSom     = ref([])
const audioEl          = ref(null)

function gerarMocks() {
  const cores = ['#ff2d55','#ff6b00','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899']
  return Array.from({ length: 12 }, (_, i) => ({
    id:        i === 0 ? props.video?.id : `mock-${i}`,
    thumbnail: props.video?.avatar ?? '',
    likes:     Math.floor(Math.random() * 80000) + 500,
    username:  `user_${i}`,
    cor:       cores[i % cores.length],
  }))
}

async function carregarVideos() {
  loadingVideos.value = true
  if (props.videosDoSom) {
    videosComSom.value = props.videosDoSom
    loadingVideos.value = false
    return
  }
  emit('buscar-videos-som', {
    somId:    props.video?.somId,
    musica:   props.video?.musica,
    callback: (videos) => { videosComSom.value = videos; loadingVideos.value = false },
  })
  setTimeout(() => {
    if (loadingVideos.value) { videosComSom.value = gerarMocks(); loadingVideos.value = false }
  }, 700)
}

watch(() => props.videosDoSom, (val) => { if (val) videosComSom.value = val })

// ── Áudio do modal ──
function toggleAudio() {
  if (!audioEl.value) return
  if (audioPlaying.value) {
    audioEl.value.pause()
    audioPlaying.value = false
  } else {
    audioEl.value.play().catch(() => {})
    audioPlaying.value = true
  }
}

function reiniciarAudio() {
  if (!audioEl.value) return
  audioEl.value.currentTime = 0
  audioEl.value.pause()
  audioPlaying.value = false
  audioProgress.value = 0
  audioCurrentTime.value = 0
}

function buscarAudio(e) {
  if (!audioEl.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioEl.value.currentTime = pct * audioDuration.value
}

function onTimeUpdate() {
  if (!audioEl.value) return
  audioCurrentTime.value = audioEl.value.currentTime
  audioProgress.value    = (audioEl.value.currentTime / audioDuration.value) * 100
}

function onMeta() {
  if (!audioEl.value) return
  audioDuration.value = audioEl.value.duration || 30
}

function onEnded() {
  audioPlaying.value     = false
  audioProgress.value    = 0
  audioCurrentTime.value = 0
}

function fecharAudio() {
  audioAberto.value = false
  if (audioEl.value) { audioEl.value.pause(); audioEl.value.currentTime = 0 }
  audioPlaying.value     = false
  audioCurrentTime.value = 0
  audioProgress.value    = 0
}

function abrirAudio() { audioAberto.value = true; carregarVideos() }

const audioTimeFormatted = computed(() => {
  const s = Math.floor(audioCurrentTime.value)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

const audioDurationFormatted = computed(() => {
  const s = Math.floor(audioDuration.value)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// ── Estado — Modal de Perfil ──
const perfilAberto             = ref(false)
const perfilUsuario            = ref(null)
const loadingPerfil            = ref(true)
const loadingVideosPerfil      = ref(true)
const loadingSeguirPerfil      = ref(false)
const videosDoPerfilCarregados = ref([])

const ehMeuPerfil = computed(() =>
  perfilUsuario.value?.id === authState.user?.id
)

const perfilIniciais = computed(() => {
  const nome = perfilUsuario.value?.nome ?? perfilUsuario.value?.username ?? ''
  return nome.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?'
})

function abrirPerfil(userId) {
  emit('ir-para-perfil', props.video.username)
}
function fecharPerfil() {
  perfilAberto.value = false
}

function toggleSeguirPerfil() {
  if (!perfilUsuario.value) return
  const estadoAtual = perfilUsuario.value.seguindo
  loadingSeguirPerfil.value = true
  emit('seguir-perfil', {
    userId:   perfilUsuario.value.id,
    seguindo: estadoAtual,
    callback: (novoEstado) => {
      if (novoEstado !== undefined) {
        perfilUsuario.value.seguindo = novoEstado
      } else {
        perfilUsuario.value.seguindo = !estadoAtual
      }
      loadingSeguirPerfil.value = false
    },
  })
  setTimeout(() => {
    if (loadingSeguirPerfil.value) loadingSeguirPerfil.value = false
  }, 3000)
}

// ── Helpers ──
const ehMeuVideo = computed(() =>
  props.video?.userId === authState.user?.id
)

function fmt(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
</script>

<style scoped>
/* ── CARD LAYOUT ── */
.video-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: calc(100vh - 100px);
  width: 100%;
  margin: 0 auto;
  margin-top: 20px;
}

.player-wrap {
  position: relative;
  height: 85vh;
  aspect-ratio: 9/16;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0d0d;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.06),
    0 24px 80px rgba(0,0,0,.8),
    0 0 120px rgba(255,45,85,.04);
  max-height: 100%;
  display: flex;
  align-items: center;
}

.player {
  width: 100%; height: 100%;
  object-fit: cover; cursor: pointer; display: block;
}

.pause-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.4);
  backdrop-filter: blur(2px);
  pointer-events: none; z-index: 5;
}

.play-btn-circle {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  border: 1.5px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0,0,0,.4);
}

.grad-top {
  position: absolute; top: 0; left: 0; right: 0; height: 30%;
  background: linear-gradient(to bottom, rgba(0,0,0,.6) 0%, transparent 100%);
  pointer-events: none; z-index: 3;
}

.grad-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 65%;
  background: linear-gradient(to top, rgba(0,0,0,.95) 0%, rgba(0,0,0,.4) 60%, transparent 100%);
  pointer-events: none; z-index: 3;
}

.video-meta {
  position: absolute; bottom: 24px; left: 16px; right: 16px;
  display: flex; flex-direction: column; gap: 10px; z-index: 4;
}

.meta-author { display: flex; align-items: center; gap: 10px; }

.avatar-ring {
  width: 38px; height: 38px; border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  flex-shrink: 0; cursor: pointer; transition: opacity .15s;
}
.avatar-ring:hover { opacity: .8; }

.meta-avatar {
  width: 100%; height: 100%; border-radius: 50%;
  object-fit: cover; border: 1.5px solid #0a0500; display: block;
}

.author-info { flex: 1; }

.author-name {
  font-size: 14px; font-weight: 700; color: #fff;
  letter-spacing: .2px; text-shadow: 0 1px 4px rgba(0,0,0,.5);
}

.clickable { cursor: pointer; transition: opacity .15s; }
.clickable:hover { opacity: .75; }

.btn-follow {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 13px;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.25);
  color: #fff; border-radius: 20px;
  font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: all .2s; backdrop-filter: blur(6px); white-space: nowrap;
}
.btn-follow:hover { background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.4); }
.btn-follow.following { background: rgba(255,45,85,.15); border-color: rgba(255,45,85,.4); color: #ff2d55; }

.dot-loader { display: flex; gap: 3px; align-items: center; }
.dot-loader span {
  width: 4px; height: 4px; border-radius: 50%;
  background: currentColor; animation: dot-pulse 1.2s infinite;
}
.dot-loader span:nth-child(2) { animation-delay: .2s; }
.dot-loader span:nth-child(3) { animation-delay: .4s; }
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: .3; transform: scale(.8); }
  40%            { opacity: 1; transform: scale(1); }
}

.meta-desc { font-size: 13px; color: rgba(255,255,255,.88); line-height: 1.45; text-shadow: 0 1px 4px rgba(0,0,0,.5); }

.meta-music { display: flex; align-items: center; gap: 8px; overflow: hidden; cursor: pointer; }
.meta-music:hover .music-ticker-wrap { opacity: .8; }

.music-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; animation: spin-slow 4s linear infinite;
}

.music-ticker-wrap {
  overflow: hidden; flex: 1;
  mask: linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%);
  transition: opacity .15s;
}

.music-ticker {
  display: inline-block; font-size: 12px;
  color: rgba(255,255,255,.65); white-space: nowrap;
  animation: ticker 12s linear infinite;
}

@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }

.repost-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; color: #ff8c42; font-weight: 600;
  background: rgba(255,107,0,.12); border: 1px solid rgba(255,107,0,.2);
  border-radius: 12px; padding: 3px 10px; width: fit-content;
}

.progress-bar {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: rgba(255,255,255,.1); z-index: 5;
}
.progress-fill { height: 100%; width: 0; background: linear-gradient(90deg, #ff2d55, #ff8c42); border-radius: 1px; }
.progress-fill.playing { animation: progress-anim 30s linear infinite; }
@keyframes progress-anim { from { width: 0%; } to { width: 100%; } }

.actions-panel {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; align-self: flex-end; margin-bottom: 24px;
}

.action-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; background: none; border: none; color: #fff;
  cursor: pointer; padding: 6px; border-radius: 12px;
  transition: transform .15s, background .15s;
}
.action-btn:hover  { transform: scale(1.08); }
.action-btn:active { transform: scale(.92); }

.action-icon {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s; backdrop-filter: blur(4px);
}
.action-icon.liked    { background: rgba(255,45,85,.15); border-color: rgba(255,45,85,.3); animation: heart-pop .35s cubic-bezier(.36,.07,.19,.97); }
.action-icon.active   { background: rgba(255,140,66,.15); border-color: rgba(255,140,66,.3); }
.action-icon.reposted { background: rgba(52,211,153,.12); border-color: rgba(52,211,153,.25); }
.action-icon.reposted svg { fill: #34d399; }

@keyframes heart-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(.88); }
  100% { transform: scale(1); }
}

.action-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.7); letter-spacing: .3px; transition: color .2s; }
.action-label.liked    { color: #ff2d55; }
.action-label.active   { color: #ff8c42; }
.action-label.reposted { color: #34d399; }

.disc-wrap { position: relative; width: 50px; height: 50px; margin-top: 8px; }
.disc-ring {
  width: 50px; height: 50px; border-radius: 50%; overflow: hidden;
  border: 2.5px solid rgba(255,255,255,.15);
  box-shadow: 0 0 16px rgba(0,0,0,.5); position: relative;
}
.disc-ring.spin { animation: spin-disc 5s linear infinite; }
.disc-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.9); }
.disc-center-dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 10px; height: 10px; border-radius: 50%;
  background: #1a0e00; border: 2px solid rgba(255,255,255,.2); pointer-events: none;
}
@keyframes spin-disc { to { transform: rotate(360deg); } }

.fade-quick-enter-active, .fade-quick-leave-active { transition: opacity .18s; }
.fade-quick-enter-from,  .fade-quick-leave-to     { opacity: 0; }

/* ── MODAIS ── */
.audio-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.4); backdrop-filter: blur(8px);
  z-index: 200; display: flex;
  justify-content: center; align-items: center; padding: 20px;
}

.audio-modal {
  width: 100%; max-width: 500px; max-height: 70vh;
  background: #141414; border-radius: 24px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.8);
}

.modal-handle {
  width: 40px; height: 4px; background: rgba(255,255,255,.15);
  border-radius: 2px; margin: 12px auto 0; flex-shrink: 0;
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; flex-shrink: 0;
}

.modal-header-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }

.modal-cover {
  width: 36px; height: 36px; border-radius: 12px;
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.modal-cover-img { width: 100%; height: 100%; object-fit: cover; }

.modal-track-info { flex: 1; min-width: 0; }
.modal-track-name { font-size: 14px; font-weight: 700; color: #fff; margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.modal-track-author { font-size: 12px; color: rgba(255,255,255,.4); margin: 0; }

.modal-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,.07); border: none; color: rgba(255,255,255,.5);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background .15s;
}
.modal-close:hover { background: rgba(255,255,255,.13); }

.modal-player { padding: 0 16px 10px; flex-shrink: 0; border-bottom: 0.5px solid rgba(255,255,255,.06); margin-bottom: 8px; }

.player-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.player-time { font-size: 11px; color: rgba(255,255,255,.3); min-width: 30px; font-variant-numeric: tabular-nums; }
.player-bar { flex: 1; height: 3px; background: rgba(255,255,255,.1); border-radius: 2px; cursor: pointer; position: relative; }
.player-fill { height: 100%; background: linear-gradient(90deg, #ff2d55, #ff8c42); border-radius: 2px; position: relative; transition: width .1s linear; }
.player-thumb { position: absolute; right: -6px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 0 6px rgba(255,45,85,.5); }

.player-controls { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 8px; }
.ctrl-side { background: none; border: none; color: rgba(255,255,255,.4); cursor: pointer; padding: 8px; transition: color .15s, transform .15s; }
.ctrl-side:hover { color: rgba(255,255,255,.8); transform: scale(1.1); }
.ctrl-fav-active { color: #ff2d55 !important; }
.ctrl-main {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 20px rgba(255,45,85,.4);
  transition: transform .15s, box-shadow .15s;
}
.ctrl-main svg { width: 20px; height: 20px; }
.ctrl-main:hover  { transform: scale(1.06); box-shadow: 0 6px 26px rgba(255,45,85,.55); }
.ctrl-main:active { transform: scale(.93); }

.btn-usar-som {
  width: 100%; padding: 8px;
  background: rgba(255,45,85,.12); border: 1px solid rgba(255,45,85,.3);
  color: #ff2d55; border-radius: 10px;
  font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all .2s;
}
.btn-usar-som:hover { background: rgba(255,45,85,.2); border-color: rgba(255,45,85,.5); }

.modal-divider { padding: 8px 16px 4px; flex-shrink: 0; }
.modal-divider-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.35); text-transform: uppercase; letter-spacing: .6px; }

.videos-grid-wrap { flex: 1; overflow-y: auto; padding: 0 8px 20px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.1) transparent; }
.videos-grid-wrap::-webkit-scrollbar { width: 3px; }
.videos-grid-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 2px; }

.videos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }

.grid-item { position: relative; aspect-ratio: 9/16; border-radius: 4px; overflow: hidden; cursor: pointer; background: #222; }
.grid-item:hover .grid-overlay { opacity: 1; }
.grid-thumb { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .2s; }
.grid-item:hover .grid-thumb { transform: scale(1.04); }
.grid-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%); display: flex; align-items: flex-end; padding: 6px; opacity: 0; transition: opacity .2s; }
.grid-views { font-size: 11px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 3px; }

.grid-current-badge { position: absolute; top: 6px; left: 6px; background: #ff2d55; color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; display: flex; align-items: center; gap: 3px; }

.grid-loading { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.grid-skeleton { aspect-ratio: 9/16; border-radius: 8px; background: rgba(255,255,255,.06); animation: skeleton-pulse 1.4s ease-in-out infinite; }
.grid-skeleton:nth-child(2) { animation-delay: .15s; }
.grid-skeleton:nth-child(3) { animation-delay: .3s; }
.grid-skeleton:nth-child(4) { animation-delay: .1s; }
.grid-skeleton:nth-child(5) { animation-delay: .25s; }
.grid-skeleton:nth-child(6) { animation-delay: .4s; }
.grid-skeleton:nth-child(7) { animation-delay: .05s; }
.grid-skeleton:nth-child(8) { animation-delay: .2s; }
.grid-skeleton:nth-child(9) { animation-delay: .35s; }
@keyframes skeleton-pulse { 0%, 100% { opacity: .4; } 50% { opacity: .9; } }

.grid-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 0; }
.grid-empty p { font-size: 13px; color: rgba(255,255,255,.25); margin: 0; }

.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .25s ease; }
.overlay-fade-enter-from,  .overlay-fade-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: transform .38s cubic-bezier(.32,.72,0,1); }
.modal-slide-leave-active { transition: transform .28s cubic-bezier(.4,0,1,1); }
.modal-slide-enter-from,
.modal-slide-leave-to     { transform: translateY(100%); opacity: 0; }

/* ── MODAL DE PERFIL ── */
.perfil-modal { max-width: 480px; }

.perfil-cover {
  height: 100px; position: relative; flex-shrink: 0;
  background: linear-gradient(135deg, #1a0e00, #2a0d1a, #0d0d2a);
}
.perfil-cover-pattern {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,45,85,.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,107,0,.12) 0%, transparent 40%);
}
.perfil-close-btn {
  position: absolute; top: 10px; right: 12px; z-index: 2;
  background: rgba(0,0,0,.4) !important;
}

.perfil-avatar-wrap {
  position: absolute; bottom: -26px; left: 20px;
  width: 58px; height: 58px; border-radius: 50%;
  padding: 2.5px;
  background: linear-gradient(135deg, #ff2d55, #ff6b00);
  z-index: 2;
}
.perfil-avatar-img {
  width: 100%; height: 100%; border-radius: 50%;
  object-fit: cover; border: 2.5px solid #141414; display: block;
}
.perfil-avatar-placeholder {
  width: 100%; height: 100%; border-radius: 50%;
  background: linear-gradient(135deg, #2a1a2a, #1a1a2a);
  border: 2.5px solid #141414;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; color: rgba(255,255,255,.7);
}

.perfil-info-row {
  padding: 34px 20px 12px;
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 12px; flex-shrink: 0;
}
.perfil-names { flex: 1; min-width: 0; }
.perfil-display-name { font-size: 16px; font-weight: 700; color: #fff; margin: 0 0 3px; min-height: 20px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.perfil-username { font-size: 13px; color: rgba(255,255,255,.4); margin: 0; min-height: 16px; }

.perfil-actions { display: flex; gap: 8px; flex-shrink: 0; }

.perfil-btn-msg {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.7);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .15s;
}
.perfil-btn-msg:hover { background: rgba(255,255,255,.13); }

.perfil-btn-seguir {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 16px; background: #ff2d55;
  border: none; color: #fff; border-radius: 20px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all .2s;
}
.perfil-btn-seguir.following {
  background: rgba(255,45,85,.12);
  border: 1px solid rgba(255,45,85,.35);
  color: #ff2d55;
}
.perfil-btn-seguir:hover   { opacity: .85; }
.perfil-btn-seguir:disabled { opacity: .5; cursor: not-allowed; }

.perfil-stats {
  padding: 0 20px 14px; display: flex; gap: 20px;
  flex-shrink: 0; border-bottom: 0.5px solid rgba(255,255,255,.07);
}
.perfil-stat-item { display: flex; flex-direction: column; gap: 1px; }
.perfil-stat-value { font-size: 15px; font-weight: 700; color: #fff; min-height: 20px; }
.perfil-stat-label { font-size: 11px; color: rgba(255,255,255,.35); }

.perfil-bio {
  padding: 12px 20px 14px;
  font-size: 13px; color: rgba(255,255,255,.65); line-height: 1.5;
  flex-shrink: 0; border-bottom: 0.5px solid rgba(255,255,255,.07);
}

.btn-ver-perfil {
  margin: 0 16px 16px;
  padding: 11px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  color: rgba(255,255,255,.7); border-radius: 12px;
  font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all .2s; flex-shrink: 0;
}
.btn-ver-perfil:hover { background: rgba(255,255,255,.1); }

.skel-line {
  display: inline-block; border-radius: 6px;
  background: rgba(255,255,255,.08);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}
.skel-name { width: 120px; height: 16px; }
.skel-user { width: 80px;  height: 13px; }
.skel-stat { width: 36px;  height: 15px; }
</style>