<template>
  <div class="layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="row-between">
          <h1 class="heading">Mensagens</h1>
          <div style="display:flex;gap:6px">
            <button class="ic-btn" @click="novoGrupoOpen = true" title="Novo grupo">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </button>
            <button class="ic-btn" @click="novaConvOpen = true" title="Nova conversa">
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
          </div>
        </div>
        <div class="search-box" :class="{ on: buscaOn }">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="search-ic"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input v-model="busca" class="search-in" placeholder="Buscar..." @focus="buscaOn=true" @blur="buscaOn=false" />
          <button v-if="busca" class="search-x" @click="busca=''">✕</button>
        </div>
        <div class="filtros">
          <button v-for="f in ['Todos','Não lidas','Online']" :key="f" class="f-btn" :class="{on:filtro===f}" @click="filtro=f">{{f}}</button>
        </div>
      </div>

      <template v-if="gruposFiltrados.length">
        <div class="div-label">
          <span>Grupos</span>
          <span class="count-badge">{{ gruposFiltrados.length }}</span>
        </div>
        <div
          v-for="g in gruposFiltrados"
          :key="'grupo-' + g.id"
          class="conv-item"
          :class="{ ativa: ativaGrupo?.id === g.id, unread: g.naoLida > 0 }"
          @click="abrirGrupo(g)"
        >
          <div class="av-wrap">
            <div class="grupo-av-sidebar" :style="grupoAvatarStyle(g)">
              {{ g.nome.slice(0,2).toUpperCase() }}
            </div>
          </div>
          <div class="conv-body">
            <div class="row-between">
              <span class="conv-nome">{{ g.nome }}</span>
              <span class="conv-hora">{{ g.hora }}</span>
            </div>
            <div class="row-between">
              <p class="conv-prev">{{ g.ultima_mensagem || 'Nenhuma mensagem ainda' }}</p>
              <span v-if="g.naoLida" class="unread-dot">{{ g.naoLida }}</span>
            </div>
          </div>
        </div>
      </template>

      <div class="div-label"><span>Conversas</span><span class="count-badge">{{convsFiltradas.length}}</span></div>

      <div class="conv-list">
        <div v-for="c in convsFiltradas" :key="c.id" class="conv-item" :class="{ativa:ativa?.id===c.id,unread:c.naoLida>0}" @click="abrirConv(c)">
         <button class="del-conv-btn" @click.stop="deletarConversa(c.id)" title="Apagar conversa">
  <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
