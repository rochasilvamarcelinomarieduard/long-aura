<template>
  <div class="search-page">

    <!-- HEADER -->
    <div class="search-header" :class="{ 'is-focused': focoAtivo }">
      <div class="search-bar-wrap" :class="{ focused: focoAtivo }">
        <div class="search-icon-wrap">
          <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <input
          v-model="query"
          class="search-input"
          placeholder="Buscar vídeos, usuários, sons..."
          @focus="focoAtivo = true"
          @blur="focoAtivo = false"
          @keydown.escape="limpar"
        />
        <transition name="fade-scale">
          <button v-if="query" class="search-clear" @click="limpar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </transition>
      </div>
      <div class="chips-row">
        <button
          v-for="cat in categorias"
          :key="cat.id"
          class="chip"
          :class="{ active: catAtiva === cat.id }"
          @click="setCat(cat.id)"
        >
          <span class="chip-icon">{{ cat.emoji }}</span>
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- BODY -->
    <div class="search-body">
      <transition name="page" mode="out-in">

        <!-- ═══ TODOS ═══ -->
        <div v-if="catAtiva === 'todos' && !query" key="todos" class="discover-wrap">

          <section class="section">
            <div class="section-head">
              <span class="section-eyebrow">Em alta</span>
              <h2 class="section-title">Trending</h2>
            </div>
            <div class="trending-grid">
              <div
                v-for="(t, i) in trending"
                :key="t.tag"
                class="trend-pill"
                :style="{ '--delay': i * 0.04 + 's' }"
                @click="query = t.tag"
              >
                <span class="trend-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="trend-body">
                  <span class="trend-tag">{{ t.tag }}</span>
                  <span class="trend-meta">{{ t.count }} · {{ t.crescimento }}</span>
                </div>
                <div class="trend-spark">
                  <span v-for="(h, bi) in t.bars" :key="bi" class="spark-bar" :style="{ height: h + '%' }"></span>
                </div>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="section-head">
              <span class="section-eyebrow">Para seguir</span>
              <h2 class="section-title">Criadores</h2>
            </div>
            <!-- CARROSSEL COM SETAS -->
            <div class="creators-carousel-wrap">
              <button
                class="carousel-arrow carousel-arrow-l"
                :class="{ hidden: creatorsScrollLeft <= 0 }"
                @click="scrollCreators(-1)"
                aria-label="Anterior"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/></svg>
              </button>
              <div class="creators-row" ref="creatorsRowEl" @scroll="onCreatorsScroll">
                <div
                  v-for="u in usuarios"
                  :key="u.handle"
                  class="creator-card"
                  @click="irParaPerfil(u.handle)"
                >
                  <div class="creator-cover" :style="{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }"></div>
                  <div class="creator-body">
                    <div class="creator-av-wrap">
                      <img :src="u.avatar" class="creator-av" />
                    </div>
                    <p class="creator-nome">{{ u.nome }}</p>
                    <p class="creator-handle">@{{ u.handle }}</p>
                    <div class="creator-stats"><span>{{ u.seguidores }}</span><span class="stat-dot">·</span><span>seguidores</span></div>
                    <button class="creator-btn" :class="{ following: u.seguindo }" @click.stop="toggleSeguir(u)">
                      <svg v-if="!u.seguindo" viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      {{ u.seguindo ? 'Seguindo' : 'Seguir' }}
                    </button>
                  </div>
                </div>
              </div>
              <button
                class="carousel-arrow carousel-arrow-r"
                :class="{ hidden: creatorsScrollEnd }"
                @click="scrollCreators(1)"
                aria-label="Próximo"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
              </button>
            </div>
          </section>

          <section class="section">
            <div class="section-head">
              <span class="section-eyebrow">Música</span>
              <h2 class="section-title">Sons Populares</h2>
            </div>
            <div v-if="sonsCarregando" class="sons-skeleton-wrap" style="padding:0 24px">
              <div v-for="i in 4" :key="i" class="som-skeleton" :style="{ animationDelay: (i*0.07)+'s' }" />
            </div>
            <div v-else class="sons-lista">
              <div
                v-for="(s, i) in sons.slice(0, 4)"
                :key="s.id"
                class="som-row"
                :class="{ playing: sonAtivo === i }"
                @click="toggleSom(i)"
              >
                <div class="som-rank">{{ String(i + 1).padStart(2, '0') }}</div>
                <div class="som-art" :style="{ background: s.grad }">
                  <img v-if="s.cover" :src="s.cover" class="som-cover-img" />
                  <div class="som-art-inner" :class="{ spin: sonAtivo === i }">
                    <svg v-if="!s.cover" viewBox="0 0 24 24" fill="rgba(255,255,255,.6)" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                </div>
                <div class="som-info">
                  <span class="som-titulo">{{ s.titulo }}</span>
                  <span class="som-artista">{{ s.artista }}</span>
                </div>
                <div class="som-right">
                  <div class="som-waves" v-if="sonAtivo === i">
                    <span v-for="n in 5" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                  </div>
                  <span class="som-usos">{{ s.usos }}</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- ═══ VÍDEOS ═══ -->
        <div v-else-if="catAtiva === 'videos' && !query" key="videos" class="tab-wrap">
          <div class="section-head" style="padding-top:20px">
            <span class="section-eyebrow">Assista agora</span>
            <h2 class="section-title">Vídeos em destaque</h2>
          </div>
          <div class="videos-full-grid">
            <div
              v-for="(v, i) in todosVideos"
              :key="i"
              class="res-card"
              :style="{ '--i': i }"
              @mouseenter="hoverCard = i; playVideo(i)"
              @mouseleave="hoverCard = null; pauseVideo(i)"
              @click="abrirVideo(v)"
            >
              <div class="res-media">
                <video :src="v.url" muted :ref="el => { if(el) videoEls[i] = el }" class="res-video" loop playsinline />
                <div class="res-grad" />
                <div class="res-play-btn" :class="{ show: hoverCard === i }">
                  <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div class="res-likes-badge">
                  <svg viewBox="0 0 24 24" fill="#ff2d6b" width="10" height="10"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {{ fmt(v.likes) }}
                </div>
              </div>
              <div class="res-info">
                <p class="res-desc">{{ v.descricao }}</p>
                <div class="res-meta">
                  <img :src="v.avatar" class="res-av" @click.stop="irParaPerfil(v.username)" style="cursor:pointer" />
                  <span class="res-user res-user-link" @click.stop="irParaPerfil(v.username)">@{{ v.username }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ USUÁRIOS ═══ -->
        <div v-else-if="catAtiva === 'usuarios' && !query" key="usuarios" class="tab-wrap">
          <div class="section-head" style="padding-top:20px">
            <span class="section-eyebrow">Descubra</span>
            <h2 class="section-title">Usuários</h2>
          </div>
          <div class="usuarios-list">
            <div
              v-for="u in usuarios"
              :key="u.handle"
              class="usuario-row"
              :style="{ '--i': usuarios.indexOf(u) }"
              @click="irParaPerfil(u.handle)"
              style="cursor:pointer"
            >
              <div class="urow-cover" :style="{ background: u.coverGrad }"></div>
              <img :src="u.avatar" class="urow-av" />
              <div class="urow-info">
                <div class="urow-top">
                  <span class="urow-nome">{{ u.nome }}</span>
                  <span v-if="u.live" class="urow-live">● AO VIVO</span>
                </div>
                <span class="urow-handle">@{{ u.handle }}</span>
                <span class="urow-bio">{{ u.bio }}</span>
                <div class="urow-stats">
                  <span class="urow-stat"><strong>{{ u.seguidores }}</strong> seguidores</span>
                  <span class="urow-dot">·</span>
                  <span class="urow-stat"><strong>{{ u.videos }}</strong> vídeos</span>
                  <span class="urow-dot">·</span>
                  <span class="urow-stat"><strong>{{ u.curtidas }}</strong> curtidas</span>
                </div>
              </div>
              <button class="urow-btn" :class="{ following: u.seguindo }" @click.stop="toggleSeguir(u)">
                <svg v-if="!u.seguindo" viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                {{ u.seguindo ? 'Seguindo' : 'Seguir' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ═══ SONS ═══ -->
        <div v-else-if="catAtiva === 'sons' && !query" key="sons" class="tab-wrap">
          <div class="section-head" style="padding-top:20px">
            <span class="section-eyebrow">Ouça agora</span>
            <h2 class="section-title">Sons Populares</h2>
          </div>

          <transition name="player-slide">
            <div v-if="sonAtivo !== null && sons[sonAtivo]" class="mini-player">
              <div class="mp-disco" :style="{ background: sons[sonAtivo].grad }">
                <div class="mp-disco-hole"></div>
              </div>
              <div class="mp-info">
                <span class="mp-titulo">{{ sons[sonAtivo].titulo }}</span>
                <span class="mp-artista">{{ sons[sonAtivo].artista }}</span>
              </div>
              <div class="mp-waves">
                <span v-for="n in 7" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
              </div>
              <button class="mp-stop" @click="pararSom">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              </button>
            </div>
          </transition>

          <section class="section" v-if="sonsRecentes.length || sonsRecentesCarregando">
            <div class="section-head" style="padding-top:0">
              <span class="section-eyebrow">Nos últimos vídeos</span>
              <h2 class="section-title">Sons Recentes</h2>
            </div>
            <div v-if="sonsRecentesCarregando" class="sons-recentes-skeleton">
              <div v-for="i in 5" :key="i" class="sr-card-skeleton" :style="{ animationDelay: (i*0.06)+'s' }" />
            </div>
            <div v-else class="sons-recentes-row">
              <div
                v-for="(sr, i) in sonsRecentes"
                :key="sr.id"
                class="sr-card"
                :class="{ playing: sonRecenteAtivo === i }"
                :style="{ '--i': i }"
                @click="toggleSomRecente(i)"
              >
                <div class="sr-art" :style="{ background: sr.grad }">
                  <img v-if="sr.cover" :src="sr.cover" class="sr-cover-img" />
                  <div class="sr-disco-hole"></div>
                  <div v-if="sonRecenteAtivo === i" class="sr-playing-ring"></div>
                </div>
                <div class="sr-waves-overlay" v-if="sonRecenteAtivo === i">
                  <span v-for="n in 4" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                </div>
                <div class="sr-info">
                  <span class="sr-titulo">{{ sr.titulo }}</span>
                  <span class="sr-artista">{{ sr.artista }}</span>
                  <div class="sr-meta">
                    <img :src="sr.userAvatar" class="sr-user-av" />
                    <span class="sr-user-nome">@{{ sr.username }}</span>
                  </div>
                </div>
                <div class="sr-usos-badge">{{ sr.usos }} vídeos</div>
              </div>
            </div>
          </section>

          <div class="chips-genero-row">
            <button
              v-for="g in GENEROS_SONS"
              :key="g.val"
              class="chip"
              :class="{ active: generoSonAtivo === g.val }"
              @click="selecionarGeneroSons(g.val)"
            >{{ g.label }}</button>
          </div>

          <div v-if="sonsCarregando" class="sons-skeleton-wrap">
            <div v-for="i in 8" :key="i" class="som-skeleton" :style="{ animationDelay: (i*0.07)+'s' }" />
          </div>
          <div v-else-if="sonsErro" class="sons-erro">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style="opacity:.3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <p>{{ sonsErro }}</p>
          </div>
          <div v-else class="sons-lista full-mode">
            <div
              v-for="(s, i) in sons"
              :key="s.id"
              class="som-row"
              :class="{ playing: sonAtivo === i }"
              @click="toggleSom(i)"
            >
              <div class="som-rank">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="som-art" :style="{ background: s.grad }">
                <img v-if="s.cover" :src="s.cover" class="som-cover-img" />
                <div class="som-art-inner" :class="{ spin: sonAtivo === i }">
                  <svg v-if="!s.cover" viewBox="0 0 24 24" fill="rgba(255,255,255,.6)" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
              </div>
              <div class="som-info">
                <span class="som-titulo">{{ s.titulo }}</span>
                <span class="som-artista">
                  {{ s.artista }}
                  <span class="som-genero-mini">{{ s.genero }}</span>
                </span>
              </div>
              <div class="som-right">
                <div class="som-waves" v-if="sonAtivo === i">
                  <span v-for="n in 5" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                </div>
                <span class="som-usos">{{ s.usos }}</span>
              </div>
            </div>
          </div>
          <div class="sons-credits">
            Áudio via <strong>iTunes Search API</strong> · Preview 30s · Apple Inc.
          </div>
        </div>

        <!-- ═══ LIVES ═══ -->
        <div v-else-if="catAtiva === 'lives' && !query" key="lives" class="tab-wrap">
          <div class="section-head" style="padding-top:20px">
            <span class="section-eyebrow">Acontecendo agora</span>
            <h2 class="section-title">Ao Vivo</h2>
          </div>
          <div class="lives-grid">
            <div
              v-for="(l, i) in lives"
              :key="l.handle"
              class="live-card"
              :style="{ '--i': i }"
              @click="irParaPerfil(l.handle)"
              style="cursor:pointer"
            >
              <div class="live-thumb" :style="{ background: l.grad }">
                <img :src="l.avatar" class="live-av" />
                <span class="live-badge">● AO VIVO</span>
                <span class="live-viewers">👁 {{ l.viewers }}</span>
              </div>
              <div class="live-info">
                <p class="live-nome">{{ l.nome }}</p>
                <p class="live-titulo">{{ l.titulo }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ RESULTADOS DE BUSCA ═══ -->
        <div v-else-if="query" key="results" class="results-wrap">
          <transition name="fade" mode="out-in">

            <div v-if="eBuscaDeSom && resultadosBuscaMusica.length > 0" key="music-search" class="music-search-wrap">
              <div class="results-header">
                <span class="results-count">{{ resultadosBuscaMusica.length }}</span>
                <span class="results-sub">músicas para <em>"{{ query }}"</em></span>
                <span v-if="buscaMusicaCarregando" class="results-loading">
                  <span class="loading-dot" v-for="n in 3" :key="n" :style="{ '--n': n }"></span>
                </span>
              </div>
              <div v-if="sonsRecentes.length" class="music-search-recentes">
                <div class="msr-label">
                  <span class="section-eyebrow" style="padding:0">Usados recentemente</span>
                </div>
                <div class="sons-recentes-row" style="padding:8px 24px 0">
                  <div
                    v-for="(sr, i) in sonsRecentes.slice(0, 4)"
                    :key="'sr-search-' + sr.id"
                    class="sr-card"
                    :class="{ playing: sonRecenteAtivo === i }"
                    :style="{ '--i': i }"
                    @click="toggleSomRecente(i)"
                  >
                    <div class="sr-art" :style="{ background: sr.grad }">
                      <img v-if="sr.cover" :src="sr.cover" class="sr-cover-img" />
                      <div class="sr-disco-hole"></div>
                      <div v-if="sonRecenteAtivo === i" class="sr-playing-ring"></div>
                    </div>
                    <div class="sr-waves-overlay" v-if="sonRecenteAtivo === i">
                      <span v-for="n in 4" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                    </div>
                    <div class="sr-info">
                      <span class="sr-titulo">{{ sr.titulo }}</span>
                      <span class="sr-artista">{{ sr.artista }}</span>
                      <div class="sr-meta">
                        <img :src="sr.userAvatar" class="sr-user-av" />
                        <span class="sr-user-nome">@{{ sr.username }}</span>
                      </div>
                    </div>
                    <div class="sr-usos-badge">{{ sr.usos }} vídeos</div>
                  </div>
                </div>
                <div class="msr-divider"></div>
              </div>
              <div class="music-results-label">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                Resultados do iTunes
              </div>
              <div class="sons-lista" style="padding:0 24px">
                <div
                  v-for="(s, i) in resultadosBuscaMusica"
                  :key="'bm-' + s.id"
                  class="som-row"
                  :class="{ playing: sonBuscaAtivo === i }"
                  @click="toggleSomBusca(i)"
                >
                  <div class="som-rank">{{ String(i + 1).padStart(2, '0') }}</div>
                  <div class="som-art" :style="{ background: s.grad }">
                    <img v-if="s.cover" :src="s.cover" class="som-cover-img" />
                    <div class="som-art-inner" :class="{ spin: sonBuscaAtivo === i }">
                      <svg v-if="!s.cover" viewBox="0 0 24 24" fill="rgba(255,255,255,.6)" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    </div>
                  </div>
                  <div class="som-info">
                    <span class="som-titulo">{{ s.titulo }}</span>
                    <span class="som-artista">
                      {{ s.artista }}
                      <span class="som-genero-mini">{{ s.genero }}</span>
                    </span>
                  </div>
                  <div class="som-right">
                    <div class="som-waves" v-if="sonBuscaAtivo === i">
                      <span v-for="n in 5" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                    </div>
                    <span class="som-usos">{{ s.usos }}</span>
                  </div>
                </div>
              </div>
              <div class="sons-credits">Áudio via <strong>iTunes Search API</strong> · Preview 30s · Apple Inc.</div>
            </div>

            <div v-else-if="eBuscaDeSom && buscaMusicaCarregando" key="music-loading" class="music-search-loading">
              <div class="msl-disco"><div class="msl-disco-inner"></div></div>
              <p class="msl-text">Buscando músicas...</p>
              <p class="msl-sub">{{ query }}</p>
            </div>

            <div v-else-if="resultadosFiltrados.length === 0 && !buscaMusicaCarregando" key="empty" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </div>
              <p class="empty-title">Sem resultados</p>
              <p class="empty-sub">Nada para <em>"{{ query }}"</em> em <em>{{ labelCat }}</em></p>
              <div class="empty-sugs">
                <span class="empty-label">Tente:</span>
                <button v-for="t in trending.slice(0,4)" :key="t.tag" class="empty-tag" @click="query = t.tag">{{ t.tag }}</button>
              </div>
            </div>

            <div v-else-if="!eBuscaDeSom" key="grid">
              <div class="results-header">
                <span class="results-count">{{ resultadosFiltrados.length }}</span>
                <span class="results-sub">resultado{{ resultadosFiltrados.length !== 1 ? 's' : '' }} em <em>{{ labelCat }}</em> para <em>"{{ query }}"</em></span>
              </div>

              <div v-if="catAtiva === 'todos' || catAtiva === 'videos'" class="results-grid">
                <div
                  v-for="(v, i) in resultadosFiltrados.filter(r => r._tipo === 'video')"
                  :key="'rv' + i"
                  class="res-card"
                  :style="{ '--i': i }"
                  @mouseenter="hoverCard = 'rv'+i; playVideo('rv'+i, v.url)"
                  @mouseleave="hoverCard = null; pauseVideo('rv'+i)"
                  @click="abrirVideo(v)"
                >
                  <div class="res-media">
                    <video :src="v.url" muted :ref="el => { if(el) videoEls['rv'+i] = el }" class="res-video" loop playsinline />
                    <div class="res-grad" />
                    <div class="res-play-btn" :class="{ show: hoverCard === 'rv'+i }">
                      <svg viewBox="0 0 24 24" fill="white" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div class="res-likes-badge">
                      <svg viewBox="0 0 24 24" fill="#ff2d6b" width="10" height="10"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {{ fmt(v.likes) }}
                    </div>
                  </div>
                  <div class="res-info">
                    <p class="res-desc">{{ v.descricao }}</p>
                    <div class="res-meta">
                      <img :src="v.avatar" class="res-av" @click.stop="irParaPerfil(v.username)" style="cursor:pointer" />
                      <span class="res-user res-user-link" @click.stop="irParaPerfil(v.username)">@{{ v.username }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="catAtiva === 'todos' || catAtiva === 'usuarios'">
                <div v-if="catAtiva === 'todos' && resultadosFiltrados.filter(r => r._tipo === 'usuario').length" class="results-section-label">Usuários</div>
                <div class="usuarios-list">
                  <div
                    v-for="(u, i) in resultadosFiltrados.filter(r => r._tipo === 'usuario')"
                    :key="'ru' + i"
                    class="usuario-row"
                    :style="{ '--i': i }"
                    @click="irParaPerfil(u.handle)"
                    style="cursor:pointer"
                  >
                    <div class="urow-cover" :style="{ background: u.coverGrad }"></div>
                    <img :src="u.avatar" class="urow-av" />
                    <div class="urow-info">
                      <div class="urow-top">
                        <span class="urow-nome">{{ u.nome }}</span>
                        <span v-if="u.live" class="urow-live">● AO VIVO</span>
                      </div>
                      <span class="urow-handle">@{{ u.handle }}</span>
                      <span class="urow-bio">{{ u.bio }}</span>
                      <div class="urow-stats">
                        <span class="urow-stat"><strong>{{ u.seguidores }}</strong> seguidores</span>
                        <span class="urow-dot">·</span>
                        <span class="urow-stat"><strong>{{ u.videos }}</strong> vídeos</span>
                      </div>
                    </div>
                    <button class="urow-btn" :class="{ following: u.seguindo }" @click.stop="toggleSeguir(u)">
                      <svg v-if="!u.seguindo" viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      {{ u.seguindo ? 'Seguindo' : 'Seguir' }}
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="catAtiva === 'todos'">
                <div v-if="resultadosFiltrados.filter(r => r._tipo === 'som').length" class="results-section-label">Sons</div>
                <div class="sons-lista">
                  <div
                    v-for="(s, i) in resultadosFiltrados.filter(r => r._tipo === 'som')"
                    :key="'rs' + i"
                    class="som-row"
                    :class="{ playing: sonAtivo === sons.indexOf(s) }"
                    @click="toggleSom(sons.indexOf(s))"
                  >
                    <div class="som-rank">{{ String(i + 1).padStart(2, '0') }}</div>
                    <div class="som-art" :style="{ background: s.grad }">
                      <img v-if="s.cover" :src="s.cover" class="som-cover-img" />
                      <div class="som-art-inner"><svg v-if="!s.cover" viewBox="0 0 24 24" fill="rgba(255,255,255,.6)" width="13" height="13"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
                    </div>
                    <div class="som-info">
                      <span class="som-titulo">{{ s.titulo }}</span>
                      <span class="som-artista">{{ s.artista }} <span class="som-genero-mini">{{ s.genero }}</span></span>
                    </div>
                    <div class="som-right">
                      <div class="som-waves" v-if="sonAtivo === sons.indexOf(s)">
                        <span v-for="n in 5" :key="n" class="wave-bar" :style="{ '--n': n }"></span>
                      </div>
                      <span class="som-usos">{{ s.usos }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </transition>
        </div>

      </transition>
    </div>

    <!-- MODAL DE VÍDEO -->
    <transition name="modal-fade">
      <div
        v-if="videoModalAberto && videoSelecionado"
        class="video-modal-backdrop"
        @click.self="fecharVideoModal"
      >
        <button class="video-modal-close" @click="fecharVideoModal" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        <div class="video-modal-player">
          <video
            ref="videoModalRef"
            :src="videoSelecionado.url"
            class="video-modal-video"
            controls
            playsinline
            loop
          ></video>
          <div class="video-modal-info">
            <div class="video-modal-user" @click="irParaPerfil(videoSelecionado.username); fecharVideoModal()">
              <img :src="videoSelecionado.avatar" class="video-modal-av" />
              <span class="video-modal-username">@{{ videoSelecionado.username }}</span>
            </div>
            <p v-if="videoSelecionado.descricao" class="video-modal-desc">{{ videoSelecionado.descricao }}</p>
            <div v-if="videoSelecionado.somNome" class="video-modal-som">
              <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              {{ videoSelecionado.somNome }}<span v-if="videoSelecionado.somArtista"> · {{ videoSelecionado.somArtista }}</span>
            </div>
            <div class="video-modal-likes">
              <svg viewBox="0 0 24 24" fill="#ff2d6b" width="13" height="13">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ fmt(videoSelecionado.likes || 0) }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'
import { authState } from '../auth.js'

const router = useRouter()

// ── NAVEGAR PARA PERFIL ──
function irParaPerfil(username) {
  if (!username) return
  router.push('/home/profile/' + username)
}

// ── CARROSSEL CRIADORES ──
const creatorsRowEl     = ref(null)
const creatorsScrollLeft = ref(0)
const creatorsScrollEnd  = ref(false)

function onCreatorsScroll() {
  const el = creatorsRowEl.value
  if (!el) return
  creatorsScrollLeft.value = el.scrollLeft
  creatorsScrollEnd.value  = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
}

function scrollCreators(dir) {
  const el = creatorsRowEl.value
  if (!el) return
  el.scrollBy({ left: dir * 300, behavior: 'smooth' })
}

// ── GÊNEROS SONS ──
const GENEROS_SONS = [
  { val: 'trending',  label: 'Em Alta',   query: 'anitta mc luisa sonza ludmilla' },
  { val: 'sertanejo', label: 'Sertanejo', query: 'jorge mateus marilia mendonca henrique juliano' },
  { val: 'funk',      label: 'Funk',       query: 'mc kevinho pabllo vittar funk brasil' },
  { val: 'pagode',    label: 'Pagode',     query: 'pagode thiaguinho dilsinho sorriso maroto' },
  { val: 'forro',     label: 'Forró',      query: 'forro xand aviao wesley safadao' },
  { val: 'axe',       label: 'Axé',        query: 'axe ivete sangalo claudia leitte' },
  { val: 'samba',     label: 'Samba',      query: 'samba zeca pagodinho diogo nogueira' },
  { val: 'pop_br',    label: 'Pop BR',     query: 'pop brasil anitta pabllo vittar luisa' },
]

const GRADIENTES = [
  'linear-gradient(135deg, #ff2d55, #ff6a00)',
  'linear-gradient(135deg, #7028e4, #e5b2ca)',
  'linear-gradient(135deg, #00c6ff, #0072ff)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fd746c, #ff9068)',
]

// ── STATE ──
const query      = ref('')
const focoAtivo  = ref(false)
const catAtiva   = ref('todos')
const sonAtivo   = ref(null)
const toastMsg   = ref('')
const hoverCard  = ref(null)
const videoEls   = ref({})

const sons                   = ref([])
const sonsCarregando         = ref(false)
const sonsErro               = ref('')
const generoSonAtivo         = ref('trending')
const audioCache             = {}
let   audioEl                = null

const sonsRecentes            = ref([])
const sonsRecentesCarregando  = ref(false)
const sonRecenteAtivo         = ref(null)
let   audioRecenteEl          = null

const resultadosBuscaMusica  = ref([])
const buscaMusicaCarregando  = ref(false)
const sonBuscaAtivo          = ref(null)
let   audioBuscaEl           = null
let   musicSearchTimer       = null

const AV = (i, bg) => `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="${bg}"/><text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700" fill="#fff0ea" text-anchor="middle" dominant-baseline="central">${i}</text></svg>`)}`

const categorias = [
  { id: 'todos',    label: 'Todos',    emoji: '✦' },
  { id: 'videos',   label: 'Vídeos',   emoji: '▶' },
  { id: 'usuarios', label: 'Usuários', emoji: '◉' },
  { id: 'sons',     label: 'Sons',     emoji: '♪' },
]

const carregando  = ref(false)
const usuarios    = ref([])
const todosVideos = ref([])
const trending    = ref([])
const lives       = ref([])

function avatarPadrao(username = '?') {
  const initials = username.slice(0, 2).toUpperCase()
  const colors = ['#1a2850','#103838','#2d1040','#4a1018','#10381a','#3a1808','#1a3a5a','#3a2a1a']
  const color = colors[username.charCodeAt(0) % colors.length]
  return AV(initials, color)
}

async function buscarUsuarios(q = '') {
  let query = supabase
    .from('profiles')
    .select('id, nome, username, avatar_url, bio, seguidores, curtidas')
    .neq('id', authState.user?.id ?? '00000000-0000-0000-0000-000000000000')
    .order('seguidores', { ascending: false })
    .limit(20)
  if (q) query = query.or(`username.ilike.%${q}%,nome.ilike.%${q}%,bio.ilike.%${q}%`)
  const { data, error } = await query
  if (error) { console.warn(error); return }
  let seguindoIds = []
  if (authState.user) {
    const { data: sData } = await supabase.from('seguidores').select('following_id').eq('follower_id', authState.user.id)
    seguindoIds = sData?.map(s => s.following_id) ?? []
  }
  usuarios.value = (data ?? []).map(u => ({
    id: u.id, nome: u.nome || u.username, handle: u.username,
    avatar: u.avatar_url || avatarPadrao(u.username), bio: u.bio || '',
    seguidores: fmt(u.seguidores || 0), curtidas: fmt(u.curtidas || 0),
    seguindo: seguindoIds.includes(u.id),
  }))
}

async function buscarVideos(q = '') {
  let dbQuery = supabase.from('videos').select(`*, profiles:user_id (username, avatar_url)`).order('created_at', { ascending: false }).limit(20)
  if (q) dbQuery = dbQuery.or(`descricao.ilike.%${q}%,titulo.ilike.%${q}%`)
  const { data, error } = await dbQuery
  if (error) { console.warn(error); return }
  todosVideos.value = (data ?? []).map(v => ({
    id: v.id, url: v.video_url, username: v.profiles?.username || 'usuario',
    descricao: v.descricao || '', likes: v.likes || 0,
    avatar: v.profiles?.avatar_url || avatarPadrao(v.profiles?.username), _tipo: 'video',
    somUrl: v.som_url || null, somNome: v.som_nome || '', somArtista: v.som_artista || '',
  }))
}

async function buscarTrending() {
  const { data } = await supabase.from('videos').select('descricao').order('likes', { ascending: false }).limit(100)
  const tagCount = {}
  for (const v of data ?? []) {
    const tags = (v.descricao || '').match(/#\w+/g) ?? []
    for (const t of tags) tagCount[t] = (tagCount[t] || 0) + 1
  }
  trending.value = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({
    tag, count: count + (count === 1 ? ' vídeo' : ' vídeos'), crescimento: '↑ Em alta',
    bars: Array.from({ length: 7 }, () => Math.floor(30 + Math.random() * 70)),
  }))
  if (!trending.value.length) {
    trending.value = [{ tag: '#longarura', count: 'Seja o primeiro!', crescimento: '↑ Novo', bars: [40,60,50,80,55,70,90] }]
  }
}

async function buscarSonsRecentes() {
  sonsRecentesCarregando.value = true
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`id, som_id, som_nome, som_artista, som_url, profiles:user_id (username, avatar_url), created_at`)
      .not('som_nome', 'is', null)
      .order('created_at', { ascending: false })
      .limit(60)
    if (error) { console.warn('[sonsRecentes]', error); return }
    const mapasSons = {}
    for (const v of (data ?? [])) {
      if (!v.som_nome) continue
      const key = v.som_id || `${v.som_nome}||${v.som_artista || ''}`
      if (!mapasSons[key]) {
        mapasSons[key] = {
          titulo: v.som_nome, artista: v.som_artista || 'Desconhecido',
          audioUrl: v.som_url || null,
          username: v.profiles?.username || 'usuario',
          userAvatar: v.profiles?.avatar_url || avatarPadrao(v.profiles?.username),
          count: 0,
        }
      }
      mapasSons[key].count++
    }
    const lista = Object.values(mapasSons).sort((a, b) => b.count - a.count).slice(0, 8)
    const enriquecidos = await Promise.all(lista.map(async (s, i) => {
      let cover = '', grad = GRADIENTES[i % GRADIENTES.length]
      try {
        const qs = new URLSearchParams({ term: `${s.titulo} ${s.artista}`, media: 'music', entity: 'song', limit: '1', country: 'BR' })
        let res = await fetch(`https://itunes.apple.com/search?${qs}`)
        if (!res.ok) throw new Error()
        const d = await res.json()
        const t = d.results?.[0]
        if (t) {
          const rawCover = (t.artworkUrl100 || '').replace('100x100', '120x120')
          cover = rawCover ? `https://images.weserv.nl/?url=${encodeURIComponent(rawCover)}&w=120&h=120&fit=cover` : ''
          if (!s.audioUrl && t.previewUrl) s.audioUrl = t.previewUrl
        }
      } catch {}
      return { ...s, id: `rec-${i}`, cover, grad, usos: s.count }
    }))
    sonsRecentes.value = enriquecidos
  } catch (e) { console.error('[sonsRecentes]', e) }
  finally { sonsRecentesCarregando.value = false }
}

