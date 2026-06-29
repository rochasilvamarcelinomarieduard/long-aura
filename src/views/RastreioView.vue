<template>
  <div class="rastreio">

    <!-- HEADER -->
    <div class="rastreio-header">
      <div class="header-brand">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#ff2e88"/>
        </svg>
        <span class="header-logo">Long<em>Aura</em></span>
        <span class="header-sep">·</span>
        <span class="header-sub">Rastreio</span>
      </div>
      <p class="header-desc">Acompanhe seu pedido em tempo real</p>
    </div>

    <!-- BUSCA -->
    <div v-if="!pedidoEncontrado" class="busca-wrap">
      <div class="busca-card">
        <div class="busca-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="1" y="3" width="15" height="13" rx="1"/>
            <path d="M16 8h4l3 5v3h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div class="busca-eyebrow">Rastreamento de Pedido</div>
        <h2 class="busca-title">Onde está<br/><span class="grad-text">meu pedido?</span></h2>
        <p class="busca-desc">Digite o código de rastreio que aparece na aba <strong>Pedidos</strong> do carrinho.</p>
        <div class="busca-input-group">
          <div class="busca-input-wrap">
            <svg class="busca-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <input v-model="codigoBusca" class="busca-input" placeholder="Ex: BR5C91JUUJR" @keydown.enter="buscar" :disabled="buscando"/>
          </div>
          <button class="busca-btn" @click="buscar" :disabled="buscando || !codigoBusca.trim()">
            <span v-if="!buscando">Rastrear <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            <span v-else class="btn-spinner"/>
          </button>
        </div>
        <p v-if="erroBusca" class="busca-erro">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ erroBusca }}
        </p>
        <div class="busca-hint">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Código de 11 dígitos enviado por e-mail após a compra
        </div>
      </div>
    </div>

    <!-- RESULTADO -->
    <div v-else class="resultado">

      <div class="res-nav">
        <button class="voltar-btn" @click="resetar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Rastrear outro
        </button>
        <div class="res-nav-right">
          <div class="res-numero">#{{ pedidoEncontrado.numero }}</div>
          <div class="res-codigo">{{ pedidoEncontrado.codigoRastreio }}</div>
        </div>
      </div>

      <!-- STATUS -->
      <div class="status-card" :class="'status-card--' + statusClass">
        <div class="status-glow"/>
        <div class="status-emoji">{{ statusEmoji }}</div>
        <div class="status-info">
          <div class="status-label">{{ statusLabel }}</div>
          <div class="status-sub">{{ etapaAtual.subtitulo }}</div>
          <div class="progress-wrap">
            <div class="progress-track"><div class="progress-fill" :style="{ width: progressoPct + '%' }"/></div>
            <span class="progress-txt">{{ pedidoEncontrado.etapaAtiva + 1 }}/{{ etapas.length }} etapas</span>
          </div>
        </div>
        <div class="status-pct">{{ progressoPct }}<span>%</span></div>
      </div>

      <!-- GRID -->
      <div class="grid-principal">

        <!-- COLUNA ESQ -->
        <div class="col-esq">

          <!-- Mapa Navegável -->
          <div class="card mapa-card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Localização</span>
              <span class="live-pill">● Ao vivo</span>
            </div>

            <!-- Mapa Leaflet -->
            <div class="mapa-leaflet-wrap">
              <div id="mapa-leaflet" ref="mapaRef" class="mapa-leaflet"/>
              <div class="mapa-dica">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Clique na loja para ver a fachada virtual
              </div>
            </div>

            <!-- Modal Fachada -->
            <Transition name="fade">
              <div v-if="fachadaAberta" class="fachada-modal">
                <div class="fachada-header">
                  <div class="fachada-titulo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Fachada Virtual — Aura Beauty
                  </div>
                  <button class="fachada-close" @click="fachadaAberta = false">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="fachada-body">
                  <div v-if="fachadaCarregando" class="fachada-loading">
                    <div class="fachada-spinner"/>
                    <span>IA gerando fachada virtual...</span>
                  </div>
                  <div v-else-if="fachadaSvg" class="fachada-svg-wrap" v-html="fachadaSvg"/>
                  <div v-else class="fachada-erro-txt">Não foi possível gerar a fachada.</div>
                </div>
              </div>
            </Transition>

            <div class="eta-band">
              <div class="eta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <div class="eta-label">Previsão de entrega</div>
                  <div class="eta-val">{{ pedidoEncontrado.previsaoEntrega }}</div>
                </div>
              </div>
              <div class="eta-divider"/>
              <div class="eta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <div>
                  <div class="eta-label">Distância</div>
                  <div class="eta-val">{{ pedidoEncontrado.distancia ?? '12,4 km' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Histórico do pedido</span>
            </div>
            <div class="timeline">
              <div v-for="(etapa, i) in etapas" :key="i" class="tl-item"
                :class="{ 'tl-done': etapa.status==='done', 'tl-active': etapa.status==='active', 'tl-pending': etapa.status==='pending' }">
                <div class="tl-left">
                  <div class="tl-dot">
                    <svg v-if="etapa.status==='done'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <div v-else-if="etapa.status==='active'" class="tl-pulse"/>
                  </div>
                  <div v-if="i < etapas.length-1" class="tl-line"/>
                </div>
                <div class="tl-content">
                  <div class="tl-top">
                    <div class="tl-titulo">{{ etapa.titulo }}</div>
                    <div v-if="etapa.hora" class="tl-hora">{{ etapa.hora }}</div>
                  </div>
                  <div class="tl-sub">{{ etapa.subtitulo }}</div>
                  <div v-if="etapa.detalhe" class="tl-detalhe">{{ etapa.detalhe }}</div>
                  <div v-if="etapa.status==='active'" class="tl-badge">Situação atual</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Itens -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="16 3 12 7 8 3"/></svg>
              <span>Itens do pedido</span>
            </div>
            <div v-for="(item, i) in pedidoEncontrado.itens" :key="i" class="item-row">
              <div class="item-img">
                <img v-if="item.imagemUrl" :src="item.imagemUrl" :alt="item.nome"/>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="16 3 12 7 8 3"/></svg>
              </div>
              <div class="item-info">
                <div class="item-nome">{{ item.nome }}</div>
                <div class="item-det">{{ item.detalhe }}</div>
              </div>
              <div class="item-preco">{{ item.preco }}</div>
            </div>
            <div class="resumo">
              <div class="resumo-row"><span>Subtotal</span><span>{{ pedidoEncontrado.subtotal }}</span></div>
              <div class="resumo-row" v-if="pedidoEncontrado.desconto"><span>Desconto</span><span class="txt-pink">− {{ pedidoEncontrado.desconto }}</span></div>
              <div class="resumo-row"><span>Frete</span><span class="txt-green">{{ pedidoEncontrado.frete ?? 'Grátis' }}</span></div>
              <div class="resumo-div"/>
              <div class="resumo-row resumo-total"><span>Total pago</span><span class="grad-text">{{ pedidoEncontrado.total }}</span></div>
            </div>
          </div>

        </div>

        <!-- COLUNA DIR -->
        <div class="col-dir">

          <!-- Transportadora -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>Transportadora</span>
            </div>
            <div class="transp-row">
              <div class="transp-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div class="transp-info">
                <div class="transp-nome">{{ pedidoEncontrado.transportadora ?? 'Jadlog · Expresso' }}</div>
                <div class="transp-cod">{{ pedidoEncontrado.codigoRastreio }}</div>
              </div>
              <button class="copiar-btn" @click="copiarCodigo">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {{ copiado ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
            <div class="info-grid">
              <div class="info-cell"><div class="info-lbl">Tipo</div><div class="info-val">{{ pedidoEncontrado.tipoFrete ?? 'Expresso' }}</div></div>
              <div class="info-cell"><div class="info-lbl">Prazo</div><div class="info-val">{{ pedidoEncontrado.prazoFrete ?? '3–5 dias úteis' }}</div></div>
              <div class="info-cell"><div class="info-lbl">Peso</div><div class="info-val">{{ pedidoEncontrado.peso ?? '—' }}</div></div>
              <div class="info-cell"><div class="info-lbl">Volumes</div><div class="info-val">{{ pedidoEncontrado.volumes ?? '1 pacote' }}</div></div>
            </div>
          </div>

          <!-- Endereço -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Endereço de entrega</span>
            </div>
            <div class="endereco-nome">{{ pedidoEncontrado.nomeDestinatario ?? 'Destinatário' }}</div>
            <div class="endereco-txt">{{ pedidoEncontrado.endereco }}</div>
          </div>

          <!-- Atualizações -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span>Atualizações</span>
            </div>
            <div v-for="(n, i) in atualizacoes" :key="i" class="notif-row">
              <div class="notif-dot" :class="'notif-dot--' + n.cor"/>
              <div class="notif-txt"><b>{{ n.titulo }}</b> — {{ n.descricao }}</div>
              <div class="notif-hora">{{ n.hora }}</div>
            </div>
          </div>

          <!-- Pagamento -->
          <div class="card">
            <div class="card-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2e88" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span>Pagamento</span>
            </div>
            <div class="info-grid">
              <div class="info-cell"><div class="info-lbl">Método</div><div class="info-val txt-pink">{{ pedidoEncontrado.pagamento }}</div></div>
              <div class="info-cell"><div class="info-lbl">Status</div><div class="info-val txt-green">Aprovado ✓</div></div>
              <div class="info-cell"><div class="info-lbl">Parcelas</div><div class="info-val">{{ pedidoEncontrado.parcelas ?? 'À vista' }}</div></div>
              <div class="info-cell info-cell--btn" @click="gerarNfe">
                <div class="info-lbl">NF-e</div>
                <div class="info-val nfe-btn">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar PDF
                </div>
              </div>
            </div>
          </div>

          <!-- Suporte -->
          <button class="suporte-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Falar com suporte
          </button>

        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="gtoast">
      <div v-if="toast" class="g-toast">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {{ toast }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import { supabase } from '@/supabase.js'

const codigoBusca      = ref('')
const buscando         = ref(false)
const erroBusca        = ref('')
const pedidoEncontrado = ref(null)
const copiado          = ref(false)
const toast            = ref('')
const mapaRef          = ref(null)
const fachadaAberta    = ref(false)
const fachadaCarregando = ref(false)
const fachadaSvg       = ref('')
let   toastTimer       = null
let   realtimeChannel  = null
let   mapaInstance     = null

// ── Coords fixas da loja (Belo Horizonte) ─────────────────────────────────────
const LOJA_LAT  = -19.9227
const LOJA_LNG  = -43.9451
const DEST_LAT  = -19.9012
const DEST_LNG  = -43.9320

function fmt(v) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function mostrarToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2200)
}

function montarPedido(data) {
  pedidoEncontrado.value = {
    numero:           data.numero,
    codigoRastreio:   data.codigo_rastreio,
    previsaoEntrega:  data.previsao_entrega,
    etapaAtiva:       data.etapa_ativa ?? 0,
    pagamento:        data.pagamento,
    parcelas:         data.parcelas,
    desconto:         data.desconto ? fmt(data.desconto) : null,
    subtotal:         fmt(data.subtotal ?? data.total),
    frete:            data.frete ? fmt(data.frete) : 'Grátis',
    total:            fmt(data.total),
    totalRaw:         Number(data.total || 0),
    subtotalRaw:      Number(data.subtotal ?? data.total ?? 0),
    freteRaw:         Number(data.frete || 0),
    descontoRaw:      Number(data.desconto || 0),
    endereco:         data.endereco_entrega,
    nomeDestinatario: data.nome_destinatario,
    transportadora:   data.transportadora,
    tipoFrete:        data.tipo_frete,
    prazoFrete:       data.prazo_frete,
    peso:             data.peso,
    volumes:          data.volumes,
    distancia:        data.distancia,
    horaPedido:       data.hora_pedido,
    horaPagamento:    data.hora_pagamento,
    horaSeparacao:    data.hora_separacao,
    horaEntrega:      data.hora_entrega,
    horaEntregue:     data.hora_entregue,
    itens: (data.itens_pedido ?? []).map(i => ({
      nome:      i.nome,
      detalhe:   i.detalhe,
      preco:     fmt(i.preco),
      precoRaw:  Number(i.preco || 0),
      imagemUrl: i.imagem_url,
    })),
  }
}

function assinarRealtime(pedidoId) {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  realtimeChannel = supabase
    .channel(`pedido-${pedidoId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedidoId}` },
      (payload) => {
        if (pedidoEncontrado.value) {
          pedidoEncontrado.value.etapaAtiva = payload.new.etapa_ativa ?? pedidoEncontrado.value.etapaAtiva
          mostrarToast('✦ Status atualizado!')
        }
      }
    )
    .subscribe()
}

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  if (mapaInstance)    mapaInstance.remove()
})

