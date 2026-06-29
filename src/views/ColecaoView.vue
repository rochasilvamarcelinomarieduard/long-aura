<template>
  <div class="colecao">

    <!-- HEADER -->
    <div class="col-header" :style="{ background: config.headerBg }">
      <div class="col-header-glow" :style="{ background: config.glowColor }" />
      <div class="col-header-inner">

        <button class="btn-voltar" @click="router.push({ name: 'Loja' })">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar à Loja
        </button>

        <div class="col-header-content">
          <div class="col-eyebrow" :style="{ color: config.cor }">
            <span class="col-eyebrow-dot" :style="{ background: config.cor }" />
            {{ config.tag }}
          </div>
          <h1 class="col-titulo">
            <span class="col-emoji">{{ config.emoji }}</span>
            {{ config.titulo }}
          </h1>
          <p class="col-desc">{{ config.desc }}</p>
        </div>

        <div class="col-kpis">
          <div class="col-kpi">
            <span class="col-kpi-n" :style="{ color: config.cor }">{{ produtosFiltrados.length }}</span>
            <span class="col-kpi-l">Itens</span>
          </div>
          <div class="col-kpi-sep" />
          <div class="col-kpi" v-if="tipo === 'promocoes'">
            <span class="col-kpi-n" :style="{ color: config.cor }">{{ maxDesconto }}%</span>
            <span class="col-kpi-l">Máx. Desconto</span>
          </div>
          <div class="col-kpi" v-if="tipo === 'lancamentos'">
            <span class="col-kpi-n" :style="{ color: config.cor }">{{ produtosDoTipo.length }}</span>
            <span class="col-kpi-l">Exclusivos</span>
          </div>
          <div class="col-kpi" v-if="tipo === 'mais-vendidos'">
            <span class="col-kpi-n" :style="{ color: config.cor }">{{ categoriasCount }}</span>
            <span class="col-kpi-l">Categorias</span>
          </div>
        </div>

      </div>
      <div class="col-header-border" :style="{ background: config.gradiente }" />
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="cats">
        <button
          v-for="cat in categorias"
          :key="cat"
          :class="['cat', { on: categoriaAtiva === cat }]"
          :style="categoriaAtiva === cat ? { background: config.gradiente } : {}"
          @click="selecionarCategoria(cat)"
        >{{ cat === 'All' ? 'Todos' : cat }}</button>
      </div>
      <div class="toolbar-right">
        <Transition name="fade">
          <button v-if="pesquisa || categoriaAtiva !== 'All' || ordenacao" class="btn-limpar" @click="limparFiltros">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Limpar filtros
          </button>
        </Transition>
        <div class="select-wrap">
          <span class="select-label">Ordenar</span>
          <select v-model="ordenacao">
            <option value="">Destaques</option>
            <option value="asc">Preço ↑</option>
            <option value="desc">Preço ↓</option>
            <option value="disc">Maior Desconto</option>
          </select>
        </div>
      </div>
    </div>

    <!-- SECTION HEAD + BUSCA -->
    <div class="sec-head">
      <div class="sec-title">
        <span v-if="categoriaAtiva !== 'All'">{{ categoriaAtiva }}</span>
        <span v-else-if="pesquisa">Resultados para "{{ pesquisa }}"</span>
        <span v-else>{{ config.titulo }}</span>
      </div>
      <div class="sec-count">{{ produtosFiltrados.length }} {{ produtosFiltrados.length === 1 ? 'item' : 'itens' }}</div>
    </div>

    <div class="prod-search-bar">
      <div class="prod-search-wrap">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          v-model="pesquisa"
          class="prod-search-input"
          :style="pesquisa ? `border-color: ${config.cor}40; box-shadow: 0 0 0 3px ${config.cor}10` : ''"
          placeholder="Buscar por nome ou categoria..."
          @keydown.escape="pesquisa = ''"
        />
        <Transition name="clear-btn">
          <button v-if="pesquisa" class="prod-search-clear" @click="pesquisa = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </Transition>
      </div>
      <Transition name="fade">
        <div v-if="pesquisa" class="prod-search-info">
          <span :style="{ color: config.cor, fontWeight: 700 }">{{ produtosFiltrados.length }}</span>
          resultado{{ produtosFiltrados.length !== 1 ? 's' : '' }} para
          <em>"{{ pesquisa }}"</em>
        </div>
      </Transition>
    </div>

    <!-- GRID DE PRODUTOS -->
    <div class="grid">
      <TransitionGroup name="card-list">
        <div
          v-for="(produto, i) in produtosFiltrados"
          :key="produto.id"
          class="card"
          :style="{ animationDelay: i * 0.035 + 's' }"
          @click="verProduto(produto.id)"
        >
          <div class="card-top">
            <img class="card-img" :src="produto.img" :alt="produto.nome" loading="lazy" />

            <div class="card-overlay">
              <button class="btn-cta" @click.stop="verProduto(produto.id)">Ver Produto</button>
              <button class="btn-cart" :style="{ background: config.gradiente }" @click.stop="adicionarCarrinho(produto)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Adicionar ao Carrinho
              </button>
            </div>

            <div v-if="desconto(produto)" class="badge badge-sale" :style="{ background: config.cor }">
              −{{ desconto(produto) }}%
            </div>
            <div v-else-if="produto.novo" class="badge badge-new">Novo</div>

            <Transition name="toast">
              <div v-if="toastId === produto.id" class="card-toast" :style="{ background: config.gradiente }">
                ✓ Adicionado
              </div>
            </Transition>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="card-cat" @click.stop="selecionarCategoria(produto.categoria)">
                {{ produto.categoria }}
              </span>
              <span v-if="desconto(produto)" class="card-disc" :style="{ color: config.cor, borderColor: config.cor + '33' }">
                Economize {{ desconto(produto) }}%
              </span>
            </div>
            <div class="card-name">{{ produto.nome }}</div>
            <div class="card-foot">
              <div class="card-prices">
                <span class="card-price" :style="{ color: config.cor }">
                  R$ {{ produto.preco.toFixed(2).replace('.', ',') }}
                </span>
                <span v-if="produto.original" class="card-orig">
                  R$ {{ produto.original.toFixed(2).replace('.', ',') }}
                </span>
              </div>
              <button
                class="card-add"
                :style="{ '--hover-bg': config.gradiente }"
                @click.stop="adicionarCarrinho(produto)"
                title="Adicionar ao carrinho"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- ESTADO VAZIO -->
      <div v-if="!produtosFiltrados.length" class="nenhum">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>Nenhum resultado encontrado</p>
        <button class="btn-limpar-vazio" @click="limparFiltros">Limpar filtros</button>
      </div>
    </div>

    <!-- TOAST GLOBAL -->
    <Transition name="gtoast">
      <div v-if="globalToast" class="global-toast" :style="{ background: config.gradiente }">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ globalToast }}
      </div>
    </Transition>

    <!-- FAB CARRINHO -->
    <button class="fab-cart" :class="{ pulse: cartPulse }" :style="{ background: config.gradiente }" @click="carrinhoAberto = true">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span v-if="totalItensCarrinho > 0" class="fab-badge">{{ totalItensCarrinho }}</span>
    </button>

    <!-- CARRINHO FLUTUANTE -->
    <CarrinhoFlutuante :aberto="carrinhoAberto" @fechar="carrinhoAberto = false" />

  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { produtos } from "../data/produtos"