async function buscarSonsPorGenero(val) {
  const g = GENEROS_SONS.find(x => x.val === val)
  if (!g) return
  const cacheKey = 'sons:' + val
  if (audioCache[cacheKey]) { sons.value = audioCache[cacheKey]; return }
  sonsCarregando.value = true; sonsErro.value = ''; sons.value = []
  try {
    const qs = new URLSearchParams({ country: 'BR', media: 'music', entity: 'song', lang: 'pt_br', explicit: 'No', limit: '30', term: g.query })
    let data
    try { const res = await fetch(`https://itunes.apple.com/search?${qs}`); data = await res.json() }
    catch {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://itunes.apple.com/search?' + qs)}`
      const res = await fetch(proxied); data = await res.json()
    }
    const tracks = (data.results ?? []).filter(t => t.previewUrl)
    if (!tracks.length) { sonsErro.value = 'Nenhum resultado com preview. Tente outro gênero.'; return }
    const lista = tracks.map((t, i) => {
      const rawCover = (t.artworkUrl100 || '').replace('100x100', '120x120')
      return {
        id: String(t.trackId), titulo: t.trackName, artista: t.artistName,
        genero: t.primaryGenreName || g.label,
        usos: (Math.floor(Math.random() * 900 + 100)) + 'K',
        grad: GRADIENTES[i % GRADIENTES.length],
        cover: rawCover ? `https://images.weserv.nl/?url=${encodeURIComponent(rawCover)}&w=120&h=120&fit=cover` : '',
        audioUrl: t.previewUrl, _tipo: 'som',
      }
    })
    audioCache[cacheKey] = lista; sons.value = lista
  } catch (e) { sonsErro.value = 'Erro ao buscar músicas.'; console.error('[iTunes]', e) }
  finally { sonsCarregando.value = false }
}

