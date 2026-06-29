<template>
  <div class="upload-page">

    <!-- HEADER -->
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="etapa > 1 ? etapa-- : null">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div class="header-title-block">
          <h1 class="header-title">Publicar vídeo</h1>
          <p class="header-sub">{{ etapa === 1 ? 'Selecione seu arquivo' : 'Configure os detalhes' }}</p>
        </div>
      </div>
      <div class="stepper">
        <div class="step" :class="{ active: etapa >= 1, done: etapa > 1 }">
          <div class="step-dot">
            <svg v-if="etapa > 1" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg>
            <span v-else>1</span>
          </div>
          <span class="step-label">Arquivo</span>
        </div>
        <div class="step-line" :class="{ done: etapa > 1 }">
          <div class="step-line-fill" />
        </div>
        <div class="step" :class="{ active: etapa >= 2 }">
          <div class="step-dot">
            <span>2</span>
          </div>
          <span class="step-label">Detalhes</span>
        </div>
      </div>
    </div>

    <!-- STEP 1: UPLOAD -->
    <transition name="slide-fade" mode="out-in">
      <div v-if="etapa === 1" key="step1" class="step-content">
        <div
          class="drop-zone"
          :class="{ dragging: isDragging, 'has-video': videoSelecionado }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
          @click="!videoSelecionado && $refs.fileInput.click()"
        >
          <input ref="fileInput" type="file" accept="video/*" class="hidden" @change="onFileChange" />

          <!-- Partículas de fundo animadas no drag -->
          <div v-if="isDragging" class="drag-particles">
            <span v-for="i in 8" :key="i" class="particle" :style="{ '--i': i }" />
          </div>

          <transition name="fade" mode="out-in">
            <div v-if="!videoSelecionado" key="empty" class="drop-empty">
              <div class="drop-icon-wrap">
                <div class="drop-icon">
                  <div class="icon-ring ring1" />
                  <div class="icon-ring ring2" />
                  <div class="icon-ring ring3" />
                  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M24 32V16M17 23l7-7 7 7"/>
                    <path d="M8 34v2a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-2"/>
                  </svg>
                </div>
              </div>
              <h2 class="drop-title">{{ isDragging ? 'Solte aqui ✨' : 'Arraste seu vídeo aqui' }}</h2>
              <p class="drop-hint">ou <button class="inline-btn" @click.stop="$refs.fileInput.click()">clique para selecionar</button></p>
              <div class="drop-tags">
                <span class="dtag">MP4</span><span class="dtag">WebM</span><span class="dtag">MOV</span>
                <span class="dtag-sep">·</span><span class="dtag">Até 500MB</span>
                <span class="dtag-sep">·</span><span class="dtag">Máx. 10 min</span>
              </div>
            </div>

            <div v-else key="preview" class="drop-preview">
              <video ref="previewVideo" :src="videoURL" class="preview-vid" autoplay muted loop />
              <div class="preview-grad" />
              <div class="preview-info">
                <div class="preview-badge">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-1.5 9.5v-5l4 2.5-4 2.5z"/></svg>
                  {{ videoNome }}
                </div>
                <button class="change-btn" @click.stop="trocarVideo">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M13.5 8A5.5 5.5 0 1 1 2.5 8"/><path d="M2.5 4.5V8H6"/></svg>
                  Trocar
                </button>
              </div>
            </div>
          </transition>
        </div>

        <div class="step1-footer" v-if="videoSelecionado">
          <div class="file-info">
            <div class="file-dot" />
            <span>{{ videoNome }}</span>
          </div>
          <button class="btn-primary" @click="etapa = 2">
            Continuar
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>

      <!-- STEP 2: DETALHES -->
      <div v-else key="step2" class="step-content step2">
        <div class="form-layout">

          <!-- Coluna esquerda: preview -->
          <div class="preview-col">
            <div class="phone-wrap">
              <div class="phone">
                <div class="phone-notch">
                  <div class="phone-cam" />
                </div>
                <video :src="videoURL" class="phone-vid" autoplay muted loop />
                <div class="phone-overlay">
                  <div class="phone-meta">
                    <p class="phone-desc">{{ descricao || 'Descrição do vídeo...' }}</p>
                    <p class="phone-user">@{{ perfilUsername }}</p>
                    <div v-if="somSelecionado" class="phone-som">
                      <div class="phone-som-disc" :class="{ spinning: true }">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="7" height="7"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      </div>
                      {{ somSelecionado.nomeExibicao }}
                    </div>
                    <div v-if="forYouEfetivo" class="phone-foryou">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                      For You
                    </div>
                  </div>
                  <div class="phone-actions">
                    <div class="paction like">
                      <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div class="paction comment">
                      <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div class="paction share">
                      <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" width="14" height="14"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                    <div class="paction music-disc" v-if="somSelecionado">
                      <img v-if="somSelecionado.cover && !somSelecionado.coverErro" :src="somSelecionado.cover" class="disc-img" @error="somSelecionado.coverErro = true" />
                      <div v-else class="disc-placeholder">
                        <svg viewBox="0 0 24 24" fill="white" width="9" height="9"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="phone-glow" />
              <div class="phone-reflection" />
            </div>
            <span class="preview-lbl">
              <span class="preview-dot" />
              Pré-visualização
            </span>
          </div>

          <!-- Coluna direita: formulário -->
          <div class="fields-col">

            <!-- Descrição -->
            <div class="fgroup">
              <div class="flabel-row">
                <label class="flabel">Descrição</label>
                <span class="fcount" :class="{ warning: descricao.length > 2000, danger: descricao.length > 2150 }">
                  {{ descricao.length }}<span class="fcount-max">/2200</span>
                </span>
              </div>
              <div class="textarea-wrap" :class="{ focused: textareaFocused }">
                <textarea
                  v-model="descricao"
                  class="ftextarea"
                  rows="4"
                  maxlength="2200"
                  placeholder="Descreva seu vídeo e adicione hashtags..."
                  @focus="textareaFocused = true"
                  @blur="textareaFocused = false"
                />
              </div>
              <div class="tags-row">
                <span
                  v-for="tag in tagsSugeridas"
                  :key="tag"
                  class="tag-chip"
                  :class="{ used: descricao.includes('#' + tag) }"
                  @click="adicionarTag(tag)"
                >
                  <span v-if="descricao.includes('#' + tag)" class="tag-check">✓</span>#{{ tag }}
                </span>
              </div>
            </div>

            <!-- SOM -->
            <div class="fgroup">
              <label class="flabel">Som</label>

              <!-- Música selecionada -->
              <div v-if="somSelecionado" class="som-selected">
                <div class="som-vinyl" :class="{ spinning: somTocando }">
                  <img v-if="somSelecionado.cover && !somSelecionado.coverErro" :src="somSelecionado.cover" class="som-cover-img" @error="somSelecionado.coverErro = true" />
                  <div v-else class="som-cover-placeholder">
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  </div>
                  <div class="vinyl-hole" />
                </div>
                <div class="som-info">
                  <p class="som-nome">{{ somSelecionado.nomeExibicao }}</p>
                  <p class="som-artista">
                    {{ somSelecionado.artistaExibicao }}
                    <span class="som-genero-tag">{{ somSelecionado.generoLabel }}</span>
                  </p>
                </div>
                <audio ref="audioPreview" :src="somSelecionado.audioUrl" loop />
                <button class="som-play" @click="togglePreviewSom" :title="somTocando ? 'Pausar' : 'Ouvir'">
                  <svg v-if="!somTocando" viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="som-trocar" @click="trocarSom" title="Trocar música">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                </button>
                <button class="som-remover" @click="removerSom" title="Remover">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>

              <!-- Trecho da música -->
              <div v-if="somSelecionado" class="trecho-wrap">
                <div class="trecho-header">
                  <span class="trecho-label">Trecho usado</span>
                  <span class="trecho-time">{{ formatarDuracao(somTrechoInicio) }} – {{ formatarDuracao(somTrechoInicio + somTrechoDuracao) }}</span>
                </div>
                <div class="trecho-bar-wrap">
                  <input
                    type="range"
                    class="trecho-slider"
                    :min="0"
                    :max="Math.max(0, 30 - somTrechoDuracao)"
                    step="1"
                    v-model.number="somTrechoInicio"
                    @input="onTrechoChange"
                  />
                  <div class="trecho-bar-bg">
                    <div
                      class="trecho-bar-fill"
                      :style="{
                        left: (somTrechoInicio / 30 * 100) + '%',
                        width: (somTrechoDuracao / 30 * 100) + '%'
                      }"
                    />
                    <div
                      class="trecho-thumb-indicator"
                      :style="{ left: (somTrechoInicio / 30 * 100) + '%' }"
                    />
                  </div>
                </div>
                <p class="trecho-hint">Arraste para escolher o trecho de {{ somTrechoDuracao }}s</p>
              </div>

              <!-- Botão abrir painel -->
              <button v-else class="btn-escolher-som" @click="abrirPesquisaSom">
                <div class="btn-som-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <span>Escolher som</span>
                <span class="btn-som-badge">🇧🇷 iTunes BR</span>
              </button>

              <!-- Painel de busca -->
              <div v-if="somPainelAberto" class="som-painel">
                <div class="som-search-row">
                  <div class="som-search-wrap">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="som-search-icon"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input
                      v-model="somQuery"
                      ref="somInput"
                      class="som-search-input"
                      placeholder="Buscar músicas, artistas..."
                      @input="onSomQueryInput"
                      @keyup.enter="buscarMusicas"
                    />
                    <span v-if="somCarregando" class="som-loading-dot" />
                    <button v-if="somQuery && !somCarregando" class="som-clear" @click="limparBuscaSom">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                  </div>
                  <button class="som-close" @click="fecharPainelSom">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>

                <!-- Filtros de gênero -->
                <div class="som-generos">
                  <button
                    v-for="g in generos" :key="g.val"
                    class="genero-chip" :class="{ active: generoAtivo === g.val }"
                    @click="selecionarGenero(g.val)"
                  >{{ g.label }}</button>
                </div>

                <!-- Lista -->
                <div class="som-lista" ref="somLista">
                  <div v-if="somCarregando && !resultadosSom.length" class="som-skeleton-list">
                    <div v-for="i in 6" :key="i" class="som-skeleton-item" :style="{ animationDelay: (i * 0.08) + 's' }" />
                  </div>

                  <div v-else-if="somErro" class="som-erro">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" style="opacity:.3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <p>{{ somErro }}</p>
                  </div>

                  <div v-else-if="!somCarregando && !resultadosSom.length" class="som-vazio">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style="opacity:.2"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    <p>Nenhum resultado encontrado</p>
                  </div>

                  <div
                    v-for="musica in resultadosSom" :key="musica.id"
                    class="som-item" :class="{ tocando: somPreviewId === musica.id }"
                    @click="selecionarSom(musica)"
                  >
                    <div class="som-item-cover" @click.stop="previewSomLista(musica)">
                      <img v-if="musica.cover && !musica.coverErro" :src="musica.cover" class="som-item-img" @error="musica.coverErro = true" />
                      <div v-if="!musica.cover || musica.coverErro" class="som-item-img-placeholder">
                        <svg viewBox="0 0 24 24" fill="white" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                      </div>
                      <div class="som-item-play-btn">
                        <svg v-if="somPreviewId !== musica.id" viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M8 5v14l11-7z"/></svg>
                        <svg v-else viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      </div>
                      <div v-if="somPreviewId === musica.id" class="som-eq">
                        <span /><span /><span /><span />
                      </div>
                    </div>

                    <div class="som-item-info">
                      <p class="som-item-nome">{{ musica.nomeExibicao }}</p>
                      <p class="som-item-artista">
                        {{ musica.artistaExibicao }}
                        <span class="som-item-gtag">{{ musica.generoLabel }}</span>
                      </p>
                    </div>

                    <div class="som-item-right">
                      <span class="som-item-dur">{{ musica.duracao }}</span>
                      <button class="som-item-sel" @click.stop="selecionarSom(musica)" title="Usar este som">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <audio ref="audioLista" @ended="somPreviewId = null" @error="onAudioError" />

                <div class="som-painel-footer">
                  <span class="som-credits">
                    Áudio via <strong>iTunes Search API</strong> · Preview 30s · Apple Inc.
                  </span>
                </div>
              </div>
            </div>

            <!-- Capa -->
            <div class="fgroup">
              <label class="flabel">Capa do vídeo</label>
              <div class="capa-row">
                <div v-for="(cap, i) in capas" :key="i" class="capa-card" :class="{ sel: capaAtiva === i }" @click="capaAtiva = i">
                  <div class="capa-thumb">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" width="16" height="16"><path d="M4 4h12v12H4z"/><path d="M8 8l4 2-4 2z" fill="currentColor" stroke="none"/></svg>
                  </div>
                  <span>{{ cap }}</span>
                </div>
              </div>
            </div>

            <!-- Visibilidade -->
            <div class="fgroup">
              <label class="flabel">Visibilidade</label>
              <div class="vis-row">
                <label
                  v-for="op in privacidades" :key="op.val"
                  class="vis-opt"
                  :class="{ sel: privacidade === op.val, disabled: forYouEfetivo && op.val !== 'publico' }"
                >
                  <input type="radio" :value="op.val" v-model="privacidade" class="hidden" :disabled="forYouEfetivo && op.val !== 'publico'" />
                  <div class="vis-icon">{{ op.icon }}</div>
                  <div>
                    <span class="vis-label">{{ op.label }}</span>
                    <span class="vis-sub">{{ op.sub }}</span>
                  </div>
                </label>
              </div>
              <p v-if="forYouEfetivo" class="vis-hint">O modo <strong>For You</strong> requer visibilidade pública.</p>
            </div>

       
            <div class="fgroup">
              <div class="foryou-row" :class="{ active: forYouEfetivo }">
                <div class="foryou-left">
                  <div class="foryou-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                  </div>
                  <div>
                    <span class="foryou-label">For You</span>
                    <span class="foryou-sub">
                      {{ somSelecionado
                        ? '🎵 Ativado automaticamente com a música'
                        : (forYou ? 'Recomendado para novos usuários' : 'Ativar recomendação no For You') }}
                    </span>
                  </div>
                  <span v-if="somSelecionado" class="foryou-badge">🎵 Auto</span>
                </div>
                <button
                  class="toggle"
                  :class="{ on: forYouEfetivo }"
                  @click="somSelecionado ? null : (forYou = !forYou)"
                  :style="somSelecionado ? 'opacity:0.6;cursor:not-allowed' : ''"
                  :aria-checked="forYouEfetivo"
                  role="switch"
                >
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>

            <!-- Barra de progresso do upload -->
            <div v-if="publicando" class="upload-progress-wrap">
              <div class="upload-progress-header">
                <div class="upload-progress-label-wrap">
                  <div class="upload-spinner" />
                  <span class="upload-progress-label">{{ uploadFase }}</span>
                </div>
                <span class="upload-progress-pct">{{ uploadProgresso }}%</span>
              </div>
              <div class="upload-progress-bar">
                <div class="upload-progress-fill" :style="{ width: uploadProgresso + '%' }" />
                <div class="upload-progress-shimmer" :style="{ left: uploadProgresso + '%' }" />
              </div>
              <p class="upload-progress-sub">{{ uploadFase === 'Enviando' ? 'Enviando arquivo para o servidor…' : uploadFase === 'Salvando' ? 'Salvando informações do vídeo…' : '🎉 Publicado com sucesso!' }}</p>
            </div>

            <!-- Ações -->
            <div class="factions">
              <button class="btn-ghost" @click="etapa = 1" :disabled="publicando">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13"><path d="M13 8H3M7 4L3 8l4 4"/></svg>
                Voltar
              </button>
              <button class="btn-outline" @click="salvarRascunho" :disabled="publicando">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" width="13" height="13"><path d="M13 10v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2"/><path d="M8 3v7M5 7l3 3 3-3"/></svg>
                Rascunho
              </button>
              <button class="btn-primary" :disabled="!descricao.trim() || publicando" @click="publicar">
                <div v-if="publicando" class="btn-spinner" />
                <svg v-else viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M2 13L14 8 2 3v4l8 1-8 1z"/></svg>
                {{ publicando ? uploadFase + '…' : 'Publicar agora' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </transition>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toastMsg" class="toast" :class="toastTipo">
        <div class="toast-dot" />
        {{ toastMsg }}
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { supabase } from '../supabase.js'
import { authState } from '../auth.js'

// ─────────────────────────────────────────────────────────────
// iTunes Search API — gratuita, sem chave, sem CORS, preview mp3 30s real

const somTrechoInicio = ref(0)
const somTrechoDuracao = 15

const GENEROS = [
  { val: 'trending',  label: 'Em Alta',   query: 'anitta mc luisa sonza ludmilla' },
  { val: 'sertanejo', label: 'Sertanejo', query: 'jorge mateus marilia mendonca henrique juliano' },
  { val: 'funk',      label: 'Funk',       query: 'mc kevinho pabllo vittar funk brasil' },
  { val: 'pagode',    label: 'Pagode',     query: 'pagode thiaguinho dilsinho sorriso maroto' },
  { val: 'forro',     label: 'Forró',      query: 'forro xand aviao wesley safadao' },
  { val: 'axe',       label: ' Axé',        query: 'axe ivete sangalo claudia leitte' },
  { val: 'samba',     label: 'Samba',      query: 'samba zeca pagodinho diogo nogueira' },
  { val: 'pop_br',    label: 'Pop BR',     query: 'pop brasil anitta pabllo vittar luisa' },
]

// ── Estado geral ──
const etapa            = ref(1)
const isDragging       = ref(false)
const videoSelecionado = ref(false)
const videoURL         = ref('')
const videoNome        = ref('')
const descricao        = ref('')
const capaAtiva        = ref(0)
const privacidade      = ref('publico')
const toastMsg         = ref('')
const toastTipo        = ref('')
const arquivoVideo     = ref(null)
const publicando       = ref(false)
const forYou           = ref(false)
const fileInput        = ref(null)
const textareaFocused  = ref(false)

// ── Upload progress ──
const uploadProgresso  = ref(0)
const uploadFase       = ref('Enviando')

const tagsSugeridas = ['sertanejo', 'funk', 'pagode', 'viral', 'fyp', 'trending', 'brasil']
const capas         = ['Auto', '1s', '3s', '5s']
const generos       = GENEROS

const privacidades = [
  { val: 'publico', icon: '', label: 'Público',  sub: 'Todos podem ver'  },
  { val: 'amigos',  icon: '', label: 'Amigos',   sub: 'Quem você segue'  },
  { val: 'privado', icon: '', label: 'Privado',  sub: 'Somente você'     },
]

const configs = ref([
  { id: 'comentarios', label: 'Comentários', sub: 'Permitir comentários',       ativo: true  },
  { id: 'dueto',       label: 'Dueto',       sub: 'Permitir criação de duetos', ativo: true  },
  { id: 'stitch',      label: 'Stitch',      sub: 'Permitir uso de trechos',    ativo: false },
  { id: 'download',    label: 'Download',    sub: 'Permitir baixar o vídeo',    ativo: true  },
])

const perfilUsername = computed(() =>
  authState.profile?.username
  ?? authState.user?.email?.split('@')[0]
  ?? 'usuario'
)

const forYouEfetivo = computed(() => forYou.value || !!somSelecionado.value)

const TAMANHO_MAX_MB = 500
const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024

function onTrechoChange() {
  if (!audioPreview.value || !somSelecionado.value?.audioUrl) return
  const estava = !audioPreview.value.paused
  audioPreview.value.currentTime = somTrechoInicio.value
  if (estava) audioPreview.value.play().catch(() => {})
}

function onFileChange(e) { const f = e.target.files[0]; if (f) carregarVideo(f) }
function onDrop(e) {
  isDragging.value = false
  const f = e.dataTransfer.files[0]
  if (f && f.type.startsWith('video/')) carregarVideo(f)
  else mostrarToast('Selecione um arquivo de vídeo válido.')
}
function carregarVideo(file) {
  if (file.size > TAMANHO_MAX_BYTES) {
    const tamanhoMB = (file.size / 1024 / 1024).toFixed(1)
    mostrarToast(`Arquivo muito grande (${tamanhoMB} MB). Limite: ${TAMANHO_MAX_MB} MB.`, 'erro')
    if (fileInput.value) fileInput.value.value = ''
    return
  }
  arquivoVideo.value = file
  videoURL.value = URL.createObjectURL(file)
  videoNome.value = file.name
  videoSelecionado.value = true
}
function trocarVideo() {
  arquivoVideo.value = null; videoSelecionado.value = false
  videoURL.value = ''; videoNome.value = ''
}
function adicionarTag(tag) {
  if (!descricao.value.includes('#' + tag))
    descricao.value = (descricao.value + ' #' + tag).trim()
}
function salvarRascunho() { mostrarToast('Rascunho salvo ✓') }

async function publicar() {
  if (!arquivoVideo.value) { mostrarToast('Selecione um vídeo.', 'erro'); return }
  if (!authState.user)     { mostrarToast('Você precisa estar logado.', 'erro'); return }

  publicando.value = true
  uploadProgresso.value = 0
  uploadFase.value = 'Enviando'

  let progressTimer = null
  function startFakeProgress() {
    uploadProgresso.value = 5
    progressTimer = setInterval(() => {
      if (uploadProgresso.value < 78) {
        const step = Math.max(1, Math.floor((80 - uploadProgresso.value) / 8))
        uploadProgresso.value = Math.min(78, uploadProgresso.value + step)
      }
    }, 300)
  }
  function stopFakeProgress() {
    clearInterval(progressTimer)
    progressTimer = null
  }

  try {
    if (audioPreview.value) audioPreview.value.pause()

    const userId   = authState.user.id
    const ext      = arquivoVideo.value.name.split('.').pop()
    const nomeSafo = arquivoVideo.value.name
                       .replace(/\.[^.]+$/, '')
                       .replace(/[^a-z0-9_\-]/gi, '_')
                       .slice(0, 60)
    const fileName = `${userId}/${Date.now()}_${nomeSafo}.${ext}`

    startFakeProgress()
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, arquivoVideo.value, {
        contentType: arquivoVideo.value.type || 'video/mp4',
        upsert: true,
      })
    stopFakeProgress()
    if (uploadError) throw uploadError

    const { data: { publicUrl: videoPublicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    uploadProgresso.value = 85
    uploadFase.value = 'Salvando'
    uploadProgresso.value = 90

    const isForYou = forYouEfetivo.value
    const registro = {
      user_id:           userId,
      video_url:         videoPublicUrl,
      storage_path:      fileName,
      descricao:         descricao.value,
      privacidade:       privacidade.value,
      for_you:           isForYou,
      feed:              isForYou ? 'foryou' : 'following',
      som_id:            somSelecionado.value?.id              ?? null,
      som_nome:          somSelecionado.value?.nomeExibicao    ?? null,
      som_artista:       somSelecionado.value?.artistaExibicao ?? null,
      som_url:           somSelecionado.value?.audioUrl        ?? null,
      som_trecho_inicio: somTrechoInicio.value,

      capa_offset:       capas[capaAtiva.value],
    }

    const { error: dbError } = await supabase.from('videos').insert(registro)
    if (dbError) throw dbError

    uploadProgresso.value = 97
    await supabase.rpc('increment_videos', { uid: userId }).maybeSingle()

    uploadProgresso.value = 100
    uploadFase.value = 'Concluído'
    mostrarToast('Vídeo publicado!')

    setTimeout(() => {
      etapa.value = 1
      arquivoVideo.value = null
      videoSelecionado.value = false
      videoURL.value = ''
      videoNome.value = ''
      descricao.value = ''
      forYou.value = false
      uploadProgresso.value = 0
      uploadFase.value = 'Enviando'
      removerSom()
    }, 2200)

  } catch (err) {
    stopFakeProgress()
    console.error('[publicar]', err?.message ?? err, err?.details ?? '', err?.hint ?? '')
    mostrarToast('Erro ao publicar: ' + (err.message || 'Tente novamente.'), 'erro')
  } finally {
    publicando.value = false
  }
}

function mostrarToast(msg, tipo = '') {
  toastMsg.value  = msg
  toastTipo.value = tipo
  setTimeout(() => { toastMsg.value = ''; toastTipo.value = '' }, 2800)
}

// ── SOM — estado ──
const somSelecionado  = ref(null)
const somTocando      = ref(false)
const somPainelAberto = ref(false)
const somQuery        = ref('')
const resultadosSom   = ref([])
const somCarregando   = ref(false)
const somPreviewId    = ref(null)
const somErro         = ref('')
const generoAtivo     = ref('trending')
const audioPreview    = ref(null)
const audioLista      = ref(null)
const somInput        = ref(null)
const somLista        = ref(null)
const audioCache      = {}
let   somDebounce     = null

watch(somSelecionado, (val) => {
  if (val) {
    forYou.value = true
    privacidade.value = 'publico'
  }
})

watch(forYou, (val) => {
  if (val) {
    privacidade.value = 'publico'
  } else if (somSelecionado.value) {
    nextTick(() => { forYou.value = true })
  }
})

function abrirPesquisaSom() {
  somPainelAberto.value = true; somErro.value = ''
  generoAtivo.value = 'trending'; somQuery.value = ''
  nextTick(() => somInput.value?.focus())
  buscarPorGenero('trending')
}
function fecharPainelSom() { somPainelAberto.value = false; pararPreviewLista() }
function trocarSom() { removerSom(); abrirPesquisaSom() }
function removerSom() {
  pararPreviewSelecionado()
  somSelecionado.value = null
  somTocando.value = false
}
function togglePreviewSom() {
  if (!audioPreview.value) return
  if (somTocando.value) { audioPreview.value.pause(); somTocando.value = false }
  else { audioPreview.value.play().catch(() => mostrarToast('Não foi possível reproduzir.')); somTocando.value = true }
}
function pararPreviewSelecionado() {
  if (audioPreview.value) { audioPreview.value.pause(); audioPreview.value.src = '' }
  somTocando.value = false
}
function pararPreviewLista() {
  if (audioLista.value) { audioLista.value.pause(); audioLista.value.src = '' }
  somPreviewId.value = null
}
function previewSomLista(musica) {
  if (!audioLista.value) return
  if (!musica.audioUrl) { mostrarToast('Sem preview disponível.'); return }
  if (somPreviewId.value === musica.id) { pararPreviewLista(); return }
  pararPreviewLista()
  somPreviewId.value = musica.id
  audioLista.value.src = musica.audioUrl
  audioLista.value.play().catch(() => { somPreviewId.value = null; mostrarToast('Não foi possível reproduzir.') })
}
function selecionarSom(musica) {
  pararPreviewLista()
  somSelecionado.value = musica
  somTrechoInicio.value = 0
  somPainelAberto.value = false
  somTocando.value = false
}
function onAudioError() { somPreviewId.value = null }
function onSomQueryInput() {
  clearTimeout(somDebounce)
  somDebounce = setTimeout(() => {
    if (somQuery.value.trim().length >= 2) buscarMusicas()
    else if (!somQuery.value.trim()) buscarPorGenero(generoAtivo.value)
  }, 400)
}
function limparBuscaSom() {
  somQuery.value = ''; buscarPorGenero(generoAtivo.value)
  nextTick(() => somInput.value?.focus())
}
function selecionarGenero(val) { generoAtivo.value = val; somQuery.value = ''; buscarPorGenero(val) }

async function buscarMusicas() {
  const q = somQuery.value.trim(); if (!q) return
  const cacheKey = 'q:' + q.toLowerCase()
  if (audioCache[cacheKey]) { resultadosSom.value = audioCache[cacheKey]; return }
  await fetchItunes({ term: q }, cacheKey)
}

async function buscarPorGenero(val) {
  const g = GENEROS.find(x => x.val === val); if (!g) return
  const cacheKey = 'g:' + val
  if (audioCache[cacheKey]) { resultadosSom.value = audioCache[cacheKey]; return }
  await fetchItunes({ term: g.query }, cacheKey, g.label)
}

async function fetchItunes(params, cacheKey, generoLabel = '') {
  somCarregando.value = true; somErro.value = ''; resultadosSom.value = []
  try {
    const qs = new URLSearchParams({
      country: 'BR', media: 'music', entity: 'song',
      lang: 'pt_br', explicit: 'No', limit: '40',
      ...params,
    })

    let data
    try {
      const res = await fetch(`https://itunes.apple.com/search?${qs}`)
      data = await res.json()
    } catch {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://itunes.apple.com/search?' + qs)}`
      const res = await fetch(proxied)
      data = await res.json()
    }

    const tracks = (data.results ?? []).filter(t => t.previewUrl)
    if (!tracks.length) {
      somErro.value = 'Nenhum resultado com preview. Tente outro termo.'; return
    }

    const lista = tracks.map(t => {
      const rawCover = (t.artworkUrl100 || '').replace('100x100', '200x200')
      const proxiedCover = rawCover
        ? `https://images.weserv.nl/?url=${encodeURIComponent(rawCover)}&w=200&h=200&fit=cover`
        : ''

      return {
        id:              String(t.trackId),
        nomeExibicao:    t.trackName,
        artistaExibicao: t.artistName,
        generoLabel:     t.primaryGenreName || generoLabel || '🎵 Música',
        cover:           proxiedCover,
        coverErro:       false,
        audioUrl:        t.previewUrl,
        duracao:         formatarDuracao(Math.floor((t.trackTimeMillis ?? 30000) / 1000)),
      }
    })

    audioCache[cacheKey] = lista
    resultadosSom.value  = lista
  } catch (e) {
    somErro.value = 'Erro ao buscar músicas. Verifique sua conexão.'
    console.error('[iTunes]', e)
  } finally { somCarregando.value = false }
}

function formatarDuracao(seg) {
  const s = Math.floor(seg)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:    #070709;
  --bg2:   #0e0e12;
  --bg3:   #14141a;
  --bg4:   #1b1b24;
  --bd:    #222230;
  --bd2:   #2c2c3e;
  --tx:    #ededf5;
  --tx2:   #7e7e9a;
  --tx3:   #3e3e55;
  --acc:   #ff3a6e;
  --acc2:  #ff7b38;
  --gold:  #ffb547;
  --grad:  linear-gradient(135deg, #ff3a6e 0%, #ff7b38 100%);
  --grad2: linear-gradient(135deg, #ff3a6e44, #ff7b3822);
  --ff:    'DM Sans', sans-serif;
  --ffm:   'DM Mono', monospace;
  --radius: 14px;
  --shadow-acc: 0 4px 24px rgba(255,58,110,.22);
}

.upload-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--ff);
  color: var(--tx);
}
.hidden { display: none; }

/* ─── HEADER ─── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  border-bottom: 1px solid var(--bd);
  background: rgba(7,7,9,.92);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
  gap: 16px;
  position: relative;
}
.header::after {
  content: '';
  position: absolute;
  inset: 0 0 -1px;
  background: linear-gradient(90deg, transparent, rgba(255,58,110,.06), transparent);
  pointer-events: none;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.back-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1px solid var(--bd);
  background: var(--bg3);
  color: var(--tx2);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .2s;
  flex-shrink: 0;
}
.back-btn:hover { border-color: var(--acc); color: var(--acc); background: rgba(255,58,110,.08); }
.back-btn svg { width: 16px; height: 16px; }
.header-title { font-size: 17px; font-weight: 700; letter-spacing: -.5px; line-height: 1; }
.header-sub { font-size: 12px; color: var(--tx2); margin-top: 3px; font-weight: 400; }

/* Stepper */
.stepper { display: flex; align-items: center; gap: 8px; }
.step { display: flex; align-items: center; gap: 7px; }
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--bd2);
  background: var(--bg3);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  color: var(--tx3);
  transition: all .35s cubic-bezier(.34,1.56,.64,1);
  font-family: var(--ffm);
}
.step.active .step-dot {
  border-color: var(--acc);
  background: rgba(255,58,110,.14);
  color: var(--acc);
  box-shadow: 0 0 0 4px rgba(255,58,110,.08);
}
.step.done .step-dot {
  border-color: var(--acc);
  background: var(--acc);
  color: #fff;
  box-shadow: 0 0 12px rgba(255,58,110,.4);
}
.step.done .step-dot svg { width: 11px; height: 11px; }
.step-label { font-size: 12px; color: var(--tx3); font-weight: 500; transition: color .3s; }
.step.active .step-label, .step.done .step-label { color: var(--tx2); }
.step-line {
  width: 36px; height: 2px;
  background: var(--bd);
  border-radius: 1px;
  overflow: hidden;
  position: relative;
}
.step-line-fill {
  position: absolute;
  inset: 0;
  background: var(--grad);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform .5s cubic-bezier(.65,0,.35,1);
  border-radius: 1px;
}
.step-line.done .step-line-fill { transform: scaleX(1); }

/* ─── STEP CONTENT ─── */
.step-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bd) transparent;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.step-content.step2 { padding: 28px; }