import { carrinho } from "../stores/carrinho"
import CarrinhoFlutuante from "../components/CarrinhoFlutuante.vue"

const router = useRouter()
const route  = useRoute()

const tipo = computed(() => route.params.tipo)

const configs = {
  lancamentos: {
    tag:       " Exclusivo",
    emoji:     "✨",
    titulo:    "Lançamentos",
    desc:      "Novidades exclusivas Aura Beauty. Peças únicas para quem chegou primeiro.",
    cor:       "#a78bfa",
    gradiente: "linear-gradient(90deg, #7c3aed, #a78bfa)",
    headerBg:  "linear-gradient(135deg, #05000d 0%, #0e0018 60%, #030008 100%)",
    glowColor: "radial-gradient(circle at 80% 40%, rgba(167,139,250,.18), transparent 55%)",
  },
  promocoes: {
    tag:       "Oferta",
    emoji:     "🏷️",
    titulo:    "Promoções",
    desc:      "Descontos exclusivos em peças selecionadas. Por tempo limitado.",
    cor:       "#ff2e88",
    gradiente: "linear-gradient(90deg, #ff2e88, #ff8c00)",
    headerBg:  "linear-gradient(135deg, #0d0005 0%, #1a0008 60%, #0a0000 100%)",
    glowColor: "radial-gradient(circle at 80% 40%, rgba(255,46,136,.18), transparent 55%)",
  },
  "mais-vendidos": {
    tag:       " Ranking",
    emoji:     "🔥",
    titulo:    "Mais Vendidos",
    desc:      "Os queridinhos da nossa comunidade. Os produtos que todo mundo ama.",
    cor:       "#fb923c",
    gradiente: "linear-gradient(90deg, #ea580c, #fb923c)",
    headerBg:  "linear-gradient(135deg, #0d0500 0%, #1a0c00 60%, #080300 100%)",
    glowColor: "radial-gradient(circle at 80% 40%, rgba(251,146,60,.18), transparent 55%)",
  },
}

