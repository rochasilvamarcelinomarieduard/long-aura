<template>
  <div class="checkout-page">

    <!-- ═══ STICKY TOP BAR ═══ -->
    <div class="top-bar">
      <button class="back-btn" @click="voltarStep">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <span class="top-title">{{ titulos[step] }}</span>
      <span class="top-right-info" v-if="step === 0">{{ itensSelecionados.length }} itens</span>
      <span class="top-right-info" v-else>Etapa {{ step + 1 }}/5</span>
    </div>

    <!-- ═══ PROGRESS BAR ═══ -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: ((step) / 4 * 100) + '%' }"></div>
    </div>

    <!-- ═══ STEPS INDICATOR ═══ -->
    <div class="steps-row">
      <div
        v-for="(s, i) in steps"
        :key="i"
        class="step-dot"
        :class="{ done: i < step, active: i === step }"
      >
        <div class="dot-circle">
          <svg v-if="i < step" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="dot-label">{{ s }}</span>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         STEP 0 — CARRINHO
    ══════════════════════════════════════ -->
    <div v-if="step === 0" class="step-content">

      <div class="empty-state" v-if="carrinho.isEmpty()">
        <div class="empty-icon">
          <svg viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#e5e5e5" stroke-width="2"/>
            <path d="M22 28h4l5 20h18l4-14H30" stroke="#ccc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="34" cy="52" r="2.5" fill="#ccc"/>
            <circle cx="46" cy="52" r="2.5" fill="#ccc"/>
          </svg>
        </div>
        <p class="empty-titulo">Seu carrinho está vazio</p>
        <p class="empty-sub">Explore produtos e adicione ao carrinho!</p>
        <button class="empty-cta" @click="$router.push('/home/loja')">Explorar produtos</button>
      </div>

      <template v-else>
        <div class="loja-group" v-for="(grupo, lojaId) in itensPorLoja" :key="lojaId">
          <div class="loja-header">
            <input type="checkbox" class="tts-check"
              :checked="todosDaLojaSelecionados(lojaId)"
              @change="toggleLoja(lojaId)"
            />
            <svg class="loja-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="loja-nome">{{ grupo.nomeLoja }}</span>
            <span class="loja-badge" v-if="grupo.frete === 0">Frete grátis</span>
          </div>

          <div class="item-row" v-for="item in grupo.itens" :key="item.id">
            <input type="checkbox" class="tts-check"
              :checked="selecionados.includes(item.id)"
              @change="toggleItem(item.id)"
            />
            <div class="item-img-wrap">
              <img :src="item.imagem || item.img" :alt="item.nome" class="item-img"/>
              <span class="item-qty-badge" v-if="item.qtd > 1">{{ item.qtd }}</span>
            </div>
            <div class="item-info">
              <p class="item-nome">{{ item.nome }}</p>
              <p class="item-variacao" v-if="item.variacao">{{ item.variacao }}</p>
              <div class="item-bottom">
                <div class="item-preco-wrap">
                  <span class="item-preco">{{ fmt(item.preco * item.qtd) }}</span>
                  <span class="item-preco-original" v-if="item.precoOriginal">{{ fmt(item.precoOriginal * item.qtd) }}</span>
                </div>
                <div class="qty-controls">
                  <button class="qty-btn" @click="carrinho.diminuir(item.id)" :disabled="item.qtd <= 1">−</button>
                  <span class="qty-num">{{ item.qtd }}</span>
                  <button class="qty-btn" @click="carrinho.aumentar(item.id)">+</button>
                </div>
              </div>
            </div>
            <button class="remove-btn" @click="carrinho.remover(item.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </button>
          </div>

          <div class="frete-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="frete-icon">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 4v4h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span v-if="grupo.frete === 0" class="frete-gratis">Frete grátis</span>
            <span v-else class="frete-valor">Frete: {{ fmt(grupo.frete) }}</span>
          </div>
        </div>

        <div class="card-section">
          <p class="section-title">Cupom de desconto</p>
          <div class="cupom-row">
            <input v-model="codigoCupom" type="text" placeholder="Ex: AURA10"
              class="cupom-input" :disabled="!!cupomAplicado" @keyup.enter="aplicarCupom"/>
            <button class="cupom-btn" @click="cupomAplicado ? removerCupom() : aplicarCupom()">
              {{ cupomAplicado ? 'Remover' : 'Aplicar' }}
            </button>
          </div>
          <p v-if="mensagemCupom" :class="['cupom-msg', cupomAplicado ? 'ok' : 'erro']">{{ mensagemCupom }}</p>
        </div>

        <div class="card-section resumo">
          <p class="section-title">Resumo do pedido</p>
          <div class="resumo-row">
            <span>Subtotal ({{ itensSelecionados.length }} itens)</span>
            <span>{{ fmt(subtotalSelecionado) }}</span>
          </div>
          <div class="resumo-row">
            <span>Frete</span>
            <span :class="freteGratis ? 'gratis' : ''">{{ freteGratis ? 'Grátis' : fmt(8.90) }}</span>
          </div>
          <div v-if="cupomAplicado" class="resumo-row desconto">
            <span>Desconto ({{ cupomAplicado.label }})</span>
            <span>− {{ fmt(carrinho.descontoCupom(cupomAplicado)) }}</span>
          </div>
          <div class="resumo-divider"></div>
          <div class="resumo-total">
            <span>Total</span>
            <span class="total-valor">{{ fmt(totalFinal) }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- ══════════════════════════════════════
         STEP 1 — ENDEREÇO
    ══════════════════════════════════════ -->
    <div v-if="step === 1" class="step-content">
      <div class="card-section">
        <p class="section-title">Endereço de entrega</p>
        <div class="field-row">
          <div class="field">
            <label>CEP *</label>
            <div class="cep-wrap">
              <input v-model="endereco.cep" type="text" placeholder="00000-000"
                class="input" maxlength="9" @input="formatarCep" @blur="buscarCep"/>
              <button class="cep-btn" @click="buscarCep" :disabled="buscandoCep">
                <span v-if="buscandoCep" class="spinner"></span>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="field-row">
          <div class="field flex-2">
            <label>Logradouro *</label>
            <input v-model="endereco.logradouro" type="text" placeholder="Rua, Avenida..." class="input"/>
          </div>
          <div class="field flex-1">
            <label>Número *</label>
            <input v-model="endereco.numero" type="text" placeholder="123" class="input"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Complemento</label>
            <input v-model="endereco.complemento" type="text" placeholder="Apto, Bloco..." class="input"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field flex-2">
            <label>Bairro *</label>
            <input v-model="endereco.bairro" type="text" placeholder="Bairro" class="input"/>
          </div>
          <div class="field flex-1">
            <label>UF *</label>
            <input v-model="endereco.uf" type="text" placeholder="MG" class="input" maxlength="2"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Cidade *</label>
            <input v-model="endereco.cidade" type="text" placeholder="Cidade" class="input"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Nome do destinatário *</label>
            <input v-model="endereco.nome" type="text" placeholder="Nome completo" class="input"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Telefone *</label>
            <input v-model="endereco.telefone" type="text" placeholder="(00) 00000-0000"
              class="input" maxlength="15" @input="formatarTelefone"/>
          </div>
        </div>
        <p v-if="erroEndereco" class="erro-msg">{{ erroEndereco }}</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         STEP 2 — ENTREGA
    ══════════════════════════════════════ -->
    <div v-if="step === 2" class="step-content">
      <div class="card-section">
        <p class="section-title">Escolha a entrega</p>
        <div
          v-for="op in opcoesEntrega"
          :key="op.id"
          class="entrega-option"
          :class="{ selected: entregaSelecionada === op.id }"
          @click="entregaSelecionada = op.id"
        >
          <div class="entrega-radio">
            <div class="radio-dot" v-if="entregaSelecionada === op.id"></div>
          </div>
          <div class="entrega-info">
            <div class="entrega-top">
              <span class="entrega-nome">{{ op.nome }}</span>
              <span class="entrega-prazo">{{ op.prazo }}</span>
            </div>
            <span class="entrega-desc">{{ op.desc }}</span>
          </div>
          <span class="entrega-preco" :class="{ gratis: op.preco === 0 }">
            {{ op.preco === 0 ? 'Grátis' : fmt(op.preco) }}
          </span>
        </div>
      </div>
      <div class="card-section">
        <p class="section-title">Endereço de entrega</p>
        <div class="endereco-resumo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#FE2C55" stroke-width="2" width="18" height="18">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <p class="er-nome">{{ endereco.nome }}</p>
            <p class="er-end">{{ endereco.logradouro }}, {{ endereco.numero }}{{ endereco.complemento ? ', ' + endereco.complemento : '' }}</p>
            <p class="er-end">{{ endereco.bairro }} — {{ endereco.cidade }}/{{ endereco.uf }} — CEP {{ endereco.cep }}</p>
          </div>
          <button class="editar-btn" @click="step = 1">Editar</button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         STEP 3 — PAGAMENTO
    ══════════════════════════════════════ -->
    <div v-if="step === 3" class="step-content">
      <div class="card-section">
        <p class="section-title">Forma de pagamento</p>
        <div
          v-for="pg in opcoesPagamento"
          :key="pg.id"
          class="pagamento-option"
          :class="{ selected: pagamentoSelecionado === pg.id }"
          @click="pagamentoSelecionado = pg.id"
        >
          <div class="entrega-radio">
            <div class="radio-dot" v-if="pagamentoSelecionado === pg.id"></div>
          </div>
          <div class="pg-icon">{{ pg.icon }}</div>
          <div class="entrega-info">
            <span class="entrega-nome">{{ pg.nome }}</span>
            <span class="entrega-desc">{{ pg.desc }}</span>
          </div>
          <span v-if="pg.badge" class="pg-badge">{{ pg.badge }}</span>
        </div>
      </div>

      <div class="card-section" v-if="pagamentoSelecionado === 'cartao'">
        <p class="section-title">Dados do cartão</p>
        <div class="field-row">
          <div class="field">
            <label>Número do cartão *</label>
            <input v-model="cartao.numero" type="text" placeholder="0000 0000 0000 0000"
              class="input" maxlength="19" @input="formatarCartao"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field flex-2">
            <label>Nome no cartão *</label>
            <input v-model="cartao.nome" type="text" placeholder="Como no cartão" class="input"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field flex-1">
            <label>Validade *</label>
            <input v-model="cartao.validade" type="text" placeholder="MM/AA"
              class="input" maxlength="5" @input="formatarValidade"/>
          </div>
          <div class="field flex-1">
            <label>CVV *</label>
            <input v-model="cartao.cvv" type="text" placeholder="123" class="input" maxlength="3"/>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Parcelas</label>
            <select v-model="cartao.parcelas" class="input select">
              <option v-for="p in parcelasDisponiveis" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card-section pix-section" v-if="pagamentoSelecionado === 'pix'">
        <div class="pix-qr">
          <div class="pix-qr-fake">
            <svg viewBox="0 0 100 100" width="100" height="100">
              <rect width="100" height="100" fill="white"/>
              <rect x="10" y="10" width="30" height="30" rx="3" fill="#161823"/>
              <rect x="14" y="14" width="22" height="22" rx="2" fill="white"/>
              <rect x="18" y="18" width="14" height="14" rx="1" fill="#161823"/>
              <rect x="60" y="10" width="30" height="30" rx="3" fill="#161823"/>
              <rect x="64" y="14" width="22" height="22" rx="2" fill="white"/>
              <rect x="68" y="18" width="14" height="14" rx="1" fill="#161823"/>
              <rect x="10" y="60" width="30" height="30" rx="3" fill="#161823"/>
              <rect x="14" y="64" width="22" height="22" rx="2" fill="white"/>
              <rect x="18" y="68" width="14" height="14" rx="1" fill="#161823"/>
            </svg>
          </div>
          <p class="pix-inst">Escaneie o QR Code acima ou copie a chave Pix</p>
          <button class="copiar-pix-btn" @click="copiarPix">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            {{ pixCopiado ? 'Copiado!' : 'Copiar chave Pix' }}
          </button>
          <p class="pix-desc">5% de desconto ao pagar com Pix</p>
        </div>
      </div>

      <!-- Resumo final -->
      <div class="card-section resumo">
        <p class="section-title">Resumo final</p>
        <div class="resumo-row"><span>Subtotal</span><span>{{ fmt(subtotalSelecionado) }}</span></div>
        <div class="resumo-row">
          <span>Frete ({{ entregaEscolhida?.nome }})</span>
          <span :class="freteEntregaGratis ? 'gratis' : ''">{{ freteEntregaGratis ? 'Grátis' : fmt(entregaEscolhida?.preco || 0) }}</span>
        </div>
        <div v-if="cupomAplicado" class="resumo-row desconto">
          <span>Cupom</span>
          <span>− {{ fmt(carrinho.descontoCupom(cupomAplicado)) }}</span>
        </div>
        <div v-if="pagamentoSelecionado === 'pix'" class="resumo-row desconto">
          <span>Desconto Pix (5%)</span>
          <span>− {{ fmt(subtotalSelecionado * 0.05) }}</span>
        </div>
        <div class="resumo-divider"></div>
        <div class="resumo-total">
          <span>Total</span>
          <span class="total-valor">{{ fmt(totalComEntrega) }}</span>
        </div>
        <p v-if="cartao.parcelas > 1" class="parcela-info">
          {{ cartao.parcelas }}x de {{ fmt(totalComEntrega / cartao.parcelas) }} sem juros
        </p>
      </div>

      <!-- Erro ao finalizar -->
      <div v-if="erroFinalizacao" class="card-section">
        <p class="erro-msg">{{ erroFinalizacao }}</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         STEP 4 — CONFIRMAÇÃO
    ══════════════════════════════════════ -->
    <div v-if="step === 4" class="step-content confirmacao">
      <div class="confetti-area">
        <div class="check-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="48" height="48">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 class="conf-titulo">Pedido realizado!</h2>
        <p class="conf-sub">Você receberá uma confirmação em breve.</p>
      </div>

      <div class="card-section">
        <p class="section-title">Detalhes do pedido</p>
        <div class="resumo-row"><span>Número do pedido</span><span class="bold">#{{ numeroPedido }}</span></div>
        <div class="resumo-row"><span>Itens</span><span>{{ itensSelecionados.length || itensFinalizados }}</span></div>
        <div class="resumo-row">
          <span>Entrega</span>
          <span>{{ entregaEscolhida?.prazo }}</span>
        </div>
        <div class="resumo-row"><span>Total pago</span><span class="total-valor">{{ fmt(totalComEntrega) }}</span></div>
      </div>

      <div class="card-section">
        <p class="section-title">Endereço de entrega</p>
        <div class="endereco-resumo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#FE2C55" stroke-width="2" width="18" height="18">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <p class="er-nome">{{ endereco.nome }}</p>
            <p class="er-end">{{ endereco.logradouro }}, {{ endereco.numero }}</p>
            <p class="er-end">{{ endereco.cidade }}/{{ endereco.uf }}</p>
          </div>
        </div>
      </div>

      <div class="conf-actions">
        <button class="btn-acompanhar" @click="$router.push('/home')">
          Voltar ao início
        </button>
      </div>
    </div>

    <!-- ═══ BOTTOM BAR ═══ -->
    <div class="bottom-bar" v-if="step < 4 && !carrinho.isEmpty()">
      <div class="bottom-info" v-if="step === 0">
        <div class="select-all-wrap">
          <input type="checkbox" class="tts-check" :checked="todosSelecionados" @change="toggleTodos"/>
          <span class="select-all-label">Todos</span>
        </div>
        <div class="total-wrap">
          <span class="total-label">Total:</span>
          <span class="bottom-total">{{ fmt(totalFinal) }}</span>
        </div>
      </div>
      <div class="bottom-info" v-else>
        <div class="total-wrap">
          <span class="total-label">Total:</span>
          <span class="bottom-total">{{ fmt(totalComEntrega) }}</span>
        </div>
      </div>
      <button class="checkout-btn" :disabled="!podeAvancar || salvando" @click="avancar">
        <span v-if="salvando" class="spinner-btn"></span>
        <span v-else>{{ labelBotao }}</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import { carrinho } from '@/stores/carrinho.js'

const router = useRouter()

// ─── Steps ───────────────────────────────────────────────
const step    = ref(0)
const steps   = ['Carrinho', 'Endereço', 'Entrega', 'Pagamento', 'Pedido']
const titulos = ['Meu Carrinho', 'Endereço', 'Entrega', 'Pagamento', 'Pedido Realizado!']

// ─── Seleção de itens ────────────────────────────────────
const selecionados    = ref(carrinho.itens.map(i => i.id))
const itensFinalizados = ref(0)  // guarda a qtd após limpar o carrinho

const itensPorLoja = computed(() => {
  const grupos = {}
  carrinho.itens.forEach(item => {
    const lk = item.lojaId || 'loja-aura'
    if (!grupos[lk]) {
      grupos[lk] = { nomeLoja: item.nomeLoja || 'Aura Store', frete: item.frete ?? 0, itens: [] }
    }
    grupos[lk].itens.push(item)
  })
  return grupos
})

const itensSelecionados = computed(() =>
  carrinho.itens.filter(i => selecionados.value.includes(i.id))
)

const todosSelecionados = computed(() =>
  carrinho.itens.length > 0 && selecionados.value.length === carrinho.itens.length
)

const todosDaLojaSelecionados = (lojaId) => {
  const ids = itensPorLoja.value[lojaId].itens.map(i => i.id)
  return ids.every(id => selecionados.value.includes(id))
}

const toggleItem = (id) => {
  const idx = selecionados.value.indexOf(id)
  if (idx === -1) selecionados.value.push(id)
  else selecionados.value.splice(idx, 1)
}

const toggleTodos = () => {
  if (todosSelecionados.value) selecionados.value = []
  else selecionados.value = carrinho.itens.map(i => i.id)
}

const toggleLoja = (lojaId) => {
  const ids = itensPorLoja.value[lojaId].itens.map(i => i.id)
  if (todosDaLojaSelecionados(lojaId)) {
    selecionados.value = selecionados.value.filter(id => !ids.includes(id))
  } else {
    ids.forEach(id => { if (!selecionados.value.includes(id)) selecionados.value.push(id) })
  }
}

// ─── Cupom ───────────────────────────────────────────────
const codigoCupom  = ref('')
const cupomAplicado = ref(null)
const mensagemCupom = ref('')

function aplicarCupom() {
  const resultado = carrinho.validarCupom(codigoCupom.value)
  if (resultado) {
    cupomAplicado.value = resultado
    mensagemCupom.value = `✅ Cupom aplicado: ${resultado.label}`
  } else {
    mensagemCupom.value = '❌ Cupom inválido ou expirado'
    setTimeout(() => (mensagemCupom.value = ''), 3000)
  }
}

function removerCupom() {
  cupomAplicado.value = null
  codigoCupom.value   = ''
  mensagemCupom.value = ''
}

// ─── Totais ──────────────────────────────────────────────
const subtotalSelecionado = computed(() =>
  itensSelecionados.value.reduce((acc, i) => acc + i.preco * i.qtd, 0)
)

const freteGratis = computed(() => subtotalSelecionado.value >= 150)

const totalFinal = computed(() => {
  let total = subtotalSelecionado.value
  if (!freteGratis.value && cupomAplicado.value?.tipo !== 'frete') total += 8.90
  if (cupomAplicado.value?.tipo === 'percentual') total -= total * cupomAplicado.value.desconto
  return total
})

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Endereço ────────────────────────────────────────────
const endereco = ref({
  cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', uf: '', nome: '', telefone: ''
})
const buscandoCep  = ref(false)
const erroEndereco = ref('')

function formatarCep() {
  endereco.value.cep = endereco.value.cep
    .replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

function formatarTelefone() {
  let v = endereco.value.telefone.replace(/\D/g, '').slice(0, 11)
  if (v.length > 10)      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  else if (v.length > 6)  v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3')
  else if (v.length > 2)  v = v.replace(/^(\d{2})(\d*)$/, '($1) $2')
  endereco.value.telefone = v
}

async function buscarCep() {
  const cep = endereco.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  buscandoCep.value = true
  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      endereco.value.logradouro = data.logradouro || ''
      endereco.value.bairro     = data.bairro     || ''
      endereco.value.cidade     = data.localidade || ''
      endereco.value.uf         = data.uf         || ''
    }
  } catch {}
  buscandoCep.value = false
}