/* ─── DROP ZONE ─── */
.drop-zone {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  border: 1.5px dashed var(--bd2);
  border-radius: 22px;
  min-height: 360px;
  background: var(--bg2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .3s cubic-bezier(.4,0,.2,1);
  position: relative;
  overflow: hidden;
}
.drop-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad2);
  opacity: 0;
  transition: opacity .3s;
  border-radius: inherit;
}
.drop-zone:hover { border-color: rgba(255,58,110,.5); background: rgba(255,58,110,.03); }
.drop-zone:hover::before { opacity: 1; }
.drop-zone.dragging {
  border-color: var(--acc);
  border-style: solid;
  background: rgba(255,58,110,.06);
  transform: scale(1.015);
  box-shadow: 0 0 0 4px rgba(255,58,110,.1), inset 0 0 60px rgba(255,58,110,.06);
}
.drop-zone.dragging::before { opacity: 1; }
.drop-zone.has-video {
  border-style: solid;
  border-color: rgba(255,123,56,.4);
  cursor: default;
  min-height: 400px;
}

/* Partículas drag */
.drag-particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--acc);
  opacity: 0;
  animation: particle-float 1.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
  left: calc(10% + var(--i) * 11%);
  top: 50%;
}
@keyframes particle-float {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  30%  { opacity: .7; transform: translateY(-40px) scale(1); }
  100% { opacity: 0; transform: translateY(-90px) scale(.5); }
}