async function buscarMusicaQuery(q) {
  if (!q.trim()) { resultadosBuscaMusica.value = []; return }
  buscaMusicaCarregando.value = true; resultadosBuscaMusica.value = []
  try {
    const qs = new URLSearchParams({ term: q, media: 'music', entity: 'song', country: 'BR', limit: '20', explicit: 'No' })
    let data
    try { const res = await fetch(`https://itunes.apple.com/search?${qs}`); data = await res.json() }
    catch {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://itunes.apple.com/search?' + qs)}`
      const res = await fetch(proxied); data = await res.json()
    }
    const tracks = (data.results ?? []).filter(t => t.previewUrl)
    resultadosBuscaMusica.value = tracks.map((t, i) => {
      const rawCover = (t.artworkUrl100 || '').replace('100x100', '120x120')
      return {
        id: String(t.trackId), titulo: t.trackName, artista: t.artistName,
        genero: t.primaryGenreName || '',
        usos: (Math.floor(Math.random() * 900 + 100)) + 'K',
        grad: GRADIENTES[i % GRADIENTES.length],
        cover: rawCover ? `https://images.weserv.nl/?url=${encodeURIComponent(rawCover)}&w=120&h=120&fit=cover` : '',
        audioUrl: t.previewUrl, _tipo: 'som',
      }
    })
  } catch (e) { console.error('[iTunes busca]', e) }
  finally { buscaMusicaCarregando.value = false }
}

