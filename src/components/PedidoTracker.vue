<template>
  <div class="pedido-tracker">

    <div v-if="carregando && !pedido" class="loading-state">
      <div class="spinner"></div>
      <span>Buscando seu pedido...</span>
    </div>

    <div v-else-if="erro && !pedido" class="error-state">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff2d6f" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Erro ao carregar pedido</p>
      <button class="retry-btn" @click="buscarPedidoAtivo">Tentar novamente</button>
    </div>

    <div v-else-if="!pedido" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.5">
        <path d="m7.5 4.27 9 5.15"/>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      </svg>
      <p>Nenhum pedido em andamento</p>
      <span>Seus pedidos ativos aparecerão aqui</span>
    </div>

    <template v-else>

      <div class="eta-banner">
        <div class="eta-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <rect x="9" y="11" width="14" height="10" rx="2"/>
            <circle cx="12" cy="16" r="1"/>
            <circle cx="20" cy="16" r="1"/>
          </svg>
        </div>
        <div class="eta-text">
          <div class="eta-title">Previsão de entrega</div>
          <div class="eta-subtitle">{{ pedido.previsaoEntrega }}</div>
        </div>
        <div class="eta-status" :class="'eta-status--' + statusClass">{{ statusLabel }}</div>
      </div>

      <div class="map-section">
        <div class="map-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Localização em tempo real
          <span class="map-live-dot"></span>
        </div>
        <div ref="mapEl" class="map-container"></div>
      </div>

      <div class="progress-section">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-label">{{ etapaAtual.titulo }} · Etapa {{ pedido.etapaAtiva + 1 }} de {{ etapas.length }}</div>
      </div>

      <div class="status-steps">
        <div
          v-for="(etapa, index) in etapas"
          :key="index"
          class="step"
          :class="{
            'step--done':    etapa.status === 'done',
            'step--active':  etapa.status === 'active',
            'step--pending': etapa.status === 'pending'
          }"
        >
          <div class="step-left">
            <div class="step-dot">
              <svg v-if="etapa.status === 'done'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <component :is="'svg'" v-else v-bind="etapa.svgAttrs" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" v-html="etapa.svgPath"></component>
            </div>
            <div v-if="index < etapas.length - 1" class="step-line"></div>
          </div>
          <div class="step-content">
            <div class="step-title">{{ etapa.titulo }}</div>
            <div class="step-subtitle">{{ etapa.subtitulo }}</div>
          </div>
        </div>
      </div>

      <div v-if="pedido.codigoRastreio" class="section-label">Rastreamento</div>
      <div v-if="pedido.codigoRastreio" class="tracking-card">
        <div class="tracking-info">
          <div class="tracking-meta">Código de rastreio</div>
          <div class="tracking-code">{{ pedido.codigoRastreio }}</div>
        </div>
        <button class="copy-btn" @click="copiarCodigo">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copiado ? 'Copiado!' : 'Copiar' }}
        </button>
      </div>

      <button
        v-if="pedido.codigoRastreio"
        class="rastreio-btn"
        @click="router.push('/rastreio')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Rastrear pedido
      </button>

      <div class="section-label">Detalhes do pedido</div>
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Pedido</span>
          <span class="info-value info-value--pink">#{{ pedido.numero }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Endereço</span>
          <span class="info-value">{{ pedido.endereco }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pagamento</span>
          <span class="info-value">
            {{ pedido.pagamento }}
            <span v-if="pedido.desconto" class="badge-desconto">{{ pedido.desconto }}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Total</span>
          <span class="info-value info-value--green">{{ pedido.total }}</span>
        </div>
      </div>

      <div class="section-label">Itens do pedido</div>
      <div class="items-list">
        <div v-for="(item, i) in pedido.itens" :key="i" class="item-row">
          <div class="item-img">
            <img v-if="item.imagemUrl" :src="item.imagemUrl" :alt="item.nome" />
            <span v-else>📦</span>
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.nome }}</div>
            <div class="item-detail">{{ item.detalhe }}</div>
          </div>
          <div class="item-price">{{ item.preco }}</div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import { usePedido } from '@/composables/usePedido'

const router = useRouter()

