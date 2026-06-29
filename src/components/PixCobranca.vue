<template>
  <Transition name="modal">
    <div v-if="aberto" class="pix-overlay" @click.self="$emit('fechar')">
      <div class="pix-modal">

        <button class="pix-close" @click="$emit('fechar')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="pix-header">
          <div class="pix-step-bar">
            <div class="pix-step-fill" :style="{ width: etapa === 1 ? '50%' : '100%' }"/>
          </div>
        </div>

        <!-- ETAPA 1: Valor -->
        <template v-if="etapa === 1">
          <div class="pix-title">Como você quer fazer a cobrança?</div>
          <div class="pix-sub">Mostre o QR code na sua tela, copie o código ou envie um link com todos os dados pra quem vai te pagar.</div>

          <div class="pix-valor-label">Valor a ser cobrado</div>
          <div class="pix-valor-input-wrap">
            <span class="pix-cifrao">R$</span>
            <input
              v-model="valorRaw"
              class="pix-valor-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              @input="erro = ''"
            />
          </div>
          <div v-if="erro" class="pix-erro">{{ erro }}</div>

          <button class="pix-btn-primary" @click="avancar">
            Gerar QR Code
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </template>

        <!-- ETAPA 2: QR Code + ações -->
        <template v-else>
          <div class="pix-title">Como você quer fazer a cobrança?</div>
          <div class="pix-sub">Mostre o QR code na sua tela, copie o código ou envie um link com todos os dados pra quem vai te pagar.</div>

          <div class="pix-qr-wrap">
            <div class="pix-qr-inner">
              <div ref="qrCanvas" class="pix-qr-canvas"/>
            </div>
          </div>

          <div class="pix-valor-label">Valor a ser pago</div>
          <div class="pix-valor-display">R$ {{ valorFormatado }}</div>
          <div class="pix-para">para <strong>{{ nomeRecebedor }}</strong></div>

          <button class="pix-btn-primary" @click="copiarCodigo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {{ copiado ? 'Código copiado!' : 'Copiar código' }}
          </button>

          <button class="pix-btn-secondary" @click="compartilhar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Enviar link da cobrança
          </button>

          <button class="pix-btn-link" @click="etapa = 1">← Alterar valor</button>
        </template>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  aberto:        { type: Boolean, default: false },
  nomeRecebedor: { type: String,  default: 'Aura Beauty' },
  chavePix:      { type: String,  default: 'contato@aurabeauty.com.br' }, // ← troque pela sua chave Pix real
})
const emit = defineEmits(['fechar'])

const etapa    = ref(1)
const valorRaw = ref('')
const erro     = ref('')
const copiado  = ref(false)
const qrCanvas = ref(null)

const valorFormatado = computed(() => {
  const n = parseFloat(valorRaw.value) || 0
  return n.toFixed(2).replace('.', ',')
})

const pixPayload = computed(() => {
  const valor = (parseFloat(valorRaw.value) || 0).toFixed(2)
  const chave = props.chavePix
  const nome  = props.nomeRecebedor.slice(0, 25).padEnd(1, ' ')

  const field = (val) => String(val.length).padStart(2, '0') + val

  const gui = '0014BR.GOV.BCB.PIX' + field(chave) + field('***')

  const payload =
    '000201' +
    '010212' +
    '26' + field(gui) +
    '52040000' +
    '5303986' +
    '54' + field(valor) +
    '5802BR' +
    '59' + field(nome) +
    '6009SAO PAULO' +
    '62070503***' +
    '6304'

  return payload + crc16(payload)
})

function crc16(str) {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return ((crc & 0xFFFF) >>> 0).toString(16).toUpperCase().padStart(4, '0')
}

async function avancar() {
  const v = parseFloat(valorRaw.value)
  if (!valorRaw.value || isNaN(v) || v <= 0) {
    erro.value = 'Informe um valor válido'
    return
  }
  etapa.value = 2
  await nextTick()
  desenharQR()
}

async function desenharQR() {
  if (!qrCanvas.value) return
  if (!window.QRCode) {
    await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js')
  }
  qrCanvas.value.innerHTML = ''
  new window.QRCode(qrCanvas.value, {
    text:         pixPayload.value,
    width:        180,
    height:       180,
    colorDark:    '#000000',
    colorLight:   '#ffffff',
    correctLevel: window.QRCode.CorrectLevel.M,
  })
}

function carregarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
}

