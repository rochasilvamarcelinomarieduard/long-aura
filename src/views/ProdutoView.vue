<template>
  <div class="page" v-if="produto">

    <!-- Toast de confirmação -->
    <Transition name="toast">
      <div v-if="toastVisivel" class="toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Produto adicionado ao carrinho!
      </div>
    </Transition>

    <div class="produto-layout">
      <!-- Galeria -->
      <div class="galeria">
        <img :src="produto.img || produto.imagem" :alt="produto.nome" class="imagem-principal" />
      </div>

      <!-- Detalhes -->
      <div class="detalhes">
        <div class="breadcrumb">
          <span>Home</span>
          <span class="sep">›</span>
          <span>{{ produto.categoria || 'Produtos' }}</span>
        </div>

        <h1 class="nome">{{ produto.nome }}</h1>

        <div class="avaliacao">
          <div class="estrelas">
            <svg v-for="i in 5" :key="i" width="14" height="14" viewBox="0 0 24 24"
              :fill="i <= 4 ? '#f5c842' : 'none'" stroke="#f5c842" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span class="reviews">4.8 · 2.300 avaliações</span>
        </div>

        <div class="preco-bloco">
          <span class="preco">{{ fmt(produto.preco) }}</span>
          <span class="preco-parcelado">
            ou 3x de {{ fmt(produto.preco / 3) }} sem juros
          </span>
        </div>

        <p class="desc">{{ produto.descricao }}</p>

        <!-- Benefícios -->
        <div v-if="produto.beneficios" class="beneficios">
          <span v-for="b in produto.beneficios.split(',')" :key="b" class="tag-beneficio">
            {{ b.trim() }}
          </span>
        </div>

        <!-- Infos rápidas -->
        <div class="infos-rapidas">
          <div class="info-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
            </svg>
            <span>{{ frete }}</span>
          </div>
          <div class="info-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span v-if="produto.estoque > 0">{{ produto.estoque }} unidades em estoque</span>
            <span v-else class="sem-estoque">Fora de estoque</span>
          </div>
        </div>

        <!-- Quantidade -->
        <div class="quantidade-wrap">
          <label class="label">Quantidade</label>
          <div class="quantidade-ctrl">
            <button @click="quantidade > 1 && quantidade--" class="qty-btn">−</button>
            <span class="qty-num">{{ quantidade }}</span>
            <button @click="quantidade++" class="qty-btn">+</button>
          </div>
        </div>

        <!-- Ações -->
        <div class="acoes">
          <button
            class="btn-add"
            :class="{ 'no-carrinho': jaNoCarrinho }"
            @click="addCarrinho"
            :disabled="produto.estoque === 0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {{ jaNoCarrinho ? `No carrinho (${carrinho.quantidadeProduto(produto.id)})` : 'Adicionar ao carrinho' }}
          </button>

          <button class="btn-favoritar" aria-label="Favoritar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <!-- Pix -->
        <div class="pix-destaque">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>5% de desconto pagando com <strong>Pix</strong> — economize {{ fmt(produto.preco * 0.05) }}</span>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <CartSidebar :aberto="sidebarAberta" @fechar="sidebarAberta = false" />
  </div>

  <!-- Produto não encontrado -->
  <div v-else class="nao-encontrado">
    <h2>Produto não encontrado</h2>
    <router-link to="/">← Voltar à loja</router-link>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import CartSidebar from '@/components/CartSidebar.vue'
import { carrinho } from '@/stores/carrinho.js'
import { produtos } from '@/data/produtos.js'

const route = useRoute()
const sidebarAberta = ref(false)
const toastVisivel = ref(false)
const quantidade = ref(1)

const produto = computed(() =>
  produtos.find(p => p.id == route.params.id)
)

const jaNoCarrinho = computed(() =>
  produto.value ? carrinho.contemProduto(produto.value.id) : false
)

const frete = computed(() =>
  carrinho.total() >= 150 ? ' Frete grátis no seu pedido!' : ' Frete grátis acima de R$ 150'
)