const props = defineProps({
  pedido: { type: Object, default: null },
  // Indica se este componente está de fato visível na tela (não escondido
  // por um v-show no componente pai). Necessário porque o Leaflet não
  // calcula dimensões corretamente em um container com display:none —
  // sem isso, o mapa fica em branco/cinza quando inicializado enquanto
  // escondido. Veja o watch de `visivel` mais abaixo.
  visivel: { type: Boolean, default: true },
})

const userId = ref(null)
supabase.auth.getUser().then(({ data }) => { userId.value = data?.user?.id ?? null })

const { pedido: pedidoBanco, carregando, erro, buscarPedidoAtivo } = usePedido(userId)

const pedido = computed(() => props.pedido ?? pedidoBanco.value)

const mapEl = ref(null)
let mapInstance      = null
let entregadorMarker = null
let mapaPendente      = null // guarda os dados do mapa quando ainda não dá pra inicializar (container escondido)

async function iniciarMapa(mapa) {
  if (!mapEl.value || !mapa?.origem?.lat) return

  // Se o container ainda está escondido (display:none, ex: aba "Pedidos"
  // não está visível), o Leaflet calcularia tamanho 0x0 e renderizaria o
  // mapa em branco. Nesse caso, guarda os dados e espera `visivel` ficar
  // true para então inicializar de fato (veja watch de `visivel`).
  if (!estaRealmenteVisivel()) {
    mapaPendente = mapa
    return
  }

  if (!window.L) {
    await carregarScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
  const L = window.L
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
  mapInstance = L.map(mapEl.value, {
    zoomControl: false, attributionControl: false, dragging: true, scrollWheelZoom: false
  })
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mapInstance)
  const origem  = [mapa.origem.lat, mapa.origem.lng]
  const destino = [mapa.destino.lat, mapa.destino.lng]
  L.marker(origem, { icon: L.divIcon({
    html: `<div style="background:#ff2d6f;width:12px;height:12px;border-radius:50%;border:2px solid #fff;"></div>`,
    className: '', iconAnchor: [6, 6]
  })}).addTo(mapInstance).bindPopup('<b>Estoque / Loja</b>')
  L.marker(destino, { icon: L.divIcon({
    html: `<div style="background:#4ade80;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>`,
    className: '', iconAnchor: [7, 7]
  })}).addTo(mapInstance).bindPopup('<b>Seu endereço</b>')
  L.polyline([origem, destino], { color: '#ff6b35', weight: 3, dashArray: '6 6', opacity: 0.7 }).addTo(mapInstance)
  if (mapa.entregador?.lat) atualizarEntregador(mapa.entregador, L)

  // Garante que o container já tenha dimensões reais antes do fitBounds
  await nextTick()
  mapInstance.invalidateSize()
  mapInstance.fitBounds(L.latLngBounds([origem, destino]), { padding: [28, 28] })
  mapaPendente = null
}

function estaRealmenteVisivel() {
  if (!mapEl.value) return false
  // offsetParent é null quando o elemento (ou um ancestral) está com
  // display:none — forma simples e confiável de detectar isso sem
  // depender só da prop `visivel`, cobrindo outros casos de v-show.
  return mapEl.value.offsetParent !== null
}

function atualizarEntregador(coords, L = window.L) {
  if (!mapInstance || !L) return
  const pos = [coords.lat, coords.lng]
  const icon = L.divIcon({
    html: `<div style="background:#ff6b35;width:20px;height:20px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;">🛵</div>`,
    className: '', iconAnchor: [10, 10]
  })
  if (entregadorMarker) {
    entregadorMarker.setLatLng(pos)
  } else {
    entregadorMarker = L.marker(pos, { icon }).addTo(mapInstance).bindPopup('<b>Entregador</b>')
  }
}

function carregarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
}

watch(() => pedido.value?.mapa, async (mapa) => {
  if (!mapa) return
  await nextTick()
  if (!mapInstance) await iniciarMapa(mapa)
  else if (mapa.entregador?.lat) atualizarEntregador(mapa.entregador)
}, { deep: true, immediate: true })