.drop-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 48px 36px;
  text-align: center;
  position: relative;
  z-index: 1;
}
.drop-icon-wrap { margin-bottom: 4px; }
.drop-icon {
  width: 96px; height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.drop-icon svg { width: 42px; height: 42px; color: var(--acc); z-index: 1; position: relative; }
.icon-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,58,110,.2);
  animation: pulse-ring 2.8s ease-out infinite;
}
.ring1 { width: 96px; height: 96px; animation-delay: 0s; }
.ring2 { width: 68px; height: 68px; animation-delay: .7s; background: rgba(255,58,110,.04); }
.ring3 { width: 44px; height: 44px; animation-delay: 1.4s; background: rgba(255,58,110,.07); }
@keyframes pulse-ring {
  0%   { opacity: .8; transform: scale(.8); }
  70%  { opacity: 0;  transform: scale(1.2); }
  100% { opacity: 0; }
}
.drop-title { font-size: 21px; font-weight: 700; letter-spacing: -.5px; color: var(--tx); transition: color .2s; }
.drop-zone.dragging .drop-title { color: var(--acc); }
.drop-hint { font-size: 14px; color: var(--tx2); }
.inline-btn {
  background: none; border: none;
  color: var(--acc);
  font-size: 14px; font-family: var(--ff); font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 0;
}
.drop-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
.dtag {
  font-size: 11px; color: var(--tx3);
  background: var(--bg3); border: 1px solid var(--bd);
  border-radius: 6px; padding: 3px 9px;
  font-family: var(--ffm);
}
.dtag-sep { color: var(--tx3); font-size: 11px; }