</button>
          <div class="av-wrap">
            <img :src="c.avatar" class="av46" />
            <span v-if="c.online" class="online-pip pulse" />
            <span v-else class="offline-pip" />
          </div>
          <div class="conv-body">
            <div class="row-between"><span class="conv-nome">{{c.nome}}</span><span class="conv-hora">{{c.hora}}</span></div>
            <div class="row-between">
              <p class="conv-prev"><span v-if="c.eu" class="eu-tag">Você: </span>{{c.prev}}</p>
              <span v-if="c.naoLida" class="unread-dot">{{c.naoLida}}</span>
            </div>
          </div>
        </div>
        <div v-if="!convsFiltradas.length" class="vazio">Nenhuma conversa</div>
      </div>
    </aside>

    <!-- CHAT INDIVIDUAL -->
    <section class="chat" :class="{ open: chatOpen && !ativaGrupo }">
      <template v-if="ativa && !ativaGrupo">
        <div class="chat-hd">
          <button class="ic-btn back" @click="chatOpen=false;ativa=null">
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div class="av-wrap">
            <img :src="ativa.avatar" class="av38" />
            <span v-if="ativa.online" class="online-pip pulse" />
            <span v-else class="offline-pip" />
          </div>
      <div class="flex1" @click="$router.push({ name: 'ProfileUser', params: { username: ativa.nome.replace('@','') } })" style="cursor:pointer">
            <div style="display:flex;align-items:center;gap:5px">
              <p class="chat-nome">{{ativa.nome}}</p>
              <span v-if="totalMsgs > 0" class="seq-inline-badge">🔥 {{totalMsgs}}</span>
            </div>
            <transition name="fade-txt" mode="out-in">
              <p v-if="typing" key="typing" class="chat-status typing-status">
                <span class="typing-dots"><span/><span/><span/></span> digitando...
              </p>
              <p v-else-if="ativa.online" key="online" class="chat-status on">● Ativo agora</p>
              <p v-else key="visto" class="chat-status">Visto {{ativa.hora}}</p>
            </transition>
          </div>

          <div class="hd-actions">
            <div class="bg-picker-wrap" v-click-outside="() => bgMenuOpen=false">
              <button class="ic-btn" :class="{on:bgMenuOpen}" @click="bgMenuOpen=!bgMenuOpen" title="Plano de fundo">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              </button>
              <transition name="pop">
                <div v-if="bgMenuOpen" class="bg-menu">
                  <p class="bg-menu-title">Plano de fundo</p>
                  <div class="bg-grid">
                    <button v-for="bg in backgrounds" :key="bg.id" class="bg-swatch" :class="{on: bgAtual===bg.id}" :style="bg.style" :title="bg.label" @click="setBg(bg.id)">
                      <span v-if="bgAtual===bg.id" class="bg-check">✓</span>
                    </button>
                  </div>
                </div>
              </transition>
            </div>

            <div class="seq-wrap" v-click-outside="() => seqMenuOpen=false">
              <button
                class="ic-btn seq-hd-btn"
                :class="{on:seqMenuOpen, 'seq-active': sequencia?.status==='active', 'seq-pending': sequencia?.status==='pending'}"
                @click="seqMenuOpen=!seqMenuOpen"
                title="Animal de sequência"
              >
                <span v-if="sequencia" class="seq-hd-emoji">{{sequencia.emoji}}</span>
                <svg v-else viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                <span v-if="sequencia?.status==='pending'" class="seq-status-dot pending-dot" />
                <span v-else-if="sequencia?.status==='active'" class="seq-status-dot active-dot" />
              </button>

              <transition name="pop">
                <div v-if="seqMenuOpen" class="seq-menu-tiktok">

                  <div class="smt-header">
                    <button class="smt-close" @click="seqMenuOpen=false">✕</button>
                    <div class="smt-title-badge"><span>✏️</span> Animal da sequência</div>
                    <div style="width:28px"/>
                  </div>

                  <div class="smt-days-row">
                    <div>
                      <div class="smt-days-label">Mensagens</div>
                      <div class="smt-days-num">{{ totalMsgs }}</div>
                    </div>
                    <div class="smt-avatars">
                      <img :src="ativa?.avatar" class="smt-av" />
                      <div class="smt-av smt-av-eu">{{ (authState.user?.user_metadata?.username || 'EU').slice(0,2).toUpperCase() }}</div>
                    </div>
                  </div>

                  <div class="smt-mascot-wrap">
                    <div class="smt-mascot" :class="{'smt-mascot--active': sequencia?.status==='active'}">
                      <svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width="90" height="98">
                        <defs>
                          <radialGradient id="smtBodyGrad" cx="40%" cy="30%">
                            <stop offset="0%" :stop-color="seqCores[seqCustom.cor][0]"/>
                            <stop offset="60%" :stop-color="seqCores[seqCustom.cor][1]"/>
                            <stop offset="100%" :stop-color="seqCores[seqCustom.cor][2]"/>
                          </radialGradient>
                          <radialGradient id="smtEyeGrad" cx="35%" cy="30%">
                            <stop offset="0%" stop-color="#8B4513"/>
                            <stop offset="100%" stop-color="#3D1800"/>
                          </radialGradient>
                        </defs>
                        <ellipse cx="60" cy="126" rx="30" ry="5" fill="rgba(150,60,0,.15)"/>
                        <path d="M20 36 C14 26 22 14 30 20 C26 26 24 34 26 40Z" :fill="seqCores[seqCustom.cor][1]"/>
                        <path d="M100 36 C106 26 98 14 90 20 C94 26 96 34 94 40Z" :fill="seqCores[seqCustom.cor][1]"/>
                        <path d="M60 12 C32 12 16 32 16 58 C16 84 32 106 60 112 C88 106 104 84 104 58 C104 32 88 12 60 12Z" fill="url(#smtBodyGrad)"/>
                        <path d="M18 62 C6 56 2 70 10 74 C16 78 22 72 24 66Z" fill="url(#smtBodyGrad)"/>
                        <path d="M102 62 C114 56 118 70 110 74 C104 78 98 72 96 66Z" fill="url(#smtBodyGrad)"/>
                        <path d="M42 108 C36 116 34 124 44 126 C52 127 54 118 52 110Z" fill="url(#smtBodyGrad)"/>
                        <path d="M78 108 C84 116 86 124 76 126 C68 127 66 118 68 110Z" fill="url(#smtBodyGrad)"/>
                        <ellipse cx="42" cy="126" rx="10" ry="5" :fill="seqCores[seqCustom.cor][2]"/>
                        <ellipse cx="78" cy="126" rx="10" ry="5" :fill="seqCores[seqCustom.cor][2]"/>
                        <ellipse cx="46" cy="54" rx="12" ry="14" fill="#fff"/>
                        <ellipse cx="74" cy="54" rx="12" ry="14" fill="#fff"/>
                        <circle cx="48" cy="56" r="8" fill="url(#smtEyeGrad)"/>
                        <circle cx="76" cy="56" r="8" fill="url(#smtEyeGrad)"/>
                        <circle cx="51" cy="52" r="3" fill="white" opacity="0.9"/>
                        <circle cx="79" cy="52" r="3" fill="white" opacity="0.9"/>
                        <circle cx="49" cy="57" r="3.5" fill="#1a0800"/>
                        <circle cx="77" cy="57" r="3.5" fill="#1a0800"/>
                        <path d="M38 42 Q46 38 54 41" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M66 41 Q74 38 82 42" stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <path d="M50 76 Q60 86 70 76" stroke="#C44000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <!-- CHAPÉU -->
                        <g v-if="seqCustom.chapeu==='coroa'">
                          <rect x="38" y="4" width="44" height="14" rx="2" fill="#FFD700"/>
                          <polygon points="38,18 46,6 52,16 60,4 68,16 74,6 82,18" fill="#FFD700"/>
                          <circle cx="60" cy="5" r="3" fill="#FF4444"/>
                          <circle cx="46" cy="7" r="2" fill="#FF4444"/>
                          <circle cx="74" cy="7" r="2" fill="#FF4444"/>
                        </g>
                        <g v-else-if="seqCustom.chapeu==='bone'">
                          <ellipse cx="60" cy="14" rx="28" ry="10" fill="#333"/>
                          <rect x="32" y="10" width="56" height="8" rx="4" fill="#222"/>
                          <rect x="60" y="4" width="20" height="6" rx="3" fill="#555"/>
                        </g>
                        <g v-else-if="seqCustom.chapeu==='festa'">
                          <polygon points="60,0 42,22 78,22" fill="#FF6B9D"/>
                          <polygon points="60,0 42,22 51,22" fill="#FF9A3C" opacity="0.6"/>
                          <circle cx="60" cy="0" r="3" fill="#FFD700"/>
                          <line x1="42" y1="22" x2="38" y2="30" stroke="#FF6B9D" stroke-width="1.5"/>
                          <circle cx="38" cy="31" r="2" fill="#FF6B9D"/>
                          <line x1="78" y1="22" x2="82" y2="30" stroke="#FFD700" stroke-width="1.5"/>
                          <circle cx="82" cy="31" r="2" fill="#FFD700"/>
                        </g>
                        <!-- ÓCULOS -->
                        <g v-if="seqCustom.oculos==='sol'">
                          <rect x="34" y="48" width="22" height="14" rx="7" fill="rgba(0,0,0,.5)"/>
                          <rect x="64" y="48" width="22" height="14" rx="7" fill="rgba(0,0,0,.5)"/>
                          <line x1="56" y1="55" x2="64" y2="55" stroke="#555" stroke-width="2"/>
                          <line x1="34" y1="55" x2="28" y2="53" stroke="#555" stroke-width="2"/>
                          <line x1="86" y1="55" x2="92" y2="53" stroke="#555" stroke-width="2"/>
                        </g>
                        <g v-else-if="seqCustom.oculos==='coracao'">
                          <path d="M36 50 C36 47 40 46 42 49 C44 46 48 47 48 50 C48 53 42 58 42 58 C42 58 36 53 36 50Z" fill="#FF6B9D"/>
                          <path d="M66 50 C66 47 70 46 72 49 C74 46 78 47 78 50 C78 53 72 58 72 58 C72 58 66 53 66 50Z" fill="#FF6B9D"/>
                          <line x1="56" y1="54" x2="66" y2="54" stroke="#FF6B9D" stroke-width="2"/>
                          <line x1="36" y1="54" x2="30" y2="52" stroke="#FF6B9D" stroke-width="2"/>
                          <line x1="78" y1="54" x2="84" y2="52" stroke="#FF6B9D" stroke-width="2"/>
                        </g>
                      </svg>
                    </div>
                  </div>

                  <!-- NOME EDITÁVEL -->
                  <div class="smt-nome-section">
                    <div class="smt-nome-row">
                      <template v-if="!seqNomeEdit">
                        <span class="smt-nome-txt">{{ nomeExibido }}</span>
                        <button class="smt-nome-edit-btn" @click="seqNomeEdit=true; seqNomeTemp=nomeExibido">✏️</button>
                      </template>
                      <template v-else>
                        <input v-model="seqNomeTemp" class="smt-nome-input" maxlength="20" autofocus @keydown.enter="salvarNome" @keydown.esc="seqNomeEdit=false" />
                        <button class="smt-nome-save-btn" @click="salvarNome">✓</button>
                        <button class="smt-nome-cancel-btn" @click="seqNomeEdit=false">✕</button>
                      </template>
                    </div>
                  </div>

                  <!-- ROUPAS -->
                  <div class="smt-roupa-section">
                    <button class="smt-roupa-toggle" @click="seqRoupaOpen=!seqRoupaOpen">
                      👕 Personalizar {{ seqRoupaOpen ? '▲' : '▼' }}
                    </button>
                    <div v-if="seqRoupaOpen" class="smt-roupa-painel">
                      <p class="smt-roupa-label">Cor</p>
                      <div class="smt-cor-grid">
                        <button v-for="(stops, cor) in seqCores" :key="cor"
                          class="smt-cor-btn" :class="{on: seqCustom.cor===cor}"
                          :style="`background:${stops[1]}`"
                          @click="atualizarCustom('cor', cor)" :title="cor"/>
                      </div>
                      <p class="smt-roupa-label">Chapéu</p>
                      <div class="smt-item-grid">
                        <button v-for="c in chapeus" :key="c.id" class="smt-item-btn" :class="{on:seqCustom.chapeu===c.id}" @click="atualizarCustom('chapeu', c.id)">{{c.emoji}}<span>{{c.nome}}</span></button>
                      </div>
                      <p class="smt-roupa-label">Óculos</p>
                      <div class="smt-item-grid">
                        <button v-for="o in oculos" :key="o.id" class="smt-item-btn" :class="{on:seqCustom.oculos===o.id}" @click="atualizarCustom('oculos', o.id)">{{o.emoji}}<span>{{o.nome}}</span></button>
                      </div>
                    </div>
                  </div>

                  <p class="smt-info">O outro lado precisa aceitar a solicitação.</p>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="sequencia?.status==='active'" class="seq-badge-bar">
            <span class="seq-badge-emoji">{{sequencia.emoji}}</span>
            <span class="seq-badge-txt">{{totalMsgs}} mensagens com <strong>{{ativa.nome}}</strong></span>
            <span class="seq-badge-flame">🔥</span>
          </div>
        </transition>

        <transition name="slide-down">
          <div v-if="seqPendente" class="seq-request-banner">
            <div class="seq-req-content">
              <span class="seq-req-emoji">{{seqPendente.emoji}}</span>
              <div class="seq-req-text">
                <p class="seq-req-title">{{ativa.nome}} quer uma sequência!</p>
                <p class="seq-req-sub">Animal: {{seqPendente.nome}} · {{totalMsgs}} mensagens trocadas</p>
              </div>
              <div class="seq-req-actions">
                <button class="seq-req-btn accept" @click="responderSequencia(true)">Aceitar</button>
                <button class="seq-req-btn reject" @click="responderSequencia(false)">Recusar</button>
              </div>
            </div>
          </div>
        </transition>

        <div class="msgs" ref="msgsEl" :style="bgStyle">
          <div v-if="!msgsAtivas.length" class="chat-empty">
            <img :src="ativa.avatar" class="av72" />
            <p class="nome-lg">{{ativa.nome}}</p>
            <p v-if="ativa.online" class="sub online-sub">● Ativo agora</p>
            <p v-else class="sub">Visto {{ativa.hora}}</p>
            <p class="sub">Comece uma conversa</p>
            <div class="seq-empty-hint">
              <span>🥚</span>
              <p>Troque {{animais[0].req}} mensagens para desbloquear o primeiro animal de sequência</p>
            </div>
          </div>

          <template v-for="(m,i) in msgsAtivas" :key="i">
            <div v-if="m.sep" class="sep">{{m.sep}}</div>
            <div v-else class="msg-row" :class="{own:m.own}">
              <img v-if="!m.own" :src="ativa.avatar" class="av26" />
              <div class="balao" :class="{own:m.own,img:m.img}">
                <img v-if="m.img" :src="m.txt" class="balao-img" @click="fullImg=m.txt" />
                <span v-else>{{m.txt}}</span>
                <span class="meta">
                  {{m.hora}}
                  <svg v-if="m.own && m.lida" viewBox="0 0 24 24" fill="#ff8c00" width="10" height="10"><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>
                  <svg v-else-if="m.own && !m.lida" viewBox="0 0 24 24" fill="rgba(255,255,255,.4)" width="10" height="10"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                </span>
              </div>
            </div>
          </template>

          <transition name="slide-down">
            <div v-if="evolucaoPendente" class="seq-evolucao-notif">
              <span>{{evolucaoPendente.emoji}}</span>
              <p>Vocês desbloquearam <strong>{{evolucaoPendente.nome}}</strong>! Solicite a evolução.</p>
              <button @click="solicitarEvolucao">Evoluir</button>
              <button class="dismiss" @click="evolucaoPendente=null">✕</button>
            </div>
          </transition>

          <div v-if="typing" class="msg-row">
            <img :src="ativa.avatar" class="av26" />
            <div class="balao typing"><span class="dot"/><span class="dot"/><span class="dot"/></div>
          </div>
        </div>

        <transition name="pop">
          <div v-if="emojiOpen" class="emoji-pick">
            <button v-for="e in emojis" :key="e" class="e-btn" @click="txt+=e">{{e}}</button>
          </div>
        </transition>

        <div class="input-bar">
          <button class="ic-btn inp-ic" :class="{on:emojiOpen}" @click="emojiOpen=!emojiOpen">
            <svg viewBox="0 0 24 24" fill="currentColor" width="19" height="19"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
          </button>
          <button class="ic-btn inp-ic" @click="$refs.imgIn.click()" :disabled="uploadingImg" :class="{uploading: uploadingImg}">
            <svg v-if="!uploadingImg" viewBox="0 0 24 24" fill="currentColor" width="19" height="19"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="19" height="19" class="spin"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
          </button>
          <input ref="imgIn" type="file" accept="image/*" style="display:none" @change="enviarImg" />
          <input v-model="txt" class="msg-in" placeholder="Enviar mensagem..." @keydown.enter="enviar" />
          <button class="send-btn" :class="{on:txt.trim()}" :disabled="!txt.trim()" @click="enviar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </template>

      <div v-else class="placeholder">
        <div class="ph-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <p class="nome-lg" style="opacity:.45">Suas mensagens</p>
        <p class="sub">Selecione uma conversa</p>
      </div>
    </section>

    <div class="grupo-panel-wrapper" :class="{ 'grupo-panel-wrapper--open': !!ativaGrupo }">
      <GrupoChatPanel
        v-model="chatGrupoOpen"
        :grupo="ativaGrupo"
        :membros="membrosGrupo"
        :msgs="msgsGrupo"
        :bg-style="bgStyle"
        :me-id="authState.user?.id"
        @fechar="fecharGrupo"
        @enviar="onEnviarMensagemGrupo"
        @enviar-img="onEnviarImgGrupo"
        @sair="onSairGrupo"
        @full-img="fullImg = $event"
        @toggle-reaction="onToggleReaction"
        @deletar-mensagem="onDeletarMensagem"
        @encaminhar-mensagem="onEncaminharMensagem"
        @reportar-mensagem="onReportarMensagem"
      />
    </div>

    <NovoGrupoModal v-model="novoGrupoOpen" :usuarios="todosUsuarios" @criado="onCriarGrupo" />

    <transition name="fade">
      <div v-if="fullImg" class="overlay dark" style="cursor:zoom-out" @click="fullImg=null">
        <img :src="fullImg" style="max-width:90vw;max-height:90vh;border-radius:12px"/>
      </div>
    </transition>

    <transition name="toast"><div v-if="toastTxt" class="toast">{{toastTxt}}</div></transition>

    <transition name="fade">
      <div v-if="novaConvOpen" class="overlay dark" @click.self="novaConvOpen=false">
        <div class="nova-conv-modal">
          <div class="nova-conv-header">
            <h2>Nova conversa</h2>
            <button class="modal-close" @click="novaConvOpen=false">✕</button>
          </div>
          <div class="nova-conv-search">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input v-model="buscaNovaConv" placeholder="Buscar usuário..." autofocus />
          </div>
          <div class="nova-conv-lista">
            <div v-if="usuariosFiltrados.length === 0" class="nova-conv-vazio">Nenhum usuário encontrado</div>
            <div v-for="u in usuariosFiltrados" :key="u.id" class="nova-conv-item" @click="iniciarConversa(u)">
              <img :src="u.avatar" class="nova-conv-av" />
              <div>
                <p class="nova-conv-nome">{{ u.nome }}</p>
                <p class="nova-conv-handle">{{ u.handle }}</p>
              </div>
              <span v-if="u.online" class="nova-conv-online">● online</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="!carregando && convs.length === 0 && !novaConvOpen" class="convs-vazio">
      <p>Nenhuma conversa ainda.</p>
      <button @click="novaConvOpen=true">Iniciar conversa</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase.js'
