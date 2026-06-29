<template>
  <div class="tts-cart">

    <!-- ═══ STICKY TOP BAR ═══ -->
    <div class="top-bar">
      <button class="back-btn" @click="$emit('voltar')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="top-title">Meu Carrinho</span>
      <span class="top-count">({{ carrinho.quantidadeTotal() }} {{ carrinho.quantidadeTotal() === 1 ? 'item' : 'itens' }})</span>
    </div>

    <!-- ═══ CARRINHO VAZIO ═══ -->
    <div v-if="carrinho.isEmpty()" class="empty-state">
      <div class="empty-icon">🛒</div>
      <p class="empty-title">Seu carrinho está vazio</p>
      <p class="empty-sub">Adicione produtos para continuar</p>
      <button class="btn-continuar" @click="$emit('voltar')">Continuar comprando</button>
    </div>

    <!-- ═══ CONTEÚDO ═══ -->
    <div v-else class="cart-content">

      <!-- Lista de itens -->
      <div class="items-list">
        <div
          v-for="item in carrinho.itens"
          :key="item.id"
          class="cart-item"
        >
          <img
            :src="item.imagem || item.img"
            :alt="item.nome"
            class="item-img"
          />
          <div class="item-info">
            <p class="item-nome">{{ item.nome }}</p>
            <p v-if="item.variante" class="item-variante">{{ item.variante }}</p>
            <p class="item-preco">R$ {{ (item.preco * item.qtd).toFixed(2).replace('.', ',') }}</p>
          </div>
          <div class="item-controls">
            <button class="qty-btn" @click="carrinho.diminuir(item.id)">−</button>
            <span class="qty-val">{{ item.qtd }}</span>
            <button class="qty-btn" @click="carrinho.aumentar(item.id)">+</button>
            <button class="remove-btn" @click="carrinho.remover(item.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Cupom ── -->
      <div class="cupom-section">
        <p class="section-label">Cupom de desconto</p>
        <div class="cupom-row">
          <input
            v-model="codigoCupom"
            type="text"
            placeholder="Digite seu cupom"
            class="cupom-input"
            :disabled="!!cupomAplicado"
            @keyup.enter="aplicarCupom"
          />
          <button
            v-if="!cupomAplicado"
            class="cupom-btn"
            @click="aplicarCupom"
          >Aplicar</button>
          <button
            v-else
            class="cupom-btn cupom-btn--remover"
            @click="removerCupom"
          >Remover</button>
        </div>
        <p v-if="cupomErro" class="cupom-erro">{{ cupomErro }}</p>
        <p v-if="cupomAplicado" class="cupom-ok">✓ {{ cupomAplicado.label }}</p>
      </div>

      <!-- ── Frete ── -->
      <div class="frete-section">
        <p class="section-label">Frete</p>
        <div class="frete-row">
          <span>{{ freteLabel }}</span>
          <span>{{ freteValorFormatado }}</span>
        </div>
      </div>

      <!-- ── Pix ── -->
      <div class="pix-section">
        <label class="pix-toggle">
          <input type="checkbox" v-model="usarPix" />
          <span>Pagar com Pix — <strong>5% de desconto</strong></span>
        </label>
      </div>

      <!-- ── Resumo ── -->
      <div class="resumo-section">
        <div class="resumo-linha">
          <span>Subtotal</span>
          <span>R$ {{ carrinho.subtotal().toFixed(2).replace('.', ',') }}</span>
        </div>
        <div v-if="cupomAplicado && cupomAplicado.tipo === 'percentual'" class="resumo-linha desconto">
          <span>Desconto ({{ cupomAplicado.label }})</span>
          <span>− R$ {{ carrinho.descontoCupom(cupomAplicado).toFixed(2).replace('.', ',') }}</span>
        </div>
        <div v-if="usarPix" class="resumo-linha desconto">
          <span>Desconto Pix (5%)</span>
          <span>− R$ {{ carrinho.descontoPix().toFixed(2).replace('.', ',') }}</span>
        </div>
        <div class="resumo-linha">
          <span>Frete</span>
          <span>{{ freteValorFormatado }}</span>
        </div>
        <div class="resumo-linha total">
          <span>Total</span>
          <span>R$ {{ carrinho.totalFinal(8.90, cupomAplicado, usarPix).toFixed(2).replace('.', ',') }}</span>
        </div>
      </div>

      <!-- ── Botão finalizar ── -->
      <button class="btn-finalizar" @click="$emit('finalizar')">
        Finalizar compra
      </button>

      <button class="btn-limpar" @click="carrinho.limpar()">
        Esvaziar carrinho
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { carrinho } from '@/stores/carrinho'