// ─── Entrega ─────────────────────────────────────────────
const entregaSelecionada = ref('padrao')
const opcoesEntrega = [
  { id: 'express', nome: 'Expresso',   prazo: '1–2 dias úteis', desc: 'Chega mais rápido',  preco: 19.90 },
  { id: 'padrao',  nome: 'Padrão',     prazo: '3–5 dias úteis', desc: 'Entrega comum',       preco: 8.90  },
  { id: 'gratis',  nome: 'Econômico',  prazo: '7–10 dias úteis',desc: 'Mais demorado',       preco: 0     },
]

const entregaEscolhida = computed(() =>
  opcoesEntrega.find(o => o.id === entregaSelecionada.value)
)

const freteEntregaGratis = computed(() =>
  (entregaEscolhida.value?.preco ?? 0) === 0 || freteGratis.value
)

const totalComEntrega = computed(() => {
  let total = subtotalSelecionado.value
  if (!freteEntregaGratis.value) total += entregaEscolhida.value?.preco || 0
  if (cupomAplicado.value?.tipo === 'percentual') total -= total * cupomAplicado.value.desconto
  if (pagamentoSelecionado.value === 'pix') total -= subtotalSelecionado.value * 0.05
  return total
})

// ─── Pagamento ───────────────────────────────────────────
const pagamentoSelecionado = ref('cartao')
const opcoesPagamento = [
  { id: 'cartao', nome: 'Cartão de crédito/débito', desc: 'Visa, Mastercard, Elo...', icon: '💳', badge: null },
  { id: 'pix',    nome: 'Pix',                      desc: 'Aprovação imediata',       icon: '⚡', badge: '5% OFF' },
  { id: 'boleto', nome: 'Boleto bancário',           desc: 'Vencimento em 3 dias',    icon: '🔖', badge: null },
]