function selecionarGeneroSons(val) {
  generoSonAtivo.value = val
  if (sonAtivo.value !== null) pararSom()
  buscarSonsPorGenero(val)
}

function toggleSom(i) {
  const som = sons.value[i]
  if (!som?.audioUrl) { mostrarToast('Sem preview disponível'); return }
  pararSomRecente(); pararSomBusca()
  if (sonAtivo.value === i) { audioEl?.pause(); sonAtivo.value = null }
  else { if (audioEl) { audioEl.pause(); audioEl.src = som.audioUrl; audioEl.play().catch(() => mostrarToast('Não foi possível reproduzir.')) } sonAtivo.value = i }
}
function pararSom() { audioEl?.pause(); sonAtivo.value = null }

function toggleSomRecente(i) {
  const sr = sonsRecentes.value[i]
  if (!sr?.audioUrl) { mostrarToast('Sem preview disponível'); return }
  pararSom(); pararSomBusca()
  if (sonRecenteAtivo.value === i) { audioRecenteEl?.pause(); sonRecenteAtivo.value = null }
  else { if (audioRecenteEl) { audioRecenteEl.pause(); audioRecenteEl.src = sr.audioUrl; audioRecenteEl.play().catch(() => mostrarToast('Não foi possível reproduzir.')) } sonRecenteAtivo.value = i }
}
function pararSomRecente() { audioRecenteEl?.pause(); sonRecenteAtivo.value = null }

