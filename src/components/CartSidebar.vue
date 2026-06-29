<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div v-if="aberto" class="overlay" @click="$emit('fechar')" />
  </Transition>

  <!-- Painel lateral -->
  <Transition name="drawer">
    <div v-if="aberto" class="drawer">

      <!-- Header -->
      <div class="drawer-header">
        <div class="header-left">
          <span class="cart-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </span>
          <h2 class="drawer-title">Seu Carrinho</h2>
          <span v-if="carrinho.quantidadeTotal() > 0" class="badge">
            {{ carrinho.quantidadeTotal() }}
          </span>
        </div>
        <button class="btn-fechar" @click="$emit('fechar')" aria-label="Fechar carrinho">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Frete grátis progress -->
      <div v-if="!carrinho.isEmpty()" class="frete-progress-bar">
        <div v-if="carrinho.total() >= 150" class="frete-ok">
          🎉 Você ganhou <strong>frete grátis!</strong>
        </div>
        <div v-else class="frete-info">
          <span>Faltam <strong>{{ fmt(150 - carrinho.total()) }}</strong> para frete grátis</span>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: Math.min((carrinho.total() / 150) * 100, 100) + '%' }" />
          </div>
        </div>
      </div>

      <!-- Itens -->
      <div class="drawer-body">
        <!-- Vazio -->
        <div v-if="carrinho.isEmpty()" class="vazio">
          <div class="vazio-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <p class="vazio-titulo">Seu carrinho está vazio</p>
          <p class="vazio-sub">Explore nossos produtos e adicione o que você amar 💛</p>
          <button class="btn-explorar" @click="$emit('fechar')">Explorar produtos</button>
        </div>

        <!-- Lista de itens -->
        <TransitionGroup name="list" tag="ul" v-else class="lista-itens">
          <li v-for="item in carrinho.itens" :key="item.id" class="item">
            <div class="item-img-wrap">
              <img :src="item.img || item.imagem" :alt="item.nome" class="item-img" />
            </div>
            <div class="item-info">
              <p class="item-nome">{{ item.nome }}</p>
              <p class="item-preco">{{ fmt(item.preco) }}</p>
              <div class="item-controles">
                <button class="ctrl-btn" @click="carrinho.diminuir(item.id)" aria-label="Diminuir">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span class="ctrl-qtd">{{ item.qtd }}</span>
                <button class="ctrl-btn" @click="carrinho.aumentar(item.id)" aria-label="Aumentar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
            <div class="item-right">
              <p class="item-subtotal">{{ fmt(item.preco * item.qtd) }}</p>
              <button class="btn-remover" @click="carrinho.remover(item.id)" aria-label="Remover item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <!-- Footer com totais -->
      <div v-if="!carrinho.isEmpty()" class="drawer-footer">

        <!-- Cupom -->
        <div class="cupom-wrap">
          <input
            v-model="codigoCupom"
            placeholder="Código de desconto"
            class="cupom-input"
            :disabled="cupomAplicado"
            @keyup.enter="aplicarCupom"
          />
          <button
            class="cupom-btn"
            @click="cupomAplicado ? removerCupom() : aplicarCupom()"
          >
            {{ cupomAplicado ? 'Remover' : 'Aplicar' }}
          </button>
        </div>
        <p v-if="mensagemCupom" :class="['cupom-msg', cupomAplicado ? 'ok' : 'erro']">
          {{ mensagemCupom }}
        </p>

        <!-- Totais -->
        <div class="totais">
          <div class="linha-total">
            <span>Subtotal</span>
            <span>{{ fmt(carrinho.subtotal()) }}</span>
          </div>
          <div class="linha-total">
            <span>Frete</span>
            <span :class="freteGratis ? 'gratis' : ''">
              {{ freteGratis ? 'Grátis' : fmt(8.90) }}
            </span>
          </div>
          <div v-if="cupomAplicado" class="linha-total desconto">
            <span>Desconto (AURA10)</span>
            <span>– {{ fmt(carrinho.descontoCupom(true)) }}</span>
          </div>
          <div class="linha-total total-final">
            <span>Total</span>
            <span>{{ fmt(carrinho.totalFinal(8.90, cupomAplicado)) }}</span>
          </div>
        </div>

        <button class="btn-checkout">
          Finalizar compra
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>

        <button class="btn-limpar" @click="carrinho.limpar()">Limpar carrinho</button>
      </div>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { carrinho } from '@/stores/carrinho.js'

defineProps({ aberto: Boolean })
defineEmits(['fechar'])

const codigoCupom = ref('')
const cupomAplicado = ref(false)
const mensagemCupom = ref('')

const freteGratis = computed(() => carrinho.total() >= 150)

function fmt(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function aplicarCupom() {
  const resultado = carrinho.validarCupom(codigoCupom.value)
  if (resultado) {
    cupomAplicado.value = true
    mensagemCupom.value = `✅ Cupom aplicado: ${resultado.label}`
  } else {
    mensagemCupom.value = '❌ Cupom inválido ou expirado'
    setTimeout(() => (mensagemCupom.value = ''), 3000)
  }
}

function removerCupom() {
  cupomAplicado.value = false
  codigoCupom.value = ''
  mensagemCupom.value = ''
}
</script>

<style scoped>
/* ── VARIÁVEIS ─────────────────────────────────────── */
.drawer {
  --c-bg: #0e0e0f;
  --c-surface: #18181b;
  --c-border: rgba(255,255,255,0.07);
  --c-accent: #f5c842;
  --c-accent-hover: #f7d46a;
  --c-text: #f0ede8;
  --c-muted: rgba(240,237,232,0.45);
  --c-danger: #ff4d6d;
  --radius: 14px;
  --font-sans: 'DM Sans', sans-serif;
  --font-display: 'Syne', sans-serif;

  position: fixed;
  top: 0; right: 0;
  width: 420px; max-width: 100vw;
  height: 100dvh;
  background: var(--c-bg);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-left: 1px solid var(--c-border);
  font-family: var(--font-sans);
  color: var(--c-text);
}

/* ── OVERLAY ────────────────────────────────────────── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
  z-index: 999;
}

/* ── HEADER ─────────────────────────────────────────── */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}
.header-left {
  display: flex; align-items: center; gap: 10px;
}
.cart-icon { color: var(--c-accent); display: flex; }
.drawer-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}
.badge {
  background: var(--c-accent);
  color: #000;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  line-height: 1.6;
}
.btn-fechar {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: color .2s, border-color .2s;
}
.btn-fechar:hover { color: var(--c-text); border-color: rgba(255,255,255,0.2); }

