<template>
  <div class="feed-layout">
    <div class="feed-center">
      <!-- TABS -->
      <div class="feed-tabs">
        <div class="tabs-inner">
          <button
            class="feed-tab"
            :class="{ active: feedTab === 'seguindo' }"
            @click="mudarTab('seguindo')"
          >
            Seguindo
          </button>
          <button
            class="feed-tab"
            :class="{ active: feedTab === 'para-voce' }"
            @click="mudarTab('para-voce')"
          >
            Para Você
          </button>
          <div class="tab-indicator" :style="tabIndicatorStyle" />
        </div>
        <button class="tab-upload-btn" @click="uploadAberto = true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          <span>Publicar</span>
        </button>
      </div>

      <!-- EMPTY STATE -->
      <div v-if="!carregando && videos.length === 0" class="feed-vazio">
        <div class="vazio-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <p class="vazio-title">Nenhum vídeo aqui</p>
        <p class="vazio-sub">{{ feedTab === 'seguindo' ? 'Siga criadores para ver o feed deles' : 'Seja o primeiro a publicar' }}</p>
        <button class="btn-vazio-upload" @click="uploadAberto = true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Publicar vídeo
        </button>
      </div>

      <!-- FEED -->
      <div v-else class="videos-scroll" ref="scrollEl" @scroll="onScroll">
        <div v-if="carregando" class="feed-loading">
          <div class="spinner-ring" />
        </div>

        <div
          v-for="(video, index) in videos"
          :key="video.id || index"
          class="video-snap"
        >
          <VideoCard
            :video="video"
            :paused="pausedIndex === index"
            :playing="currentIndex === index"
            :comentarios-aberto="painelComentarios === index"
            @set-ref="el => { if(el) videoRefs[index] = el }"
            @toggle-play="togglePlay(index)"
            @curtir="curtir(index)"
            @abrir-comentarios="abrirComentarios(index)"
            @republicar="republicar(index)"
            @compartilhar="abrirCompartilhar(index)"
            @seguir="seguirAutor(index)"
            @ir-para-perfil="irParaPerfil"
            @buscar-usuario-perfil="onBuscarUsuarioPerfil"
            @buscar-videos-perfil="onBuscarVideosPerfil"
            @seguir-perfil="onSeguirPerfil"
          />
        </div>

        <div v-if="temMais && !carregandoMais" class="load-more" @click="carregarMais">
          <div class="load-more-inner">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Carregar mais
          </div>
        </div>
        <div v-if="carregandoMais" class="feed-loading"><div class="spinner-ring" /></div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <transition name="panel-slide" mode="out-in">

      <!-- COMMENTS PANEL -->
      <aside v-if="painelComentarios !== null" key="comments" class="panel-comments">
        <div class="panel-header">
          <div class="panel-header-info">
            <h3>Comentários</h3>
            <span class="comments-count">{{ fmt(totalComentariosReal) }}</span>
          </div>
          <button class="panel-close" @click="fecharComentarios">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <!-- Lista de comentários -->
        <div class="comments-list" ref="comentariosEl">
          <div v-if="carregandoComentarios" class="comments-loading">
            <div class="spinner-ring spinner-sm" />
          </div>

          <div v-if="!carregandoComentarios && comentariosList.length === 0" class="comments-empty">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style="opacity:.2"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <p>Seja o primeiro a comentar</p>
          </div>

          <div v-for="(c, i) in comentariosList" :key="c.id || i" class="comment-item">
            <img :src="c.avatar" class="comment-avatar" />
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-name">@{{ c.nome }}</span>
                <span class="comment-time">{{ c.hora }}</span>
                <button v-if="c.ehMeu" class="comment-delete" @click="apagarComentario(i)" title="Apagar">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>

              <!-- GIF no comentário -->
              <div v-if="c.gifUrl" class="comment-gif-wrap">
                <img :src="c.gifUrl" class="comment-gif" />
              </div>

              <p v-if="c.texto" class="comment-text">{{ c.texto }}</p>

              <div class="comment-actions">
                <button class="comment-like" :class="{ liked: c.curtido }" @click="curtirComentario(i)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {{ c.likes || '' }}
                </button>
                <button class="comment-reply-btn" @click="responderComentario(c)">
                  Responder
                </button>
              </div>

              <div v-if="c.respondendo" class="comment-reply-box">
                <input
                  v-model="c.textoResposta"
                  class="comment-input"
                  :placeholder="'Respondendo @' + c.nome"
                  @keydown.enter="enviarResposta(i)"
                  style="font-size:12px; padding: 7px 10px"
                />
                <button class="comment-send" :disabled="!c.textoResposta?.trim()" @click="enviarResposta(i)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>

              <div v-if="c.respostas?.length" class="comment-replies">
                <div v-for="(r, ri) in c.respostas" :key="ri" class="comment-reply-item">
                  <img :src="r.avatar" class="comment-avatar" style="width:24px;height:24px" />
                  <div style="flex:1">
                    <span class="comment-name" style="font-size:11px">@{{ r.nome }}</span>
                    <span class="comment-time" style="margin-left:6px">{{ r.hora }}</span>
                    <p class="comment-text" style="font-size:12px;margin-top:2px">{{ r.texto }}</p>
                  </div>
                  <button v-if="r.ehMeu" class="comment-delete" @click="apagarComentario(ri, i)" title="Apagar">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- GIF Picker -->
        <transition name="gif-slide">
          <div v-if="gifAberto" class="gif-picker">
            <div class="gif-picker-header">
              <div class="gif-search-wrap">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="gif-search-icon"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                <input
                  v-model="gifQuery"
                  class="gif-search-input"
                  placeholder="Buscar GIFs…"
                  @input="buscarGifs"
                  ref="gifSearchEl"
                />
              </div>
              <button class="gif-close-btn" @click="gifAberto = false">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>

            <!-- Categorias rápidas -->
            <div v-if="!gifQuery" class="gif-categories">
              <button
                v-for="cat in gifCategories"
                :key="cat"
                class="gif-cat-btn"
                @click="gifQuery = cat; buscarGifs()"
              >{{ cat }}</button>
            </div>

            <div v-if="gifCarregando" class="gif-loading">
              <div class="spinner-ring spinner-sm" />
            </div>

            <div v-else class="gif-grid">
              <div
                v-for="gif in gifResultados"
                :key="gif.id"
                class="gif-item"
                @click="selecionarGif(gif)"
              >
                <img :src="gif.preview" :alt="gif.title" class="gif-thumb" loading="lazy" />
              </div>
              <div v-if="gifResultados.length === 0 && gifQuery" class="gif-empty">
                Nenhum GIF encontrado
              </div>
            </div>
          </div>
        </transition>

        <!-- Input de comentário -->
        <div class="comment-input-row">
          <img :src="avatarUsuario" class="comment-input-avatar" />
          <div class="comment-input-wrap">
            <input
              v-model="novoComentario"
              class="comment-input"
              placeholder="Adicione um comentário…"
              @keydown.enter.prevent="enviarComentario"
              ref="comentarioInputEl"
            />
            <!-- Botão GIF -->
            <button
              class="gif-toggle-btn"
              :class="{ active: gifAberto }"
              @click="toggleGifPicker"
              title="Enviar GIF"
            >
              GIF
            </button>
          </div>
          <button
            class="comment-send"
            :disabled="(!novoComentario.trim() && !gifPendente) || enviandoComentario"
            @click="enviarComentario"
          >
            <div v-if="enviandoComentario" class="spinner-ring spinner-xs" />
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <!-- Preview do GIF selecionado -->
        <transition name="fade">
          <div v-if="gifPendente" class="gif-pendente">
            <img :src="gifPendente.preview" class="gif-pendente-img" />
            <button class="gif-pendente-rm" @click="gifPendente = null">
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </transition>
      </aside>

      <!-- SUGGESTIONS PANEL -->
      <aside v-else key="suggestions" class="panel-suggestions">
        <!-- Clima + Calendário -->
        <div class="widget-row">
          <div class="widget-clima">
            <div class="widget-icon">🌤️</div>
            <div class="widget-info">
              <p class="widget-val">{{ clima.temp }}°C</p>
              <p class="widget-sub">{{ clima.desc }}</p>
            </div>
            <div class="widget-city">{{ clima.cidade }}</div>
          </div>
          <div class="widget-cal">
            <p class="cal-dia">{{ calDia }}</p>
            <p class="cal-mes">{{ calMes }}</p>
            <p class="cal-semana">{{ calSemana }}</p>
          </div>
        </div>

        <!-- Suggested accounts -->
        <div class="panel-section">
          <h4 class="section-title">Sugeridos para você</h4>
          <div v-if="carregandoSugestoes" class="panel-loading"><div class="spinner-ring spinner-sm" /></div>
          <div
            v-for="u in sugestoes"
            :key="u.id"
            class="user-row clickable-row"
            @click="irParaPerfil(u.username)"
          >
            <div class="user-avatar-wrap">
              <img :src="u.avatar" class="user-avatar" />
              <div class="user-avatar-ring" />
            </div>
            <div class="user-info">
              <p class="user-name">@{{ u.username }}</p>
              <p class="user-sub">{{ u.seguidores_count }} seguidores</p>
            </div>
            <button
              class="follow-btn"
              :class="{ following: u.seguindo }"
              :disabled="u.loadingSeguir"
              @click.stop="seguirSugestao(u)"
            >
              <template v-if="u.loadingSeguir">
                <div class="spinner-ring spinner-xs" />
              </template>
              <template v-else-if="u.seguindo">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </template>
              <template v-else>Seguir</template>
            </button>
          </div>
        </div>

        <!-- Following -->
        <div class="panel-section" style="margin-top: 24px">
          <h4 class="section-title">Seguindo</h4>
          <div v-if="carregandoSeguindo" class="panel-loading"><div class="spinner-ring spinner-sm" /></div>
          <div
            v-for="u in seguindoList"
            :key="u.id"
            class="user-row clickable-row"
            @click="irParaPerfil(u.username)"
          >
            <div class="user-avatar-wrap">
              <img :src="u.avatar" class="user-avatar" />
              <div v-if="u.online" class="online-dot" />
            </div>
            <div class="user-info">
              <p class="user-name">@{{ u.username }}</p>
              <p class="user-sub" :class="{ online: u.online }">{{ u.online ? 'Ativo agora' : 'Seguindo' }}</p>
            </div>
          </div>
          <p v-if="!carregandoSeguindo && seguindoList.length === 0" class="section-empty">
            Ninguém ainda
          </p>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <div class="footer-links">
            <a href="#">Sobre</a>
            <a href="#">Contato</a>
            <a href="#">Termos</a>
          </div>
          <p class="footer-copy">© 2025 Long Aura</p>
        </footer>
      </aside>
    </transition>

    <!-- SHARE MENU -->
    <transition name="fade">
      <div v-if="menuCompartilhar !== null" class="overlay" @click="menuCompartilhar = null">
        <div class="share-sheet" @click.stop>
          <div class="share-handle" />
          <p class="share-title">Compartilhar</p>
          <div class="share-grid">
            <button class="share-option" @click="compartilhar('whatsapp')">
              <div class="share-icon" style="background: linear-gradient(135deg, #25d366, #128c7e)">
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.997 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.948-1.42A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.52 2 11.997 2z"/></svg>
              </div>
              <span>WhatsApp</span>
            </button>
            <button class="share-option" @click="compartilhar('twitter')">
              <div class="share-icon" style="background: #000">
                <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </div>
              <span>X / Twitter</span>
            </button>
            <button class="share-option" @click="compartilhar('copiar')">
              <div class="share-icon" style="background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1)">
                <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
              </div>
              <span>{{ linkCopiado ? 'Copiado ✓' : 'Copiar link' }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- UPLOAD MODAL -->
    <transition name="fade">
      <div v-if="uploadAberto" class="overlay upload-overlay" @click.self="fecharUpload">
        <div class="upload-modal">
          <div class="upload-modal-header">
            <span class="upload-modal-title">Novo vídeo</span>
            <button class="panel-close" @click="fecharUpload">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <div
            class="drop-zone"
            :class="{ 'has-file': uploadFile, dragging: dragOver }"
            @click="$refs.fileInput.click()"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
          >
            <input ref="fileInput" type="file" accept="video/*" class="hidden-input" @change="onFileChange" />

            <template v-if="!uploadFile">
              <div class="drop-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
              </div>
              <p class="drop-title">Arraste ou clique para selecionar</p>
              <p class="drop-sub">MP4, MOV, AVI · até 500 MB</p>
            </template>

            <template v-else>
              <video :src="uploadPreview" class="upload-preview" muted loop autoplay playsinline />
              <div class="upload-file-bar">
                <span class="upload-file-name">{{ uploadFile.name }}</span>
                <button class="upload-rm" @click.stop="removerArquivo">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>
            </template>
          </div>

          <div class="upload-fields">
            <div class="upload-field">
              <label>Descrição</label>
              <textarea v-model="uploadDescricao" rows="3" maxlength="200" placeholder="Conte sobre o vídeo…" />
              <span class="char-count">{{ uploadDescricao.length }}/200</span>
            </div>
            <div class="upload-field">
              <label>Música</label>
              <input v-model="uploadMusica" maxlength="80" placeholder="Nome da música ou som original" />
            </div>
          </div>

          <div class="upload-foryou-row">
            <div class="upload-foryou-info">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
              <span>For You</span>
              <span class="upload-foryou-sub">Aparecer no feed "Para Você"</span>
            </div>
            <button
              class="toggle-btn"
              :class="{ on: uploadForYou }"
              @click="uploadForYou = !uploadForYou"
              :aria-checked="uploadForYou"
              role="switch"
            >
              <span class="toggle-knob" />
            </button>
          </div>

          <div v-if="uploadProgresso > 0 && uploadProgresso < 100" class="upload-progress">
            <div class="upload-progress-bar" :style="{ width: uploadProgresso + '%' }" />
          </div>

          <p v-if="uploadErro" class="upload-error">{{ uploadErro }}</p>

          <div class="upload-actions">
            <button class="upload-cancel" @click="fecharUpload">Cancelar</button>
            <button class="upload-submit" :disabled="!uploadFile || publicando" @click="publicarVideo">
              <template v-if="publicando">
                <div class="spinner-ring spinner-xs" />
                Publicando…
              </template>
              <template v-else>
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                Publicar
              </template>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOAST -->
    <transition name="toast-pop">
      <div v-if="toast" class="toast">
        <div class="toast-dot" />
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, onActivated, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VideoCard from '@/components/VideoCard.vue'
import { supabase } from '@/supabase.js'
import { authState } from '@/auth.js'
import {
  fetchVideos,
  fetchVideosForYou,
  uploadVideo,
  toggleLike,
  toggleRepost,
  fetchMeusLikes,
  fetchMeusReposts,
  fetchComentarios,
  addComentario,
} from '@/videos.js'
import { criarNotificacao } from '@/notificacoes.js'

defineOptions({ name: 'FeedView' })

const router = useRouter()
const route  = useRoute()

// ── STATE ──
const feedTab               = ref('para-voce')
const currentIndex          = ref(0)
const pausedIndex           = ref(null)
const videoRefs             = ref([])
const scrollEl              = ref(null)
const comentariosEl         = ref(null)
const comentarioInputEl     = ref(null)
const painelComentarios     = ref(null)
const comentariosList       = ref([])
const carregandoComentarios = ref(false)
const novoComentario        = ref('')
const enviandoComentario    = ref(false)
const menuCompartilhar      = ref(null)
const linkCopiado           = ref(false)
const videos                = ref([])
const carregando            = ref(false)
const carregandoMais        = ref(false)
const temMais                = ref(true)
const offset                = ref(0)
const LIMIT                 = 10
const toast                 = ref('')
let toastT                  = null

const sugestoes             = ref([])
const seguindoList          = ref([])
const carregandoSugestoes   = ref(false)
const carregandoSeguindo    = ref(false)

const uploadAberto          = ref(false)
const uploadFile            = ref(null)
const uploadPreview         = ref(null)
const uploadDescricao       = ref('')
const uploadMusica          = ref('')
const uploadProgresso       = ref(0)
const uploadErro            = ref('')
const uploadForYou          = ref(false)
const publicando            = ref(false)
const dragOver              = ref(false)

// ── GIF STATE ──
const gifAberto      = ref(false)
const gifQuery       = ref('')
const gifResultados  = ref([])
const gifCarregando  = ref(false)
const gifPendente    = ref(null)
const gifSearchEl    = ref(null)
let gifDebounce      = null

const KLIPY_KEY = 'kiGoUgrtyjoZbKfFgUpJ64rzRQRjDL95l52dcepbU4gbWopnUF0MykoDzTeBtI6V'

const gifCategories = ['😂 Engraçado', '❤️ Amor', '🎉 Parabéns', '😮 Chocado', '👏 Aplausos', '🔥 Fire']

// ── CONTADOR REAL DE COMENTÁRIOS ──
// Soma os comentários principais + todas as respostas para exibir o total correto
const totalComentariosReal = computed(() => {
  let total = comentariosList.value.length
  for (const c of comentariosList.value) {
    total += (c.respostas?.length || 0)
  }
  return total
})

async function buscarGifs() {
  clearTimeout(gifDebounce)
  const q = gifQuery.value.trim()
  const customerId = authState.user?.id || 'anon'

  const montarUrl = () => {
    const base = `https://api.klipy.com/api/v1/${KLIPY_KEY}`
    if (!q) return `${base}/gifs/trending?customer_id=${customerId}&per_page=20`
    return `${base}/gifs/search?q=${encodeURIComponent(q)}&customer_id=${customerId}&per_page=20`
  }

  gifDebounce = setTimeout(async () => {
    gifCarregando.value = true
    try {
      const res = await fetch(montarUrl())
      if (!res.ok) {
        const erroTxt = await res.text().catch(() => '')
        throw new Error(`Klipy ${res.status}: ${erroTxt}`)
      }
      const data = await res.json()
      console.log('Klipy raw response:', data) // deixa esse log por enquanto

      const items = data?.data?.data || data?.data?.items || data?.data || []
      gifResultados.value = items.map(g => ({
        id:      g.id || g.slug,
        title:   g.title || '',
        preview: g.file?.sm?.gif?.url || g.file?.xs?.gif?.url || g.preview_url || g.url,
        url:     g.file?.md?.gif?.url || g.file?.hd?.gif?.url || g.url,
      }))
    } catch (err) {
      console.error('buscarGifs:', err)
      gifResultados.value = []
      showToast('Erro ao buscar GIFs')
    } finally {
      gifCarregando.value = false
    }
  }, q ? 400 : 0)
}
function toggleGifPicker() {
  gifAberto.value = !gifAberto.value
  if (gifAberto.value) {
    nextTick(() => {
      gifSearchEl.value?.focus()
      buscarGifs()
    })
  }
}

function selecionarGif(gif) {
  gifPendente.value = gif
  gifAberto.value = false
  gifQuery.value = ''
  gifResultados.value = []
  nextTick(() => comentarioInputEl.value?.focus())
}

const AV_DEFAULT = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzJhMmEyYSIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSI1NCIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiPj88L3RleHQ+PC9zdmc+'
const avatarUsuario = computed(() => authState.profile?.avatar_url || AV_DEFAULT)

const tabIndicatorStyle = computed(() => {
  const idx = feedTab.value === 'seguindo' ? 0 : 1
  return { transform: `translateX(${idx * 100}%)` }
})

const clima = ref({ temp: '--', desc: 'Carregando...', cidade: '' })

const calDia    = computed(() => new Date().getDate())
const calMes    = computed(() => new Date().toLocaleDateString('pt-BR', { month: 'long' }))
const calSemana = computed(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long' }))

async function carregarClima() {
  try {
    const cidade = 'Sabará'
    const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cidade)}&format=json&limit=1`)
    const gd = await geo.json()
    if (!gd.length) throw new Error('cidade não encontrada')
    const { lat, lon } = gd[0]
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    const d = await r.json()
    const cod = d.current_weather?.weathercode
    const descs = { 0:'Céu limpo',1:'Majoritariamente limpo',2:'Parcialmente nublado',3:'Nublado',45:'Neblina',48:'Neblina',51:'Garoa',61:'Chuva leve',63:'Chuva moderada',65:'Chuva forte',80:'Pancadas',95:'Tempestade' }
    clima.value = { temp: Math.round(d.current_weather?.temperature ?? 0), desc: descs[cod] ?? 'Tempo variável', cidade }
  } catch {
    clima.value = { temp: '--', desc: 'Indisponível', cidade: '' }
  }
}

function fmt(n) {
  if (!n && n !== 0) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastT)
  toastT = setTimeout(() => toast.value = '', 2500)
}

function horaLabel(ts) {
  if (!ts) return 'agora'
  const d = new Date(ts), now = new Date(), diff = now - d
  if (diff < 60000)    return 'agora'
  if (diff < 3600000)  return Math.floor(diff / 60000) + 'min'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function irParaPerfil(username) {
  if (!username) return
  router.push('/home/profile/' + username)
}

// ── FEED ──
function mapearVideo(v, likes, reposts, meusSeguidosIds) {
  return {
    id:               v.id,
    userId:           v.user_id,
    url:              v.video_url,
    username:         v.profiles?.username || 'usuario',
    descricao:        v.descricao || '',
    musica:           v.som_nome || v.musica || 'Som original',
    avatar:           v.profiles?.avatar_url || AV_DEFAULT,
    likes:            v.likes || 0,
    curtido:          likes.includes(v.id),
    reposts:          v.reposts || 0,
    republicado:      reposts.includes(v.id),
    totalComentarios: v.comentarios || 0,
    seguindo:         meusSeguidosIds.includes(v.user_id),
    forYou:           v.for_you ?? false,
    somUrl:           v.som_url     ?? null,
    somNome:          v.som_nome    ?? null,
    somArtista:       v.som_artista ?? null,
    loadingSeguir:    false,
  }
}

async function carregarFeed(reset = false) {
  if (!authState.user) return
  if (reset) { offset.value = 0; videos.value = []; temMais.value = true }
  carregando.value = reset

  try {
    let vids = []

    if (feedTab.value === 'para-voce') {
      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles:user_id(id, nome, username, avatar_url)')
        .eq('for_you', true)
        .order('created_at', { ascending: false })
        .range(offset.value, offset.value + LIMIT - 1)
      if (error) throw error
      vids = data || []
    } else {
      const { data: subs } = await supabase
        .from('seguidores')
        .select('following_id')
        .eq('follower_id', authState.user.id)
      const ids = (subs || []).map(s => s.following_id)
      if (!ids.length) { videos.value = []; carregando.value = false; return }
      const { data, error } = await supabase
        .from('videos')
        .select('*, profiles:user_id(id, nome, username, avatar_url)')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .range(offset.value, offset.value + LIMIT - 1)
      if (error) throw error
      vids = data || []
    }

    if (!vids.length) { temMais.value = false; carregando.value = false; return }

    const [likes, reposts, meusSeguidosIds] = await Promise.all([
      fetchMeusLikes(),
      fetchMeusReposts(),
      fetchMeusSeguidosIds(),
    ])

    const mapped = vids.map(v => mapearVideo(v, likes, reposts, meusSeguidosIds))
    if (reset) videos.value = mapped
    else videos.value.push(...mapped)

    offset.value += LIMIT
    temMais.value = vids.length === LIMIT
  } catch (err) {
    console.warn('carregarFeed:', err)
  } finally {
    carregando.value = false
    carregandoMais.value = false
  }
}

async function carregarMais() {
  if (carregandoMais.value || !temMais.value) return
  carregandoMais.value = true
  await carregarFeed(false)
}

async function mudarTab(tab) {
  if (feedTab.value === tab) return
  feedTab.value = tab
  videoRefs.value.forEach(el => el?.pause())
  currentIndex.value = 0; pausedIndex.value = null; painelComentarios.value = null
  await carregarFeed(true)
  nextTick(() => {
    scrollEl.value?.scrollTo({ top: 0 })
    safePlay(videoRefs.value[0])
  })
}

async function fetchMeusSeguidosIds() {
  if (!authState.user) return []
  const { data } = await supabase.from('seguidores').select('following_id').eq('follower_id', authState.user.id)
  return (data || []).map(s => s.following_id)
}

// ── ABRIR VÍDEO ESPECÍFICO ──
async function abrirVideoEspecifico(id) {
  if (!id || !authState.user) return
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*, profiles:user_id(id, nome, username, avatar_url)')
      .eq('id', id)
      .single()

    if (error || !data) { showToast('Vídeo não encontrado'); return }

    const [likes, reposts, meusSeguidosIds] = await Promise.all([
      fetchMeusLikes(),
      fetchMeusReposts(),
      fetchMeusSeguidosIds(),
    ])

    const v = mapearVideo(data, likes, reposts, meusSeguidosIds)

    videos.value = videos.value.filter(x => x.id !== v.id)
    videos.value.unshift(v)

    videoRefs.value.forEach(el => el?.pause())
    currentIndex.value = 0
    pausedIndex.value = null

    await nextTick()
    scrollEl.value?.scrollTo({ top: 0 })
    safePlay(videoRefs.value[0])
  } catch (err) {
    console.warn('abrirVideoEspecifico:', err)
    showToast('Erro ao abrir vídeo')
  }
}

// ── CURTIR ──
async function curtir(index) {
  const v = videos.value[index]
  if (!v?.id) return
  const novo = !v.curtido
  v.curtido = novo; v.likes += novo ? 1 : -1
  try { await toggleLike(v.id) }
  catch { v.curtido = !novo; v.likes += novo ? -1 : 1; showToast('Erro ao curtir') }
}

// ── REPUBLICAR ──
async function republicar(index) {
  const v = videos.value[index]
  if (!v?.id) return
  const novo = !v.republicado
  v.republicado = novo; v.reposts += novo ? 1 : -1
  try { await toggleRepost(v.id); showToast(novo ? 'Republicado ✓' : 'Repost removido') }
  catch { v.republicado = !novo; v.reposts += novo ? -1 : 1; showToast('Erro ao republicar') }
}

// ── SEGUIR ──
async function seguirAutor(index) {
  const v = videos.value[index]
  if (!v || !authState.user || v.userId === authState.user.id) return
  v.loadingSeguir = true
  try {
    const novoEstado = await toggleSeguirUsuario(v.userId, v.seguindo)
    v.seguindo = novoEstado
    const sug = sugestoes.value.find(s => s.id === v.userId)
    if (sug) sug.seguindo = novoEstado
    await recarregarSeguindo()
  } catch (err) {
    console.error('seguirAutor:', err)
    showToast('Erro ao seguir')
  } finally { v.loadingSeguir = false }
}

async function seguirSugestao(u) {
  if (!authState.user) return
  u.loadingSeguir = true
  try {
    const novoEstado = await toggleSeguirUsuario(u.id, u.seguindo)
    u.seguindo = novoEstado
    videos.value.filter(v => v.userId === u.id).forEach(v => v.seguindo = novoEstado)
    await recarregarSeguindo()
    showToast(novoEstado ? 'Seguindo @' + u.username + ' ✓' : 'Deixou de seguir')
  } catch (err) {
    console.error('seguirSugestao:', err)
    showToast('Erro ao seguir')
  } finally { u.loadingSeguir = false }
}

async function toggleSeguirUsuario(userId, atualmenteSeguindo) {
  const eu = authState.user.id
  let seguindo = atualmenteSeguindo
  if (seguindo === undefined || seguindo === null) {
    const { data } = await supabase.from('seguidores').select('id').eq('follower_id', eu).eq('following_id', userId).maybeSingle()
    seguindo = !!data
  }
  if (seguindo) {
    await supabase.from('seguidores').delete().eq('follower_id', eu).eq('following_id', userId)
    try { await supabase.rpc('decrement_seguidores', { profile_id: userId }) } catch {}
    try { await supabase.rpc('decrement_seguindo',   { profile_id: eu }) } catch {}
  } else {
    const { error } = await supabase.from('seguidores').upsert({ follower_id: eu, following_id: userId }, { onConflict: 'follower_id,following_id', ignoreDuplicates: true })
    if (error) throw error
    try { await supabase.rpc('increment_seguidores', { profile_id: userId }) } catch {}
    try { await supabase.rpc('increment_seguindo',   { profile_id: eu }) } catch {}
    await criarNotificacao({ toUserId: userId, fromUserId: eu, tipo: 'seguiu' }).catch(() => {})
  }
  return !seguindo
}

async function onSeguirPerfil({ userId, seguindo: estadoAtual, callback }) {
  try {
    const novoEstado = await toggleSeguirUsuario(userId, estadoAtual)
    videos.value.filter(v => v.userId === userId).forEach(v => v.seguindo = novoEstado)
    const sug = sugestoes.value.find(s => s.id === userId)
    if (sug) sug.seguindo = novoEstado
    await recarregarSeguindo()
    callback?.(novoEstado)
  } catch (err) {
    console.error('onSeguirPerfil:', err)
    showToast('Erro ao seguir')
    callback?.(estadoAtual)
  }
}

async function onBuscarUsuarioPerfil({ userId, callback }) {
  try {
    const { data } = await supabase.from('profiles').select('id, nome, username, avatar_url, bio, seguidores, seguindo').eq('id', userId).single()
    const meusIds = await fetchMeusSeguidosIds()
    callback?.({
      id: data.id, nome: data.nome, username: data.username,
      avatar: data.avatar_url || AV_DEFAULT, bio: data.bio || '',
      seguidores: data.seguidores || 0, seguindoCount: data.seguindo || 0,
      curtidas: 0, seguindo: meusIds.includes(data.id),
    })
  } catch (err) {
    console.warn('onBuscarUsuarioPerfil:', err)
    callback?.(null)
  }
}

async function onBuscarVideosPerfil({ userId, callback }) {
  try {
    const { data } = await supabase.from('videos').select('id, video_url, likes').eq('user_id', userId).order('created_at', { ascending: false }).limit(12)
    callback?.((data || []).map(v => ({ id: v.id, thumbnail: v.video_url, likes: v.likes || 0 })))
  } catch (err) {
    console.warn('onBuscarVideosPerfil:', err)
    callback?.([])
  }
}

// ── COMENTÁRIOS ──
async function abrirComentarios(index) {
  if (painelComentarios.value === index) { fecharComentarios(); return }
  painelComentarios.value = index
  comentariosList.value = []
  gifAberto.value = false
  gifPendente.value = null
  novoComentario.value = ''
  const v = videos.value[index]
  if (!v?.id) return
  carregandoComentarios.value = true
  try {
    const { data, error } = await supabase
      .from('comentarios')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('video_id', v.id)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) throw error

    comentariosList.value = await Promise.all((data || []).map(async c => {
      const { data: resps } = await supabase
        .from('comentarios')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('parent_id', c.id)
        .order('created_at', { ascending: true })

      return {
        id:            c.id,
        user_id:       c.user_id,
        nome:          c.profiles?.username || 'usuario',
        avatar:        c.profiles?.avatar_url || AV_DEFAULT,
        texto:         c.texto,
        gifUrl:        c.gif_url || null,
        hora:          horaLabel(c.created_at),
        likes:         c.likes || 0,
        curtido:       false,
        ehMeu:         c.user_id === authState.user?.id,
        respondendo:   false,
        textoResposta: '',
        respostas: (resps || []).map(r => ({
          id:      r.id,
          user_id: r.user_id,
          nome:    r.profiles?.username || 'usuario',
          avatar:  r.profiles?.avatar_url || AV_DEFAULT,
          texto:   r.texto,
          hora:    horaLabel(r.created_at),
          ehMeu:   r.user_id === authState.user?.id,
        }))
      }
    }))

   // Atualiza o contador do vídeo com o total real do banco
if (videos.value[index]) videos.value[index] = { ...videos.value[index], totalComentarios: totalComentariosReal.value }

  } catch (err) { console.warn(err) }
  finally {
    carregandoComentarios.value = false
    nextTick(() => comentarioInputEl.value?.focus())
  }
}
function fecharComentarios() {
  // Salva o total real no vídeo antes de limpar a lista
  if (painelComentarios.value !== null && videos.value[painelComentarios.value]) {
    const idx = painelComentarios.value
    videos.value[idx] = { ...videos.value[idx], totalComentarios: totalComentariosReal.value }
  }
  painelComentarios.value = null
  comentariosList.value = []
  gifAberto.value = false
  gifPendente.value = null
  novoComentario.value = ''
}

function curtirComentario(i) {
  const c = comentariosList.value[i]
  if (!c) return
  c.curtido ? (c.likes--, c.curtido = false) : (c.likes++, c.curtido = true)
}

async function enviarComentario() {
  const txt = novoComentario.value.trim()
  const gif = gifPendente.value
  if ((!txt && !gif) || painelComentarios.value === null || enviandoComentario.value) return
  const v = videos.value[painelComentarios.value]
  if (!v?.id) return

  enviandoComentario.value = true
  novoComentario.value = ''
  gifPendente.value = null
  gifAberto.value = false

  try {
    const payload = {
      video_id: v.id,
      user_id:  authState.user.id,
      texto:    txt || '',
      gif_url:  gif?.url || null,
    }

    const { data, error } = await supabase
      .from('comentarios')
      .insert(payload)
      .select('*, profiles:user_id(username, avatar_url)')
      .single()

    if (error) throw error

    comentariosList.value.push({
      id:            data.id,
      user_id:       data.user_id,
      nome:          data.profiles?.username || authState.profile?.username || 'voce',
      avatar:        data.profiles?.avatar_url || avatarUsuario.value,
      texto:         txt || '',
      gifUrl:        gif?.url || null,
      hora:          'agora',
      likes:         0,
      curtido:       false,
      ehMeu:         true,
      respondendo:   false,
      textoResposta: '',
      respostas:     [],
    })

   videos.value[painelComentarios.value] = { ...v, totalComentarios: totalComentariosReal.value }
   supabase.from('videos').update({ comentarios: totalComentariosReal.value }).eq('id', v.id).then(() => {})
console.log('Novo total:', videos.value[painelComentarios.value].totalComentarios, 'index:', painelComentarios.value)
    nextTick(() => {
      if (comentariosEl.value) comentariosEl.value.scrollTop = 999999
    })
  } catch (err) {
    console.error('enviarComentario:', err)
    showToast('Erro ao comentar: ' + (err.message || 'tente novamente'))
    novoComentario.value = txt
    gifPendente.value = gif
  } finally {
    enviandoComentario.value = false
  }
}

// ── SUGESTÕES ──
async function carregarSugestoes() {
  if (!authState.user) return
  carregandoSugestoes.value = true
  try {
    const { data } = await supabase.from('profiles').select('id, username, avatar_url, seguidores').neq('id', authState.user.id).order('seguidores', { ascending: false }).limit(6)
    sugestoes.value = (data || []).map(u => ({ id: u.id, username: u.username || 'usuario', avatar: u.avatar_url || AV_DEFAULT, seguidores_count: fmt(u.seguidores || 0), seguindo: false, loadingSeguir: false }))
  } catch (err) { console.warn(err) }
  finally { carregandoSugestoes.value = false }
}

async function recarregarSeguindo() {
  if (!authState.user) return
  carregandoSeguindo.value = true
  try {
    const { data } = await supabase.from('seguidores').select('following_id, profiles:following_id(id, username, avatar_url)').eq('follower_id', authState.user.id).limit(10)
    seguindoList.value = (data || []).map(s => ({ id: s.profiles?.id, username: s.profiles?.username || 'usuario', avatar: s.profiles?.avatar_url || AV_DEFAULT, online: false }))
  } catch (err) { console.warn(err) }
  finally { carregandoSeguindo.value = false }
}

// ── UPLOAD ──
function onFileChange(e) { const f = e.target.files[0]; if (f) setUploadFile(f) }
function onDrop(e) { dragOver.value = false; const f = e.dataTransfer.files[0]; if (f?.type.startsWith('video/')) setUploadFile(f) }
function setUploadFile(f) { uploadFile.value = f; uploadPreview.value = URL.createObjectURL(f); uploadErro.value = '' }
function removerArquivo() { uploadFile.value = null; uploadPreview.value = null; uploadProgresso.value = 0 }
function fecharUpload() {
  if (publicando.value) return
  uploadAberto.value = false; uploadFile.value = null; uploadPreview.value = null
  uploadDescricao.value = ''; uploadMusica.value = ''; uploadProgresso.value = 0
  uploadErro.value = ''; uploadForYou.value = false
}

async function publicarVideo() {
  if (!uploadFile.value || publicando.value) return
  publicando.value = true; uploadErro.value = ''; uploadProgresso.value = 5
  try {
    const dados = await uploadVideo({
      file: uploadFile.value, titulo: uploadDescricao.value.slice(0, 60) || 'Meu vídeo',
      descricao: uploadDescricao.value, musica: uploadMusica.value || 'Som original', forYou: uploadForYou.value,
    })
    uploadProgresso.value = 100
    showToast('Vídeo publicado ✓')
    fecharUpload()
    const deveAparecerNoFeed = feedTab.value === 'seguindo' || (feedTab.value === 'para-voce' && uploadForYou.value)
    if (deveAparecerNoFeed) {
      videos.value.unshift({
        id: dados.id, userId: authState.user.id, url: dados.video_url,
        username: authState.profile?.username || 'voce', descricao: dados.descricao || '',
        musica: dados.musica || 'Som original', avatar: avatarUsuario.value,
        likes: 0, curtido: false, reposts: 0, republicado: false,
        totalComentarios: 0, seguindo: false, forYou: dados.for_you ?? uploadForYou.value, loadingSeguir: false,
      })
      nextTick(() => { scrollEl.value?.scrollTo({ top: 0, behavior: 'smooth' }); safePlay(videoRefs.value[0]); currentIndex.value = 0 })
    }
  } catch (err) {
    uploadErro.value = 'Erro ao publicar: ' + (err.message || 'tente novamente')
    uploadProgresso.value = 0
  } finally { publicando.value = false }
}

// ── PLAYER ──
// Evita o erro AbortError quando play() e pause() são chamados ao mesmo tempo
function safePlay(el) {
  if (!el) return
  const p = el.play()
  if (p !== undefined) p.catch(() => {})
}

function togglePlay(index) {
  const el = videoRefs.value[index]
  if (!el) return
  if (el.paused) {
    safePlay(el)
    pausedIndex.value = null
  } else {
    el.pause()
    pausedIndex.value = index
  }
}

function onScroll() {
  if (!scrollEl.value) return
  const idx = Math.round(scrollEl.value.scrollTop / scrollEl.value.clientHeight)
  if (idx !== currentIndex.value) {
    videoRefs.value[currentIndex.value]?.pause()
    currentIndex.value = idx
    pausedIndex.value = null
    nextTick(() => safePlay(videoRefs.value[idx]))
    if (painelComentarios.value !== null && painelComentarios.value !== idx) fecharComentarios()
  }
}

// ── SHARE ──
function abrirCompartilhar(index) { menuCompartilhar.value = index; linkCopiado.value = false }
function compartilhar(tipo) {
  const url = encodeURIComponent(window.location.href)
  const txt = encodeURIComponent('Olha esse vídeo no Long Aura!')
  if      (tipo === 'whatsapp') window.open('https://wa.me/?text=' + txt + '%20' + url, '_blank')
  else if (tipo === 'twitter')  window.open('https://twitter.com/intent/tweet?text=' + txt + '&url=' + url, '_blank')
  else if (tipo === 'copiar') {
    navigator.clipboard.writeText(window.location.href)
    linkCopiado.value = true
    setTimeout(() => { linkCopiado.value = false; menuCompartilhar.value = null }, 1800)
    return
  }
  menuCompartilhar.value = null
}

// ── RESPONDER ──
function responderComentario(c) {
  comentariosList.value.forEach(x => { if (x !== c) x.respondendo = false })
  c.respondendo = !c.respondendo
  if (!c.textoResposta) c.textoResposta = ''
}

async function enviarResposta(i) {
  const c = comentariosList.value[i]
  const txt = c.textoResposta?.trim()
  if (!txt) return
  const v = videos.value[painelComentarios.value]
  if (!v?.id) return
  try {
    const { data, error } = await supabase.from('comentarios')
      .insert({ video_id: v.id, user_id: authState.user.id, texto: txt, parent_id: c.id })
      .select('*, profiles:user_id(username, avatar_url)')
      .single()
    if (error) throw error
    if (!c.respostas) c.respostas = []
    c.respostas.push({ id: data.id, user_id: data.user_id, nome: data.profiles?.username || authState.profile?.username || 'voce', avatar: data.profiles?.avatar_url || avatarUsuario.value, texto: txt, hora: 'agora', ehMeu: true })
    c.textoResposta = ''; c.respondendo = false
    videos.value[painelComentarios.value] = { ...v, totalComentarios: totalComentariosReal.value }
    supabase.from('videos').update({ comentarios: totalComentariosReal.value }).eq('id', v.id).then(() => {})
  } catch (err) { console.error('enviarResposta:', err); showToast('Erro ao responder') }
}

async function apagarComentario(i, parentIndex = null) {
  const lista = parentIndex !== null ? comentariosList.value[parentIndex].respostas : comentariosList.value
  const c = lista[i]
  if (!c?.id) return
  try {
    await supabase.from('comentarios').delete().eq('id', c.id).eq('user_id', authState.user.id)
    lista.splice(i, 1)
   const idx = painelComentarios.value
// Atualiza contador com total real após apagar
if (videos.value[idx]?.id) {
  supabase.from('videos').update({ comentarios: totalComentariosReal.value }).eq('id', videos.value[idx].id).then(() => {})
}
    showToast('Comentário apagado')
  } catch { showToast('Erro ao apagar') }
}

// ── LIFECYCLE ──
function onVisibilityChange() {
  if (document.visibilityState === 'visible' && authState.user && !videos.value.length) {
    carregarFeed(true); carregarSugestoes(); recarregarSeguindo()
  }
}

onMounted(async () => {
  if (!authState.user) return
  await carregarFeed(true)
  carregarSugestoes(); recarregarSeguindo(); carregarClima()
  if (route.query.v) {
    await abrirVideoEspecifico(route.query.v)
  } else {
    nextTick(() => safePlay(videoRefs.value[0]))
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
})

watch(() => route.query.v, (novoId, antigoId) => {
  if (novoId && novoId !== antigoId) {
    abrirVideoEspecifico(novoId)
  }
})

onActivated(async () => {
  if (!authState.user) return
  carregando.value = false
  await carregarFeed(true)
  carregarSugestoes(); recarregarSeguindo()
  if (route.query.v) {
    await abrirVideoEspecifico(route.query.v)
  } else {
    nextTick(() => safePlay(videoRefs.value[0]))
  }
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,600;0,700;1,700&display=swap');
* { font-family: 'DM Sans', sans-serif; }

.feed-layout { display: flex; height: 100%; overflow: hidden; width: 100%; background: #070300; }
.feed-center { position: relative; width: 100%; max-width: 500px; margin: 0 auto; overflow: hidden; }
.hidden-input { display: none; }

/* TABS */
.feed-tabs { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10; width: auto; pointer-events: none; }
.tabs-inner { display: flex; align-items: center; gap: 20px; pointer-events: auto; }
.feed-tab { background: none; border: none; color: rgba(255,255,255,.6); font-size: 17px; font-weight: 700; cursor: pointer; padding: 5px 10px; transition: all .2s ease; text-shadow: 0 1px 4px rgba(0,0,0,.8); }
.feed-tab.active { color: #fff; transform: scale(1.1); }
.tab-indicator { position: absolute; bottom: -4px; height: 3px; background: #fff; border-radius: 2px; transition: all .3s cubic-bezier(.4,0,.2,1); box-shadow: 0 1px 4px rgba(0,0,0,.5); }
.tab-upload-btn { display: none !important; }

/* FEED */
.videos-scroll { flex: 1; overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none; height: 100%; padding-top: 56px; }
.videos-scroll::-webkit-scrollbar { display: none; }
.video-snap { height: calc(100vh - 56px); scroll-snap-align: start; display: flex; align-items: center; justify-content: center; padding: 60px 0 0; }

/* EMPTY */
.feed-vazio { position: absolute; inset: 56px 0 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: rgba(255,255,255,.3); text-align: center; padding: 40px; }
.vazio-icon { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.vazio-title { font-size: 17px; font-weight: 700; color: rgba(255,255,255,.5); }
.vazio-sub { font-size: 13px; color: rgba(255,255,255,.25); }
.btn-vazio-upload { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding: 10px 22px; background: linear-gradient(135deg, #ff2d55, #ff6a00); border: none; color: #fff; border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .18s; }
.btn-vazio-upload:hover { opacity: .85; }

/* LOAD MORE */
.load-more { display: flex; justify-content: center; padding: 24px; }
.load-more-inner { display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 20px; font-size: 13px; color: rgba(255,255,255,.5); cursor: pointer; transition: background .18s; }
.load-more-inner:hover { background: rgba(255,255,255,.08); }
.feed-loading { display: flex; justify-content: center; align-items: center; height: 100px; }

/* PANELS */
.panel-comments,
.panel-suggestions {
  width: 360px; min-width: 360px; height: 100%;
  border-left: 1px solid rgba(255,255,255,.04);
  display: flex; flex-direction: column; flex-shrink: 0;
  background: rgba(8,4,0,.8); backdrop-filter: blur(20px);
}

.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,.05); }
.panel-header-info { display: flex; align-items: center; gap: 10px; }
.panel-header-info h3 { font-size: 15px; font-weight: 700; color: rgba(255,255,255,.85); }
.comments-count { font-size: 12px; font-weight: 700; background: rgba(255,45,85,.15); color: #ff2d55; border-radius: 10px; padding: 2px 8px; }
.panel-close { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.06); border: none; color: rgba(255,255,255,.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
.panel-close:hover { background: rgba(255,255,255,.1); color: #fff; }

/* COMMENTS LIST */
.comments-list { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 18px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent; min-height: 0; }
.comments-loading, .panel-loading { display: flex; justify-content: center; padding: 28px 0; }
.comments-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 0; color: rgba(255,255,255,.25); font-size: 13px; }

.comment-item { display: flex; gap: 10px; animation: slide-in-comment .2s ease; }
@keyframes slide-in-comment { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.comment-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,.08); }
.comment-body { flex: 1; min-width: 0; }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.comment-name { font-size: 12px; font-weight: 700; color: rgba(255,255,255,.75); }
.comment-time { font-size: 11px; color: rgba(255,255,255,.25); }
.comment-text { font-size: 13px; color: rgba(255,255,255,.85); line-height: 1.45; margin-bottom: 6px; word-break: break-word; }

/* GIF no comentário */
.comment-gif-wrap { margin-bottom: 6px; border-radius: 10px; overflow: hidden; max-width: 200px; }
.comment-gif { width: 100%; display: block; border-radius: 10px; }

.comment-actions { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.comment-like { display: inline-flex; align-items: center; gap: 4px; background: none; border: none; color: rgba(255,255,255,.3); font-size: 12px; cursor: pointer; font-family: inherit; transition: color .15s; padding: 0; }
.comment-like:hover { color: rgba(255,255,255,.6); }
.comment-like.liked { color: #ff2d55; }
.comment-reply-btn { background: none; border: none; color: rgba(255,255,255,.3); font-size: 12px; cursor: pointer; font-family: inherit; padding: 0; transition: color .15s; }
.comment-reply-btn:hover { color: rgba(255,255,255,.6); }
.comment-delete { background: none; border: none; color: rgba(255,255,255,.2); cursor: pointer; padding: 0; margin-left: auto; transition: color .15s; display: flex; align-items: center; }
.comment-delete:hover { color: #ff5555; }

.comment-reply-box { display: flex; align-items: center; gap: 6px; margin-top: 8px; background: rgba(255,255,255,.04); border-radius: 20px; padding: 0 6px 0 12px; border: 1px solid rgba(255,255,255,.08); }

.comment-replies { margin-top: 10px; padding-left: 10px; border-left: 2px solid rgba(255,255,255,.06); display: flex; flex-direction: column; gap: 10px; }
.comment-reply-item { display: flex; gap: 8px; align-items: flex-start; }

/* INPUT ROW */
.comment-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(255,255,255,.06);
  background: rgba(8,4,0,.95);
  flex-shrink: 0;
}

.comment-input-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,.08); }

.comment-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 22px;
  padding: 0 8px 0 14px;
  transition: border-color .18s;
  gap: 6px;
}
.comment-input-wrap:focus-within { border-color: rgba(255,45,85,.4); background: rgba(255,45,85,.04); }

.comment-input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  padding: 10px 0;
}
.comment-input::placeholder { color: rgba(255,255,255,.25); }

.gif-toggle-btn {
  flex-shrink: 0;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  color: rgba(255,255,255,.5);
  font-size: 10px;
  font-weight: 800;
  font-family: inherit;
  padding: 3px 7px;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: .5px;
  transition: all .15s;
}
.gif-toggle-btn:hover,
.gif-toggle-btn.active {
  background: rgba(255,45,85,.15);
  border-color: rgba(255,45,85,.4);
  color: #ff2d55;
}

.comment-send { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #ff2d55, #ff6a00); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity .15s, transform .15s; flex-shrink: 0; }
.comment-send:disabled { opacity: .35; cursor: default; }
.comment-send:not(:disabled):hover { opacity: .85; transform: scale(1.05); }

/* GIF PENDENTE */
.gif-pendente {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 8px;
  background: rgba(8,4,0,.95);
  flex-shrink: 0;
}
.gif-pendente-img { height: 60px; border-radius: 8px; border: 1px solid rgba(255,255,255,.1); }
.gif-pendente-rm {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,.1); border: none;
  color: rgba(255,255,255,.6); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  flex-shrink: 0;
}
.gif-pendente-rm:hover { background: rgba(255,45,85,.3); color: #ff2d55; }

/* GIF PICKER */
.gif-picker {
  flex-shrink: 0;
  background: rgba(12,6,0,.98);
  border-top: 1px solid rgba(255,255,255,.07);
  display: flex;
  flex-direction: column;
  max-height: 280px;
  overflow: hidden;
}

.gif-picker-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 8px;
  flex-shrink: 0;
}

.gif-search-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  padding: 0 10px;
  gap: 7px;
  transition: border-color .15s;
}
.gif-search-wrap:focus-within { border-color: rgba(255,45,85,.4); }
.gif-search-icon { color: rgba(255,255,255,.3); flex-shrink: 0; }
.gif-search-input { flex: 1; background: none; border: none; color: #fff; font-size: 13px; font-family: inherit; outline: none; padding: 8px 0; }
.gif-search-input::placeholder { color: rgba(255,255,255,.25); }

.gif-close-btn { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.07); border: none; color: rgba(255,255,255,.4); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .15s; }
.gif-close-btn:hover { background: rgba(255,255,255,.13); color: #fff; }

.gif-categories { display: flex; gap: 6px; padding: 0 12px 8px; overflow-x: auto; scrollbar-width: none; flex-shrink: 0; }
.gif-categories::-webkit-scrollbar { display: none; }
.gif-cat-btn { flex-shrink: 0; padding: 4px 10px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.09); border-radius: 20px; color: rgba(255,255,255,.55); font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all .15s; white-space: nowrap; }
.gif-cat-btn:hover { background: rgba(255,45,85,.12); border-color: rgba(255,45,85,.3); color: #ff2d55; }

.gif-loading { display: flex; justify-content: center; padding: 24px; }

.gif-grid { flex: 1; overflow-y: auto; padding: 0 8px 10px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent; }
.gif-item { position: relative; aspect-ratio: 1.5; border-radius: 8px; overflow: hidden; cursor: pointer; background: rgba(255,255,255,.04); transition: transform .15s, opacity .15s; }
.gif-item:hover { transform: scale(1.03); opacity: .9; }
.gif-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.gif-empty { grid-column: 1/-1; text-align: center; padding: 24px; font-size: 13px; color: rgba(255,255,255,.25); }

.gif-slide-enter-active, .gif-slide-leave-active { transition: all .22s ease; }
.gif-slide-enter-from, .gif-slide-leave-to { opacity: 0; transform: translateY(12px); }

/* SUGGESTIONS PANEL */
.panel-suggestions { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent; }
.panel-section { padding: 20px 20px 0; }
.section-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.25); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 14px; }
.section-empty { font-size: 12px; color: rgba(255,255,255,.2); padding: 8px 0; }

.user-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.clickable-row { cursor: pointer; border-radius: 10px; padding: 6px 8px; margin: 0 -8px 8px; transition: background .18s; }
.clickable-row:hover { background: rgba(255,255,255,.05); }

.user-avatar-wrap { position: relative; flex-shrink: 0; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,.08); display: block; }
.user-avatar-ring { position: absolute; inset: -2px; border-radius: 50%; background: linear-gradient(135deg, #ff2d55, #ff6a00); z-index: -1; opacity: 0; transition: opacity .2s; }
.clickable-row:hover .user-avatar-ring { opacity: 1; }
.online-dot { position: absolute; bottom: 1px; right: 1px; width: 9px; height: 9px; border-radius: 50%; background: #34d399; border: 1.5px solid #070300; }

.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-sub { font-size: 11px; color: rgba(255,255,255,.3); }
.user-sub.online { color: #34d399; }

.follow-btn { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 5px 14px; background: rgba(255,45,85,.1); border: 1px solid rgba(255,45,85,.25); color: #ff2d55; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .18s; white-space: nowrap; min-width: 64px; }
.follow-btn:hover:not(:disabled) { background: #ff2d55; color: #fff; }
.follow-btn.following { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); color: rgba(255,255,255,.5); }
.follow-btn:disabled { opacity: .5; cursor: default; }

.panel-footer { padding: 28px 20px 20px; margin-top: auto; }
.footer-links { display: flex; gap: 12px; margin-bottom: 8px; }
.footer-links a { font-size: 11px; color: rgba(255,255,255,.2); text-decoration: none; transition: color .15s; }
.footer-links a:hover { color: rgba(255,255,255,.45); }
.footer-copy { font-size: 11px; color: rgba(255,255,255,.15); }

/* SPINNERS */
.spinner-ring { width: 26px; height: 26px; border: 2.5px solid rgba(255,255,255,.08); border-top-color: rgba(255,45,85,.7); border-radius: 50%; animation: spin .7s linear infinite; }
.spinner-sm { width: 18px; height: 18px; border-width: 2px; }
.spinner-xs { width: 14px; height: 14px; border-width: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* OVERLAY */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); backdrop-filter: blur(8px); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
.upload-overlay { align-items: center; }

/* SHARE */
.share-sheet { background: #100800; border-radius: 24px 24px 0 0; border: 1px solid rgba(255,255,255,.07); border-bottom: none; padding: 12px 24px 36px; width: 100%; max-width: 440px; }
.share-handle { width: 40px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.12); margin: 0 auto 18px; }
.share-title { font-size: 15px; font-weight: 700; color: rgba(255,255,255,.7); text-align: center; margin-bottom: 20px; }
.share-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.share-option { display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: none; color: rgba(255,255,255,.7); cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: opacity .15s; }
.share-option:hover { opacity: .75; }
.share-icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* UPLOAD */
.upload-modal { background: #0e0700; border-radius: 20px; border: 1px solid rgba(255,255,255,.07); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
.upload-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,.05); }
.upload-modal-title { font-size: 16px; font-weight: 700; color: rgba(255,255,255,.85); }
.drop-zone { margin: 16px 20px; border: 1.5px dashed rgba(255,255,255,.1); border-radius: 16px; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: border-color .2s, background .2s; position: relative; overflow: hidden; }
.drop-zone:hover, .drop-zone.dragging { border-color: rgba(255,45,85,.5); background: rgba(255,45,85,.04); }
.drop-zone.has-file { border-style: solid; border-color: rgba(255,255,255,.08); min-height: 260px; }
.drop-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.3); }
.drop-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.5); }
.drop-sub { font-size: 12px; color: rgba(255,255,255,.2); }
.upload-preview { width: 100%; height: 260px; object-fit: cover; border-radius: 14px; display: block; }
.upload-file-bar { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(0,0,0,.7); backdrop-filter: blur(4px); }
.upload-file-name { font-size: 12px; color: rgba(255,255,255,.7); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upload-rm { background: none; border: none; color: rgba(255,255,255,.4); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; transition: background .15s; }
.upload-rm:hover { background: rgba(255,255,255,.1); }
.upload-fields { padding: 0 20px; display: flex; flex-direction: column; gap: 14px; }
.upload-field { position: relative; }
.upload-field label { display: block; font-size: 11px; font-weight: 700; color: rgba(255,255,255,.3); text-transform: uppercase; letter-spacing: .7px; margin-bottom: 7px; }
.upload-field input, .upload-field textarea { width: 100%; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 11px 14px; font-size: 13px; color: #fff; font-family: inherit; outline: none; resize: none; transition: border-color .18s; box-sizing: border-box; }
.upload-field input:focus, .upload-field textarea:focus { border-color: rgba(255,45,85,.4); }
.upload-field input::placeholder, .upload-field textarea::placeholder { color: rgba(255,255,255,.2); }
.char-count { position: absolute; bottom: 10px; right: 12px; font-size: 10px; color: rgba(255,255,255,.2); }

.upload-foryou-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; margin-top: 8px; border-top: 1px solid rgba(255,255,255,.05); border-bottom: 1px solid rgba(255,255,255,.05); }
.upload-foryou-info { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,.6); font-size: 13px; font-weight: 600; }
.upload-foryou-sub { font-size: 11px; font-weight: 400; color: rgba(255,255,255,.3); }

.toggle-btn { width: 40px; height: 22px; border-radius: 11px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); position: relative; cursor: pointer; flex-shrink: 0; transition: all .25s; padding: 0; }
.toggle-btn.on { background: #ff2d55; border-color: #ff2d55; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,.4); transition: all .25s cubic-bezier(.34,1.56,.64,1); }
.toggle-btn.on .toggle-knob { transform: translateX(18px); background: #fff; }

.upload-progress { margin: 12px 20px 0; height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
.upload-progress-bar { height: 100%; background: linear-gradient(90deg, #ff2d55, #ff8c42); border-radius: 2px; transition: width .3s; }
.upload-error { color: #ff5555; font-size: 13px; text-align: center; padding: 0 20px; margin-top: 8px; }

.upload-actions { display: flex; gap: 10px; padding: 16px 20px 24px; margin-top: 8px; }
.upload-cancel { flex: 1; padding: 11px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07); color: rgba(255,255,255,.5); border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .18s; }
.upload-cancel:hover { background: rgba(255,255,255,.08); }
.upload-submit { flex: 2; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 11px; background: linear-gradient(135deg, #ff2d55, #ff6a00); border: none; color: #fff; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity .18s; letter-spacing: -.1px; }
.upload-submit:disabled { opacity: .45; cursor: default; }
.upload-submit:not(:disabled):hover { opacity: .88; }

/* TOAST */
.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px; background: rgba(16,8,0,.92); border: 1px solid rgba(255,255,255,.08); border-radius: 24px; padding: 10px 18px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.85); z-index: 400; white-space: nowrap; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,.5); }
.toast-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; flex-shrink: 0; }

/* WIDGETS */
.widget-row { display: flex; gap: 10px; margin: 16px 20px 0; }
.widget-clima { flex: 1; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; min-width: 0; }
.widget-icon { font-size: 22px; flex-shrink: 0; }
.widget-info { flex: 1; min-width: 0; }
.widget-val { font-size: 18px; font-weight: 700; color: #fff; margin: 0; line-height: 1; }
.widget-sub { font-size: 10px; color: rgba(255,255,255,.3); margin: 3px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.widget-city { font-size: 10px; color: rgba(255,255,255,.2); writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; flex-shrink: 0; }
.widget-cal { width: 80px; flex-shrink: 0; background: rgba(255,45,85,.08); border: 1px solid rgba(255,45,85,.15); border-radius: 14px; padding: 10px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
.cal-dia { font-size: 28px; font-weight: 700; color: #ff2d55; line-height: 1; margin: 0; }
.cal-mes { font-size: 10px; color: rgba(255,255,255,.5); margin: 0; text-transform: capitalize; }
.cal-semana { font-size: 9px; color: rgba(255,255,255,.25); margin: 0; text-transform: capitalize; }

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.panel-slide-enter-active, .panel-slide-leave-active { transition: all .25s cubic-bezier(.4,0,.2,1); }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; transform: translateX(20px); }
.toast-pop-enter-active, .toast-pop-leave-active { transition: all .25s cubic-bezier(.4,0,.2,1); }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>