function fmt(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function addCarrinho() {
  if (!produto.value) return
  for (let i = 0; i < quantidade.value; i++) {
    carrinho.adicionar(produto.value)
  }
  mostrarToast()
  sidebarAberta.value = true
}

function mostrarToast() {
  toastVisivel.value = true
  setTimeout(() => { toastVisivel.value = false }, 2500)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

.page {
  --c-bg: #0e0e0f;
  --c-surface: #18181b;
  --c-border: rgba(255,255,255,0.07);
  --c-accent: #f5c842;
  --c-text: #f0ede8;
  --c-muted: rgba(240,237,232,0.5);

  background: var(--c-bg);
  color: var(--c-text);
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  padding: 100px 60px 80px;
}

.produto-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── GALERIA ─────────────────────────────────────────── */
.galeria { position: sticky; top: 100px; height: fit-content; }
.imagem-principal {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 20px;
  border: 1px solid var(--c-border);
}

/* ── DETALHES ────────────────────────────────────────── */
.detalhes { display: flex; flex-direction: column; gap: 20px; }

.breadcrumb { font-size: 12px; color: var(--c-muted); display: flex; gap: 6px; }
.sep { opacity: 0.5; }

.nome {
  font-family: 'Syne', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0;
}

.avaliacao { display: flex; align-items: center; gap: 10px; }
.estrelas { display: flex; gap: 2px; }
.reviews { font-size: 13px; color: var(--c-muted); }

.preco-bloco { display: flex; flex-direction: column; gap: 4px; }
.preco { font-size: 2rem; font-weight: 800; color: var(--c-accent); letter-spacing: -0.02em; }
.preco-parcelado { font-size: 13px; color: var(--c-muted); }

.desc { font-size: 15px; color: var(--c-muted); line-height: 1.7; }

.beneficios { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-beneficio {
  background: rgba(245,200,66,0.1);
  color: var(--c-accent);
  border: 1px solid rgba(245,200,66,0.2);
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
}

.infos-rapidas { display: flex; flex-direction: column; gap: 10px; }
.info-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--c-muted);
}
.sem-estoque { color: #ff4d6d; }

.label { font-size: 13px; font-weight: 600; color: var(--c-muted); }
.quantidade-wrap { display: flex; flex-direction: column; gap: 10px; }
.quantidade-ctrl { display: flex; align-items: center; gap: 0; border: 1px solid var(--c-border); border-radius: 12px; overflow: hidden; width: fit-content; }
.qty-btn {
  background: var(--c-surface);
  border: none;
  color: var(--c-text);
  width: 42px; height: 42px;
  font-size: 20px;
  cursor: pointer;
  transition: background .15s;
}
.qty-btn:hover { background: rgba(255,255,255,0.08); }
.qty-num { font-size: 15px; font-weight: 700; padding: 0 20px; }

.acoes { display: flex; gap: 12px; }
.btn-add {
  flex: 1;
  background: var(--c-accent);
  color: #000;
  border: none;
  border-radius: 14px;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: background .2s, transform .15s;
}
.btn-add:hover { background: #f7d46a; transform: translateY(-1px); }
.btn-add.no-carrinho { background: var(--c-surface); color: var(--c-text); border: 1px solid var(--c-border); }
.btn-add:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-favoritar {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  width: 52px; height: 52px;
  border-radius: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: color .2s, border-color .2s;
}
.btn-favoritar:hover { color: #ff4d6d; border-color: rgba(255,77,109,0.3); }

.pix-destaque {
  display: flex; align-items: center; gap: 10px;
  background: rgba(74,222,128,0.07);
  border: 1px solid rgba(74,222,128,0.15);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: rgba(240,237,232,0.7);
}
.pix-destaque strong { color: #4ade80; }

/* ── TOAST ───────────────────────────────────────────── */
.toast {
  position: fixed; top: 24px; right: 24px;
  background: #1a1a1d;
  border: 1px solid rgba(74,222,128,0.3);
  color: #4ade80;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex; align-items: center; gap: 8px;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.toast-enter-active { transition: all .3s cubic-bezier(.22,.68,0,1.2); }
.toast-leave-active { transition: all .25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-12px) scale(.95); }
.toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── NÃO ENCONTRADO ──────────────────────────────────── */
.nao-encontrado {
  background: #0e0e0f; color: #f0ede8;
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  font-family: 'DM Sans', sans-serif;
}
.nao-encontrado a { color: #f5c842; }

@media (max-width: 768px) {
  .page { padding: 80px 20px 60px; }
  .produto-layout { grid-template-columns: 1fr; gap: 32px; }
  .galeria { position: static; }
  .nome { font-size: 1.6rem; }
}
</style>