/* ── FRETE PROGRESS ─────────────────────────────────── */
.frete-progress-bar {
  padding: 12px 24px;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  font-size: 12px;
  color: var(--c-muted);
  flex-shrink: 0;
}
.frete-ok { color: var(--c-accent); font-weight: 600; font-size: 12.5px; }
.frete-info { display: flex; flex-direction: column; gap: 8px; }
.progress-track {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--c-accent);
  border-radius: 999px;
  transition: width .4s ease;
}

/* ── BODY ───────────────────────────────────────────── */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--c-border) transparent;
}

/* ── VAZIO ──────────────────────────────────────────── */
.vazio {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; text-align: center;
  gap: 12px; padding: 40px 0;
}
.vazio-icon { color: rgba(255,255,255,0.15); margin-bottom: 8px; }
.vazio-titulo { font-size: 1.1rem; font-weight: 700; color: var(--c-text); }
.vazio-sub { font-size: 13px; color: var(--c-muted); max-width: 240px; line-height: 1.6; }
.btn-explorar {
  margin-top: 8px;
  background: var(--c-accent);
  color: #000;
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background .2s, transform .15s;
}
.btn-explorar:hover { background: var(--c-accent-hover); transform: translateY(-1px); }

/* ── LISTA ──────────────────────────────────────────── */
.lista-itens { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }

.item {
  display: flex; gap: 14px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 14px;
  transition: border-color .2s;
}
.item:hover { border-color: rgba(255,255,255,0.13); }

.item-img-wrap {
  width: 72px; height: 72px; flex-shrink: 0;
  border-radius: 10px; overflow: hidden;
  background: #222;
}
.item-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.item-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.item-nome { font-size: 13px; font-weight: 600; line-height: 1.4; color: var(--c-text); }
.item-preco { font-size: 12px; color: var(--c-muted); }

.item-controles {
  display: flex; align-items: center; gap: 8px; margin-top: 6px;
}
.ctrl-btn {
  background: rgba(255,255,255,0.07);
  border: none;
  width: 26px; height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text);
  transition: background .15s;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.14); }
.ctrl-qtd { font-size: 13px; font-weight: 700; min-width: 20px; text-align: center; }

.item-right {
  display: flex; flex-direction: column;
  align-items: flex-end; justify-content: space-between;
}
.item-subtotal { font-size: 13px; font-weight: 700; color: var(--c-text); }
.btn-remover {
  background: none; border: none;
  color: var(--c-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  transition: color .2s, background .2s;
}
.btn-remover:hover { color: var(--c-danger); background: rgba(255,77,109,0.1); }

/* ── FOOTER ─────────────────────────────────────────── */
.drawer-footer {
  padding: 20px 24px 28px;
  border-top: 1px solid var(--c-border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Cupom */
.cupom-wrap { display: flex; gap: 8px; }
.cupom-input {
  flex: 1;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--c-text);
  font-size: 13px;
  outline: none;
  transition: border-color .2s;
}
.cupom-input:focus { border-color: var(--c-accent); }
.cupom-input:disabled { opacity: 0.5; cursor: not-allowed; }
.cupom-input::placeholder { color: var(--c-muted); }
.cupom-btn {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color .2s, color .2s;
}
.cupom-btn:hover { border-color: var(--c-accent); color: var(--c-accent); }
.cupom-msg { font-size: 12px; margin: -6px 0 0; }
.cupom-msg.ok { color: #4ade80; }
.cupom-msg.erro { color: var(--c-danger); }

/* Totais */
.totais { display: flex; flex-direction: column; gap: 8px; }
.linha-total {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--c-muted);
}
.linha-total.total-final {
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
  color: var(--c-text);
  font-size: 16px;
  font-weight: 700;
}
.linha-total.desconto { color: #4ade80; }
.gratis { color: #4ade80; font-weight: 600; }

/* Botões */
.btn-checkout {
  width: 100%;
  background: var(--c-accent);
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .2s, transform .15s;
  letter-spacing: -0.01em;
}
.btn-checkout:hover { background: var(--c-accent-hover); transform: translateY(-1px); }

.btn-limpar {
  width: 100%;
  background: none;
  border: none;
  color: var(--c-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  transition: color .2s;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.btn-limpar:hover { color: var(--c-danger); }

/* ── TRANSIÇÕES ─────────────────────────────────────── */
.overlay-enter-active, .overlay-leave-active { transition: opacity .3s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.drawer-enter-active { transition: transform .35s cubic-bezier(.22,.68,0,1.2); }
.drawer-leave-active { transition: transform .28s ease-in; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.list-enter-active { transition: all .3s ease; }
.list-leave-active { transition: all .25s ease; }
.list-enter-from { opacity: 0; transform: translateX(20px); }
.list-leave-to { opacity: 0; transform: translateX(-20px); height: 0; }
.list-move { transition: transform .3s ease; }
</style>