function toggleSomBusca(i) {
  const s = resultadosBuscaMusica.value[i]
  if (!s?.audioUrl) { mostrarToast('Sem preview disponível'); return }
  pararSom(); pararSomRecente()
  if (sonBuscaAtivo.value === i) { audioBuscaEl?.pause(); sonBuscaAtivo.value = null }
  else { if (audioBuscaEl) { audioBuscaEl.pause(); audioBuscaEl.src = s.audioUrl; audioBuscaEl.play().catch(() => mostrarToast('Não foi possível reproduzir.')) } sonBuscaAtivo.value = i }
}
function pararSomBusca() { audioBuscaEl?.pause(); sonBuscaAtivo.value = null }

async function carregarTudo() {
  carregando.value = true
  await Promise.all([buscarUsuarios(), buscarVideos(), buscarTrending(), buscarSonsPorGenero('trending'), buscarSonsRecentes()])
  carregando.value = false
}

async function toggleSeguir(u) {
  if (!authState.user) { mostrarToast('Faça login para seguir'); return }
  const eu = authState.user.id
  if (u.seguindo) {
    await supabase.from('seguidores').delete().eq('follower_id', eu).eq('following_id', u.id)
    await supabase.rpc('decrement_seguidores', { profile_id: u.id })
    await supabase.rpc('decrement_seguindo',   { profile_id: eu })
    u.seguindo = false; mostrarToast('Deixou de seguir @' + u.handle)
  } else {
    await supabase.from('seguidores').insert({ follower_id: eu, following_id: u.id })
    await supabase.rpc('increment_seguidores', { profile_id: u.id })
    await supabase.rpc('increment_seguindo',   { profile_id: eu })
    await supabase.from('notificacoes').insert({ to_user_id: u.id, from_user_id: eu, tipo: 'seguiu', lida: false })
    u.seguindo = true; mostrarToast('Seguindo @' + u.handle + ' ✓')
  }
}

const labelCat        = computed(() => categorias.find(c => c.id === catAtiva.value)?.label ?? 'Todos')
const eBuscaDeSom     = computed(() => catAtiva.value === 'sons')
const todosOsItens    = computed(() => [...todosVideos.value, ...usuarios.value.map(u => ({ ...u, _tipo: 'usuario' })), ...sons.value])
const resultadosFiltrados = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return []
  let pool = todosOsItens.value
  if (catAtiva.value === 'videos')   pool = todosVideos.value
  if (catAtiva.value === 'usuarios') pool = usuarios.value.map(u => ({ ...u, _tipo: 'usuario' }))
  if (catAtiva.value === 'sons')     pool = sons.value
  return pool.filter(item => {
    if (item._tipo === 'video')   return item.descricao.toLowerCase().includes(q) || item.username.toLowerCase().includes(q)
    if (item._tipo === 'usuario') return item.nome.toLowerCase().includes(q) || item.handle.toLowerCase().includes(q) || item.bio?.toLowerCase().includes(q)
    if (item._tipo === 'som')     return item.titulo.toLowerCase().includes(q) || item.artista.toLowerCase().includes(q)
    return false
  })
})

let searchTimer = null
watch(query, (q) => {
  clearTimeout(searchTimer); clearTimeout(musicSearchTimer); pararSomBusca(); sonBuscaAtivo.value = null
  searchTimer = setTimeout(async () => {
    carregando.value = true
    await Promise.all([buscarUsuarios(q), buscarVideos(q)])
    carregando.value = false
  }, 350)
  if (catAtiva.value === 'sons') {
    if (!q.trim()) { resultadosBuscaMusica.value = []; return }
    musicSearchTimer = setTimeout(() => buscarMusicaQuery(q), 500)
  }
})
watch(catAtiva, (nova) => {
  if (nova === 'sons' && query.value.trim()) buscarMusicaQuery(query.value)
})

function setCat(id)      { catAtiva.value = id; pararSom(); pararSomRecente(); pararSomBusca() }
function playVideo(key)  { videoEls.value[key]?.play().catch(() => {}) }
function pauseVideo(key) { videoEls.value[key]?.pause() }

// ── MODAL DE VÍDEO ──
const videoModalAberto = ref(false)
const videoSelecionado = ref(null)
const videoModalRef    = ref(null)

let audioVideoModalEl = null