const cartao    = ref({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 })
const pixCopiado = ref(false)

function formatarCartao() {
  cartao.value.numero = cartao.value.numero
    .replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatarValidade() {
  cartao.value.validade = cartao.value.validade
    .replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
}

function copiarPix() {
  navigator.clipboard?.writeText('00020126580014br.gov.bcb.pix')
  pixCopiado.value = true
  setTimeout(() => (pixCopiado.value = false), 2000)
}

const parcelasDisponiveis = computed(() => {
  const total = totalComEntrega.value
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: i === 0
      ? `1x de ${fmt(total)} (à vista)`
      : `${i + 1}x de ${fmt(total / (i + 1))} sem juros`
  }))
})

// ─── Navegação + Salvar no Supabase ──────────────────────
const numeroPedido    = ref('')
const salvando        = ref(false)
const erroFinalizacao = ref('')

const podeAvancar = computed(() => {
  if (step.value === 0) return itensSelecionados.value.length > 0
  if (step.value === 1) return (
    endereco.value.cep && endereco.value.logradouro &&
    endereco.value.numero && endereco.value.cidade &&
    endereco.value.uf && endereco.value.nome && endereco.value.telefone
  )
  if (step.value === 2) return !!entregaSelecionada.value
  if (step.value === 3) {
    if (pagamentoSelecionado.value === 'cartao')
      return cartao.value.numero.length >= 19 && cartao.value.nome &&
             cartao.value.validade.length === 5 && cartao.value.cvv.length >= 3
    return true
  }
  return false
})