// ── Inicializa Leaflet após pedido encontrado ────────────────────────────────
watch(pedidoEncontrado, async (val) => {
  if (!val) return
  await nextTick()
  await iniciarMapa()
})

async function carregarLeaflet() {
  if (window.L) return
  // CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id   = 'leaflet-css'
    link.rel  = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
  }
  // JS
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    s.onload  = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

async function iniciarMapa() {
  await carregarLeaflet()
  const L = window.L
  if (mapaInstance) { mapaInstance.remove(); mapaInstance = null }

  const el = document.getElementById('mapa-leaflet')
  if (!el) return

  mapaInstance = L.map(el, { zoomControl: true, scrollWheelZoom: true })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mapaInstance)

  // Marcador LOJA (ícone customizado pink)
  const iconeLoja = L.divIcon({
    className: '',
    html: `<div class="mapa-pin mapa-pin--loja">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>`,
    iconSize:   [38, 38],
    iconAnchor: [19, 38],
  })

  // Marcador DESTINO (ícone verde)
  const iconeDestino = L.divIcon({
    className: '',
    html: `<div class="mapa-pin mapa-pin--destino">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>`,
    iconSize:   [34, 34],
    iconAnchor: [17, 34],
  })

  const markerLoja = L.marker([LOJA_LAT, LOJA_LNG], { icon: iconeLoja })
    .addTo(mapaInstance)
    .bindPopup(`
      <div class="popup-loja">
        <strong>🏪 Aura Beauty</strong><br/>
        <span>Clique para ver a fachada virtual ✦</span>
      </div>
    `, { className: 'popup-dark' })

  markerLoja.on('click', () => abrirFachada())

  L.marker([DEST_LAT, DEST_LNG], { icon: iconeDestino })
    .addTo(mapaInstance)
    .bindPopup(`<div class="popup-loja"><strong>📦 Seu endereço</strong></div>`, { className: 'popup-dark' })

  // Linha tracejada entre loja e destino
  L.polyline(
    [[LOJA_LAT, LOJA_LNG], [DEST_LAT, DEST_LNG]],
    { color: '#ff2e88', weight: 2.5, dashArray: '8 6', opacity: 0.8 }
  ).addTo(mapaInstance)

  // Ajusta bounds para mostrar os dois pontos
  mapaInstance.fitBounds(
    [[LOJA_LAT, LOJA_LNG], [DEST_LAT, DEST_LNG]],
    { padding: [40, 40] }
  )
}