function abrirVideo(v) {
  if (!v?.url) { mostrarToast('Vídeo indisponível'); return }
  // pausa qualquer preview mudo que esteja tocando em hover
  Object.values(videoEls.value).forEach(el => el?.pause?.())
  videoSelecionado.value = v
  videoModalAberto.value = true

  // espera o <video> ser montado no DOM, ainda dentro da "janela"
  // do gesto de clique do usuário (necessário pro navegador liberar som)
  nextTick(() => {
    const el = videoModalRef.value
    if (!el) return
    el.currentTime = 0

    if (v.somUrl) {
      // o arquivo de vídeo não tem faixa de áudio própria — o som
      // dele é a música escolhida pelo autor ao publicar (som_url).
      // o vídeo fica mudo e o áudio toca sincronizado com play/pause/seek.
      el.muted = true
      if (!audioVideoModalEl) audioVideoModalEl = new Audio()
      audioVideoModalEl.pause()
      audioVideoModalEl.src = v.somUrl
      audioVideoModalEl.currentTime = 0
      audioVideoModalEl.loop = true

      el.onplay    = () => audioVideoModalEl.play().catch(() => {})
      el.onpause   = () => audioVideoModalEl.pause()
      el.onseeking = () => { audioVideoModalEl.currentTime = el.currentTime }

      el.play().catch(() => {})
      audioVideoModalEl.play().catch(() => mostrarToast('Toque na tela para ativar o som'))
    } else {
      // sem som vinculado: tenta tocar o áudio nativo do próprio arquivo (se houver)
      audioVideoModalEl?.pause()
      el.muted = false
      el.volume = 1
      el.onplay = el.onpause = el.onseeking = null
      el.play().catch(() => {
        el.muted = true
        el.play().catch(() => {})
        mostrarToast('Esse vídeo não tem áudio')
      })
    }
  })
}

function fecharVideoModal() {
  videoModalRef.value?.pause()
  audioVideoModalEl?.pause()
  videoModalAberto.value = false
  videoSelecionado.value = null
}

function onModalKeydown(e) {
  if (e.key === 'Escape' && videoModalAberto.value) fecharVideoModal()
}

watch(videoModalAberto, (aberto) => {
  document.body.style.overflow = aberto ? 'hidden' : ''
})

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
function limpar()          { query.value = ''; resultadosBuscaMusica.value = []; pararSomBusca() }
function mostrarToast(msg) { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 2200) }