const labelBotao = computed(() => {
  if (salvando.value) return 'Salvando...'
  const labels = ['Informar endereço', 'Escolher entrega', 'Ir para pagamento', 'Finalizar pedido']
  return labels[step.value]
})

async function finalizarPedido() {
  salvando.value        = true
  erroFinalizacao.value = ''

  try {
    // 1. Pega o usuário logado
    const { data: { user }, error: errUser } = await supabase.auth.getUser()
    if (errUser || !user) throw new Error('Usuário não autenticado. Faça login para finalizar.')

    // 2. Monta o endereço em texto
    const enderecoTexto = [
      endereco.value.logradouro,
      endereco.value.numero,
      endereco.value.complemento,
      endereco.value.bairro,
      `${endereco.value.cidade}/${endereco.value.uf}`,
      `CEP ${endereco.value.cep}`,
    ].filter(Boolean).join(', ')

    // 3. Calcula desconto em %
    let descontoPorcentagem = 0
    if (pagamentoSelecionado.value === 'pix')               descontoPorcentagem += 5
    if (cupomAplicado.value?.tipo === 'percentual')          descontoPorcentagem += cupomAplicado.value.desconto * 100

    // 4. Insere o pedido
    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        user_id:              user.id,
        status:               'pendente',
        etapa_ativa:          1,
        pagamento:            pagamentoSelecionado.value,
        desconto:             Number((totalComEntrega.value * descontoPorcentagem / 100).toFixed(2)),
        endereco:             enderecoTexto,
      })
      .select()
      .single()

    if (errPedido) throw errPedido

    // 5. Insere os itens do pedido
    const itensBanco = itensSelecionados.value.map(item => ({
      pedido_id:     pedido.id,
      produto_id:    item.id,
      nome:          item.nome,
      detalhe:       item.variacao || null,
      preço:         item.preco,
      url_da_imagem: item.imagem || item.img || null,
    }))

    const { error: errItens } = await supabase
      .from('itens_pedido')
      .insert(itensBanco)

    if (errItens) throw errItens

    // 6. Sucesso — guarda número e limpa carrinho
    itensFinalizados.value = itensSelecionados.value.length
    numeroPedido.value     = pedido.numero ?? pedido.id.slice(0, 8).toUpperCase()
    carrinho.limpar()
    selecionados.value = []
    step.value = 4
    window.scrollTo({ top: 0, behavior: 'smooth' })

  } catch (e) {
    console.error('[Checkout] Erro ao finalizar pedido:', e)
    erroFinalizacao.value = e.message || 'Erro ao salvar pedido. Tente novamente.'
  } finally {
    salvando.value = false
  }
}