import { authState } from '../auth.js'
import {
  fetchConversas,
  fetchMensagens,
  enviarMensagem,
  subscribeToMensagens,
  subscribeToConversas,
} from '../messages.js'

import NovoGrupoModal  from '../components/NovoGrupoModal.vue'
import GrupoChatPanel  from '../components/GrupoChatPanel.vue'
import {
  criarGrupo,
  fetchGrupos,
  fetchMembrosGrupo,
  fetchMensagensGrupo,
  enviarMensagemGrupo,
  subscribeGrupoMensagens,
  sairDoGrupo,
} from '../groups.js'

const SYS_SEQ_REQUEST = '__SEQ_REQUEST__:'
const SYS_SEQ_ACCEPT  = '__SEQ_ACCEPT__:'
const SYS_SEQ_REJECT  = '__SEQ_REJECT__'

const busca       = ref('')
const buscaOn     = ref(false)
const filtro      = ref('Todos')
const ativa       = ref(null)
const chatOpen    = ref(false)
const txt         = ref('')
const emojiOpen   = ref(false)
const typing      = ref(false)
const msgsEl      = ref(null)
const fullImg     = ref(null)
const toastTxt    = ref('')
const carregando  = ref(false)
const convs       = ref([])
const mensagens   = ref([])
const bgMenuOpen  = ref(false)
const seqMenuOpen = ref(false)
const bgAtual     = ref('default')
const uploadingImg = ref(false)

const sequencia        = ref(null)
const seqPendente      = ref(null)
const evolucaoPendente = ref(null)
const seqNomeEdit      = ref(false)
const seqNomeTemp      = ref('')
const seqRoupaOpen     = ref(false)
const seqCustom = ref({ cor: 'laranja', chapeu: 'nenhum', oculos: 'nenhum', nome_custom: '' })

let ultimoUpsertLocal = 0
let seqSub = null

const novoGrupoOpen    = ref(false)
const grupos           = ref([])
const ativaGrupo       = ref(null)
const chatGrupoOpen    = ref(false)
const msgsGrupo        = ref([])
const membrosGrupo     = ref([])
let grupoMsgSub        = null

const GRUPO_CORES = [
  'linear-gradient(135deg,#c41840,#8b0000)',
  'linear-gradient(135deg,#c45000,#7a2d00)',
  'linear-gradient(135deg,#006b8c,#004455)',
  'linear-gradient(135deg,#1a6b2a,#0a3a14)',
  'linear-gradient(135deg,#6b1a6b,#3a0a3a)',
  'linear-gradient(135deg,#8c6b00,#4a3800)',
]
function grupoAvatarStyle(g) {
  return { background: GRUPO_CORES[((g?.nome || '').charCodeAt(0) || 0) % GRUPO_CORES.length] }
}

let toastT  = null
let msgSub  = null
let convSub = null
const pendentes = new Set()

const animais = [
  { emoji: '🥚',  nome: 'Ovo',         req: 10   },
  { emoji: '🐣',  nome: 'Pintinho',    req: 30   },
  { emoji: '🐥',  nome: 'Pintinho+',   req: 75   },
  { emoji: '🐦',  nome: 'Passarinho',  req: 150  },
  { emoji: '🦅',  nome: 'Águia',       req: 300  },
  { emoji: '🦁',  nome: 'Leão',        req: 500  },
  { emoji: '🐉',  nome: 'Dragão',      req: 750  },
  { emoji: '👑',  nome: 'Lendário',    req: 1000 },
]

const seqCores = {
  laranja: ['#FFDC60','#FFB347','#E87A00'],
  azul:    ['#60C8FF','#3A8FD4','#1A5A9A'],
  roxo:    ['#C880FF','#9A50D4','#6A2A9A'],
  verde:   ['#80FF80','#3ABF3A','#1A7A1A'],
  rosa:    ['#FFB0D0','#FF6B9D','#CC2060'],
  dourado: ['#FFF060','#FFD700','#B89000'],
}

const chapeus = [
  { id:'nenhum', emoji:'🚫', nome:'Nenhum' },
  { id:'coroa',  emoji:'👑', nome:'Coroa'  },
  { id:'bone',   emoji:'🧢', nome:'Boné'   },
  { id:'festa',  emoji:'🎉', nome:'Festa'  },
]

const oculos = [
  { id:'nenhum',  emoji:'🚫', nome:'Nenhum'  },
  { id:'sol',     emoji:'😎', nome:'Sol'     },
  { id:'coracao', emoji:'🥰', nome:'Coração' },
]

const nomeExibido = computed(() => {
  if (seqCustom.value.nome_custom) return seqCustom.value.nome_custom
  if (sequencia.value?.nomeCustom)  return sequencia.value.nomeCustom
  if (sequencia.value?.nome)        return sequencia.value.nome
  if (animalAtual.value)            return animalAtual.value.nome
  return animais[0].nome
})

async function carregarSequencia(convId) {
  if (!convId) return
  const { data, error } = await supabase
    .from('sequencias')
    .select('*')
    .eq('conversa_id', convId)
    .maybeSingle()

  if (error) {
    console.error('carregarSequencia falhou:', error)
    toast('Erro ao carregar personalização: ' + error.message)
    return
  }

  if (data) {
    if (data.status && data.emoji) {
      sequencia.value = {
        emoji:      data.emoji,
        nome:       data.nome,
        nomeCustom: data.nome_custom || '',
        status:     data.status,
        req:        0,
      }
    } else {
      sequencia.value = null
    }
    seqCustom.value = {
      cor:        data.cor        || 'laranja',
      chapeu:     data.chapeu     || 'nenhum',
      oculos:     data.oculos     || 'nenhum',
      nome_custom: data.nome_custom || '',
    }
  } else {
    sequencia.value = null
    seqCustom.value = { cor: 'laranja', chapeu: 'nenhum', oculos: 'nenhum', nome_custom: '' }
  }
}

async function upsertSequencia(patch) {
  if (!ativa.value) {
    console.warn('upsertSequencia chamado sem conversa ativa')
    return false
  }

  const payload = {
    conversa_id: ativa.value.id,
    cor:         seqCustom.value.cor,
    chapeu:      seqCustom.value.chapeu,
    oculos:      seqCustom.value.oculos,
    nome_custom: seqCustom.value.nome_custom,
    ...patch,
    updated_at: new Date().toISOString(),
  }

  ultimoUpsertLocal = Date.now()

  const { error } = await supabase
    .from('sequencias')
    .upsert(payload, { onConflict: 'conversa_id' })

  if (error) {
    console.error('upsertSequencia falhou:', error)
    let msg = 'Erro ao salvar personalização.'
    if (error.code === '42501' || /row-level security/i.test(error.message)) {
      msg = 'Sem permissão para salvar (verifique as políticas RLS da tabela "sequencias").'
    } else if (/no unique or exclusion constraint/i.test(error.message)) {
      msg = 'Falta uma constraint UNIQUE em "conversa_id" na tabela "sequencias".'
    }
    toast(msg)
    return false
  }
  return true
}