const config = computed(() => configs[tipo.value] ?? configs["lancamentos"])

const carrinhoAberto = ref(false)
const pesquisa       = ref("")
const ordenacao      = ref("")
const categoriaAtiva = ref("All")
const toastId        = ref(null)
const cartPulse      = ref(false)
const globalToast    = ref("")
let toastTimer       = null

// ── CORREÇÃO: mais-vendidos agora retorna todos os produtos ──
const produtosDoTipo = computed(() => {
  if (tipo.value === "lancamentos")   return produtos.filter(p => p.novo)
  if (tipo.value === "promocoes")     return produtos.filter(p => p.promo || p.original)
  if (tipo.value === "mais-vendidos") return produtos
  return produtos
})

function desconto(p) {
  return p.original ? Math.round((1 - p.preco / p.original) * 100) : 0
}

const maxDesconto = computed(() =>
  Math.max(0, ...produtosDoTipo.value.map(p => desconto(p)))
)

const categorias = computed(() => [
  "All",
  ...new Set(produtosDoTipo.value.map(p => p.categoria)),
])

const categoriasCount = computed(() =>
  new Set(produtosDoTipo.value.map(p => p.categoria)).size
)

const produtosFiltrados = computed(() => {
  let list = [...produtosDoTipo.value]

  if (categoriaAtiva.value !== "All") {
    list = list.filter(p => p.categoria === categoriaAtiva.value)
  }

  if (pesquisa.value.trim()) {
    const q = pesquisa.value.toLowerCase().trim()
    list = list.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q) ||
      (p.descricao && p.descricao.toLowerCase().includes(q))
    )
  }

  if (ordenacao.value === "asc")  list = [...list].sort((a, b) => a.preco - b.preco)
  if (ordenacao.value === "desc") list = [...list].sort((a, b) => b.preco - a.preco)
  if (ordenacao.value === "disc") list = [...list].sort((a, b) => desconto(b) - desconto(a))

  return list
})

const totalItensCarrinho = computed(() =>
  carrinho.itens.reduce((s, i) => s + i.qtd, 0)
)

function verProduto(id) {
  router.push({ name: "Produto", params: { id } })
}