async function abrirFachada() {
  fachadaAberta.value     = true
  fachadaCarregando.value = false
  fachadaSvg.value = `<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0005"/>
      <stop offset="100%" stop-color="#1a0010"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ff2e88" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ff2e88" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="vitrine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0010"/>
      <stop offset="100%" stop-color="#0d0008"/>
    </linearGradient>
    <filter id="neon">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Fundo -->
  <rect width="600" height="340" fill="url(#sky)"/>

  <!-- Estrelas -->
  <circle cx="50" cy="20" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="120" cy="35" r="1" fill="#fff" opacity="0.4"/>
  <circle cx="200" cy="15" r="1.2" fill="#fff" opacity="0.7"/>
  <circle cx="380" cy="25" r="1" fill="#fff" opacity="0.5"/>
  <circle cx="450" cy="10" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="530" cy="30" r="1.2" fill="#fff" opacity="0.4"/>
  <circle cx="570" cy="18" r="1" fill="#fff" opacity="0.5"/>

  <!-- Prédio fundo -->
  <rect x="30" y="60" width="80" height="180" fill="#0f0008" rx="2"/>
  <rect x="490" y="80" width="80" height="160" fill="#0f0008" rx="2"/>

  <!-- Janelas prédio fundo esq -->
  <rect x="42" y="75" width="18" height="14" fill="#ff8c00" opacity="0.3" rx="1"/>
  <rect x="68" y="75" width="18" height="14" fill="#ff2e88" opacity="0.2" rx="1"/>
  <rect x="42" y="100" width="18" height="14" fill="#ff2e88" opacity="0.15" rx="1"/>
  <rect x="68" y="100" width="18" height="14" fill="#ff8c00" opacity="0.25" rx="1"/>

  <!-- Prédio principal -->
  <rect x="110" y="40" width="380" height="220" fill="#0d0008" rx="3"/>
  <rect x="110" y="40" width="380" height="4" fill="#ff2e88" opacity="0.8"/>

  <!-- 2º andar janelas -->
  <rect x="130" y="60" width="50" height="35" fill="#1a0010" rx="2" stroke="#ff2e88" stroke-width="0.5" stroke-opacity="0.4"/>
  <rect x="200" y="60" width="50" height="35" fill="#1a0010" rx="2" stroke="#ff2e88" stroke-width="0.5" stroke-opacity="0.4"/>
  <rect x="270" y="60" width="60" height="35" fill="#ff2e88" opacity="0.08" rx="2" stroke="#ff2e88" stroke-width="0.5" stroke-opacity="0.6"/>
  <rect x="350" y="60" width="50" height="35" fill="#1a0010" rx="2" stroke="#ff2e88" stroke-width="0.5" stroke-opacity="0.4"/>
  <rect x="420" y="60" width="50" height="35" fill="#1a0010" rx="2" stroke="#ff8c00" stroke-width="0.5" stroke-opacity="0.4"/>

  <!-- Luz nas janelas do 2º andar -->
  <rect x="131" y="61" width="48" height="33" fill="#ff8c00" opacity="0.06" rx="2"/>
  <rect x="421" y="61" width="48" height="33" fill="#ff8c00" opacity="0.08" rx="2"/>

  <!-- Letreiro AURA BEAUTY -->
  <rect x="150" y="108" width="300" height="50" fill="#0a0005" rx="4" stroke="#ff2e88" stroke-width="1.5"/>
  <rect x="152" y="110" width="296" height="46" fill="url(#glow)" rx="3"/>
  <text x="300" y="141" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#ff2e88" filter="url(#neon)">AURA BEAUTY</text>
  <text x="300" y="141" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#ff2e88">AURA BEAUTY</text>

  <!-- Linha decorativa letreiro -->
  <line x1="170" y1="148" x2="230" y2="148" stroke="#ff8c00" stroke-width="0.8" opacity="0.6"/>
  <line x1="370" y1="148" x2="430" y2="148" stroke="#ff8c00" stroke-width="0.8" opacity="0.6"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial" font-size="7" fill="#ff8c00" opacity="0.8" letter-spacing="4">BEAUTY &amp; LIFESTYLE</text>

  <!-- Vitrine -->
  <rect x="130" y="170" width="340" height="90" fill="url(#vitrine)" rx="2" stroke="#ff2e88" stroke-width="0.8" stroke-opacity="0.5"/>

  <!-- Luz vitrine -->
  <rect x="131" y="171" width="338" height="15" fill="#ff2e88" opacity="0.06"/>

  <!-- Produto 1: Perfume -->
  <rect x="175" y="185" width="22" height="40" fill="#1a0010" rx="3" stroke="#ff8c00" stroke-width="0.8"/>
  <rect x="175" y="180" width="22" height="10" fill="#ff8c00" opacity="0.7" rx="2"/>
  <rect x="181" y="175" width="10" height="8" fill="#ff8c00" opacity="0.5" rx="1"/>
  <text x="186" y="212" text-anchor="middle" font-family="Arial" font-size="5" fill="#ff8c00" opacity="0.8">PARFUM</text>

  <!-- Produto 2: Batom -->
  <rect x="228" y="195" width="14" height="30" fill="#ff2e88" opacity="0.8" rx="2"/>
  <rect x="228" y="188" width="14" height="10" fill="#ff2e88" rx="2"/>
  <ellipse cx="235" cy="188" rx="7" ry="4" fill="#ff6b35"/>

  <!-- Produto 3: Frasco grande -->
  <rect x="268" y="182" width="30" height="45" fill="#0d0008" rx="4" stroke="#ff2e88" stroke-width="1"/>
  <rect x="270" y="184" width="26" height="41" fill="#1a0010" rx="3"/>
  <text x="283" y="207" text-anchor="middle" font-family="Georgia" font-size="6" fill="#ff2e88">A</text>
  <rect x="275" y="178" width="16" height="7" fill="#ff2e88" opacity="0.6" rx="1"/>

  <!-- Produto 4: Batom 2 -->
  <rect x="322" y="198" width="12" height="27" fill="#ff8c00" opacity="0.9" rx="2"/>
  <rect x="322" y="192" width="12" height="9" fill="#ff8c00" rx="2"/>
  <ellipse cx="328" cy="192" rx="6" ry="3" fill="#ffb347"/>

  <!-- Produto 5: Frasco pequeno -->
  <rect x="358" y="192" width="20" height="35" fill="#1a0010" rx="3" stroke="#ff8c00" stroke-width="0.8"/>
  <rect x="362" y="188" width="12" height="7" fill="#ff8c00" opacity="0.5" rx="1"/>

  <!-- Reflexo chão vitrine -->
  <rect x="130" y="255" width="340" height="5" fill="#ff2e88" opacity="0.08"/>

  <!-- Porta -->
  <rect x="265" y="200" width="70" height="60" fill="#0a0005" rx="2" stroke="#ff2e88" stroke-width="0.8" stroke-opacity="0.6"/>
  <line x1="300" y1="200" x2="300" y2="260" stroke="#ff2e88" stroke-width="0.5" stroke-opacity="0.4"/>
  <circle cx="308" cy="232" r="2.5" fill="#ff8c00" opacity="0.8"/>
  <circle cx="292" cy="232" r="2.5" fill="#ff8c00" opacity="0.8"/>

  <!-- Calçada -->
  <rect x="0" y="260" width="600" height="80" fill="#080005"/>
  <rect x="0" y="260" width="600" height="3" fill="#ff2e88" opacity="0.3"/>

  <!-- Reflexo neon no chão -->
  <ellipse cx="300" cy="268" rx="200" ry="8" fill="#ff2e88" opacity="0.06"/>
  <ellipse cx="300" cy="272" rx="150" ry="5" fill="#ff2e88" opacity="0.04"/>

  <!-- Linhas calçada -->
  <line x1="0" y1="290" x2="600" y2="290" stroke="#1a0010" stroke-width="1"/>
  <line x1="0" y1="310" x2="600" y2="310" stroke="#1a0010" stroke-width="1"/>

  <!-- Luminárias -->
  <rect x="108" y="90" width="4" height="170" fill="#0d0008"/>
  <rect x="95" y="88" width="18" height="5" fill="#ff8c00" opacity="0.7" rx="1"/>
  <ellipse cx="104" cy="93" rx="12" ry="4" fill="#ff8c00" opacity="0.15"/>

  <rect x="488" y="90" width="4" height="170" fill="#0d0008"/>
  <rect x="487" y="88" width="18" height="5" fill="#ff8c00" opacity="0.7" rx="1"/>
  <ellipse cx="496" cy="93" rx="12" ry="4" fill="#ff8c00" opacity="0.15"/>
</svg>`
}

 async function buscar() {
  const codigo = codigoBusca.value.trim().toUpperCase()
  if (!codigo) return
  buscando.value  = true
  erroBusca.value = ''
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { erroBusca.value = 'Você precisa estar logado para rastrear.'; return }
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .eq('codigo_rastreio', codigo)
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) throw error
    if (!data) { erroBusca.value = 'Código não encontrado. Verifique se digitou corretamente.'; return }
    montarPedido(data)
    assinarRealtime(data.id)
  } catch {
    erroBusca.value = 'Erro ao buscar pedido. Tente novamente.'
  } finally {
    buscando.value = false
  }
}