.drop-preview { position: absolute; inset: 0; display: flex; align-items: flex-end; }
.preview-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.preview-grad { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, transparent 55%); }
.preview-info {
  position: relative; z-index: 2;
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px;
}
.preview-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,.85);
  max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 20px;
  padding: 6px 13px;
}
.change-btn {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; font-family: var(--ff);
  color: #fff;
  background: rgba(255,58,110,.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,58,110,.5);
  border-radius: 20px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all .2s;
}
.change-btn:hover { background: var(--acc); box-shadow: 0 4px 16px rgba(255,58,110,.4); }

.step1-footer {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 0;
}
.file-info {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--tx2); font-family: var(--ffm);
  max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.file-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--acc);
  flex-shrink: 0;
  box-shadow: 0 0 10px var(--acc);
  animation: blink-dot 2s ease-in-out infinite;
}
@keyframes blink-dot { 0%,100%{opacity:1;} 50%{opacity:.4;} }

/* ─── BUTTONS ─── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--grad);
  border: none; color: #fff;
  font-size: 14px; font-weight: 700; font-family: var(--ff);
  padding: 11px 22px;
  border-radius: 12px;
  cursor: pointer;
  transition: all .2s;
  box-shadow: var(--shadow-acc);
  white-space: nowrap; flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  pointer-events: none;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,58,110,.42); }
.btn-primary:active:not(:disabled) { transform: scale(.97); }
.btn-primary:disabled { opacity: .35; cursor: not-allowed; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 7px;
  background: none; border: 1px solid var(--bd);
  color: var(--tx2);
  font-size: 13px; font-weight: 600; font-family: var(--ff);
  padding: 10px 18px; border-radius: 11px;
  cursor: pointer; transition: all .2s;
}
.btn-ghost:hover:not(:disabled) { border-color: var(--bd2); color: var(--tx); background: var(--bg3); }
.btn-ghost:disabled { opacity: .35; cursor: not-allowed; }
.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  background: none; border: 1px solid rgba(255,181,71,.3);
  color: var(--gold);
  font-size: 13px; font-weight: 600; font-family: var(--ff);
  padding: 10px 18px; border-radius: 11px;
  cursor: pointer; transition: all .2s;
}
.btn-outline:hover:not(:disabled) { background: rgba(255,181,71,.07); border-color: rgba(255,181,71,.5); }
.btn-outline:disabled { opacity: .35; cursor: not-allowed; }

/* ─── FORM LAYOUT ─── */
.form-layout { display: flex; gap: 32px; align-items: flex-start; }