function selecionarCategoria(cat) {
  categoriaAtiva.value = cat
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function limparFiltros() {
  pesquisa.value       = ""
  ordenacao.value      = ""
  categoriaAtiva.value = "All"
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function adicionarCarrinho(produto) {
  carrinho.adicionar({
    id:    produto.id,
    nome:  produto.nome,
    preco: produto.preco,
    img:   produto.img,
    qtd:   1,
  })

  toastId.value = produto.id
  setTimeout(() => { if (toastId.value === produto.id) toastId.value = null }, 1500)

  cartPulse.value = true
  setTimeout(() => { cartPulse.value = false }, 600)

  mostrarToast(`${produto.nome} adicionado!`)
  carrinhoAberto.value = true
}

function mostrarToast(msg) {
  globalToast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { globalToast.value = "" }, 2400)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

.colecao {
  --grad: linear-gradient(90deg, #ff2e88, #ff8c00);
  --bg:   #000000;
  --s1:   #060606;
  --s2:   #0c0c0c;
  --s3:   #111111;
  --b1:   #111111;
  --b2:   #1c1c1c;
  --b3:   #282828;
  --t1:   #f0f0f0;
  --t2:   #888888;
  --t3:   #444444;

  background: var(--bg);
  min-height: 100%;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.col-header {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--b1);
}
.col-header-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.col-header-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 36px;
  padding: 36px 48px 40px;
}
.col-header-border {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1px solid var(--b2);
  background: rgba(255,255,255,.03);
  color: var(--t2);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color .2s, color .2s;
}
.btn-voltar:hover { border-color: var(--t2); color: var(--t1); }

.col-header-content { flex: 1; min-width: 0; }

.col-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.col-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: blink 2s ease infinite;
}
@keyframes blink {
  0%,100% { opacity:1; transform:scale(1); }
  50%     { opacity:.4; transform:scale(1.5); }
}

.col-titulo {
  font-family: 'Syne', sans-serif;
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1.5px;
  color: var(--t1);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.col-emoji { font-size: 34px; line-height: 1; }

.col-desc {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.65;
  max-width: 460px;
}

.col-kpis {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-shrink: 0;
}
.col-kpi { text-align: center; }
.col-kpi-n {
  font-family: 'Syne', sans-serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  display: block;
}
.col-kpi-l {
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #555;
  margin-top: 5px;
  display: block;
}
.col-kpi-sep {
  width: 1px; height: 38px;
  background: var(--b2);
  flex-shrink: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 48px;
  border-bottom: 1px solid var(--b1);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.cats { display: flex; gap: 6px; flex-wrap: wrap; }

.cat {
  padding: 7px 18px;
  border-radius: 4px;
  border: 1px solid var(--b2);
  background: transparent;
  color: var(--t2);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: all .2s;
}
.cat:hover:not(.on) { border-color: var(--b3); color: var(--t1); }
.cat.on { border-color: transparent; color: white; font-weight: 600; }

.toolbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.btn-limpar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 4px;
  border: 1px solid var(--b3);
  background: transparent;
  color: var(--t3);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .2s;
}
.btn-limpar:hover { border-color: #ff2e88; color: #ff2e88; }

.select-wrap { display: flex; align-items: center; gap: 8px; }
.select-label {
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #555;
  white-space: nowrap;
}
select {
  background: var(--s1);
  border: 1px solid var(--b2);
  border-radius: 6px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  padding: 8px 14px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  transition: border-color .2s;
}
select:focus { border-color: #ff2e88; }

.sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 48px 14px;
}
.sec-title {
  font-family: 'Syne', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--t1);
  display: flex;
  align-items: center;
  gap: 10px;
}
.sec-title::before {
  content: '';
  width: 3px; height: 13px;
  background: var(--grad);
  border-radius: 2px;
  flex-shrink: 0;
}
.sec-count { font-size: 11px; color: #555; letter-spacing: 1px; }

.prod-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 48px 22px;
}
.prod-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 540px;
}
.prod-search-wrap > svg {
  position: absolute;
  left: 16px;
  color: #444;
  pointer-events: none;
}
.prod-search-input {
  width: 100%;
  padding: 12px 42px 12px 46px;
  background: var(--s1);
  border: 1px solid var(--b2);
  border-radius: 8px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.prod-search-input::placeholder { color: var(--t3); }

.prod-search-clear {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 3px;
  transition: color .2s;
}
.prod-search-clear:hover { color: #ff2e88; }

.prod-search-info {
  font-size: 12px;
  color: var(--t2);
  white-space: nowrap;
  flex-shrink: 0;
}
.prod-search-info em { font-style: normal; color: var(--t1); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1px;
  padding: 0 48px 80px;
  background: var(--b1);
}

.card-list-enter-active { transition: all .35s ease; }
.card-list-leave-active { transition: all .2s ease; position: absolute; }
.card-list-enter-from   { opacity: 0; transform: translateY(14px); }
.card-list-leave-to     { opacity: 0; transform: scale(.96); }
.card-list-move         { transition: transform .35s ease; }

.card {
  background: var(--s1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: cardUp .4s ease both;
}
.card:hover               { background: var(--s2); }
.card:hover .card-img     { transform: scale(1.05); }
.card:hover .card-overlay { opacity: 1; transform: translateY(0); }

@keyframes cardUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-top {
  overflow: hidden;
  position: relative;
  height: 285px;
}
.card-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  background: var(--s3);
  transition: transform .55s cubic-bezier(.22,.68,0,1.2);
}

.card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 44px 14px 14px;
  background: linear-gradient(to top, rgba(0,0,0,.95) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 7px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity .28s, transform .28s;
}

.btn-cta {
  width: 100%;
  padding: 9px;
  background: white;
  color: #000;
  border: none;
  border-radius: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s;
}
.btn-cta:hover { opacity: .86; }

.btn-cart {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px;
  color: white;
  border: none;
  border-radius: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s;
}
.btn-cart:hover { opacity: .86; }

.badge {
  position: absolute;
  top: 12px; left: 0;
  padding: 5px 13px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: white;
  clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
}
.badge-new { background: #0d5c3a !important; }

.card-toast {
  position: absolute;
  top: 12px; right: 12px;
  padding: 5px 13px;
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 20px;
  pointer-events: none;
}

.card-body {
  padding: 16px 18px 20px;
  border-top: 1px solid var(--b1);
  background: var(--s1);
  transition: background .2s;
}
.card:hover .card-body { background: var(--s2); }

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.card-cat {
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #555;
  cursor: pointer;
  transition: color .2s;
}
.card-cat:hover { color: #ff2e88; }

.card-disc {
  font-size: 9px;
  letter-spacing: .5px;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 3px;
}

.card-name {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--t1);
  margin-bottom: 14px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-prices { display: flex; align-items: baseline; gap: 7px; }
.card-price {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 700;
}
.card-orig {
  font-size: 11px;
  color: #555;
  text-decoration: line-through;
}

.card-add {
  width: 30px; height: 30px;
  border-radius: 6px;
  border: 1px solid var(--b2);
  background: var(--s3);
  color: var(--t2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all .2s;
}
.card-add:hover {
  background: var(--hover-bg, var(--grad));
  border-color: transparent;
  color: white;
}

.nenhum {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 48px;
  text-align: center;
  background: var(--bg);
}
.nenhum svg { color: var(--b3); }
.nenhum p {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--b3);
}
.btn-limpar-vazio {
  margin-top: 4px;
  padding: 9px 22px;
  border: 1px solid var(--b2);
  background: transparent;
  color: var(--t2);
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .2s;
}
.btn-limpar-vazio:hover { border-color: #ff2e88; color: #ff2e88; }

.global-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
  border-radius: 20px;
  white-space: nowrap;
  pointer-events: none;
}

.fab-cart {
  position: fixed;
  bottom: 32px; right: 32px;
  width: 56px; height: 56px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 150;
  transition: transform .2s;
}
.fab-cart:hover { transform: scale(1.08); }
.fab-badge {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 20px; height: 20px;
  padding: 0 5px;
  background: white;
  color: #ff2e88;
  font-size: 10px;
  font-weight: 800;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ff2e88;
}
@keyframes fabPop {
  0%,100% { transform: scale(1); }
  40%     { transform: scale(1.22); }
  70%     { transform: scale(.92); }
}
.fab-cart.pulse { animation: fabPop .5s ease; }

.toast-enter-active { transition: all .25s ease; }
.toast-leave-active { transition: all .3s ease; }
.toast-enter-from,
.toast-leave-to     { opacity: 0; transform: translateY(-6px); }

.gtoast-enter-active,
.gtoast-leave-active { transition: all .3s ease; }
.gtoast-enter-from,
.gtoast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(12px); }

.fade-enter-active,
.fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

.clear-btn-enter-active,
.clear-btn-leave-active { transition: all .15s ease; }
.clear-btn-enter-from,
.clear-btn-leave-to     { opacity: 0; transform: scale(.7); }

@media (max-width: 900px) {
  .col-header-inner  { flex-direction: column; align-items: flex-start; gap: 20px; padding: 24px 20px 28px; }
  .col-titulo        { font-size: 28px; }
  .col-kpis          { gap: 20px; }

  .toolbar,
  .sec-head,
  .prod-search-bar,
  .grid              { padding-left: 20px; padding-right: 20px; }

  .toolbar           { flex-direction: column; align-items: flex-start; gap: 12px; }
  .toolbar-right     { align-self: flex-end; }

  .grid              { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); padding-bottom: 48px; }
  .card-top          { height: 210px; }
  .card-overlay      { opacity: 1; transform: translateY(0); }
}
</style>