// Quando o painel que contém este componente passa a ficar visível de
// fato (ex: a pessoa abre a aba "Pedidos" no carrinho, que usa v-show),
// ou inicializa o mapa pela primeira vez (caso ele tenha sido pedido
// enquanto ainda estava escondido), ou recalcula o tamanho de um mapa
// que já existia mas estava com dimensões erradas por ter sido criado
// dentro de um container display:none.
watch(() => props.visivel, async (visivel) => {
  if (!visivel) return
  await nextTick()

  if (mapaPendente) {
    // Mapa nunca tinha sido desenhado de fato — inicializa agora que dá.
    await iniciarMapa(mapaPendente)
  } else if (mapInstance) {
    // Mapa já existia: só precisa recalcular o tamanho do container,
    // que mudou de 0x0 (display:none) para o tamanho real.
    mapInstance.invalidateSize()
    if (pedido.value?.mapa) {
      const origem  = [pedido.value.mapa.origem.lat, pedido.value.mapa.origem.lng]
      const destino = [pedido.value.mapa.destino.lat, pedido.value.mapa.destino.lng]
      mapInstance.fitBounds(window.L.latLngBounds([origem, destino]), { padding: [28, 28] })
    }
  }
})

onUnmounted(() => { if (mapInstance) { mapInstance.remove(); mapInstance = null } })