function resetar() {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  if (mapaInstance)    { mapaInstance.remove(); mapaInstance = null }
  realtimeChannel        = null
  pedidoEncontrado.value = null
  codigoBusca.value      = ''
  erroBusca.value        = ''
  fachadaAberta.value    = false
  fachadaSvg.value       = ''
}

async function copiarCodigo() {
  await navigator.clipboard?.writeText(pedidoEncontrado.value?.codigoRastreio ?? '')
  copiado.value = true
  mostrarToast('Código copiado!')
  setTimeout(() => { copiado.value = false }, 2000)
}

// ── Gerar NF-e PDF ────────────────────────────────────────────────────────────
async function gerarNfe() {
  const p = pedidoEncontrado.value
  if (!p) return
  mostrarToast('Gerando NF-e...')

  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = resolve; s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210, mg = 14
  let y = 0

  // ── Helpers ──────────────────────────────────────────────────────────────
  const rgb   = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
  const sF    = c => doc.setFillColor(...rgb(c))
  const sD    = c => doc.setDrawColor(...rgb(c))
  const sT    = c => doc.setTextColor(...rgb(c))
  const font  = (sz, st = 'normal', col = '#1a1a1a') => { doc.setFontSize(sz); doc.setFont('helvetica', st); sT(col) }
  const box   = (x, yy, w, h, fc, sc, lw = 0.2) => {
    if (fc) sF(fc); if (sc) { sD(sc); doc.setLineWidth(lw) }
    doc.rect(x, yy, w, h, fc && sc ? 'FD' : fc ? 'F' : 'D')
  }
  const rbox  = (x, yy, w, h, r, fc, sc, lw = 0.3) => {
    if (fc) sF(fc); if (sc) { sD(sc); doc.setLineWidth(lw) }
    doc.roundedRect(x, yy, w, h, r, r, fc && sc ? 'FD' : fc ? 'F' : 'D')
  }
  const hline = (x1, x2, yy, col = '#e0e0e0', lw = 0.25) => {
    sD(col); doc.setLineWidth(lw); doc.line(x1, yy, x2, yy)
  }
  const pill  = (x, yy, w, h, fc) => { sF(fc); doc.roundedRect(x, yy, w, h, h/2, h/2, 'F') }

  // ── CABEÇALHO BRANCO ─────────────────────────────────────────────────────
  // Fundo branco total
  box(0, 0, W, 50, '#ffffff')

  // Barra lateral esquerda rosa
  box(0, 0, 4, 50, '#ff2e88')

  // Linha decorativa topo (rosa→laranja)
  const steps = 40
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const r = 0xff
    const g = Math.round(0x2e + t * (0x8c - 0x2e))
    const b = Math.round(0x88 + t * (0x00 - 0x88))
    doc.setFillColor(r, g, b)
    doc.rect((W / steps) * i, 0, W / steps + 0.5, 2.5, 'F')
  }

  // Logo: "Aura" preto + "Beauty" rosa
  font(22, 'bold', '#1a1a1a')
  doc.text('Aura', mg + 4, 22)
  const aW = doc.getTextWidth('Aura')
  font(22, 'bold', '#ff2e88')
  doc.text('Beauty', mg + 4 + aW + 1.5, 22)

  // Subtítulo
  font(6.5, 'normal', '#999999')
  doc.text('BEAUTY & LIFESTYLE PREMIUM', mg + 4, 29)

  // Linha divisória fina
  hline(mg + 4, mg + 4 + doc.getTextWidth('AuraBeauty') + 30, 32, '#f0f0f0')

  // Badge NF-e
  pill(W - mg - 50, 10, 50, 11, '#ff2e88')
  font(7.5, 'bold', '#ffffff')
  doc.text('NOTA FISCAL ELETRÔNICA', W - mg - 25, 17, { align: 'center' })

  // Número pedido
  font(9, 'bold', '#1a1a1a')
  doc.text(`Pedido  #${p.numero}`, W - mg - 25, 29, { align: 'center' })

  const agora = new Date()
  const dataEmissao = agora.toLocaleDateString('pt-BR') + '  ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  font(6.5, 'normal', '#aaaaaa')
  doc.text(`Emitida em: ${dataEmissao}`, W - mg - 25, 35, { align: 'center' })

  // Linha separadora inferior do header
  hline(0, W, 50, '#eeeeee', 0.4)

  y = 60

  // ── HELPER seção ─────────────────────────────────────────────────────────
  const secao = (label, yy) => {
    font(6.5, 'bold', '#ff2e88')
    doc.text(label, mg, yy)
    hline(mg + doc.getTextWidth(label) + 3, W - mg, yy - 1, '#f0f0f0', 0.3)
    return yy + 6
  }

  // ── INFORMAÇÕES DO PEDIDO ─────────────────────────────────────────────────
  y = secao('INFORMAÇÕES DO PEDIDO', y)

  rbox(mg, y, W - mg * 2, 34, 3, '#fafafa', '#eeeeee')

  // divisória interna
  hline(mg + 4, W - mg - 4, y + 18, '#eeeeee', 0.2)

  const cols  = [mg + 5, mg + 47, mg + 97, mg + 147]
  const row1y = y + 14
  const row2y = y + 27

  const infoData = [
    ['Nº do Pedido',       `#${p.numero}`,                 cols[0], row1y],
    ['Código de Rastreio', p.codigoRastreio,               cols[1], row1y],
    ['Pagamento',          p.pagamento,                    cols[2], row1y],
    ['Status',             'Aprovado ✓',                   cols[3], row1y],
    ['Transportadora',     p.transportadora ?? 'Jadlog',   cols[0], row2y],
    ['Tipo de Frete',      p.tipoFrete ?? 'Expresso',      cols[1], row2y],
    ['Previsão Entrega',   p.previsaoEntrega ?? '—',        cols[2], row2y],
    ['Parcelas',           p.parcelas ?? 'À vista',        cols[3], row2y],
  ]

  for (const [lbl, val, x, ry] of infoData) {
    font(5.8, 'normal', '#aaaaaa'); doc.text(lbl.toUpperCase(), x, ry - 5)
    if (lbl === 'Status')        { font(8.5, 'bold', '#22c55e') }
    else if (lbl === 'Nº do Pedido') { font(8.5, 'bold', '#ff2e88') }
    else                         { font(8.5, 'bold', '#1a1a1a') }
    doc.text(String(val ?? '—'), x, ry)
  }
  y += 42

  // ── DESTINATÁRIO ──────────────────────────────────────────────────────────
  y = secao('DESTINATÁRIO', y)

  rbox(mg, y, W - mg * 2, 26, 3, '#fafafa', '#eeeeee')

  // Pin rosa
  sF('#ff2e88'); doc.circle(mg + 8, y + 11, 2.5, 'F')
  sF('#ffffff'); doc.circle(mg + 8, y + 11, 1,   'F')

  font(10, 'bold', '#1a1a1a')
  doc.text(p.nomeDestinatario ?? 'Destinatário', mg + 14, y + 13)
  font(8, 'normal', '#777777')
  doc.text(doc.splitTextToSize(p.endereco ?? '', 165)[0], mg + 14, y + 21)
  y += 34

  // ── ITENS DO PEDIDO ───────────────────────────────────────────────────────
  y = secao('ITENS DO PEDIDO', y)

  // Cabeçalho da tabela
  rbox(mg, y, W - mg * 2, 9, 2, '#1a1a1a', null)
  font(6.5, 'bold', '#ffffff')
  doc.text('PRODUTO',  mg + 5,     y + 6)
  doc.text('DETALHE',  mg + 106,   y + 6)
  doc.text('VALOR',    W - mg - 5, y + 6, { align: 'right' })
  y += 9

  for (let i = 0; i < p.itens.length; i++) {
    const item  = p.itens[i]
    const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa'
    box(mg, y, W - mg * 2, 10, rowBg, '#eeeeee', 0.15)

    // dot colorido
    sF(i % 2 === 0 ? '#ff2e88' : '#ff8c00')
    doc.circle(mg + 8, y + 5, 1.2, 'F')

    font(8.5, 'normal', '#1a1a1a')
    doc.text(doc.splitTextToSize(item.nome, 88)[0], mg + 13, y + 6.8)
    font(7.5, 'normal', '#888888')
    doc.text(item.detalhe ?? '—', mg + 106, y + 6.8)
    font(8.5, 'bold', '#ff2e88')
    doc.text(item.preco, W - mg - 5, y + 6.8, { align: 'right' })
    y += 10
  }
  y += 8

  // ── RESUMO FINANCEIRO ─────────────────────────────────────────────────────
  const rw = 72, rx = W - mg - rw
  const hasDisc = p.descontoRaw > 0
  const rh = hasDisc ? 48 : 40

  rbox(rx, y, rw, rh, 3, '#fafafa', '#eeeeee')

  font(6.5, 'bold', '#ff2e88')
  doc.text('RESUMO', rx + 5, y + 7)
  hline(rx + 2, rx + rw - 2, y + 9, '#eeeeee', 0.25)

  let ry = y + 16
  font(8, 'normal', '#888888'); doc.text('Subtotal:',  rx + 5,      ry)
  font(8, 'bold',   '#1a1a1a'); doc.text(p.subtotal,   rx + rw - 5, ry, { align: 'right' }); ry += 7

  if (hasDisc) {
    font(8, 'normal', '#888888'); doc.text('Desconto:', rx + 5,      ry)
    font(8, 'bold',   '#e63946'); doc.text(`- ${p.desconto}`, rx + rw - 5, ry, { align: 'right' }); ry += 7
  }

  font(8, 'normal', '#888888'); doc.text('Frete:',    rx + 5,      ry)
  font(8, 'bold',   '#22c55e'); doc.text(p.freteRaw > 0 ? p.frete : 'Grátis', rx + rw - 5, ry, { align: 'right' }); ry += 5

  // Barra total rosa
  rbox(rx, ry, rw, 12, 2, '#ff2e88', null)
  font(7.5, 'bold', '#ffffff'); doc.text('TOTAL PAGO', rx + 5, ry + 8)
  font(10,  'bold', '#ffffff'); doc.text(p.total, rx + rw - 5, ry + 8, { align: 'right' })

  y = ry + 22

  // ── RODAPÉ ────────────────────────────────────────────────────────────────
  hline(mg, W - mg, 274, '#eeeeee', 0.3)

  font(6.5, 'normal', '#bbbbbb')
  doc.text('Este documento é uma representação simplificada da Nota Fiscal Eletrônica.', mg, 279)
  doc.text('Para fins fiscais, consulte a NF-e completa no portal SEFAZ com a chave de acesso.', mg, 284)

  // Pontilhado
  sD('#eeeeee'); doc.setLineWidth(0.2); doc.setLineDashPattern([1, 2], 0)
  doc.line(mg, 288, W - mg, 288)
  doc.setLineDashPattern([], 0)

  // Nome empresa
  font(7, 'bold', '#ff2e88'); doc.text('Aura Beauty', mg, 293)
  const abW = doc.getTextWidth('Aura Beauty')
  font(7, 'normal', '#bbbbbb')
  doc.text('  ·  CNPJ 00.000.000/0001-00  ·  contato@aurabeauty.com.br  ·  (11) 9 9999-9999', mg + abW, 293)

  // Barra gradiente final
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const g = Math.round(0x2e + t * (0x8c - 0x2e))
    const b = Math.round(0x88 + t * (0x00 - 0x88))
    doc.setFillColor(0xff, g, b)
    doc.rect((W / steps) * i, 297, W / steps + 0.5, 3, 'F')
  }

  doc.save(`nfe-aurabeauty-${p.numero}.pdf`)
  mostrarToast('✓ NF-e gerada com sucesso!')
}