onMounted(() => {
  audioEl        = new Audio(); audioEl.addEventListener('ended', () => { sonAtivo.value = null })
  audioRecenteEl = new Audio(); audioRecenteEl.addEventListener('ended', () => { sonRecenteAtivo.value = null })
  audioBuscaEl   = new Audio(); audioBuscaEl.addEventListener('ended', () => { sonBuscaAtivo.value = null })
  window.addEventListener('keydown', onModalKeydown)
  carregarTudo()
})
onBeforeUnmount(() => {
  audioEl?.pause(); audioEl = null
  audioRecenteEl?.pause(); audioRecenteEl = null
  audioBuscaEl?.pause(); audioBuscaEl = null
  audioVideoModalEl?.pause(); audioVideoModalEl = null
  window.removeEventListener('keydown', onModalKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }

.search-page { flex: 1; display: flex; flex-direction: column; height: 100%; overflow: hidden; background: #080400; font-family: 'DM Sans', sans-serif; color: #fff5e8; }

.search-header { flex-shrink: 0; padding: 20px 24px 0; background: linear-gradient(to bottom, #0d0600, rgba(8,4,0,.97)); border-bottom: 1px solid #1e1000; }
.search-bar-wrap { display: flex; align-items: center; background: #110800; border: 1.5px solid #2a1500; border-radius: 13px; padding: 0 14px; gap: 10px; margin-bottom: 14px; transition: border-color .25s, box-shadow .25s, background .2s; }
.search-bar-wrap.focused { border-color: #ff2d6b; box-shadow: 0 0 0 3px rgba(255,45,107,.1), 0 4px 20px rgba(0,0,0,.4); background: #160a00; }
.search-icon-wrap { display: flex; align-items: center; color: rgba(255,245,232,.28); flex-shrink: 0; transition: color .2s; }
.search-bar-wrap.focused .search-icon-wrap { color: #ff2d6b; }
.search-input { flex: 1; background: none; border: none; outline: none; color: #fff5e8; font-size: 15px; font-family: 'DM Sans', sans-serif; padding: 13px 0; }
.search-input::placeholder { color: rgba(255,245,232,.25); }
.search-clear { background: #2a1500; border: none; color: rgba(255,245,232,.5); cursor: pointer; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
.search-clear:hover { background: #ff2d6b; color: #fff; }
.chips-row { display: flex; gap: 6px; overflow-x: auto; padding: 0 0 14px; scrollbar-width: none; }
.chips-row::-webkit-scrollbar { display: none; }
.chip { display: flex; align-items: center; gap: 5px; background: none; border: 1px solid #2a1500; color: rgba(255,245,232,.35); font-size: 12px; font-weight: 600; font-family: 'DM Mono', monospace; padding: 5px 13px; border-radius: 6px; cursor: pointer; white-space: nowrap; letter-spacing: .04em; flex-shrink: 0; transition: all .2s; }
.chip:hover { border-color: #ff9a3c; color: #ff9a3c; }
.chip.active { background: #ff2d6b; border-color: #ff2d6b; color: #fff; box-shadow: 0 2px 12px rgba(255,45,107,.3); }
.chip-icon { font-style: normal; font-size: 11px; }

.search-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #2a1500 transparent; }
.tab-wrap { padding: 0 0 48px; }
.discover-wrap { padding: 4px 0 48px; }
.section { margin-bottom: 32px; }
.section-head { padding: 18px 24px 12px; }
.section-eyebrow { display: block; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #ff9a3c; margin-bottom: 3px; }
.section-title { font-size: 20px; font-weight: 700; letter-spacing: -.3px; color: #fff5e8; }

.trending-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #1a0c00; border-top: 1px solid #1a0c00; border-bottom: 1px solid #1a0c00; }
.trend-pill { display: flex; align-items: center; gap: 10px; padding: 13px 18px; background: #080400; cursor: pointer; transition: background .15s; animation: fadeUp .4s both; animation-delay: var(--delay); }
.trend-pill:hover { background: rgba(255,45,107,.04); }
.trend-pill:hover .trend-tag { color: #ff2d6b; }
@keyframes fadeUp { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
.trend-num { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,245,232,.2); flex-shrink: 0; width: 18px; }
.trend-body { flex: 1; min-width: 0; }
.trend-tag { display: block; font-size: 13px; font-weight: 700; color: #fff5e8; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .2s; }
.trend-meta { font-size: 10px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; }
.trend-spark { display: flex; align-items: flex-end; gap: 2px; height: 22px; flex-shrink: 0; }
.spark-bar { display: block; width: 3px; border-radius: 2px; background: #2a1500; transition: background .2s; min-height: 3px; }
.trend-pill:hover .spark-bar { background: rgba(255,45,107,.45); }
.trend-pill:hover .spark-bar:last-child { background: #ff2d6b; }

/* ── CARROSSEL CRIADORES ── */
.creators-carousel-wrap {
  position: relative;
  padding: 0 24px;
}
.creators-row {
  display: flex; gap: 10px;
  overflow-x: auto; scrollbar-width: none;
  scroll-behavior: smooth;
  padding: 4px 0 8px;
}
.creators-row::-webkit-scrollbar { display: none; }

.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px; border-radius: 50%;
  background: #1e1000; border: 1px solid #3a2000;
  color: rgba(255,245,232,.7); fill: currentColor;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  transition: all .2s; box-shadow: 0 2px 12px rgba(0,0,0,.6);
}
.carousel-arrow:hover { background: #ff2d6b; border-color: #ff2d6b; color: #fff; transform: translateY(-50%) scale(1.1); }
.carousel-arrow.hidden { opacity: 0; pointer-events: none; }
.carousel-arrow-l { left: 4px; }
.carousel-arrow-r { right: 4px; }

.creator-card { flex-shrink: 0; width: 140px; border-radius: 13px; overflow: hidden; background: #110800; border: 1px solid #2a1500; cursor: pointer; transition: border-color .2s, transform .25s, box-shadow .25s; }
.creator-card:hover { border-color: #ff2d6b; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,.55); }
.creator-cover { height: 48px; }
.creator-body { padding: 0 10px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 3px; }
.creator-av-wrap { position: relative; margin-top: -20px; margin-bottom: 5px; }
.creator-av { width: 40px; height: 40px; border-radius: 50%; border: 2.5px solid #080400; object-fit: cover; display: block; }
.creator-nome { font-size: 12px; font-weight: 700; color: #fff5e8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.creator-handle { font-size: 10px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; }
.creator-stats { display: flex; align-items: center; gap: 4px; font-size: 10px; color: rgba(255,245,232,.45); margin: 2px 0 4px; }
.stat-dot { color: rgba(255,245,232,.2); }
.creator-btn { display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; background: none; border: 1.5px solid #ff2d6b; color: #ff2d6b; font-size: 11px; font-weight: 700; padding: 5px 0; border-radius: 7px; cursor: pointer; font-family: inherit; transition: all .2s; }
.creator-btn:hover { background: #ff2d6b; color: #fff; }
.creator-btn.following { background: #180c00; border-color: #2a1500; color: rgba(255,245,232,.35); }

.sons-lista { display: flex; flex-direction: column; padding: 0 24px; gap: 3px; }
.som-row { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; border: 1px solid transparent; cursor: pointer; transition: background .15s, border-color .15s; position: relative; overflow: hidden; }
.som-row::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,45,107,.05), transparent); opacity: 0; transition: opacity .2s; }
.som-row:hover::before, .som-row.playing::before { opacity: 1; }
.som-row:hover { background: #110800; border-color: #2a1500; }
.som-row.playing { background: #110800; border-color: rgba(255,45,107,.3); }
.som-rank { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,245,232,.25); width: 18px; text-align: center; flex-shrink: 0; }
.som-art { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.som-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.som-art::after { content: ''; position: absolute; width: 14px; height: 14px; background: #080400; border-radius: 50%; z-index: 2; }
.som-art-inner { position: relative; z-index: 3; display: flex; align-items: center; justify-content: center; }
.som-art-inner.spin { animation: spindisco 2s linear infinite; }
@keyframes spindisco { to { transform: rotate(360deg); } }
.som-info { flex: 1; min-width: 0; }
.som-titulo { display: block; font-size: 13px; font-weight: 600; color: #fff5e8; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.som-artista { font-size: 11px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.som-genero-mini { font-size: 9px; color: #ff9a3c; background: rgba(255,154,60,.1); border: 1px solid rgba(255,154,60,.2); border-radius: 4px; padding: 1px 4px; white-space: nowrap; flex-shrink: 0; }
.som-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.som-usos { font-size: 11px; color: rgba(255,245,232,.28); font-family: 'DM Mono', monospace; }
.som-waves { display: flex; align-items: center; gap: 2px; height: 14px; }
.wave-bar { display: block; width: 3px; border-radius: 2px; background: #ff2d6b; animation: waveAnim .7s ease-in-out infinite alternate; animation-delay: calc(var(--n) * 0.1s); }
@keyframes waveAnim { from { height: 3px; } to { height: 13px; } }
.chips-genero-row { display: flex; gap: 6px; overflow-x: auto; padding: 4px 24px 16px; scrollbar-width: none; }
.chips-genero-row::-webkit-scrollbar { display: none; }
.sons-skeleton-wrap { display: flex; flex-direction: column; padding: 0 24px; gap: 3px; }
.som-skeleton { height: 62px; border-radius: 10px; background: rgba(255,245,232,.04); animation: skeleton-pulse 1.4s ease-in-out infinite; }
@keyframes skeleton-pulse { 0%,100%{opacity:.3;} 50%{opacity:.7;} }
.sons-erro { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 24px; text-align: center; color: rgba(255,45,107,.5); font-size: 13px; }
.sons-credits { padding: 14px 24px 4px; font-size: 10px; color: rgba(255,245,232,.18); font-family: 'DM Mono', monospace; text-align: center; }
.sons-credits strong { color: rgba(255,245,232,.3); }

.sons-recentes-row { display: flex; gap: 10px; padding: 0 24px 16px; overflow-x: auto; scrollbar-width: none; }
.sons-recentes-row::-webkit-scrollbar { display: none; }
.sr-card { flex-shrink: 0; width: 148px; background: #110800; border: 1px solid #2a1500; border-radius: 14px; overflow: hidden; cursor: pointer; animation: fadeUp .35s both; animation-delay: calc(var(--i) * 0.06s); transition: border-color .2s, transform .25s, box-shadow .25s; display: flex; flex-direction: column; position: relative; }
.sr-card:hover { border-color: #ff9a3c; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.6); }
.sr-card.playing { border-color: rgba(255,45,107,.5); box-shadow: 0 0 0 2px rgba(255,45,107,.2); }
.sr-art { width: 100%; aspect-ratio: 1/1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
.sr-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sr-disco-hole { position: absolute; width: 28px; height: 28px; background: rgba(8,4,0,.85); border-radius: 50%; border: 2px solid rgba(255,245,232,.08); z-index: 2; }
.sr-playing-ring { position: absolute; inset: -2px; border-radius: 50%; border: 3px solid #ff2d6b; opacity: .7; animation: pulseRing 1.2s ease-in-out infinite; z-index: 3; pointer-events: none; }
@keyframes pulseRing { 0%,100%{ transform: scale(1); opacity:.7; } 50%{ transform: scale(1.06); opacity:1; } }
.sr-waves-overlay { position: absolute; bottom: 8px; right: 8px; z-index: 4; display: flex; align-items: center; gap: 2px; height: 14px; }
.sr-info { padding: 10px 11px 11px; display: flex; flex-direction: column; gap: 2px; }
.sr-titulo { font-size: 12px; font-weight: 700; color: #fff5e8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sr-artista { font-size: 10px; color: rgba(255,245,232,.35); font-family: 'DM Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
.sr-meta { display: flex; align-items: center; gap: 5px; }
.sr-user-av { width: 14px; height: 14px; border-radius: 50%; object-fit: cover; border: 1px solid #2a1500; flex-shrink: 0; }
.sr-user-nome { font-size: 10px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sr-usos-badge { position: absolute; top: 8px; right: 8px; background: rgba(8,4,0,.75); backdrop-filter: blur(4px); border: 1px solid #2a1500; border-radius: 6px; font-size: 9px; font-weight: 700; font-family: 'DM Mono', monospace; color: #ff9a3c; padding: 2px 6px; z-index: 5; }
.sons-recentes-skeleton { display: flex; gap: 10px; padding: 0 24px 16px; overflow-x: auto; }
.sr-card-skeleton { flex-shrink: 0; width: 148px; height: 210px; border-radius: 14px; background: rgba(255,245,232,.04); animation: skeleton-pulse 1.4s ease-in-out infinite; }

.mini-player { display: flex; align-items: center; gap: 14px; margin: 0 24px 16px; padding: 14px 16px; background: #150a00; border: 1px solid rgba(255,45,107,.3); border-radius: 12px; position: relative; overflow: hidden; }
.mini-player::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(255,45,107,.08), transparent); pointer-events: none; }
.mp-disco { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; animation: spindisco 3s linear infinite; position: relative; }
.mp-disco-hole { position: absolute; width: 14px; height: 14px; background: #150a00; border-radius: 50%; }
.mp-info { flex: 1; min-width: 0; }
.mp-titulo { display: block; font-size: 14px; font-weight: 700; color: #fff5e8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-artista { font-size: 11px; color: rgba(255,245,232,.4); font-family: 'DM Mono', monospace; }
.mp-waves { display: flex; align-items: center; gap: 3px; height: 18px; flex-shrink: 0; }
.mp-stop { background: rgba(255,45,107,.15); border: 1px solid rgba(255,45,107,.3); color: #ff2d6b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all .2s; }
.mp-stop:hover { background: #ff2d6b; color: #fff; }

.usuarios-list { display: flex; flex-direction: column; padding: 0 24px; gap: 4px; }
.usuario-row { display: flex; align-items: center; gap: 0; background: #110800; border: 1px solid #2a1500; border-radius: 13px; overflow: hidden; animation: fadeUp .35s both; animation-delay: calc(var(--i) * 0.06s); transition: border-color .2s; }
.usuario-row:hover { border-color: rgba(255,45,107,.4); }
.urow-cover { width: 6px; height: 100%; min-height: 80px; flex-shrink: 0; }
.urow-av { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #2a1500; flex-shrink: 0; margin: 14px 14px 14px 12px; }
.urow-info { flex: 1; min-width: 0; padding: 14px 0; }
.urow-top { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.urow-nome { font-size: 15px; font-weight: 700; color: #fff5e8; }
.urow-live { font-size: 9px; font-weight: 800; font-family: 'DM Mono', monospace; color: #ff2d6b; background: rgba(255,45,107,.12); border: 1px solid rgba(255,45,107,.3); padding: 1px 6px; border-radius: 4px; letter-spacing: .05em; }
.urow-handle { display: block; font-size: 12px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; margin-bottom: 4px; }
.urow-bio { display: block; font-size: 12px; color: rgba(255,245,232,.55); line-height: 1.4; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95%; }
.urow-stats { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.urow-stat { font-size: 11px; color: rgba(255,245,232,.4); }
.urow-stat strong { color: #fff5e8; font-weight: 700; }
.urow-dot { color: rgba(255,245,232,.2); font-size: 11px; }
.urow-btn { display: flex; align-items: center; gap: 5px; background: none; border: 1.5px solid #ff2d6b; color: #ff2d6b; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; transition: all .2s; white-space: nowrap; margin: 0 14px; flex-shrink: 0; }
.urow-btn:hover { background: #ff2d6b; color: #fff; }
.urow-btn.following { background: #180c00; border-color: #2a1500; color: rgba(255,245,232,.35); }

.videos-full-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 8px; padding: 0 24px; }

.lives-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; padding: 0 24px; }
.live-card { border-radius: 13px; overflow: hidden; border: 1px solid #2a1500; cursor: pointer; animation: fadeUp .35s both; animation-delay: calc(var(--i) * 0.08s); transition: border-color .2s, transform .2s; }
.live-card:hover { border-color: #ff2d6b; transform: translateY(-2px); }
.live-thumb { position: relative; height: 120px; display: flex; align-items: center; justify-content: center; }
.live-av { width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,.2); object-fit: cover; }
.live-badge { position: absolute; top: 8px; left: 8px; background: #ff2d6b; color: #fff; font-size: 9px; font-weight: 800; font-family: 'DM Mono', monospace; padding: 2px 7px; border-radius: 4px; letter-spacing: .05em; }
.live-viewers { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,.6); color: #fff; font-size: 11px; font-family: 'DM Mono', monospace; padding: 2px 8px; border-radius: 10px; }
.live-info { padding: 10px 12px 12px; background: #110800; }
.live-nome { font-size: 12px; font-weight: 700; color: rgba(255,245,232,.6); margin-bottom: 2px; }
.live-titulo { font-size: 13px; font-weight: 600; color: #fff5e8; }

.res-card { border-radius: 11px; overflow: hidden; background: #110800; border: 1px solid #2a1500; cursor: pointer; animation: fadeUp .3s both; animation-delay: calc(var(--i) * 0.07s); transition: border-color .2s, transform .25s, box-shadow .25s; }
.res-card:hover { border-color: #ff2d6b; transform: translateY(-4px); box-shadow: 0 14px 40px rgba(0,0,0,.65); }
.res-media { position: relative; aspect-ratio: 9/14; overflow: hidden; background: #0a0500; }
.res-video { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s; }
.res-card:hover .res-video { transform: scale(1.05); }
.res-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%); pointer-events: none; }
.res-play-btn { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.18); opacity: 0; transition: opacity .2s; }
.res-play-btn.show { opacity: 1; }
.res-likes-badge { position: absolute; bottom: 8px; left: 8px; display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 700; color: #fff; font-family: 'DM Mono', monospace; text-shadow: 0 1px 4px rgba(0,0,0,.9); }
.res-info { padding: 9px 11px 11px; }
.res-desc { font-size: 12px; color: rgba(255,245,232,.65); line-height: 1.5; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.res-meta { display: flex; align-items: center; gap: 6px; }
.res-av { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1px solid #2a1500; }
.res-user { font-size: 11px; color: rgba(255,245,232,.3); font-family: 'DM Mono', monospace; }
.res-user-link { cursor: pointer; transition: color .2s; }
.res-user-link:hover { color: #ff9a3c; }

.results-wrap { padding: 0 0 48px; }
.results-header { display: flex; align-items: baseline; gap: 8px; padding: 20px 24px 16px; border-bottom: 1px solid #1a0c00; margin-bottom: 8px; flex-wrap: wrap; }
.results-count { font-size: 26px; font-weight: 700; color: #fff5e8; letter-spacing: -.4px; }
.results-sub { font-size: 13px; color: rgba(255,245,232,.35); }
.results-sub em { color: #ff9a3c; font-style: normal; }
.results-loading { display: flex; align-items: center; gap: 3px; margin-left: 8px; }
.loading-dot { width: 4px; height: 4px; background: #ff2d6b; border-radius: 50%; animation: dotBounce .7s ease-in-out infinite alternate; animation-delay: calc(var(--n) * 0.15s); }
@keyframes dotBounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
.results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 8px; padding: 0 24px 16px; }
.results-section-label { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(255,245,232,.3); text-transform: uppercase; letter-spacing: .08em; padding: 12px 24px 8px; }

.music-search-wrap { padding-bottom: 48px; }
.music-search-recentes { margin-bottom: 4px; }
.msr-label { padding: 4px 24px 10px; }
.msr-divider { height: 1px; background: #1a0c00; margin: 12px 24px; }
.music-results-label { display: flex; align-items: center; gap: 7px; padding: 8px 24px 10px; font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .1em; color: rgba(255,245,232,.3); }
.music-search-loading { display: flex; flex-direction: column; align-items: center; padding: 72px 24px 40px; gap: 14px; }
.msl-disco { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #ff2d55, #ff6a00); display: flex; align-items: center; justify-content: center; animation: spindisco 1.5s linear infinite; }
.msl-disco-inner { width: 26px; height: 26px; background: #080400; border-radius: 50%; }
.msl-text { font-size: 16px; font-weight: 700; color: #fff5e8; }
.msl-sub { font-size: 13px; color: #ff9a3c; font-family: 'DM Mono', monospace; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 24px 40px; gap: 10px; text-align: center; }
.empty-icon { width: 68px; height: 68px; border-radius: 50%; background: #110800; border: 1px solid #2a1500; display: flex; align-items: center; justify-content: center; color: rgba(255,245,232,.2); margin-bottom: 6px; }
.empty-title { font-size: 20px; font-weight: 700; color: #fff5e8; }
.empty-sub { font-size: 13px; color: rgba(255,245,232,.35); }
.empty-sub em { color: #ff9a3c; font-style: normal; }
.empty-sugs { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 7px; margin-top: 10px; }
.empty-label { font-size: 11px; color: rgba(255,245,232,.25); font-family: 'DM Mono', monospace; }
.empty-tag { background: none; border: 1px solid #2a1500; color: #ff9a3c; font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 6px; cursor: pointer; font-family: 'DM Mono', monospace; transition: all .2s; }
.empty-tag:hover { background: rgba(255,154,60,.08); border-color: #ff9a3c; }

.toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #180c00; color: #fff5e8; padding: 10px 22px; border-radius: 24px; font-size: 13px; font-weight: 600; z-index: 500; border: 1px solid #2a1500; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,.5); }

/* ── MODAL DE VÍDEO ── */
.video-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(4, 2, 0, .9);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: modalBgIn .2s ease;
}
@keyframes modalBgIn { from { opacity: 0; } to { opacity: 1; } }
.video-modal-close {
  position: fixed; top: 20px; right: 24px;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,245,232,.08); border: 1px solid rgba(255,245,232,.15);
  color: #fff5e8; display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 1001; transition: all .2s;
}
.video-modal-close:hover { background: #ff2d6b; border-color: #ff2d6b; color: #fff; transform: scale(1.08); }
.video-modal-player {
  position: relative;
  width: min(420px, 92vw);
  max-height: 88vh;
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  overflow: hidden;
  background: #000;
  box-shadow: 0 30px 90px rgba(0,0,0,.7);
  animation: modalPlayerIn .25s ease;
}
@keyframes modalPlayerIn { from { opacity: 0; transform: scale(.94) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.video-modal-video { width: 100%; height: 100%; object-fit: cover; display: block; background: #000; }
.video-modal-info {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 18px 16px 20px;
  background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.4) 60%, transparent 100%);
  display: flex; flex-direction: column; gap: 7px;
  pointer-events: none;
}
.video-modal-user { display: flex; align-items: center; gap: 8px; pointer-events: auto; cursor: pointer; width: fit-content; }
.video-modal-av { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255,245,232,.3); }
.video-modal-username { font-size: 13px; font-weight: 700; color: #fff5e8; }
.video-modal-desc { font-size: 12px; color: rgba(255,245,232,.85); line-height: 1.45; }
.video-modal-som { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #ff9a3c; font-family: 'DM Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.video-modal-likes { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: #fff5e8; font-family: 'DM Mono', monospace; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.fade-scale-enter-active, .fade-scale-leave-active { transition: all .15s; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(.8); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.page-enter-active { transition: all .25s ease; }
.page-leave-active { transition: all .18s ease; }
.page-enter-from { opacity: 0; transform: translateY(10px); }
.page-leave-to   { opacity: 0; transform: translateY(-5px); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
.player-slide-enter-active, .player-slide-leave-active { transition: all .3s ease; }
.player-slide-enter-from, .player-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>