function copiarCodigo() {
  navigator.clipboard.writeText(pixPayload.value).catch(() => {})
  copiado.value = true
  setTimeout(() => copiado.value = false, 2500)
}

function compartilhar() {
  const texto = `Pix para ${props.nomeRecebedor}\nValor: R$ ${valorFormatado.value}\nChave: ${props.chavePix}`
  if (navigator.share) {
    navigator.share({ title: 'Cobrança Pix', text: texto })
  } else {
    navigator.clipboard.writeText(texto)
    alert('Link copiado para a área de transferência!')
  }
}

watch(() => props.aberto, (v) => {
  if (!v) { etapa.value = 1; valorRaw.value = ''; erro.value = ''; copiado.value = false }
})
</script>

<style scoped>
.pix-overlay {
  position: fixed; inset: 0; z-index: 999;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(0,0,0,.85); backdrop-filter: blur(6px);
  padding: 0;
}
@media (min-width: 600px) {
  .pix-overlay { align-items: center; padding: 24px; }
}

.pix-modal {
  position: relative;
  width: 100%; max-width: 420px;
  background: #111;
  border: 1px solid #222;
  border-radius: 20px 20px 0 0;
  padding: 28px 24px 36px;
  display: flex; flex-direction: column; gap: 0;
}
@media (min-width: 600px) {
  .pix-modal { border-radius: 20px; }
}

.pix-close {
  position: absolute; top: 16px; left: 16px;
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid #2a2a2a; background: #1e1e1e;
  color: #888; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .2s;
}
.pix-close:hover { border-color: #ff2e88; color: #ff2e88; }

.pix-header { margin-bottom: 20px; padding-top: 4px; }
.pix-step-bar {
  height: 3px; background: #2a2a2a; border-radius: 4px; overflow: hidden;
}
.pix-step-fill {
  height: 100%; background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 4px; transition: width .4s ease;
}

.pix-title {
  font-family: 'Syne', sans-serif;
  font-size: 22px; font-weight: 800; color: #fff;
  line-height: 1.15; margin-bottom: 10px;
}
.pix-sub { font-size: 13px; color: #888; line-height: 1.6; margin-bottom: 24px; }

.pix-valor-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }

.pix-valor-input-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #1a1a1a; border: 1px solid #2a2a2a;
  border-radius: 12px; padding: 14px 18px; margin-bottom: 6px;
  transition: border-color .2s;
}
.pix-valor-input-wrap:focus-within { border-color: #7c3aed; }
.pix-cifrao { font-size: 18px; font-weight: 700; color: #555; }
.pix-valor-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 28px; font-weight: 800; color: #fff; font-family: 'Syne', sans-serif;
  width: 100%;
}
.pix-valor-input::placeholder { color: #333; }
.pix-valor-input::-webkit-outer-spin-button,
.pix-valor-input::-webkit-inner-spin-button { -webkit-appearance: none; }

.pix-erro { font-size: 11px; color: #ff2e88; margin-bottom: 12px; }

.pix-qr-wrap {
  display: flex; justify-content: center; margin: 4px 0 20px;
}
.pix-qr-inner {
  width: 210px; height: 210px;
  background: #fff;
  border: 3px solid #7c3aed;
  border-radius: 16px;
  padding: 12px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.pix-qr-canvas { display: block; }

.pix-valor-display {
  font-family: 'Syne', sans-serif;
  font-size: 38px; font-weight: 800; color: #fff;
  margin-bottom: 4px;
}
.pix-para { font-size: 13px; color: #888; margin-bottom: 24px; }
.pix-para strong { color: #bbb; }

.pix-btn-primary {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 15px; background: #7c3aed; color: #fff; border: none;
  border-radius: 50px; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: opacity .2s, transform .15s; margin-bottom: 10px;
}
.pix-btn-primary:hover { opacity: .9; transform: translateY(-1px); }

.pix-btn-secondary {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 15px; background: #1e1e1e; color: #bbb;
  border: 1px solid #2a2a2a; border-radius: 50px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all .2s; margin-bottom: 12px;
}
.pix-btn-secondary:hover { border-color: #7c3aed; color: #a78bfa; }

.pix-btn-link {
  background: none; border: none; color: #555; font-size: 12px;
  cursor: pointer; width: 100%; text-align: center;
  transition: color .2s; padding: 4px;
}
.pix-btn-link:hover { color: #7c3aed; }

.modal-enter-active, .modal-leave-active { transition: all .28s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .pix-modal, .modal-leave-to .pix-modal { transform: translateY(30px); }
</style>