function subscribeSequencia(convId) {
  if (seqSub) { seqSub.unsubscribe(); seqSub = null }
  seqSub = supabase
    .channel(`seq-${convId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sequencias', filter: `conversa_id=eq.${convId}` },
      (payload) => {
        const row = payload.new
        if (!row) return
        seqCustom.value = {
          cor:        row.cor         || 'laranja',
          chapeu:     row.chapeu      || 'nenhum',
          oculos:     row.oculos      || 'nenhum',
          nome_custom: row.nome_custom || '',
        }
        if (row.status && row.emoji) {
          sequencia.value = {
            emoji:      row.emoji,
            nome:       row.nome,
            nomeCustom: row.nome_custom || '',
            status:     row.status,
            req:        sequencia.value?.req || 0,
          }
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('subscribeSequencia: falha ao conectar no realtime', status)
        toast('Sem conexão em tempo real — ative o Realtime para a tabela "sequencias" no Supabase.')
      }
    })
}

async function salvarNome() {
  const nome = seqNomeTemp.value.trim()
  if (!nome) { seqNomeEdit.value = false; return }
  const anterior = seqCustom.value.nome_custom
  seqCustom.value.nome_custom = nome
  if (sequencia.value) sequencia.value.nomeCustom = nome
  seqNomeEdit.value = false
  const ok = await upsertSequencia({ nome_custom: nome })
  if (!ok) {
    seqCustom.value.nome_custom = anterior
    if (sequencia.value) sequencia.value.nomeCustom = anterior
  }
}

async function atualizarCustom(campo, valor) {
  const anterior = seqCustom.value[campo]
  seqCustom.value[campo] = valor
  const ok = await upsertSequencia({ [campo]: valor })
  if (!ok) {
    seqCustom.value[campo] = anterior
  }
}

const totalMsgs = computed(() => mensagens.value.filter(m => !m.sistema).length)

const animalAtual = computed(() =>
  [...animais].reverse().find(a => totalMsgs.value >= a.req) ?? null
)

const proximoAnimal = computed(() =>
  animais.find(a => totalMsgs.value < a.req) ?? null
)

const progressoPct = computed(() => {
  if (!proximoAnimal.value) return 100
  const idx = animais.indexOf(proximoAnimal.value)
  const prevReq = idx > 0 ? animais[idx - 1].req : 0
  const range = proximoAnimal.value.req - prevReq
  const progress = totalMsgs.value - prevReq
  return Math.min(100, Math.round((progress / range) * 100))
})

const gruposFiltrados = computed(() =>
  grupos.value.filter(g => g.nome.toLowerCase().includes(busca.value.toLowerCase()))
)

const backgrounds = [
  { id: 'default', label: 'Padrão',      style: 'background:#080400' },
  { id: 'dots',    label: 'Pontos',      style: 'background:#080400;background-image:radial-gradient(circle,rgba(255,107,0,.18) 1.5px,transparent 0);background-size:16px 16px' },
  { id: 'grid',    label: 'Grade',       style: 'background:#080400;background-image:linear-gradient(rgba(255,107,0,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.08) 1px,transparent 1px);background-size:18px 18px' },
  { id: 'night',   label: 'Noturno',     style: 'background:linear-gradient(180deg,#05091a 0%,#0a0a1a 100%)' },
  { id: 'forest',  label: 'Floresta',    style: 'background:linear-gradient(180deg,#020e04 0%,#04140a 100%)' },
  { id: 'wine',    label: 'Vinho',       style: 'background:linear-gradient(180deg,#140308 0%,#200510 100%)' },
  { id: 'sunset',  label: 'Pôr do sol',  style: 'background:#0d0400;background-image:radial-gradient(ellipse at 50% 110%,rgba(255,80,0,.14),transparent 68%)' },
  { id: 'ocean',   label: 'Oceano',      style: 'background:#00050e;background-image:radial-gradient(ellipse at 50% 110%,rgba(0,100,255,.13),transparent 68%)' },
  { id: 'purple',  label: 'Roxo',        style: 'background:linear-gradient(180deg,#0a0414 0%,#120824 100%)' },
]

const bgStyleMap = {
  default: { background:'#080400', backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,107,0,.03) 1px,transparent 0)', backgroundSize:'28px 28px' },
  dots:    { background:'#080400', backgroundImage:'radial-gradient(circle,rgba(255,107,0,.12) 1.5px,transparent 0)', backgroundSize:'16px 16px' },
  grid:    { background:'#080400', backgroundImage:'linear-gradient(rgba(255,107,0,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.07) 1px,transparent 1px)', backgroundSize:'18px 18px' },
  night:   { background:'linear-gradient(180deg,#05091a,#0a0a1a)' },
  forest:  { background:'linear-gradient(180deg,#020e04,#04140a)' },
  wine:    { background:'linear-gradient(180deg,#140308,#200510)' },
  sunset:  { background:'#0d0400', backgroundImage:'radial-gradient(ellipse at 50% 110%,rgba(255,80,0,.14),transparent 68%)' },
  ocean:   { background:'#00050e', backgroundImage:'radial-gradient(ellipse at 50% 110%,rgba(0,100,255,.13),transparent 68%)' },
  purple:  { background:'linear-gradient(180deg,#0a0414,#120824)' },
}

const bgStyle = computed(() => bgStyleMap[bgAtual.value] || bgStyleMap.default)

function setBg(id) {
  bgAtual.value = id
  bgMenuOpen.value = false
  if (ativa.value) {
    const c = convs.value.find(x => x.id === ativa.value.id)
    if (c) c.bg = id
  }
}

const emojis = ['😀','😂','😍','🥰','😎','🔥','💯','✨','🎉','👏','🙌','💪','👀','🫶','😭','🤣','💀','🫠','🤯','😤','🎵','🎨','💻','🚀','⚡','🌊','🌸','🍕']

const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = e => { if (!el.contains(e.target)) binding.value(e) }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

async function solicitarSequencia(animal) {
  if (totalMsgs.value < animal.req) {
    const faltam = animal.req - totalMsgs.value
    toast(`Faltam ${faltam} mensagem${faltam > 1 ? 's' : ''} para solicitar ${animal.emoji} ${animal.nome}`)
    return
  }
  if (sequencia.value?.status === 'pending') {
    toast('Já existe uma solicitação aguardando aceite')
    return
  }
  sequencia.value = { ...animal, status: 'pending' }
  seqMenuOpen.value = false
  try {
    await enviarMensagem(ativa.value.id, `${SYS_SEQ_REQUEST}${JSON.stringify(animal)}`)
    const ok = await upsertSequencia({
      emoji:  animal.emoji,
      nome:   animal.nome,
      status: 'pending',
    })
    if (!ok) { sequencia.value = null; return }
    toast(`${animal.emoji} Solicitação enviada! Aguardando ${ativa.value.nome} aceitar.`)
  } catch {
    sequencia.value = null
    toast('Erro ao enviar solicitação')
  }
}

async function responderSequencia(aceitar) {
  const animal = seqPendente.value
  seqPendente.value = null
  if (aceitar) {
    sequencia.value = { ...animal, status: 'active' }
    try {
      await enviarMensagem(ativa.value.id, `${SYS_SEQ_ACCEPT}${JSON.stringify(animal)}`)
      await upsertSequencia({
        emoji:  animal.emoji,
        nome:   animal.nome,
        status: 'active',
      })
      toast(`${animal.emoji} Sequência ativada com ${ativa.value.nome}!`)
    } catch {
      toast('Erro ao aceitar sequência')
    }
  } else {
    try {
      await enviarMensagem(ativa.value.id, SYS_SEQ_REJECT)
      await upsertSequencia({ status: 'rejected' })
      toast('Solicitação recusada.')
    } catch {
      toast('Erro ao recusar sequência')
    }
  }
}

function solicitarEvolucao() {
  const animal = evolucaoPendente.value
  evolucaoPendente.value = null
  solicitarSequencia(animal)
}

function checarEvolucao() {
  if (!animalAtual.value) return
  if (
    sequencia.value?.status === 'active' &&
    sequencia.value.emoji !== animalAtual.value.emoji &&
    !evolucaoPendente.value
  ) {
    evolucaoPendente.value = animalAtual.value
  }
}

function processarMensagemSistema(nova) {
  const txt = nova.texto || ''
  if (txt.startsWith(SYS_SEQ_REQUEST)) {
    try { seqPendente.value = JSON.parse(txt.replace(SYS_SEQ_REQUEST, '')) } catch { }
    return true
  }
  if (txt.startsWith(SYS_SEQ_ACCEPT)) {
    try {
      const animal = JSON.parse(txt.replace(SYS_SEQ_ACCEPT, ''))
      sequencia.value = { ...animal, status: 'active' }
      toast(`${animal.emoji} ${ativa.value?.nome} aceitou a sequência!`)
    } catch { }
    return true
  }
  if (txt === SYS_SEQ_REJECT) {
    if (sequencia.value) sequencia.value = { ...sequencia.value, status: 'rejected' }
    toast(`${ativa.value?.nome} recusou a solicitação de sequência.`)
    return true
  }
  return false
}

function avatarPadrao(username = '?') {
  const initials = (username || '?').slice(0, 2).toUpperCase()
  const colors = ['#1a2850','#103838','#2d1040','#4a1018','#10381a','#3a1808']
  const color  = colors[(username.charCodeAt(0) || 0) % colors.length]
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" fill="${color}"/><text x="75" y="75" font-family="system-ui" font-size="54" font-weight="700" fill="#fff0ea" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`)}`
}

function horaLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts), now = new Date(), diff = now - d
  if (diff < 86400000 && d.getDate() === now.getDate())
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diff < 172800000) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { weekday: 'short' })
}

function agora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

let presenceSub = null

function subscribePresence(convId, outroUserId) {
  if (presenceSub) { presenceSub.unsubscribe(); presenceSub = null }
  presenceSub = supabase
    .channel(`presence-${convId}`)
    .on('presence', { event: 'sync' }, () => {
      const state = presenceSub.presenceState()
      const onlineUsers = Object.values(state).flat().map(u => u.user_id)
      const isOnline = onlineUsers.includes(outroUserId)
      if (ativa.value) ativa.value.online = isOnline
      const c = convs.value.find(x => x.id === convId)
      if (c) c.online = isOnline
    })
    .subscribe()
}

function mapearConversa(c, existente) {
  const outro = c.outro_usuario || c.user1 || c.user2 || {}
  return {
    id:      c.id,
    userId:  outro.id,
    nome:    '@' + (outro.username || 'usuario'),
    prev:    c.ultima_mensagem || '',
    hora:    horaLabel(c.updated_at),
    avatar:  outro.avatar_url || avatarPadrao(outro.username),
    online:  existente?.online  ?? false,
    naoLida: existente?.naoLida ?? 0,
    eu:      existente?.eu      ?? false,
    bg:      existente?.bg      ?? 'default',
  }
}

async function carregarConversas() {
  if (!authState.user) return
  carregando.value = true
  try {
    const dados = await fetchConversas()
    convs.value = (dados || []).map(c => mapearConversa(c, convs.value.find(x => x.id === c.id)))
  } catch (err) {
    console.warn('carregarConversas:', err)
  } finally {
    carregando.value = false
  }
}

async function onConversaAtualizada(raw) {
  const eu = authState.user?.id
  if (!eu) return
  if (raw.user1_id !== eu && raw.user2_id !== eu) return
  const existente = convs.value.find(c => c.id === raw.id)
  if (existente) {
    existente.prev = raw.ultima_mensagem || existente.prev
    existente.hora = horaLabel(raw.updated_at)
    if (ativa.value?.id !== raw.id && raw.ultima_mensagem !== existente.prev) {
      existente.naoLida = (existente.naoLida || 0) + 1
    }
    const idx = convs.value.indexOf(existente)
    if (idx > 0) { convs.value.splice(idx, 1); convs.value.unshift(existente) }
  } else {
    await carregarConversas()
  }
}

const todosUsuarios = ref([])
const buscaNovaConv = ref('')
const novaConvOpen  = ref(false)

async function buscarUsuariosParaConversa() {
  if (!authState.user) return
  const { data } = await supabase
    .from('profiles')
    .select('id, nome, username, avatar_url')
    .neq('id', authState.user.id)
    .order('username')
    .limit(50)
  todosUsuarios.value = (data || []).map(u => ({
    id: u.id, nome: u.nome || u.username,
    handle: '@' + u.username,
    avatar: u.avatar_url || avatarPadrao(u.username),
    online: false,
  }))
}

const usuariosFiltrados = computed(() => {
  const q = buscaNovaConv.value.toLowerCase()
  if (!q) return todosUsuarios.value
  return todosUsuarios.value.filter(u =>
    u.handle.toLowerCase().includes(q) || u.nome.toLowerCase().includes(q)
  )
})

async function iniciarConversa(usuario) {
  if (!authState.user) return
  const eu = authState.user.id
  const { data: existing } = await supabase
    .from('conversas')
    .select('id')
    .or(`and(user1_id.eq.${eu},user2_id.eq.${usuario.id}),and(user1_id.eq.${usuario.id},user2_id.eq.${eu})`)
    .maybeSingle()
  let convId
  if (existing) {
    convId = existing.id
  } else {
    const { data: nova, error } = await supabase
      .from('conversas')
      .insert({ user1_id: eu, user2_id: usuario.id, ultima_mensagem: '', updated_at: new Date().toISOString() })
      .select().single()
    if (error) { toast('Erro ao criar conversa'); return }
    convId = nova.id
  }
  novaConvOpen.value = false
  await carregarConversas()
  const conv = convs.value.find(c => c.id === convId)
  if (conv) abrirConv(conv)
}

// ─── HELPER: mapear texto de mensagem (detecta __IMG__) ──────────────────────
function mapearMsg(m, isOwn) {
  const isImg = m.texto?.startsWith('__IMG__')
  return {
    id:      m.id,
    txt:     isImg ? m.texto.replace('__IMG__', '') : m.texto,
    img:     isImg,
    hora:    horaLabel(m.created_at),
    own:     isOwn,
    lida:    true,
    sistema: false,
  }
}

async function abrirConv(c) {
  if (msgSub) { msgSub.unsubscribe(); msgSub = null }
  if (seqSub) { seqSub.unsubscribe(); seqSub = null }
  fecharGrupo()
  ativa.value      = c
  c.naoLida        = 0
  chatOpen.value   = true
  emojiOpen.value  = false
  bgMenuOpen.value = false
  seqMenuOpen.value = false
  mensagens.value  = []
  pendentes.clear()
  sequencia.value        = null
  seqPendente.value      = null
  evolucaoPendente.value = null
  seqNomeEdit.value      = false
  seqRoupaOpen.value     = false
  bgAtual.value = c.bg || 'default'

  await carregarSequencia(c.id)
  subscribeSequencia(c.id)

  if (c.userId) subscribePresence(c.id, c.userId)
  try {
    const dados = await fetchMensagens(c.id)
    mensagens.value = (dados || [])
      .filter(m => !isMensagemSistema(m.texto))
      .map(m => mapearMsg(m, m.user_id === authState.user?.id))
  } catch (err) {
    console.warn('fetchMensagens:', err)
  }
  nextTick(scrollDown)
  msgSub = subscribeToMensagens(c.id, (nova) => {
    const eu = authState.user?.id
    const consumida = processarMensagemSistema(nova)
    if (consumida) return
    if (nova.user_id === eu) {
      const tempIdx = mensagens.value.findIndex(m => String(m.id).startsWith('temp-'))
      if (tempIdx !== -1) {
        const isImg = nova.texto?.startsWith('__IMG__')
        mensagens.value[tempIdx].id   = nova.id
        mensagens.value[tempIdx].lida = true
        if (isImg) {
          mensagens.value[tempIdx].txt = nova.texto.replace('__IMG__', '')
          mensagens.value[tempIdx].img = true
        }
        pendentes.delete(String(mensagens.value[tempIdx].id))
      } else if (!mensagens.value.find(m => m.id === nova.id)) {
        mensagens.value.push(mapearMsg(nova, true))
      }
      checarEvolucao()
      return
    }
    if (mensagens.value.find(m => m.id === nova.id)) return
    mensagens.value.push(mapearMsg(nova, false))
    const conv = convs.value.find(x => x.id === c.id)
    if (conv) {
      const isImg = nova.texto?.startsWith('__IMG__')
      conv.prev = isImg ? '📷 Foto' : nova.texto
      conv.hora = horaLabel(nova.created_at)
      conv.eu = false
      const idx = convs.value.indexOf(conv)
      if (idx > 0) { convs.value.splice(idx, 1); convs.value.unshift(conv) }
    }
    checarEvolucao()
    nextTick(scrollDown)
  })
}

function deletarConversa(id) {
  convs.value = convs.value.filter(c => c.id !== id)
  if (ativa.value?.id === id) {
    ativa.value = null
    chatOpen.value = false
  }
}

function isMensagemSistema(txt) {
  if (!txt) return false
  return txt.startsWith(SYS_SEQ_REQUEST) || txt.startsWith(SYS_SEQ_ACCEPT) || txt === SYS_SEQ_REJECT
}

async function enviar() {
  const t = txt.value.trim()
  if (!t || !ativa.value) return
  txt.value = ''
  emojiOpen.value = false
  const tempId = `temp-${Date.now()}`
  pendentes.add(tempId)
  mensagens.value.push({ id: tempId, txt: t, hora: agora(), own: true, lida: false })
  const conv = convs.value.find(x => x.id === ativa.value.id)
  if (conv) { conv.prev = t; conv.eu = true; conv.hora = agora() }
  nextTick(scrollDown)
  checarEvolucao()
  try {
    const salva = await enviarMensagem(ativa.value.id, t)
    const m = mensagens.value.find(x => x.id === tempId)
    if (m) { m.id = salva.id; m.lida = true; pendentes.delete(tempId) }
  } catch (err) {
    toast('Erro ao enviar mensagem')
    mensagens.value = mensagens.value.filter(x => x.id !== tempId)
    pendentes.delete(tempId)
  }
}

const convsFiltradas = computed(() => {
  let l = convs.value.filter(c => c.nome.toLowerCase().includes(busca.value.toLowerCase()))
  if (filtro.value === 'Não lidas') l = l.filter(c => c.naoLida > 0)
  if (filtro.value === 'Online')    l = l.filter(c => c.online)
  return l
})

const msgsAtivas = computed(() => mensagens.value.filter(m => !m.sistema))

// ─── CORRIGIDO: enviarImg agora faz upload para o Supabase Storage ────────────
async function enviarImg(e) {
  const file = e.target.files[0]
  if (!file || !ativa.value) return
  e.target.value = ''

  uploadingImg.value = true

  const localUrl = URL.createObjectURL(file)
  const tempId = `temp-${Date.now()}`
  mensagens.value.push({ id: tempId, txt: localUrl, img: true, hora: agora(), own: true, lida: false })
  const c = convs.value.find(x => x.id === ativa.value.id)
  if (c) { c.prev = '📷 Foto'; c.eu = true; c.hora = agora() }
  nextTick(scrollDown)

  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `chat/${ativa.value.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('mensagens-fotos')
      .upload(path, file, { contentType: file.type })
    if (upErr) throw upErr

    const { data: urlData } = supabase.storage
      .from('mensagens-fotos')
      .getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    const salva = await enviarMensagem(ativa.value.id, `__IMG__${publicUrl}`)

    const m = mensagens.value.find(x => x.id === tempId)
    if (m) { m.id = salva.id; m.txt = publicUrl; m.lida = true }

  } catch (err) {
    console.error('enviarImg erro:', err)
    toast('Erro ao enviar foto. Verifique o bucket "mensagens-fotos" no Supabase.')
    mensagens.value = mensagens.value.filter(x => x.id !== tempId)
  } finally {
    uploadingImg.value = false
  }
}