/* ─── PHONE MOCKUP ─── */
.preview-col {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  position: sticky; top: 0;
}
.phone-wrap { position: relative; }
.phone {
  width: 150px; height: 270px;
  border-radius: 26px;
  border: 1.5px solid var(--bd2);
  overflow: hidden;
  position: relative;
  background: var(--bg2);
  box-shadow: 0 16px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04) inset;
}
.phone-notch {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 50px; height: 18px;
  background: var(--bg);
  border-radius: 0 0 14px 14px;
  z-index: 3;
  display: flex; align-items: center; justify-content: center;
}
.phone-cam {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #1a1a2e;
  border: 1px solid #333;
  margin-top: 4px;
}
.phone-vid { width: 100%; height: 100%; object-fit: cover; display: block; }
.phone-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.9) 0%, transparent 60%);
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 12px 10px;
}
.phone-meta { flex: 1; min-width: 0; }
.phone-desc { font-size: 9.5px; color: rgba(255,255,255,.9); line-height: 1.4; margin-bottom: 3px; font-weight: 500; max-width: 88px; }
.phone-user { font-size: 8.5px; color: rgba(255,255,255,.5); font-weight: 700; }
.phone-som {
  display: flex; align-items: center; gap: 4px;
  margin-top: 5px; font-size: 8px;
  color: rgba(255,255,255,.5);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 88px;
}
.phone-som-disc {
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(135deg, var(--acc), var(--acc2));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.phone-som-disc.spinning { animation: spin-slow 3s linear infinite; }
@keyframes spin-slow { to { transform: rotate(360deg); } }
.phone-foryou {
  display: flex; align-items: center; gap: 3px;
  margin-top: 4px; font-size: 7.5px;
  color: rgba(255,58,110,.9);
  font-weight: 700; letter-spacing: .3px;
}
.phone-actions { display: flex; flex-direction: column; gap: 8px; }
.paction {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,.08);
}
.paction.like { background: rgba(255,58,110,.2); border-color: rgba(255,58,110,.2); }
.paction.music-disc {
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,.15);
  animation: spin-slow 4s linear infinite;
}
.disc-img { width: 100%; height: 100%; object-fit: cover; }
.disc-placeholder {
  width: 100%; height: 100%;
  background: var(--grad);
  display: flex; align-items: center; justify-content: center;
}
.phone-glow {
  position: absolute; bottom: -24px; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 48px;
  background: radial-gradient(ellipse, rgba(255,58,110,.35), transparent);
  filter: blur(12px);
  pointer-events: none;
}
.phone-reflection {
  position: absolute;
  top: 0; right: -40px;
  width: 30px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.03), transparent);
  transform: skewX(-10deg);
  pointer-events: none;
}
.preview-lbl {
  font-size: 11px; color: var(--tx3);
  letter-spacing: .5px; text-transform: uppercase; font-weight: 600;
  display: flex; align-items: center; gap: 5px;
}
.preview-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--acc); animation: blink-dot 2s ease-in-out infinite;
}