// ── Etapas ────────────────────────────────────────────────────────────────────
const etapas = computed(() => {
  const p = pedidoEncontrado.value, a = p?.etapaAtiva ?? 0
  return [
    { titulo: 'Pedido confirmado',  subtitulo: 'Pedido recebido pela loja',                                                               detalhe: null,                            hora: p?.horaPedido    ?? null },
    { titulo: 'Pagamento aprovado', subtitulo: p?.pagamento ?? '',                                                                        detalhe: null,                            hora: p?.horaPagamento ?? null },
    { titulo: 'Separando pedido',   subtitulo: a===2?'Equipe preparando o pacote':a>2?'Pacote preparado':'Aguardando etapa anterior',      detalhe: a===2?'Até 1 dia útil':null,     hora: a>=2?(p?.horaSeparacao??null):null },
    { titulo: 'Saiu para entrega',  subtitulo: a===3?'Entregador a caminho':a>3?'Entregador chegou':'Aguardando',                         detalhe: a===3?`Previsão: ${p?.previsaoEntrega??'—'}`:null, hora: a>=3?(p?.horaEntrega??null):null },
    { titulo: 'Entregue',           subtitulo: a>=4?'Pedido entregue com sucesso!':'Aguardando',                                          detalhe: null,                            hora: a>=4?(p?.horaEntregue??null):null },
  ].map((e, i) => ({ ...e, status: a > i ? 'done' : a === i ? 'active' : 'pending' }))
})