function scrollDown() {
  if (msgsEl.value) msgsEl.value.scrollTop = msgsEl.value.scrollHeight
}

function toast(m) { toastTxt.value = m; clearTimeout(toastT); toastT = setTimeout(() => toastTxt.value = '', 2800) }

async function carregarGrupos() {
  if (!authState.user) return
  try {
    const dados = await fetchGrupos(authState.user.id)
    grupos.value = dados.map(g => ({
      ...g,
      hora:    horaLabel(g.updated_at),
      naoLida: 0,
    }))
  } catch (err) {
    console.error('carregarGrupos erro:', err)
  }
}

async function onCriarGrupo({ nome, descricao, membros }) {
  try {
    const grupo = await criarGrupo({
      nome,
      descricao,
      membroIds: membros.map(u => u.id),
      criadoPor: authState.user.id,
    })
    novoGrupoOpen.value = false
    await carregarGrupos()
    const g = grupos.value.find(x => x.id === grupo.id)
    if (g) abrirGrupo(g)
    toast(`Grupo "${grupo.nome}" criado!`)
  } catch {
    toast('Erro ao criar grupo')
  }
}

function fecharGrupo() {
  if (grupoMsgSub) { grupoMsgSub.unsubscribe(); grupoMsgSub = null }
  ativaGrupo.value    = null
  chatGrupoOpen.value = false
  msgsGrupo.value     = []
  membrosGrupo.value  = []
}