/* ─── FIELDS ─── */
.fields-col {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 22px;
}
.fgroup { display: flex; flex-direction: column; gap: 10px; }
.flabel-row { display: flex; align-items: center; justify-content: space-between; }
.flabel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--tx2); }
.fcount { font-size: 11px; color: var(--tx3); font-family: var(--ffm); transition: color .2s; }
.fcount.warning { color: var(--gold); }
.fcount.danger { color: var(--acc); }
.fcount-max { opacity: .5; }

.textarea-wrap {
  border-radius: 13px;
  border: 1px solid var(--bd);
  background: var(--bg2);
  transition: border-color .2s, box-shadow .2s;
  overflow: hidden;
}
.textarea-wrap.focused {
  border-color: var(--acc);
  box-shadow: 0 0 0 3px rgba(255,58,110,.1);
}
.ftextarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--tx);
  font-size: 14px; font-family: var(--ff);
  padding: 13px 14px;
  resize: none; outline: none;
  line-height: 1.65;
  color-scheme: dark;
}
.ftextarea::placeholder { color: var(--tx3); }

.tags-row { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip {
  font-size: 12px; color: var(--acc2);
  background: rgba(255,123,56,.07);
  border: 1px solid rgba(255,123,56,.2);
  border-radius: 20px; padding: 4px 12px;
  cursor: pointer; transition: all .2s; font-weight: 500;
  display: flex; align-items: center; gap: 4px;
}
.tag-chip:hover { background: rgba(255,123,56,.18); border-color: rgba(255,123,56,.45); transform: translateY(-1px); }
.tag-chip.used { color: var(--tx3); border-color: var(--bd); background: var(--bg3); cursor: default; }
.tag-check { font-size: 10px; color: var(--acc); }

/* ─── CAPA ─── */
.capa-row { display: flex; gap: 8px; }
.capa-card {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  cursor: pointer; font-size: 11px; color: var(--tx3); font-weight: 600;
  transition: all .2s;
}
.capa-card.sel { color: var(--acc); }
.capa-thumb {
  width: 56px; height: 78px;
  border-radius: 9px;
  background: var(--bg3); border: 1.5px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  transition: all .2s; color: var(--tx3);
}
.capa-card:hover .capa-thumb { border-color: var(--bd2); transform: translateY(-2px); }
.capa-card.sel .capa-thumb {
  border-color: var(--acc);
  background: rgba(255,58,110,.08);
  color: var(--acc);
  box-shadow: 0 4px 16px rgba(255,58,110,.2);
}

/* ─── VISIBILIDADE ─── */
.vis-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.vis-opt {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 10px;
  background: var(--bg2); border: 1.5px solid var(--bd);
  border-radius: 13px; cursor: pointer; text-align: center;
  transition: all .2s;
}
.vis-opt:hover { border-color: var(--bd2); background: var(--bg3); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.3); }
.vis-opt.sel { border-color: var(--acc); background: rgba(255,58,110,.07); box-shadow: 0 0 0 1px rgba(255,58,110,.2), 0 4px 20px rgba(255,58,110,.12); }
.vis-opt.disabled { opacity: .4; cursor: not-allowed; filter: grayscale(1); transform: none; }
.vis-hint { font-size: 10px; color: var(--acc2); margin-top: 4px; font-weight: 500; }
.vis-icon { font-size: 20px; line-height: 1; }
.vis-label { display: block; font-size: 13px; font-weight: 700; color: var(--tx); margin-bottom: 2px; }
.vis-sub { font-size: 10.5px; color: var(--tx2); line-height: 1.3; }

/* ─── PERMISSÕES ─── */
.perms-list { display: flex; flex-direction: column; gap: 4px; }
.perm-item {
  display: flex; align-items: center; gap: 14px;
  padding: 13px 14px;
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 12px; transition: all .15s;
}
.perm-item:hover { background: var(--bg3); border-color: var(--bd2); transform: translateX(2px); }
.perm-text { flex: 1; }
.perm-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 2px; }
.perm-sub { font-size: 11.5px; color: var(--tx2); }