function avancar() {
  erroEndereco.value = ''
  if (step.value === 3) {
    finalizarPedido()   // ← salva no Supabase
    return
  }
  step.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function voltarStep() {
  if (step.value === 0) router.push('/home/loja')
  else {
    step.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<style scoped>
:root {
  --red: #FE2C55; --red-light: #fff0f3; --gray: #f5f5f5; --gray-2: #ebebeb;
  --text: #161823; --text-2: #757575; --border: #e8e8e8; --white: #ffffff;
  --green: #00c951; --bar-h: 52px; --bottom-h: 68px;
}
.checkout-page {
  font-family: 'Noto Sans','Helvetica Neue',Arial,sans-serif;
  background: #f5f5f5; min-height: 100vh;
  padding-bottom: calc(var(--bottom-h) + 20px);
  color: var(--text); -webkit-font-smoothing: antialiased;
}
.top-bar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; height: var(--bar-h);
  background: white; padding: 0 14px; border-bottom: 1px solid var(--border); gap: 10px;
}
.back-btn {
  width: 34px; height: 34px; background: none; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  border-radius: 50%; transition: background .15s; color: var(--text); flex-shrink: 0;
}
.back-btn:hover { background: var(--gray); }
.back-btn svg { width: 20px; height: 20px; }
.top-title { flex: 1; text-align: center; font-size: 16px; font-weight: 600; letter-spacing: -.2px; }
.top-right-info { font-size: 12px; color: var(--text-2); flex-shrink: 0; }
.progress-bar { height: 3px; background: var(--gray-2); }
.progress-fill { height: 100%; background: #FE2C55; transition: width 0.4s ease; }
.steps-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 10px 16px 8px; background: white; border-bottom: 1px solid var(--border);
}
.step-dot { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
.dot-circle {
  width: 26px; height: 26px; border-radius: 50%; background: var(--gray-2); color: var(--text-2);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; transition: background .3s, color .3s;
}
.dot-circle svg { width: 12px; height: 12px; }
.step-dot.active .dot-circle { background: #FE2C55; color: white; }
.step-dot.done .dot-circle   { background: #00c951; color: white; }
.dot-label { font-size: 9px; color: var(--text-2); text-align: center; white-space: nowrap; }
.step-dot.active .dot-label  { color: #FE2C55; font-weight: 600; }
.step-dot.done .dot-label    { color: #00c951; }
.step-content { padding: 10px 0 8px; }
.card-section { background: white; margin: 8px 0; padding: 16px 14px; }
.section-title { font-size: 13.5px; font-weight: 700; color: var(--text); margin-bottom: 14px; letter-spacing: -.1px; }
.tts-check {
  appearance: none; -webkit-appearance: none; width: 20px; height: 20px;
  border: 1.8px solid #ccc; border-radius: 50%; cursor: pointer; flex-shrink: 0;
  transition: border-color .15s, background .15s; position: relative;
  display: flex; align-items: center; justify-content: center;
}
.tts-check:checked { background: #FE2C55; border-color: #FE2C55; }
.tts-check:checked::after {
  content: ''; width: 5px; height: 9px; border: 2px solid white;
  border-top: none; border-left: none;
  transform: rotate(45deg) translate(-1px,-1px); position: absolute;
}
.loja-group { background: white; margin: 8px 0; }
.loja-header { display: flex; align-items: center; gap: 8px; padding: 12px 14px 10px; border-bottom: 1px solid var(--gray); }
.loja-icon { width: 16px; height: 16px; color: var(--text-2); flex-shrink: 0; }
.loja-nome { font-size: 13px; font-weight: 600; flex: 1; }
.loja-badge { font-size: 10px; font-weight: 600; color: var(--green); background: #e6faf0; padding: 2px 7px; border-radius: 20px; }
.item-row { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border-bottom: 1px solid var(--gray); }
.item-img-wrap { position: relative; flex-shrink: 0; }
.item-img { width: 84px; height: 84px; border-radius: 6px; object-fit: cover; background: var(--gray); display: block; }
.item-qty-badge {
  position: absolute; top: -5px; right: -5px; background: #FE2C55; color: white;
  font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; border: 2px solid white;
}
.item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.item-nome { font-size: 13px; font-weight: 400; line-height: 1.35; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-variacao { font-size: 11px; color: var(--text-2); background: var(--gray); padding: 2px 7px; border-radius: 4px; display: inline-block; width: fit-content; }
.item-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.item-preco-wrap { display: flex; flex-direction: column; gap: 1px; }
.item-preco { font-size: 15px; font-weight: 700; color: #FE2C55; }
.item-preco-original { font-size: 11px; color: #bbb; text-decoration: line-through; }
.qty-controls { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.qty-btn { width: 28px; height: 28px; background: var(--gray); border: none; font-size: 17px; cursor: pointer; color: var(--text); display: flex; align-items: center; justify-content: center; transition: background .1s; line-height: 1; }
.qty-btn:hover:not(:disabled) { background: var(--gray-2); }
.qty-btn:disabled { color: #ccc; cursor: default; }
.qty-num { min-width: 28px; text-align: center; font-size: 13px; font-weight: 600; background: white; padding: 0 2px; line-height: 28px; }
.remove-btn { background: none; border: none; cursor: pointer; padding: 4px; color: #ccc; flex-shrink: 0; transition: color .15s; }
.remove-btn:hover { color: #FE2C55; }
.remove-btn svg { width: 17px; height: 17px; }
.frete-row { display: flex; align-items: center; gap: 6px; padding: 9px 14px 11px; }
.frete-icon { width: 15px; height: 15px; color: var(--text-2); }
.frete-gratis { font-size: 12px; color: var(--green); font-weight: 600; }
.frete-valor  { font-size: 12px; color: var(--text-2); }
.cupom-row { display: flex; gap: 8px; }
.cupom-input { flex: 1; border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; font-size: 13px; color: var(--text); outline: none; transition: border-color .2s; background: white; }
.cupom-input:focus { border-color: #FE2C55; }
.cupom-input::placeholder { color: #bbb; }
.cupom-input:disabled { background: var(--gray); color: var(--text-2); }
.cupom-btn { background: #FE2C55; color: white; border: none; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: opacity .15s; }
.cupom-btn:hover { opacity: .88; }
.cupom-msg { font-size: 12px; margin-top: 8px; }
.cupom-msg.ok   { color: var(--green); }
.cupom-msg.erro { color: #FE2C55; }
.resumo-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-2); padding: 5px 0; }
.resumo-divider { height: 1px; background: var(--gray); margin: 8px 0; }
.resumo-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; color: var(--text); padding: 4px 0; }
.total-valor { color: #FE2C55; font-weight: 700; }
.gratis  { color: var(--green); font-weight: 600; }
.desconto { color: var(--green); }
.bold    { font-weight: 700; color: var(--text); }
.parcela-info { font-size: 11.5px; color: var(--text-2); margin-top: 8px; text-align: right; }
.field-row { display: flex; gap: 10px; margin-bottom: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.flex-1 { flex: 1; } .flex-2 { flex: 2; }
.field label { font-size: 12px; font-weight: 600; color: var(--text-2); }
.input { border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; font-size: 13.5px; color: var(--text); outline: none; transition: border-color .2s; background: white; width: 100%; box-sizing: border-box; }
.input:focus { border-color: #FE2C55; }
.input::placeholder { color: #bbb; }
.select { appearance: none; cursor: pointer; }
.cep-wrap { display: flex; gap: 6px; }
.cep-btn { flex-shrink: 0; width: 40px; height: 40px; background: var(--gray); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; color: var(--text-2); }
.cep-btn:hover:not(:disabled) { background: var(--gray-2); }
.cep-btn:disabled { cursor: wait; }
.spinner { width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: #FE2C55; border-radius: 50%; animation: spin .6s linear infinite; }
.spinner-btn { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.erro-msg { color: #FE2C55; font-size: 12px; margin-top: 4px; }
.endereco-resumo { display: flex; align-items: flex-start; gap: 10px; background: var(--gray); border-radius: 8px; padding: 12px; }
.er-nome { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.er-end  { font-size: 12px; color: var(--text-2); line-height: 1.5; }
.editar-btn { margin-left: auto; flex-shrink: 0; font-size: 12px; color: #FE2C55; background: none; border: none; cursor: pointer; font-weight: 600; }
.entrega-option { display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--border); border-radius: 10px; padding: 14px 12px; margin-bottom: 10px; cursor: pointer; transition: border-color .15s, background .15s; }
.entrega-option:hover,
.entrega-option.selected { border-color: #FE2C55; background: #fff5f7; }
.entrega-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color .15s; }
.entrega-option.selected .entrega-radio { border-color: #FE2C55; }
.radio-dot { width: 10px; height: 10px; border-radius: 50%; background: #FE2C55; }
.entrega-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.entrega-top  { display: flex; align-items: center; gap: 8px; }
.entrega-nome { font-size: 13.5px; font-weight: 600; color: var(--text); }
.entrega-prazo { font-size: 11px; color: var(--text-2); background: var(--gray); padding: 2px 7px; border-radius: 20px; }
.entrega-desc  { font-size: 12px; color: var(--text-2); }
.entrega-preco { font-size: 14px; font-weight: 700; color: var(--text); flex-shrink: 0; }
.entrega-preco.gratis { color: var(--green); }
.pagamento-option { display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--border); border-radius: 10px; padding: 14px 12px; margin-bottom: 10px; cursor: pointer; transition: border-color .15s, background .15s; }
.pagamento-option:hover,
.pagamento-option.selected { border-color: #FE2C55; background: #fff5f7; }
.pg-icon  { font-size: 22px; flex-shrink: 0; }
.pg-badge { font-size: 11px; font-weight: 700; color: var(--green); background: #e6faf0; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; }
.pix-qr   { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.pix-qr-fake { padding: 12px; background: white; border: 1.5px solid var(--border); border-radius: 12px; }
.pix-inst { font-size: 13px; color: var(--text-2); text-align: center; }
.copiar-pix-btn { display: flex; align-items: center; gap: 6px; background: var(--gray); border: 1px solid var(--border); border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--text); transition: background .15s; }
.copiar-pix-btn:hover { background: var(--gray-2); }
.pix-desc { font-size: 12px; color: var(--green); font-weight: 600; }
.confirmacao {}
.confetti-area { background: white; padding: 40px 20px 32px; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 8px; text-align: center; }
.check-circle { width: 80px; height: 80px; border-radius: 50%; background: var(--green); display: flex; align-items: center; justify-content: center; animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.conf-titulo { font-size: 22px; font-weight: 700; color: var(--text); }
.conf-sub    { font-size: 14px; color: var(--text-2); }
.conf-actions { padding: 16px 14px; }
.btn-acompanhar { width: 100%; background: #FE2C55; color: white; border: none; border-radius: 24px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
.btn-acompanhar:hover { opacity: .88; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 40px 24px; text-align: center; gap: 12px; }
.empty-icon svg { width: 80px; height: 80px; }
.empty-titulo { font-size: 17px; font-weight: 600; }
.empty-sub { font-size: 13.5px; color: var(--text-2); }
.empty-cta { margin-top: 8px; background: #FE2C55; color: white; border: none; border-radius: 24px; padding: 12px 32px; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
.empty-cta:hover { opacity: .88; }
.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; height: var(--bottom-h); background: white; border-top: 1px solid var(--border); display: flex; align-items: center; padding: 0 14px; gap: 10px; z-index: 100; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.bottom-info { flex: 1; display: flex; align-items: center; gap: 10px; }
.select-all-wrap { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.select-all-label { font-size: 13px; color: var(--text-2); }
.total-wrap { display: flex; align-items: baseline; gap: 4px; }
.total-label { font-size: 13px; color: var(--text-2); }
.bottom-total { font-size: 18px; font-weight: 700; color: #FE2C55; }
.checkout-btn { flex-shrink: 0; background: #FE2C55; color: white; border: none; border-radius: 24px; padding: 0 22px; height: 44px; font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .15s, transform .1s; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
.checkout-btn:hover:not(:disabled) { opacity: .88; transform: scale(1.02); }
.checkout-btn:disabled { background: #e0e0e0; color: #aaa; cursor: not-allowed; transform: none; }
</style>