async function abrirGrupo(g) {
  if (grupoMsgSub) { grupoMsgSub.unsubscribe(); grupoMsgSub = null }
  ativa.value      = null
  chatOpen.value   = false
  ativaGrupo.value    = g
  chatGrupoOpen.value = true
  msgsGrupo.value     = []
  membrosGrupo.value  = []
  g.naoLida           = 0
  try {
    const [membros, msgs] = await Promise.all([
      fetchMembrosGrupo(g.id),
      fetchMensagensGrupo(g.id),
    ])
    membrosGrupo.value = membros || []
    msgsGrupo.value = (msgs || []).map(m => ({
      id:          m.id,
      txt:         m.texto,
      hora:        horaLabel(m.created_at),
      own:         m.user_id === authState.user?.id,
      lida:        true,
      autorId:     m.user_id,
      autorNome:   m.profiles?.username ? '@' + m.profiles.username : 'Usuário',
      autorAvatar: m.profiles?.avatar_url || avatarPadrao(m.profiles?.username),
      ts:          m.created_at,
    }))
  } catch (err) {
    console.warn('abrirGrupo erro:', err)
    membrosGrupo.value = []
    msgsGrupo.value    = []
  }
  grupoMsgSub = subscribeGrupoMensagens(g.id, (nova) => {
    if (nova.user_id === authState.user?.id) return
    if (msgsGrupo.value.find(m => m.id === nova.id)) return
    const membro = membrosGrupo.value.find(m => m.id === nova.user_id)
    msgsGrupo.value.push({
      id:          nova.id,
      txt:         nova.texto,
      hora:        horaLabel(nova.created_at),
      own:         false,
      lida:        true,
      autorId:     nova.user_id,
      autorNome:   membro ? '@' + membro.username : 'Usuário',
      autorAvatar: membro?.avatar_url || avatarPadrao(membro?.username),
      ts:          nova.created_at,
    })
    const gr = grupos.value.find(x => x.id === g.id)
    if (gr) { gr.ultima_mensagem = nova.texto; gr.hora = horaLabel(nova.created_at) }
  })
}

async function onEnviarMensagemGrupo({ txt: texto, replyTo }) {
  if (!ativaGrupo.value || !texto?.trim()) return
  const tempId = `temp-${Date.now()}`
  const eu = authState.user
  msgsGrupo.value.push({
    id:          tempId,
    txt:         texto,
    hora:        agora(),
    own:         true,
    lida:        false,
    autorId:     eu?.id,
    autorNome:   'Você',
    autorAvatar: eu?.user_metadata?.avatar_url || avatarPadrao(eu?.user_metadata?.username),
    ts:          new Date().toISOString(),
    replyTo:     replyTo || null,
  })
  const gr = grupos.value.find(x => x.id === ativaGrupo.value.id)
  if (gr) { gr.ultima_mensagem = texto; gr.hora = agora() }
  try {
    const salva = await enviarMensagemGrupo(ativaGrupo.value.id, eu.id, texto)
    const m = msgsGrupo.value.find(x => x.id === tempId)
    if (m) { m.id = salva.id; m.lida = true }
  } catch {
    toast('Erro ao enviar mensagem')
    msgsGrupo.value = msgsGrupo.value.filter(x => x.id !== tempId)
  }
}

function onEnviarImgGrupo(dataUrl) {
  if (!ativaGrupo.value) return
  msgsGrupo.value.push({
    txt:         dataUrl,
    img:         true,
    hora:        agora(),
    own:         true,
    lida:        false,
    autorId:     authState.user?.id,
    autorNome:   'Você',
    autorAvatar: '',
    ts:          new Date().toISOString(),
  })
  const gr = grupos.value.find(x => x.id === ativaGrupo.value?.id)
  if (gr) gr.ultima_mensagem = '📷 Foto'
}

async function onSairGrupo() {
  if (!ativaGrupo.value) return
  const grupoId = ativaGrupo.value.id
  try {
    await sairDoGrupo(grupoId, authState.user.id)
    grupos.value = grupos.value.filter(g => g.id !== grupoId)
    fecharGrupo()
    toast('Você saiu do grupo')
  } catch {
    toast('Erro ao sair do grupo')
  }
}

function onToggleReaction({ msgId, emoji }) {
  const eu = authState.user?.id
  if (!eu) return
  const msg = msgsGrupo.value.find(m => m.id === msgId)
  if (!msg) return
  if (!msg.reactions) msg.reactions = {}
  if (!msg.reactions[emoji]) msg.reactions[emoji] = []
  const idx = msg.reactions[emoji].indexOf(eu)
  if (idx === -1) {
    msg.reactions[emoji].push(eu)
  } else {
    msg.reactions[emoji].splice(idx, 1)
    if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji]
  }
}

function onDeletarMensagem(msgId) {
  msgsGrupo.value = msgsGrupo.value.filter(m => m.id !== msgId)
}

function onEncaminharMensagem(msg) {
  toast(`Mensagem encaminhada: "${(msg?.txt || '').slice(0, 30)}"`)
}

function onReportarMensagem(msgId) {
  toast('Mensagem reportada. Obrigado!')
}

watch(msgsAtivas, () => nextTick(scrollDown))

import { useRoute } from 'vue-router'
const route = useRoute()

onMounted(async () => {
  await carregarConversas()
  await carregarGrupos()
  await buscarUsuariosParaConversa()
  convSub = subscribeToConversas(onConversaAtualizada)

  const dmUsername = route.query.dm
  if (dmUsername) {
    let usuario = todosUsuarios.value.find(
      u => u.handle.replace('@', '').toLowerCase() === String(dmUsername).toLowerCase()
    )
    if (!usuario) {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url')
        .eq('username', dmUsername)
        .single()
      if (data) {
        usuario = {
          id:     data.id,
          nome:   data.nome || data.username,
          handle: '@' + data.username,
          avatar: data.avatar_url || avatarPadrao(data.username),
          online: false,
        }
      }
    }
    if (usuario) await iniciarConversa(usuario)
  }
})