/* Toggle */
.toggle {
  width: 42px; height: 24px; border-radius: 12px;
  background: var(--bg4); border: 1px solid var(--bd2);
  position: relative; cursor: pointer; flex-shrink: 0;
  transition: all .28s cubic-bezier(.4,0,.2,1); padding: 0;
}
.toggle.on { background: var(--acc); border-color: var(--acc); box-shadow: 0 0 12px rgba(255,58,110,.35); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: rgba(255,255,255,.35);
  transition: all .28s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
.toggle.on .toggle-knob { transform: translateX(18px); background: #fff; }

/* ─── FOR YOU ─── */
.foryou-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 15px;
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 13px; transition: all .25s; gap: 12px;
}
.foryou-row.active {
  border-color: rgba(255,58,110,.4);
  background: rgba(255,58,110,.05);
  box-shadow: 0 0 0 1px rgba(255,58,110,.15);
}
.foryou-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.foryou-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: var(--bg3); border: 1px solid var(--bd);
  display: flex; align-items: center; justify-content: center;
  color: var(--tx3); flex-shrink: 0; transition: all .25s;
}
.foryou-row.active .foryou-icon {
  background: rgba(255,58,110,.12);
  border-color: rgba(255,58,110,.35);
  color: var(--acc);
  box-shadow: 0 0 12px rgba(255,58,110,.2);
}
.foryou-label { display: block; font-size: 13px; font-weight: 700; color: var(--tx); margin-bottom: 2px; }
.foryou-sub { display: block; font-size: 11px; color: var(--tx2); }
.foryou-badge {
  font-size: 9.5px; font-weight: 700;
  color: var(--acc);
  background: rgba(255,58,110,.1);
  border: 1px solid rgba(255,58,110,.25);
  border-radius: 6px; padding: 2px 7px;
  white-space: nowrap; flex-shrink: 0;
  font-family: var(--ffm);
}

/* ─── UPLOAD PROGRESS ─── */
.upload-progress-wrap {
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 13px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
  animation: fadeIn .25s ease;
}
.upload-progress-header {
  display: flex; align-items: center; justify-content: space-between;
}
.upload-progress-label-wrap { display: flex; align-items: center; gap: 8px; }
.upload-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,58,110,.2);
  border-top-color: var(--acc);
  border-radius: 50%;
  animation: spin .8s linear infinite;
  flex-shrink: 0;
}
.upload-progress-label { font-size: 13px; font-weight: 600; color: var(--tx); }
.upload-progress-pct { font-size: 13px; font-weight: 700; color: var(--acc); font-family: var(--ffm); }
.upload-progress-bar {
  height: 5px; border-radius: 3px;
  background: var(--bg4); overflow: visible; position: relative;
}
.upload-progress-fill {
  height: 100%; border-radius: 3px;
  background: var(--grad);
  transition: width .35s ease;
  box-shadow: 0 0 10px rgba(255,58,110,.5);
  position: relative;
}
.upload-progress-shimmer {
  position: absolute;
  top: -3px;
  width: 14px; height: 11px;
  background: radial-gradient(ellipse, rgba(255,255,255,.9), transparent);
  border-radius: 50%;
  transform: translateX(-50%);
  filter: blur(2px);
  pointer-events: none;
}
.upload-progress-sub {
  font-size: 11.5px; color: var(--tx2); line-height: 1.4;
}

/* ─── ACTIONS ─── */
.factions {
  display: flex; gap: 8px; justify-content: flex-end;
  padding-top: 4px; flex-wrap: wrap;
}

/* ─── SOM ─── */
.btn-escolher-som {
  display: flex; align-items: center; gap: 9px;
  width: 100%; padding: 13px 16px;
  background: var(--bg2); border: 1.5px dashed var(--bd2);
  color: var(--tx2); border-radius: 13px;
  font-size: 13px; font-weight: 600; font-family: var(--ff);
  cursor: pointer; transition: all .2s;
}
.btn-escolher-som:hover { border-color: var(--acc); color: var(--acc); background: rgba(255,58,110,.05); transform: translateY(-1px); }
.btn-som-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,58,110,.1); border: 1px solid rgba(255,58,110,.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--acc); flex-shrink: 0;
  transition: all .2s;
}
.btn-escolher-som:hover .btn-som-icon { background: rgba(255,58,110,.18); }
.btn-som-badge {
  margin-left: auto; font-size: 10px; font-weight: 700;
  color: var(--tx3); background: var(--bg3);
  border: 1px solid var(--bd); border-radius: 6px;
  padding: 2px 8px; font-family: var(--ffm);
}

/* Som selecionado */
.som-selected {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 13px;
  background: var(--bg2);
  border: 1px solid rgba(255,58,110,.35);
  border-radius: 13px;
  animation: fadeIn .25s ease;
  box-shadow: 0 0 0 1px rgba(255,58,110,.1), 0 4px 20px rgba(255,58,110,.08);
}

/* Vinyl record effect */
.som-vinyl {
  width: 44px; height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.5);
  border: 2px solid rgba(255,255,255,.1);
}
.som-vinyl.spinning { animation: spin-slow 4s linear infinite; }
.som-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.som-cover-placeholder {
  width: 100%; height: 100%;
  background: var(--grad);
  display: flex; align-items: center; justify-content: center;
}
.vinyl-hole {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 10px; height: 10px;
  border-radius: 50%; background: var(--bg);
  border: 1px solid rgba(255,255,255,.2);
  z-index: 2;
}
.som-info { flex: 1; min-width: 0; }
.som-nome { font-size: 13px; font-weight: 700; color: var(--tx); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.som-artista { font-size: 11px; color: var(--tx2); display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.som-genero-tag { font-size: 9.5px; color: var(--acc2); background: rgba(255,123,56,.1); border: 1px solid rgba(255,123,56,.2); border-radius: 4px; padding: 1px 5px; white-space: nowrap; }
.som-play {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all .2s;
  background: var(--grad); color: #fff;
  box-shadow: 0 3px 14px rgba(255,58,110,.38);
}
.som-play:hover { transform: scale(1.1); box-shadow: 0 5px 20px rgba(255,58,110,.5); }
.som-trocar, .som-remover {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .18s;
  background: var(--bg3); border: 1px solid var(--bd); color: var(--tx2);
}
.som-trocar:hover { background: var(--bg4); color: var(--tx); border-color: var(--bd2); }
.som-remover:hover { background: rgba(255,58,110,.12); border-color: rgba(255,58,110,.35); color: var(--acc); }

/* Trecho */
.trecho-wrap {
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 13px; padding: 13px 15px;
  display: flex; flex-direction: column; gap: 10px;
}
.trecho-header { display: flex; align-items: center; justify-content: space-between; }
.trecho-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: var(--tx2); }
.trecho-time { font-size: 12px; color: var(--acc); font-family: var(--ffm); font-weight: 700; }
.trecho-bar-wrap { position: relative; height: 32px; display: flex; align-items: center; }
.trecho-slider { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; z-index: 2; height: 100%; }
.trecho-bar-bg {
  width: 100%; height: 6px;
  background: var(--bg4); border-radius: 3px;
  position: relative; overflow: visible;
}
.trecho-bar-fill {
  position: absolute; top: 0; height: 100%;
  background: var(--grad); border-radius: 3px;
  transition: left .1s, width .1s;
  box-shadow: 0 0 10px rgba(255,58,110,.45);
}
.trecho-thumb-indicator {
  position: absolute; top: 50%;
  transform: translate(-50%, -50%);
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.5), 0 0 0 3px rgba(255,58,110,.3);
  transition: left .1s;
  z-index: 1;
}
.trecho-hint { font-size: 10.5px; color: var(--tx3); }