const etapaAtual   = computed(() => etapas.value[pedidoEncontrado.value?.etapaAtiva ?? 0] ?? etapas.value[0])
const progressoPct = computed(() => Math.round((((pedidoEncontrado.value?.etapaAtiva ?? 0) + 1) / etapas.value.length) * 100))

const statusMap = {
  0: { label: 'Confirmado', cls: 'green', emoji: '✅' },
  1: { label: 'Pago',       cls: 'green', emoji: '💳' },
  2: { label: 'Separando',  cls: 'amber', emoji: '📦' },
  3: { label: 'Em rota',    cls: 'blue',  emoji: '🛵' },
  4: { label: 'Entregue',   cls: 'green', emoji: '🏠' },
}
const statusLabel = computed(() => statusMap[pedidoEncontrado.value?.etapaAtiva ?? 0]?.label ?? '')
const statusClass = computed(() => statusMap[pedidoEncontrado.value?.etapaAtiva ?? 0]?.cls  ?? 'green')
const statusEmoji = computed(() => statusMap[pedidoEncontrado.value?.etapaAtiva ?? 0]?.emoji ?? '📦')

const atualizacoes = computed(() => {
  const p = pedidoEncontrado.value, a = p?.etapaAtiva ?? 0, f = []
  if (a >= 1) f.push({ cor: 'green', titulo: 'Pagamento confirmado', descricao: p?.pagamento ?? 'boleto compensado', hora: p?.horaPagamento ?? '—' })
  if (a >= 0) f.push({ cor: 'pink',  titulo: 'Pedido criado',        descricao: 'aguardando pagamento',               hora: p?.horaPedido    ?? '—' })
  if (a < 2)  f.push({ cor: 'gray',  titulo: 'Notificação de envio', descricao: 'pendente',                           hora: '—' })
  return f
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.rastreio {
  --grad: linear-gradient(90deg, #ff2e88, #ff8c00);
  --bg:   #000000;
  --s1:   #060606;
  --s2:   #0a0a0a;
  --s3:   #111111;
  --b1:   #111111;
  --b2:   #1c1c1c;
  --b3:   #282828;
  --t1:   #f0f0f0;
  --t2:   #888888;
  --t3:   #444444;
  background: var(--bg);
  min-height: 100vh;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 60px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.grad-text {
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── HEADER ─────────────────────────────────────────────────────────────── */
.rastreio-header {
  background: linear-gradient(135deg, #14000a, #0a0a0a 70%);
  border-bottom: 1px solid var(--b1);
  padding: 20px 48px 18px;
  display: flex; align-items: center; justify-content: space-between;
}
.header-brand { display: flex; align-items: center; gap: 10px; }
.header-logo  {
  font-family: 'Syne', sans-serif;
  font-size: 17px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--t1);
}
.header-logo em {
  font-style: normal;
  background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.header-sep  { color: var(--b3); font-size: 18px; }
.header-sub  { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--t2); }
.header-desc { font-size: 12px; color: var(--t3); }

/* ── BUSCA ──────────────────────────────────────────────────────────────── */
.busca-wrap {
  display: flex; align-items: center; justify-content: center;
  min-height: calc(100vh - 70px); padding: 40px 20px;
}
.busca-card {
  width: 100%; max-width: 520px;
  background: var(--s1); border: 1px solid var(--b2); border-radius: 14px;
  padding: 44px 40px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  position: relative; overflow: hidden;
}
.busca-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--grad);
}
.busca-icon-wrap {
  width: 68px; height: 68px; border-radius: 18px;
  background: rgba(255,46,136,.08); border: 1px solid rgba(255,46,136,.15);
  display: flex; align-items: center; justify-content: center; color: #ff2e88; margin-bottom: 22px;
}
.busca-eyebrow { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: #ff2e88; margin-bottom: 8px; }
.busca-title {
  font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800;
  line-height: 1.1; letter-spacing: -0.5px; color: var(--t1); margin-bottom: 10px;
}
.busca-desc  { font-size: 12.5px; color: var(--t2); line-height: 1.6; margin-bottom: 28px; max-width: 360px; }
.busca-desc strong { color: var(--t1); }

.busca-input-group { display: flex; gap: 8px; width: 100%; margin-bottom: 12px; }
.busca-input-wrap  { flex: 1; position: relative; display: flex; align-items: center; }
.busca-input-icon  { position: absolute; left: 14px; color: var(--t3); pointer-events: none; }
.busca-input {
  width: 100%; padding: 13px 16px 13px 44px;
  background: var(--s3); border: 1px solid var(--b2); border-radius: 9px;
  color: var(--t1); font-family: 'DM Sans', sans-serif; font-size: 14px;
  letter-spacing: 1.5px; font-weight: 500; text-transform: uppercase; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.busca-input:focus { border-color: #ff2e88; box-shadow: 0 0 0 3px rgba(255,46,136,.08); }
.busca-input::placeholder { color: #333; letter-spacing: 1px; }

.busca-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 13px 22px; background: var(--grad); color: #fff; border: none; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
  letter-spacing: .5px; text-transform: uppercase; cursor: pointer; white-space: nowrap;
  transition: opacity .2s, transform .15s;
}
.busca-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
.busca-btn:disabled { opacity: .4; cursor: not-allowed; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

.busca-erro { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #ff2e88; margin-bottom: 10px; }
.busca-hint { display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--t3); }
.busca-hint svg { color: #555; flex-shrink: 0; }

/* ── RESULTADO ──────────────────────────────────────────────────────────── */
.resultado { max-width: 960px; margin: 0 auto; padding: 28px 28px 0; }

.res-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.voltar-btn {
  display: flex; align-items: center; gap: 7px;
  background: none; border: none; color: var(--t2); font-size: 12.5px;
  font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 7px 14px 7px 0; transition: color .2s;
}
.voltar-btn:hover { color: var(--t1); }
.res-nav-right   { display: flex; align-items: center; gap: 10px; }
.res-numero      { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #ff2e88; }
.res-codigo      { font-size: 11px; font-family: monospace; color: var(--t3); letter-spacing: 1px; }

/* ── STATUS ─────────────────────────────────────────────────────────────── */
.status-card {
  border-radius: 13px; padding: 12px 16px;
  display: flex; align-items: center; gap: 14px; margin-bottom: 12px;
  position: relative; overflow: hidden;
}
.status-card--green { background: rgba(74,222,128,.05); border: 1px solid rgba(74,222,128,.2); }
.status-card--amber { background: rgba(251,191,36,.05);  border: 1px solid rgba(251,191,36,.2); }
.status-card--blue  { background: rgba(96,165,250,.05);  border: 1px solid rgba(96,165,250,.2); }
.status-glow {
  position: absolute; right: -60px; top: -60px; width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,46,136,.06), transparent 70%); pointer-events: none;
}
.status-emoji  { font-size: 32px; flex-shrink: 0; }
.status-info   { flex: 1; }
.status-label  { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: var(--t1); }
.status-sub    { font-size: 12px; color: var(--t2); margin-top: 3px; }
.progress-wrap { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.progress-track { flex: 1; height: 3px; background: rgba(255,255,255,.07); border-radius: 2px; overflow: hidden; }
.progress-fill  { height: 100%; background: var(--grad); border-radius: 2px; transition: width .7s ease; }
.progress-txt   { font-size: 10px; color: var(--t3); white-space: nowrap; }
.status-pct {
  font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; flex-shrink: 0;
  background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.status-pct span { font-size: 14px; }

/* ── GRID ───────────────────────────────────────────────────────────────── */
.grid-principal { display: grid; grid-template-columns: 1fr 290px; gap: 16px; align-items: start; }
@media (max-width: 720px) { .grid-principal { grid-template-columns: 1fr; } }
.col-esq, .col-dir { display: flex; flex-direction: column; gap: 8px; }

/* ── CARD ───────────────────────────────────────────────────────────────── */
.card { background: var(--s1); border: 1px solid var(--b2); border-radius: 13px; padding: 12px 14px; }
.card-header {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--t3); margin-bottom: 8px;
}
.card-header span:first-of-type { color: var(--t2); }
.live-pill {
  margin-left: auto; font-size: 9.5px; font-weight: 700; color: #4ade80;
  background: rgba(74,222,128,.1); border-radius: 20px; padding: 2px 9px; letter-spacing: 0;
}

/* ── MAPA LEAFLET ───────────────────────────────────────────────────────── */
.mapa-leaflet-wrap { position: relative; margin-bottom: 12px; border-radius: 9px; overflow: hidden; }
.mapa-leaflet      { width: 100%; height: 260px; border-radius: 9px; }
.mapa-dica {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,0,0,.75); border: 1px solid rgba(255,46,136,.3); border-radius: 20px;
  padding: 4px 12px; font-size: 10px; color: #ccc; white-space: nowrap; pointer-events: none;
  backdrop-filter: blur(4px); z-index: 500;
}

/* Pinos customizados do mapa */
:global(.mapa-pin) {
  width: 38px; height: 38px; border-radius: 50% 50% 50% 0;
  display: flex; align-items: center; justify-content: center;
  transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(0,0,0,.5);
}
:global(.mapa-pin > *) { transform: rotate(45deg); }
:global(.mapa-pin--loja)    { background: linear-gradient(135deg, #ff2e88, #ff6b35); border: 2px solid rgba(255,255,255,.3); }
:global(.mapa-pin--destino) { background: linear-gradient(135deg, #4ade80, #22c55e); border: 2px solid rgba(255,255,255,.3); }

/* Popup dark */
:global(.popup-dark .leaflet-popup-content-wrapper) {
  background: #111; border: 1px solid #282828; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.6); color: #f0f0f0;
}
:global(.popup-dark .leaflet-popup-tip) { background: #111; }
:global(.popup-loja) { font-family: 'DM Sans', sans-serif; font-size: 12px; line-height: 1.7; }
:global(.popup-loja strong) { color: #ff2e88; font-size: 13px; }
:global(.popup-loja span)   { color: #888; font-size: 11px; }

/* ── FACHADA MODAL ──────────────────────────────────────────────────────── */
.fachada-modal {
  background: var(--s1); border: 1px solid var(--b2); border-radius: 11px;
  overflow: hidden; margin-bottom: 12px;
}
.fachada-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--b2);
  background: var(--s3);
}
.fachada-titulo {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700; letter-spacing: .5px; color: var(--t2);
}
.fachada-close {
  background: none; border: none; color: var(--t3); cursor: pointer; padding: 4px;
  display: flex; align-items: center; transition: color .2s;
}
.fachada-close:hover { color: #ff2e88; }
.fachada-body { padding: 16px; min-height: 120px; display: flex; align-items: center; justify-content: center; }
.fachada-loading {
  display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--t2); font-size: 12px;
}
.fachada-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(255,46,136,.2); border-top-color: #ff2e88;
  border-radius: 50%; animation: spin .8s linear infinite;
}
.fachada-svg-wrap { width: 100%; }
.fachada-svg-wrap :deep(svg), .fachada-svg-wrap svg { width: 100%; height: auto; border-radius: 8px; }
.fachada-erro-txt { font-size: 12px; color: var(--t2); }

/* Transição fade */
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease, transform .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── ETA BAND ───────────────────────────────────────────────────────────── */
.eta-band    { display: flex; align-items: center; background: var(--s3); border: 1px solid var(--b2); border-radius: 8px; padding: 12px 14px; gap: 14px; }
.eta-item    { display: flex; align-items: center; gap: 9px; flex: 1; }
.eta-divider { width: 1px; height: 28px; background: var(--b2); flex-shrink: 0; }
.eta-label   { font-size: 9.5px; color: var(--t3); text-transform: uppercase; letter-spacing: .5px; }
.eta-val     { font-size: 13px; font-weight: 600; color: var(--t1); margin-top: 2px; }

/* ── TIMELINE ───────────────────────────────────────────────────────────── */
.timeline  { display: flex; flex-direction: column; }
.tl-item   { display: flex; gap: 12px; }
.tl-left   { display: flex; flex-direction: column; align-items: center; }
.tl-dot {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--b2); color: var(--t3); transition: all .3s;
}
.tl-done .tl-dot   { background: #ff2e88; color: #fff; }
.tl-active .tl-dot { background: #ff6b35; color: #fff; box-shadow: 0 0 0 5px rgba(255,107,53,.15); }
.tl-pulse  { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
.tl-line   { width: 2px; flex: 1; min-height: 14px; margin: 3px 0; background: var(--b2); }
.tl-done .tl-line { background: #ff2e88; }
.tl-content  { padding-bottom: 8px; flex: 1; }
.tl-top      { display: flex; align-items: center; justify-content: space-between; }
.tl-titulo   { font-size: 13.5px; font-weight: 500; color: var(--t1); }
.tl-pending .tl-titulo { color: var(--t3); }
.tl-hora     { font-size: 10.5px; color: var(--t3); }
.tl-sub      { font-size: 11.5px; color: var(--t2); margin-top: 2px; }
.tl-active .tl-sub { color: #ff6b35; }
.tl-detalhe  { font-size: 11px; color: var(--t3); margin-top: 3px; font-style: italic; }
.tl-badge    { display: inline-block; margin-top: 5px; font-size: 9.5px; font-weight: 700; color: #ff6b35; background: rgba(255,107,53,.1); border-radius: 20px; padding: 2px 9px; }

/* ── ITENS ──────────────────────────────────────────────────────────────── */
.item-row { display: flex; align-items: center; gap: 11px; padding: 6px 0; border-bottom: 1px solid var(--b1); }
.item-row:last-of-type { border-bottom: none; }
.item-img  { width: 38px; height: 38px; border-radius: 8px; background: var(--b2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-nome { font-size: 13px; font-weight: 500; color: var(--t1); }
.item-det  { font-size: 11px; color: var(--t2); margin-top: 1px; }
.item-preco { font-size: 13px; font-weight: 600; color: var(--t1); }

.resumo      { margin-top: 8px; }
.resumo-row  { display: flex; justify-content: space-between; font-size: 12px; color: var(--t2); padding: 2px 0; }
.resumo-div  { height: 1px; background: var(--b2); margin: 6px 0; }
.resumo-total { font-size: 14px; font-weight: 700; color: var(--t1); }

/* ── TRANSPORTADORA ─────────────────────────────────────────────────────── */
.transp-row  { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.transp-icon { width: 36px; height: 36px; background: var(--s3); border-radius: 8px; border: 1px solid var(--b2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.transp-info { flex: 1; }
.transp-nome { font-size: 13px; font-weight: 500; color: var(--t1); }
.transp-cod  { font-size: 10.5px; color: #ff2e88; font-family: monospace; letter-spacing: .5px; margin-top: 1px; }
.copiar-btn  {
  display: flex; align-items: center; gap: 5px;
  background: var(--s3); border: 1px solid var(--b2); border-radius: 6px;
  padding: 5px 10px; font-size: 10.5px; color: var(--t2);
  cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: all .2s;
}
.copiar-btn:hover { color: var(--t1); border-color: #ff2e88; }

/* ── INFO GRID ──────────────────────────────────────────────────────────── */
.info-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.info-cell    { background: var(--s3); border-radius: 8px; padding: 7px 10px; }
.info-cell--btn { cursor: pointer; transition: background .2s; }
.info-cell--btn:hover { background: rgba(255,46,136,.08); }
.info-lbl     { font-size: 9.5px; color: var(--t3); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 4px; }
.info-val     { font-size: 12px; color: #ccc; font-weight: 500; }
.nfe-btn      { display: flex; align-items: center; gap: 5px; color: #ff2e88 !important; font-weight: 600; }

/* ── ENDEREÇO ───────────────────────────────────────────────────────────── */
.endereco-nome { font-size: 13px; font-weight: 500; color: var(--t1); margin-bottom: 4px; }
.endereco-txt  { font-size: 12px; color: var(--t2); line-height: 1.6; }

/* ── NOTIF ──────────────────────────────────────────────────────────────── */
.notif-row  { display: flex; align-items: center; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--b1); }
.notif-row:last-child { border-bottom: none; }
.notif-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.notif-dot--green { background: #4ade80; }
.notif-dot--pink  { background: #ff2e88; }
.notif-dot--gray  { background: var(--b3); }
.notif-txt  { font-size: 11.5px; color: var(--t2); flex: 1; }
.notif-txt b { color: var(--t1); font-weight: 500; }
.notif-hora { font-size: 10px; color: var(--t3); white-space: nowrap; }

/* ── SUPORTE ────────────────────────────────────────────────────────────── */
.suporte-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; background: var(--s1); border: 1px solid var(--b2); border-radius: 10px;
  padding: 13px; font-size: 12.5px; color: var(--t2); font-family: 'DM Sans', sans-serif;
  cursor: pointer; transition: all .2s;
}
.suporte-btn:hover { background: var(--s2); color: var(--t1); border-color: #ff2e88; }

/* ── UTILITÁRIOS ────────────────────────────────────────────────────────── */
.txt-pink  { color: #ff2e88; }
.txt-green { color: #4ade80; }

/* ── TOAST ──────────────────────────────────────────────────────────────── */
.g-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  z-index: 1000; display: flex; align-items: center; gap: 8px;
  padding: 10px 22px; background: var(--grad); color: #fff;
  font-size: 12px; font-weight: 700; border-radius: 22px; white-space: nowrap;
  pointer-events: none; box-shadow: 0 4px 24px rgba(255,46,136,.35);
}
.gtoast-enter-active, .gtoast-leave-active { transition: all .3s ease; }
.gtoast-enter-from, .gtoast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── RESPONSIVO ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .rastreio-header { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 4px; }
  .resultado       { padding: 16px 16px 0; }
  .busca-card      { padding: 32px 22px; }
  .busca-title     { font-size: 26px; }
}
</style>