onUnmounted(() => {
  msgSub?.unsubscribe()
  convSub?.unsubscribe()
  presenceSub?.unsubscribe()
  grupoMsgSub?.unsubscribe()
  seqSub?.unsubscribe()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}

.layout{display:flex;height:100%;background:#060301;color:#f0e8df;font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden;position:relative}

.sidebar{width:340px;min-width:320px;display:flex;flex-direction:column;background:#0c0700;border-right:1px solid #1e1100;overflow:hidden;flex-shrink:0}
.sidebar-top{padding:18px 16px 0;flex-shrink:0;border-bottom:1px solid #1a0f00}
.heading{font-size:21px;font-weight:800;letter-spacing:-.4px;background:linear-gradient(135deg,#ff2d6b,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.row-between{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.ic-btn{background:#181000;border:1px solid #2a1800;color:rgba(240,232,223,.5);width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;fill:currentColor;flex-shrink:0;position:relative}
.ic-btn:hover,.ic-btn.on{background:#221400;color:#ff8c00;border-color:#ff8c00}
.ic-btn.uploading{color:#ff8c00;border-color:#ff8c00;background:#221400}
.search-box{display:flex;align-items:center;gap:8px;background:#130900;border:1.5px solid #2a1800;border-radius:12px;padding:0 12px;margin-bottom:12px;transition:border-color .2s}
.search-box.on{border-color:#ff2d6b}
.search-ic{fill:rgba(240,232,223,.25);flex-shrink:0}
.search-in{flex:1;background:none;border:none;outline:none;color:#f0e8df;font-size:13px;font-family:inherit;padding:10px 0}
.search-in::placeholder{color:rgba(240,232,223,.22)}
.search-x{background:none;border:none;color:rgba(240,232,223,.3);cursor:pointer;font-size:12px}
.filtros{display:flex;gap:5px;padding-bottom:12px;overflow-x:auto;scrollbar-width:none}
.filtros::-webkit-scrollbar{display:none}
.f-btn{background:none;border:1px solid #2a1800;color:rgba(240,232,223,.35);font-size:11px;font-weight:600;font-family:inherit;padding:4px 11px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:all .2s}
.f-btn:hover{border-color:#ff8c00;color:#ff8c00}
.f-btn.on{background:#ff2d6b;border-color:#ff2d6b;color:#fff}

.online-pip{position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:#ff9a3c;border-radius:50%;border:2px solid #0c0700}
.online-pip.pulse{animation:pipPulse 2.4s ease-in-out infinite}
@keyframes pipPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,154,60,.6)}50%{box-shadow:0 0 0 4px rgba(255,154,60,0)}}
.offline-pip{position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:#3a2a1a;border-radius:50%;border:2px solid #0c0700}

.chat-status{font-size:11px;color:rgba(240,232,223,.35)}
.chat-status.on{color:#ff9a3c}
.typing-status{display:flex;align-items:center;gap:6px;color:#ff8c00;font-size:11px}
.typing-dots{display:inline-flex;gap:3px;align-items:center}
.typing-dots span{width:4px;height:4px;background:#ff8c00;border-radius:50%;animation:bounce 1.2s infinite}
.typing-dots span:nth-child(2){animation-delay:.18s}
.typing-dots span:nth-child(3){animation-delay:.36s}
@keyframes bounce{0%,60%,100%{transform:none}30%{transform:translateY(-4px)}}
.fade-txt-enter-active,.fade-txt-leave-active{transition:opacity .25s,transform .25s}
.fade-txt-enter-from{opacity:0;transform:translateY(-4px)}
.fade-txt-leave-to{opacity:0;transform:translateY(4px)}

.div-label{display:flex;align-items:center;justify-content:space-between;padding:9px 16px 5px;flex-shrink:0}
.div-label span{font-size:10px;color:rgba(240,232,223,.25);text-transform:uppercase;letter-spacing:.1em;font-weight:700}
.count-badge{background:#1e1000;border:1px solid #2a1800;color:rgba(240,232,223,.3);font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px}
.conv-list{flex:1;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#2a1800 transparent}
.conv-item{display:flex;align-items:center;gap:11px;padding:11px 16px;cursor:pointer;transition:background .15s;border-left:2.5px solid transparent}
.conv-item:hover{background:#110800}
.conv-item.ativa{background:#160a00;border-left-color:#ff2d6b}
.conv-item.unread .conv-nome{color:#f0e8df;font-weight:700}
.av-wrap{position:relative;flex-shrink:0}
.av46{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1.5px solid #2a1800}
.av38{width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid #2a1800}
.av26{width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid #2a1800;flex-shrink:0}
.av72{width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid #2a1800}
.conv-body{flex:1;min-width:0}
.conv-nome{font-size:13px;font-weight:600;color:rgba(240,232,223,.7)}
.conv-hora{font-size:10px;color:rgba(240,232,223,.25);white-space:nowrap}
.conv-prev{font-size:12px;color:rgba(240,232,223,.28);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.eu-tag{color:rgba(240,232,223,.18)}
.unread-dot{background:linear-gradient(135deg,#ff2d6b,#ff6b00);color:#fff;font-size:10px;font-weight:700;min-width:17px;height:17px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0}
.vazio{padding:32px;text-align:center;color:rgba(240,232,223,.2);font-size:13px}
.online-sub{color:#ff9a3c !important}
.grupo-av-sidebar{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:rgba(255,255,255,.9);letter-spacing:-.5px;flex-shrink:0;border:1.5px solid rgba(255,255,255,.08)}

.chat{display:none;flex-direction:column;background:#080400;min-width:0;position:relative}
.chat.open{display:flex;flex:1}
.chat-hd{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#0c0700;border-bottom:1px solid #1a0f00;flex-shrink:0}
.hd-actions{display:flex;gap:6px;align-items:center;position:relative}
.back{display:none}
.flex1{flex:1;min-width:0}
.chat-nome{font-size:14px;font-weight:700}

.grupo-panel-wrapper{display:none;flex:0;overflow:hidden}
.grupo-panel-wrapper--open{display:flex;flex:1;min-width:0;overflow:hidden}
.grupo-panel-wrapper > *{flex:1;min-width:0;width:100%}

.seq-inline-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(255,140,0,.13);border:1px solid rgba(255,140,0,.25);border-radius:20px;padding:1px 7px;font-size:12px;font-weight:900;color:#ff9a3c;}

.seq-hd-btn{overflow:visible}
.seq-hd-emoji{font-size:16px;line-height:1}
.seq-hd-btn.seq-active{border-color:#ff8c00;background:#221400;color:#ff8c00}
.seq-hd-btn.seq-pending{border-color:rgba(255,200,0,.4);background:#1a1400}
.seq-status-dot{position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;border:1.5px solid #0c0700}
.pending-dot{background:#ffca28;animation:pendingPulse 1.5s ease-in-out infinite}
.active-dot{background:#ff9a3c;animation:pipPulse 2.4s ease-in-out infinite}
@keyframes pendingPulse{0%,100%{opacity:1}50%{opacity:.4}}

.seq-wrap{position:relative}
.bg-picker-wrap{position:relative}

.bg-menu{position:absolute;top:calc(100% + 8px);right:0;background:#0e0800;border:1px solid #2a1800;border-radius:14px;padding:12px;z-index:200;min-width:220px;box-shadow:0 8px 32px rgba(0,0,0,.8)}
.bg-menu-title{font-size:10px;color:rgba(240,232,223,.35);text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:8px;padding-left:2px}
.bg-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.bg-swatch{width:36px;height:36px;border-radius:9px;border:1.5px solid #2a1800;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;transition:transform .15s,border-color .15s}
.bg-swatch:hover{transform:scale(1.08);border-color:#ff8c00}
.bg-swatch.on{border-color:#ff2d6b;border-width:2px}
.bg-check{color:#ff2d6b;font-size:14px;font-weight:700}

.seq-menu-tiktok{position:absolute;top:calc(100% + 10px);right:0;width:240px;border-radius:20px;overflow:hidden;z-index:300;box-shadow:0 16px 48px rgba(0,0,0,.7);font-family:'Nunito','Plus Jakarta Sans',sans-serif;border:1px solid rgba(255,180,70,.15);}

.smt-header{background:linear-gradient(160deg,#FFD166 0%,#FFB347 50%,#FF9A3C 100%);display:flex;align-items:center;justify-content:space-between;padding:10px 12px 0;}
.smt-close{width:24px;height:24px;border-radius:50%;background:rgba(0,0,0,.12);border:none;cursor:pointer;font-size:11px;font-weight:900;color:rgba(80,40,0,.7);display:flex;align-items:center;justify-content:center;}
.smt-title-badge{background:rgba(255,255,255,.28);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:800;color:rgba(80,40,0,.85);display:flex;align-items:center;gap:4px;}

.smt-days-row{background:linear-gradient(160deg,#FFD166 0%,#FFB347 50%,#FF9A3C 100%);display:flex;align-items:flex-end;justify-content:space-between;padding:4px 14px 8px;}
.smt-days-label{font-size:11px;font-weight:800;color:rgba(100,50,0,.6);margin-bottom:2px;}
.smt-days-num{font-size:42px;font-weight:900;color:#3D1800;line-height:1;letter-spacing:-2px;text-shadow:0 2px 0 rgba(255,255,255,.22);}
.smt-avatars{display:flex;margin-bottom:2px;}
.smt-av{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,200,80,.5);object-fit:cover;background:#c88040;overflow:hidden;}
.smt-av-eu{margin-left:-8px;background:linear-gradient(135deg,#a06030,#c89060);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;}

.smt-mascot-wrap{background:linear-gradient(180deg,#FFB347 0%,#FFD080 100%);display:flex;justify-content:center;padding:0 0 2px;}
.smt-mascot{animation:smtFloat 3s ease-in-out infinite;}
.smt-mascot--active{animation:smtFloat 1.8s ease-in-out infinite;}
@keyframes smtFloat{0%,100%{transform:translateY(0) rotate(-1deg);}50%{transform:translateY(-6px) rotate(1deg);}}

.smt-nome-section{background:#fffbf2;padding:6px 12px;border-top:1px solid #ffe0b0;}
.smt-nome-row{display:flex;align-items:center;gap:6px;}
.smt-nome-txt{font-size:14px;font-weight:900;color:#3D1800;flex:1;}
.smt-nome-edit-btn{background:none;border:none;cursor:pointer;font-size:13px;padding:2px;}
.smt-nome-input{flex:1;background:#fff8ee;border:1.5px solid #FFB347;border-radius:8px;padding:3px 7px;font-size:13px;font-weight:800;color:#3D1800;font-family:inherit;outline:none;}
.smt-nome-save-btn{background:#FF9A3C;border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:900;padding:3px 7px;cursor:pointer;}
.smt-nome-cancel-btn{background:none;border:none;color:#c87000;font-size:12px;cursor:pointer;font-weight:900;}

.smt-roupa-section{background:#fffbf2;padding:5px 12px 7px;border-top:1px solid #ffe0b0;}
.smt-roupa-toggle{background:rgba(255,180,60,.15);border:1px solid rgba(255,180,60,.3);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:800;color:#c87000;cursor:pointer;font-family:inherit;width:100%;text-align:left;}
.smt-roupa-painel{margin-top:6px;}
.smt-roupa-label{font-size:10px;font-weight:800;color:#c87000;text-transform:uppercase;letter-spacing:.06em;margin:5px 0 3px;}
.smt-cor-grid{display:flex;gap:5px;flex-wrap:wrap;}
.smt-cor-btn{width:24px;height:24px;border-radius:50%;border:2.5px solid transparent;cursor:pointer;transition:transform .15s,border-color .15s;}
.smt-cor-btn:hover{transform:scale(1.15);}
.smt-cor-btn.on{border-color:#3D1800;transform:scale(1.1);}
.smt-item-grid{display:flex;gap:4px;flex-wrap:wrap;}
.smt-item-btn{background:#fff8ee;border:1.5px solid #ffe0b0;border-radius:8px;padding:3px 7px;font-size:11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;font-family:inherit;transition:border-color .15s;}
.smt-item-btn span{font-size:9px;color:#c87000;font-weight:700;}
.smt-item-btn.on{border-color:#FF9A3C;background:#fff3e0;}
.smt-item-btn:hover{border-color:#FFB347;}

.smt-info{background:#fffbf2;padding:0 12px 8px;font-size:9px;color:rgba(100,60,0,.45);text-align:center;}

.seq-badge-bar{display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 16px;background:linear-gradient(90deg,rgba(255,45,107,.1),rgba(255,107,0,.1));border-bottom:1px solid rgba(255,107,0,.15);font-size:12px;flex-shrink:0}
.seq-badge-emoji{font-size:18px}
.seq-badge-txt{color:rgba(240,232,223,.6)}
.seq-badge-txt strong{color:#ff8c00}
.seq-badge-flame{font-size:16px}

.seq-request-banner{background:linear-gradient(90deg,rgba(255,200,0,.08),rgba(255,140,0,.06));border-bottom:1px solid rgba(255,200,0,.2);padding:10px 16px;flex-shrink:0}
.seq-req-content{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.seq-req-emoji{font-size:26px;flex-shrink:0}
.seq-req-text{flex:1;min-width:0}
.seq-req-title{font-size:13px;font-weight:700;color:#f0e8df}
.seq-req-sub{font-size:11px;color:rgba(240,232,223,.4);margin-top:2px}
.seq-req-actions{display:flex;gap:6px;flex-shrink:0}
.seq-req-btn{border:none;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s}
.seq-req-btn.accept{background:linear-gradient(135deg,#ff2d6b,#ff6b00);color:#fff}
.seq-req-btn.accept:hover{transform:scale(1.04)}
.seq-req-btn.reject{background:#1e1000;color:rgba(240,232,223,.4);border:1px solid #2a1800}
.seq-req-btn.reject:hover{border-color:#ff4444;color:rgba(255,100,100,.7)}

.seq-evolucao-notif{display:flex;align-items:center;gap:8px;background:#1a0e00;border:1px solid rgba(255,140,0,.25);border-radius:12px;padding:10px 14px;margin:8px 16px;animation:msgIn .3s ease;flex-shrink:0}
.seq-evolucao-notif span{font-size:22px}
.seq-evolucao-notif p{flex:1;font-size:12px;color:rgba(240,232,223,.6);line-height:1.4}
.seq-evolucao-notif p strong{color:#ff9a3c}
.seq-evolucao-notif button{background:linear-gradient(135deg,#ff2d6b,#ff6b00);color:#fff;border:none;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap}
.seq-evolucao-notif .dismiss{background:none;color:rgba(240,232,223,.3);border:none;border-radius:50%;width:22px;height:22px;padding:0;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer}

.seq-empty-hint{display:flex;align-items:center;gap:8px;background:#130900;border:1px solid #2a1800;border-radius:10px;padding:10px 14px;margin-top:12px;max-width:280px}
.seq-empty-hint span{font-size:20px}
.seq-empty-hint p{font-size:11px;color:rgba(240,232,223,.35);line-height:1.4}

.slide-down-enter-active,.slide-down-leave-active{transition:all .3s ease}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-100%);max-height:0}

.msgs{flex:1;overflow-y:auto;padding:18px 18px 8px;display:flex;flex-direction:column;gap:5px;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#2a1800 transparent;transition:background .5s,background-image .5s}
.chat-empty{display:flex;flex-direction:column;align-items:center;gap:10px;margin:auto;padding:40px}
.nome-lg{font-size:16px;font-weight:700}
.sub{font-size:13px;color:rgba(240,232,223,.3)}
.sep{text-align:center;font-size:10px;color:rgba(240,232,223,.22);padding:6px 0;text-transform:uppercase;letter-spacing:.06em}
.msg-row{display:flex;align-items:flex-end;gap:7px;animation:msgIn .2s ease}
.msg-row.own{flex-direction:row-reverse}
@keyframes msgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.balao{max-width:62%;background:#1a0e00;border:1px solid #2a1800;border-radius:16px 16px 16px 4px;padding:9px 13px;font-size:14px;line-height:1.5;color:rgba(240,232,223,.88);word-break:break-word}
.balao.own{background:linear-gradient(135deg,#c41840,#c45000);border:none;border-radius:16px 16px 4px 16px;color:#fff}
.balao.img{padding:4px;background:transparent;border-color:#2a1800}
.balao-img{width:180px;height:180px;object-fit:cover;border-radius:12px;cursor:zoom-in;display:block}
.meta{display:flex;align-items:center;gap:3px;font-size:10px;color:rgba(255,255,255,.3);margin-top:3px;justify-content:flex-end}
.typing{padding:11px 14px;display:flex;gap:4px;align-items:center}
.dot{width:6px;height:6px;background:rgba(240,232,223,.3);border-radius:50%;animation:bounce 1.2s infinite}
.dot:nth-child(2){animation-delay:.18s}.dot:nth-child(3){animation-delay:.36s}

.spin{animation:spinIcon .8s linear infinite}
@keyframes spinIcon{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.emoji-pick{position:absolute;bottom:65px;left:14px;background:#0e0800;border:1px solid #2a1800;border-radius:14px;padding:10px;z-index:60;display:grid;grid-template-columns:repeat(8,1fr);gap:3px;box-shadow:0 8px 32px rgba(0,0,0,.6)}
.e-btn{background:none;border:none;font-size:19px;cursor:pointer;padding:4px;border-radius:7px;transition:background .15s;line-height:1}
.e-btn:hover{background:#1e1000}
.input-bar{display:flex;align-items:center;gap:7px;padding:11px 14px;background:#0c0700;border-top:1px solid #1a0f00;flex-shrink:0;position:relative}
.inp-ic{background:none;border:none;color:rgba(240,232,223,.28);transition:color .2s}
.inp-ic:hover,.inp-ic.on{color:#ff8c00;background:none;border:none}
.msg-in{flex:1;background:#130900;border:1.5px solid #2a1800;border-radius:22px;padding:9px 15px;color:#f0e8df;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
.msg-in:focus{border-color:#ff6b00}
.msg-in::placeholder{color:rgba(240,232,223,.2)}
.send-btn{background:#1e1000;border:1.5px solid #2a1800;color:rgba(240,232,223,.22);width:37px;height:37px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;fill:currentColor;flex-shrink:0}
.send-btn.on{background:linear-gradient(135deg,#ff2d6b,#ff6b00);border-color:transparent;color:#fff;box-shadow:0 3px 14px rgba(255,45,107,.4)}
.send-btn.on:hover{transform:scale(1.08)}
.placeholder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:rgba(240,232,223,.2)}
.ph-icon{width:76px;height:76px;border-radius:50%;background:#130900;border:1px solid #2a1800;display:flex;align-items:center;justify-content:center;fill:rgba(240,232,223,.15)}

.overlay{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center}
.dark{background:rgba(0,0,0,.93)}
.toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);background:#1a0e00;color:#f0e8df;font-size:13px;font-weight:600;padding:9px 20px;border-radius:22px;border:1px solid #2a1800;z-index:600;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5)}

.fade-enter-active,.fade-leave-active{transition:opacity .2s}
.fade-enter-from,.fade-leave-to{opacity:0}
.pop-enter-active{transition:all .22s cubic-bezier(.34,1.56,.64,1)}
.pop-leave-active{transition:all .15s ease}
.pop-enter-from,.pop-leave-to{opacity:0;transform:scale(.88) translateY(6px)}
.toast-enter-active,.toast-leave-active{transition:all .3s ease}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translate(-50%,10px)}

.nova-conv-modal{background:#0f0800;border:1px solid #2a1500;border-radius:16px;width:360px;max-height:520px;display:flex;flex-direction:column;overflow:hidden}
.nova-conv-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #1e1000}
.nova-conv-header h2{font-size:15px;font-weight:700;color:#f0e8df}
.modal-close{background:none;border:none;color:rgba(240,232,223,.4);font-size:16px;cursor:pointer;padding:4px}
.modal-close:hover{color:#ff2d6b}
.nova-conv-search{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #1e1000;color:rgba(240,232,223,.4)}
.nova-conv-search input{flex:1;background:none;border:none;outline:none;color:#f0e8df;font-size:14px}
.nova-conv-search input::placeholder{color:rgba(240,232,223,.3)}
.nova-conv-lista{flex:1;overflow-y:auto;padding:8px 0}
.nova-conv-vazio{padding:24px;text-align:center;color:rgba(240,232,223,.3);font-size:13px}
.nova-conv-item{display:flex;align-items:center;gap:12px;padding:10px 20px;cursor:pointer;transition:background .15s}
.nova-conv-item:hover{background:rgba(255,45,107,.07)}
.nova-conv-av{width:40px;height:40px;border-radius:50%;object-fit:cover}
.nova-conv-nome{font-size:14px;font-weight:600;color:#f0e8df}
.nova-conv-handle{font-size:12px;color:rgba(240,232,223,.4)}
.nova-conv-online{margin-left:auto;font-size:11px;color:#ff9a3c;white-space:nowrap}
.convs-vazio{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);text-align:center;color:rgba(240,232,223,.3);font-size:13px}
.convs-vazio button{margin-top:8px;background:#ff2d6b;color:#fff;border:none;padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px}
.conv-item{position:relative}
.del-conv-btn{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(240,232,223,.18);font-size:11px;cursor:pointer;padding:3px 5px;border-radius:6px;line-height:1;opacity:0;transition:opacity .15s,color .15s,background .15s;z-index:1;font-weight:700;letter-spacing:.5px}
.conv-item:hover .del-conv-btn{opacity:1}
.del-conv-btn:hover{color:#ff2d6b;background:rgba(255,45,107,.08)}

@media(max-width:700px){
  .sidebar{width:100%;min-width:100%}
  .chat{display:flex;position:absolute;inset:0;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);flex:none}
  .chat.open{transform:none}
  .back{display:flex}
  .seq-menu-tiktok{right:auto;left:0;width:240px}
  .bg-menu{right:auto;left:0}
  .seq-req-content{flex-wrap:wrap}
  .grupo-panel-wrapper{display:flex;position:absolute;inset:0;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);flex:none}
  .grupo-panel-wrapper--open{transform:none;flex:none}
  .grupo-panel-wrapper > *{width:100%}
}
</style>