defineEmits(['voltar', 'finalizar'])

// ── Cupom ──
const codigoCupom  = ref('')
const cupomAplicado = ref(null)   // objeto { desconto, tipo, label } ou null
const cupomErro    = ref('')

function aplicarCupom() {
  cupomErro.value = ''
  const resultado = carrinho.validarCupom(codigoCupom.value)
  if (resultado) {
    cupomAplicado.value = resultado
  } else {
    cupomErro.value = 'Cupom inválido ou expirado.'
  }
}

function removerCupom() {
  cupomAplicado.value = null
  codigoCupom.value = ''
  cupomErro.value = ''
}

// ── Pix ──
const usarPix = ref(false)

// ── Frete helpers ──
const FRETE_PADRAO = 8.90

const freteLabel = computed(() => {
  if (cupomAplicado.value?.tipo === 'frete') return 'Grátis (cupom)'
  if (carrinho.total() >= 150) return 'Grátis (acima de R$ 150)'
  return 'Padrão'
})

const freteValorFormatado = computed(() => {
  const v = carrinho.freteCalculado(FRETE_PADRAO, cupomAplicado.value)
  return v === 0 ? 'Grátis' : `R$ ${v.toFixed(2).replace('.', ',')}`
})
</script>

<script>
// computed precisa ser importado quando se usa <script setup>
import { computed } from 'vue'
</script>

<style scoped>
.tts-cart {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: inherit;
}

/* TOP BAR */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}
.back-btn svg { width: 22px; height: 22px; }
.top-title { font-weight: 700; font-size: 1rem; }
.top-count { font-size: .85rem; color: #888; }

/* EMPTY */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  text-align: center;
}
.empty-icon { font-size: 3rem; }
.empty-title { font-weight: 700; font-size: 1.1rem; }
.empty-sub { color: #888; font-size: .9rem; }
.btn-continuar {
  margin-top: 12px;
  padding: 12px 24px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .95rem;
  cursor: pointer;
}

/* CONTENT */
.cart-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ITEMS */
.items-list { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.item-img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
  flex-shrink: 0;
}
.item-info { flex: 1; }
.item-nome { font-weight: 600; font-size: .9rem; margin: 0 0 2px; }
.item-variante { font-size: .8rem; color: #888; margin: 0 0 4px; }
.item-preco { font-size: .9rem; font-weight: 700; margin: 0; }
.item-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.qty-btn {
  width: 28px; height: 28px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
}
.qty-val { min-width: 20px; text-align: center; font-weight: 600; }
.remove-btn {
  background: none; border: none; cursor: pointer; padding: 4px;
  color: #999;
  display: flex; align-items: center;
}
.remove-btn svg { width: 18px; height: 18px; }

/* CUPOM */
.section-label { font-weight: 600; font-size: .9rem; margin: 0 0 8px; }
.cupom-row { display: flex; gap: 8px; }
.cupom-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: .9rem;
  outline: none;
}
.cupom-input:disabled { background: #f9f9f9; color: #888; }
.cupom-btn {
  padding: 10px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .9rem;
  cursor: pointer;
  white-space: nowrap;
}
.cupom-btn--remover { background: #e53e3e; }
.cupom-erro { color: #e53e3e; font-size: .82rem; margin: 4px 0 0; }
.cupom-ok { color: #38a169; font-size: .82rem; margin: 4px 0 0; }

/* FRETE */
.frete-row {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  color: #444;
}

/* PIX */
.pix-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: .9rem;
  cursor: pointer;
}
.pix-toggle input { accent-color: #1a1a1a; width: 16px; height: 16px; }

/* RESUMO */
.resumo-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.resumo-linha {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
}
.resumo-linha.desconto { color: #38a169; }
.resumo-linha.total { font-weight: 700; font-size: 1.05rem; }

/* BOTÕES */
.btn-finalizar {
  width: 100%;
  padding: 14px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-limpar {
  background: none;
  border: none;
  color: #999;
  font-size: .85rem;
  cursor: pointer;
  text-align: center;
  text-decoration: underline;
}
</style>