/* Painel de busca */
.som-painel {
  background: var(--bg2); border: 1px solid var(--bd);
  border-radius: 15px; overflow: hidden;
  animation: fadeIn .22s ease;
  box-shadow: 0 8px 32px rgba(0,0,0,.4);
}
.som-search-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 10px 8px;
  border-bottom: 1px solid var(--bd);
}
.som-search-wrap {
  flex: 1; display: flex; align-items: center; gap: 8px;
  background: var(--bg3); border: 1px solid var(--bd);
  border-radius: 11px; padding: 8px 12px;
  transition: border-color .2s, box-shadow .2s;
}
.som-search-wrap:focus-within { border-color: var(--acc); box-shadow: 0 0 0 3px rgba(255,58,110,.1); }
.som-search-icon { color: var(--tx3); flex-shrink: 0; }
.som-search-input { flex: 1; background: none; border: none; outline: none; color: var(--tx); font-size: 13px; font-family: var(--ff); }
.som-search-input::placeholder { color: var(--tx3); }
.som-clear { background: none; border: none; color: var(--tx3); cursor: pointer; padding: 2px; display: flex; align-items: center; transition: color .15s; }
.som-clear:hover { color: var(--tx); }
.som-loading-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--acc); flex-shrink: 0; animation: pulse-dot .8s infinite alternate; }
@keyframes pulse-dot { from{opacity:.3;} to{opacity:1;} }
.som-close {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: var(--bg3); border: 1px solid var(--bd);
  color: var(--tx2); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.som-close:hover { background: var(--bg4); color: var(--tx); }

.som-generos {
  display: flex; gap: 6px; padding: 8px 10px;
  border-bottom: 1px solid var(--bd);
  overflow-x: auto; scrollbar-width: none;
}
.som-generos::-webkit-scrollbar { display: none; }
.genero-chip {
  font-size: 11.5px; font-weight: 600; font-family: var(--ff);
  color: var(--tx3); background: var(--bg3); border: 1px solid var(--bd);
  border-radius: 20px; padding: 4px 12px; cursor: pointer;
  white-space: nowrap; transition: all .2s;
}
.genero-chip:hover { color: var(--tx2); border-color: var(--bd2); transform: translateY(-1px); }
.genero-chip.active { color: var(--acc); border-color: rgba(255,58,110,.45); background: rgba(255,58,110,.09); }

.som-lista { max-height: 290px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--bd) transparent; }
.som-lista::-webkit-scrollbar { width: 3px; }
.som-lista::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 2px; }

.som-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; cursor: pointer;
  transition: all .15s; border-bottom: 1px solid rgba(255,255,255,.03);
}
.som-item:last-child { border-bottom: none; }
.som-item:hover { background: var(--bg3); }
.som-item.tocando { background: rgba(255,58,110,.07); border-left: 2px solid var(--acc); }

.som-item-cover {
  width: 42px; height: 42px; border-radius: 9px; flex-shrink: 0;
  position: relative; overflow: hidden; cursor: pointer;
  background: var(--bg4); display: flex; align-items: center; justify-content: center;
}
.som-item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.som-item-img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #1e1e2e, #2e1e2e); display: flex; align-items: center; justify-content: center; }
.som-item-play-btn {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .15s;
}
.som-item-cover:hover .som-item-play-btn { opacity: 1; }
.som-item.tocando .som-item-play-btn { opacity: 1; background: rgba(255,58,110,.55); }

.som-eq { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); display: flex; align-items: flex-end; gap: 1.5px; height: 10px; }
.som-eq span { display: block; width: 2px; background: #fff; border-radius: 1px; animation: eq-bar .6s ease-in-out infinite alternate; }
.som-eq span:nth-child(1){height:4px;animation-delay:0s;}
.som-eq span:nth-child(2){height:8px;animation-delay:.1s;}
.som-eq span:nth-child(3){height:6px;animation-delay:.2s;}
.som-eq span:nth-child(4){height:10px;animation-delay:.05s;}
@keyframes eq-bar{from{transform:scaleY(.3);}to{transform:scaleY(1);}}

.som-item-info { flex: 1; min-width: 0; }
.som-item-nome { font-size: 13px; font-weight: 600; color: var(--tx); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
.som-item-artista { font-size: 11px; color: var(--tx2); display: flex; align-items: center; gap: 5px; }
.som-item-gtag { font-size: 9.5px; color: var(--acc2); background: rgba(255,123,56,.1); border: 1px solid rgba(255,123,56,.15); border-radius: 4px; padding: 1px 5px; white-space: nowrap; flex-shrink: 0; }
.som-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
.som-item-dur { font-size: 11px; color: var(--tx3); font-family: var(--ffm); }
.som-item-sel {
  width: 27px; height: 27px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,58,110,.1); border: 1px solid rgba(255,58,110,.28);
  color: var(--acc); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.som-item-sel:hover { background: var(--acc); color: #fff; transform: scale(1.12); box-shadow: 0 3px 12px rgba(255,58,110,.4); }

.som-skeleton-list { display: flex; flex-direction: column; gap: 2px; padding: 4px; }
.som-skeleton-item {
  height: 58px; border-radius: 9px;
  background: rgba(255,255,255,.04);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}
@keyframes skeleton-pulse{0%,100%{opacity:.25;}50%{opacity:.6;}}

.som-vazio, .som-erro { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 36px 0; }
.som-vazio p, .som-erro p { font-size: 13px; color: var(--tx3); text-align: center; max-width: 260px; line-height: 1.5; }
.som-erro p { color: rgba(255,58,110,.6); }

.som-painel-footer { padding: 8px 12px; border-top: 1px solid var(--bd); background: var(--bg3); }
.som-credits { font-size: 10.5px; color: var(--tx3); }
.som-credits strong { color: var(--tx2); }

/* ─── TOAST ─── */
.toast {
  position: fixed; bottom: 28px; left: 50%;
  transform: translateX(-50%);
  background: var(--bg3); color: var(--tx);
  border: 1px solid var(--bd2);
  padding: 12px 22px; border-radius: 30px;
  font-size: 13px; font-weight: 600; z-index: 500;
  white-space: nowrap;
  display: flex; align-items: center; gap: 9px;
  box-shadow: 0 10px 40px rgba(0,0,0,.55);
  backdrop-filter: blur(16px);
}
.toast.erro { border-color: rgba(255,58,110,.4); background: rgba(20,10,14,.92); }
.toast.erro .toast-dot { background: #ff6b6b; box-shadow: 0 0 10px #ff6b6b; }
.toast-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 10px var(--acc); flex-shrink: 0; }

/* ─── TRANSITIONS ─── */
.slide-fade-enter-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.slide-fade-leave-active { transition: all .22s cubic-bezier(.4,0,.2,1); }
.slide-fade-enter-from { opacity: 0; transform: translateX(18px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-18px); }

.fade-enter-active, .fade-leave-active { transition: opacity .2s ease, transform .2s ease; }
.fade-enter-from { opacity: 0; transform: translateY(6px); }
.fade-leave-to   { opacity: 0; transform: translateY(-6px); }

.toast-enter-active, .toast-leave-active { transition: all .32s cubic-bezier(.34,1.56,.64,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 14px) scale(.93); }

@keyframes fadeIn { from{opacity:0;transform:translateY(5px);} to{opacity:1;transform:none;} }

/* ─── RESPONSIVE ─── */
@media (max-width: 680px) {
  .form-layout { flex-direction: column; }
  .preview-col { position: static; flex-direction: row; align-items: center; gap: 16px; }
  .phone { width: 104px; height: 186px; }
  .vis-row { grid-template-columns: 1fr; }
  .stepper { display: none; }
  .som-generos { padding: 6px 8px; }
  .step-content { padding: 20px 16px; }
  .header { padding: 14px 16px; }
}
</style>