const svgs = {
  clock:   `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
  package: `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>`,
  truck:   `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>`,
  home:    `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`
}

const etapas = computed(() => {
  const a = pedido.value?.etapaAtiva ?? 0
  return [
    { titulo: 'Pedido confirmado',    subtitulo: 'Recebemos seu pedido',                                                      icon: 'clock'   },
    { titulo: 'Pagamento aprovado',   subtitulo: pedido.value?.pagamento ?? 'Pix',                                            icon: 'clock'   },
    { titulo: 'Separando seu pedido', subtitulo: a === 2 ? 'Em andamento no estoque...' : a > 2 ? 'Concluído' : 'Aguardando', icon: 'package' },
    { titulo: 'Saiu para entrega',    subtitulo: a === 3 ? 'A caminho da sua casa!' : 'Aguardando',                           icon: 'truck'   },
    { titulo: 'Entregue',             subtitulo: a >= 4  ? 'Pedido entregue!' : 'Aguardando',                                 icon: 'home'    },
  ].map((e, i) => ({
    ...e,
    svgPath:  svgs[e.icon],
    svgAttrs: { viewBox: '0 0 24 24' },
    status: a > i ? 'done' : a === i ? 'active' : 'pending'
  }))
})

const etapaAtualIndex = computed(() => Math.min(pedido.value?.etapaAtiva ?? 0, etapas.value.length - 1))
const etapaAtual      = computed(() => etapas.value[etapaAtualIndex.value])
const progressPercent = computed(() => Math.round(((pedido.value?.etapaAtiva ?? 0) / (etapas.value.length - 1)) * 100))

const statusMap = {
  0: { label: 'Confirmado', cls: 'green' },
  1: { label: 'Pago',       cls: 'green' },
  2: { label: 'Separando',  cls: 'amber' },
  3: { label: 'Em rota',    cls: 'blue'  },
  4: { label: 'Entregue',   cls: 'green' },
}
const statusLabel = computed(() => statusMap[pedido.value?.etapaAtiva ?? 0]?.label ?? '')
const statusClass = computed(() => statusMap[pedido.value?.etapaAtiva ?? 0]?.cls ?? 'green')

const copiado = ref(false)
function copiarCodigo() {
  navigator.clipboard.writeText(pedido.value?.codigoRastreio ?? '').catch(() => {})
  copiado.value = true
  setTimeout(() => { copiado.value = false }, 2000)
}
</script>

<style scoped>
.pedido-tracker { padding: 4px 0 8px; color: #fff; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px 0; color: #666; font-size: 13px; }
.spinner { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #2a2a2a; border-top-color: #ff2d6f; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 0; text-align: center; }
.error-state p { font-size: 14px; color: #fff; }
.retry-btn { background: #ff2d6f; color: #fff; border: none; border-radius: 8px; padding: 8px 20px; font-size: 13px; cursor: pointer; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 60px 20px; text-align: center; }
.empty-state p { font-size: 15px; color: #fff; font-weight: 500; }
.empty-state span { font-size: 13px; color: #555; }
.eta-banner { background: #1a1a2e; border: 0.5px solid #2d2d5e; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.eta-icon { width: 36px; height: 36px; background: #2d2d5e; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #818cf8; flex-shrink: 0; }
.eta-text { flex: 1; }
.eta-title { font-size: 13px; color: #c7d2fe; font-weight: 500; }
.eta-subtitle { font-size: 11px; color: #6366f1; margin-top: 2px; }
.eta-status { font-size: 10px; font-weight: 600; border-radius: 20px; padding: 3px 8px; white-space: nowrap; }
.eta-status--green { color: #4ade80; background: rgba(74,222,128,0.12); }
.eta-status--amber { color: #fbbf24; background: rgba(251,191,36,0.12); }
.eta-status--blue  { color: #60a5fa; background: rgba(96,165,250,0.12); }
.map-section { margin-bottom: 14px; }
.map-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #555; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 6px; }
.map-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
.map-container { width: 100%; height: 180px; border-radius: 10px; overflow: hidden; border: 0.5px solid #2a2a2a; }
.progress-section { margin-bottom: 20px; }
.progress-track { background: #1e1e1e; border-radius: 4px; height: 4px; margin-bottom: 6px; }
.progress-fill { background: linear-gradient(90deg, #ff2d6f, #ff6b35); height: 4px; border-radius: 4px; transition: width 0.6s ease; }
.progress-label { font-size: 11px; color: #666; }
.status-steps { margin-bottom: 4px; }
.step { display: flex; gap: 12px; }
.step-left { display: flex; flex-direction: column; align-items: center; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #2a2a2a; color: #555; transition: all 0.3s; }
.step--done .step-dot   { background: #ff2d6f; color: #fff; }
.step--active .step-dot { background: #ff6b35; color: #fff; box-shadow: 0 0 0 4px rgba(255,107,53,0.2); }
.step-line { width: 2px; flex: 1; min-height: 18px; margin: 2px 0; background: #2a2a2a; }
.step--done .step-line  { background: #ff2d6f; }
.step-content { padding-bottom: 18px; flex: 1; }
.step-title { font-size: 14px; font-weight: 500; color: #fff; line-height: 1.4; }
.step--pending .step-title { color: #555; }
.step-subtitle { font-size: 12px; color: #888; margin-top: 2px; }
.step--active .step-subtitle { color: #ff6b35; }
.section-label { font-size: 11px; font-weight: 600; color: #555; letter-spacing: 0.8px; text-transform: uppercase; margin: 16px 0 8px; }
.tracking-card { background: #1e1e1e; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; }
.tracking-meta { font-size: 11px; color: #555; margin-bottom: 3px; }
.tracking-code { font-size: 13px; color: #aaa; font-family: monospace; letter-spacing: 1.5px; }
.copy-btn { display: flex; align-items: center; gap: 5px; background: #2a2a2a; border: none; color: #ff2d6f; font-size: 11px; font-weight: 500; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.copy-btn:hover { background: #333; }
.info-card { background: #1e1e1e; border-radius: 10px; padding: 4px 14px; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 0.5px solid #2a2a2a; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 12px; color: #888; }
.info-value { font-size: 13px; color: #fff; font-weight: 500; text-align: right; }
.info-value--pink  { color: #ff2d6f; }
.info-value--green { color: #4ade80; }
.badge-desconto { font-size: 10px; font-weight: 600; color: #4ade80; background: rgba(74,222,128,0.12); border-radius: 20px; padding: 2px 7px; margin-left: 6px; }
.items-list { display: flex; flex-direction: column; gap: 8px; }
.item-row { display: flex; align-items: center; gap: 10px; background: #1e1e1e; border-radius: 10px; padding: 10px 12px; }
.item-img { width: 38px; height: 38px; border-radius: 8px; background: #2a2a2a; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; overflow: hidden; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-name   { font-size: 13px; color: #fff; font-weight: 500; }
.item-detail { font-size: 11px; color: #888; margin-top: 2px; }
.item-price  { font-size: 13px; font-weight: 500; color: #fff; }
.rastreio-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #ff2d6f; color: #fff; border: none; border-radius: 10px; padding: 14px; font-size: 14px; font-weight: 500; cursor: pointer; margin-top: 16px; text-decoration: none; transition: background 0.2s; }
.rastreio-btn:hover { background: #e0205f; }
</style>