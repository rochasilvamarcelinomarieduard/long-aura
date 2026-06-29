<template>
  <Transition name="drawer">
    <div v-if="aberto" class="drawer-overlay" @click.self="fechar">
      <div class="drawer">

        <!-- ══ HEADER ══ -->
        <div class="drawer-header">
          <button v-if="step > 0" class="back-btn" @click="voltarStep" aria-label="Voltar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="header-title" :class="{ 'with-back': step > 0 }">
            <svg v-if="step === 0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff2d6f" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {{ stepTitulos[step] }}
          </div>
          <button class="close-btn" @click="fechar" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- ══ PROGRESS STEPS (steps 0-3) ══ -->
        <div v-if="step < 4" class="steps-bar">
          <div v-for="(s, i) in stepLabels" :key="i" class="step-item" :class="{ active: i === step, done: i < step }">
            <div class="step-circle">
              <svg v-if="i < step" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="step-label">{{ s }}</span>
            <div v-if="i < stepLabels.length - 1" class="step-line" :class="{ done: i < step }"></div>
          </div>
        </div>

        <!-- ══ TABS (só no step 0) ══ -->
        <div v-if="step === 0" class="tabs">
          <button class="tab" :class="{ 'tab--active': abaAtiva === 'carrinho' }" @click="abaAtiva = 'carrinho'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrinho
            <span class="tab-badge">{{ totalItens }}</span>
          </button>
          <button class="tab" :class="{ 'tab--active': abaAtiva === 'pedido' }" @click="abaAtiva = 'pedido'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            </svg>
            Pedidos
          </button>
        </div>

        <!-- ══════════════════════════════════════
             PANEL: CARRINHO (step 0, aba carrinho)
        ══════════════════════════════════════ -->
        <div v-show="step === 0 && abaAtiva === 'carrinho'" class="panel">

          <!-- Frete grátis banner -->
          <div class="frete-banner">
            <span v-if="freteGratis"> Você ganhou <strong>frete grátis!</strong></span>
            <span v-else>
              Faltam <strong>{{ fmt(150 - carrinho.total()) }}</strong> para frete grátis
              <div class="frete-progress"><div class="frete-fill" :style="{ width: Math.min(carrinho.total() / 150 * 100, 100) + '%' }"></div></div>
            </span>
          </div>

          <!-- Vazio -->
          <div v-if="carrinho.isEmpty()" class="vazio">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" stroke-width="1.2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p class="vazio-titulo">Seu carrinho está vazio</p>
            <p class="vazio-sub">Adicione produtos para continuar</p>
            <button class="btn-explorar" @click="fechar">Explorar produtos</button>
          </div>

          <!-- Lista de itens -->
          <TransitionGroup v-else name="list" tag="ul" class="lista-itens">
            <li v-for="item in carrinho.itens" :key="item.id" class="item">
              <div class="item-img-wrap">
                <img :src="item.img || item.imagem" :alt="item.nome" class="item-img"/>
              </div>
              <div class="item-info">
                <p class="item-nome">{{ item.nome }}</p>
                <p class="item-preco-unit">{{ fmt(item.preco) }} / un</p>
                <div class="item-controles">
                  <button class="ctrl-btn" @click="carrinho.diminuir(item.id)">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span class="ctrl-qtd">{{ item.qtd }}</span>
                  <button class="ctrl-btn" @click="carrinho.aumentar(item.id)">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
              <div class="item-right">
                <p class="item-subtotal">{{ fmt(item.preco * item.qtd) }}</p>
                <button class="btn-remover" @click="carrinho.remover(item.id)" aria-label="Remover">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </li>
          </TransitionGroup>

          <template v-if="!carrinho.isEmpty()">
            <!-- Cupom -->
            <div class="section-block">
              <p class="section-label">Cupom de desconto</p>
              <div class="cupom-row">
                <input v-model="codigoCupom" type="text" placeholder="Ex: AURA10"
                  class="cupom-input" :disabled="!!cupomAplicado" @keyup.enter="aplicarCupom"/>
                <button class="cupom-btn" @click="cupomAplicado ? removerCupom() : aplicarCupom()">
                  {{ cupomAplicado ? 'Remover' : 'Aplicar' }}
                </button>
              </div>
              <p v-if="mensagemCupom" :class="['cupom-msg', cupomAplicado ? 'ok' : 'erro']">{{ mensagemCupom }}</p>
            </div>

            <!-- Pix toggle -->
            <div class="pix-row">
              <label class="pix-label">
                <input type="checkbox" v-model="pagarPix" class="pix-check"/>
                Pagar com Pix
              </label>
              <span class="pix-badge">5% OFF</span>
            </div>

            <!-- Resumo -->
            <div class="resumo">
              <div class="resumo-row"><span>Subtotal ({{ totalItens }} itens)</span><span>{{ fmt(carrinho.subtotal()) }}</span></div>
              <div class="resumo-row">
                <span>Frete</span>
                <span :class="freteGratis ? 'green' : 'muted'">{{ freteGratis ? 'Grátis' : fmt(8.90) }}</span>
              </div>
              <div v-if="cupomAplicado" class="resumo-row green">
                <span>Desconto ({{ cupomAplicado.label }})</span>
                <span>− {{ fmt(carrinho.descontoCupom(cupomAplicado)) }}</span>
              </div>
              <div v-if="pagarPix" class="resumo-row green">
                <span>Desconto Pix</span>
                <span>− {{ fmt(carrinho.descontoPix()) }}</span>
              </div>
              <div class="resumo-divider"></div>
              <div class="resumo-total">
                <span>Total</span>
                <span class="total-value">{{ fmt(carrinho.totalFinal(8.90, cupomAplicado, pagarPix)) }}</span>
              </div>
            </div>

            <!-- CTA -->
            <div class="actions">
              <button class="btn-checkout" @click="irParaEndereco">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Informar endereço
              </button>
              <button class="btn-limpar" @click="carrinho.limpar()">Limpar carrinho</button>
            </div>
          </template>
        </div>

        <!-- ══════════════════════════════════════
             PANEL: PEDIDOS (step 0, aba pedido)
        ══════════════════════════════════════ -->
        <div v-show="step === 0 && abaAtiva === 'pedido'" class="panel">
          <PedidoTracker v-if="pedidoAtivo" :pedido="pedidoAtivo" :visivel="painelPedidoVisivel"/>
          <div v-else class="vazio">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" stroke-width="1.5">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            </svg>
            <p class="vazio-titulo">Nenhum pedido ativo</p>
            <p class="vazio-sub">Seus pedidos em andamento aparecerão aqui</p>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             STEP 1: ENDEREÇO
        ══════════════════════════════════════ -->
        <div v-if="step === 1" class="panel">
          <div class="section-block">
            <p class="section-label">CEP</p>
            <div class="cep-row">
              <input v-model="endereco.cep" type="text" placeholder="00000-000"
                class="field-input" maxlength="9" @input="formatarCep" @blur="buscarCep"/>
              <button class="cep-btn" @click="buscarCep" :disabled="buscandoCep">
                <span v-if="buscandoCep" class="spinner"></span>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="row-2">
            <div class="section-block flex-2">
              <p class="section-label">Logradouro *</p>
              <input v-model="endereco.logradouro" type="text" placeholder="Rua, Av..." class="field-input"/>
            </div>
            <div class="section-block flex-1">
              <p class="section-label">Número *</p>
              <input v-model="endereco.numero" type="text" placeholder="123" class="field-input"/>
            </div>
          </div>

          <div class="section-block">
            <p class="section-label">Complemento</p>
            <input v-model="endereco.complemento" type="text" placeholder="Apto, Bloco..." class="field-input"/>
          </div>

          <div class="row-2">
            <div class="section-block flex-2">
              <p class="section-label">Bairro *</p>
              <input v-model="endereco.bairro" type="text" placeholder="Bairro" class="field-input"/>
            </div>
            <div class="section-block flex-1">
              <p class="section-label">UF *</p>
              <input v-model="endereco.uf" type="text" placeholder="MG" class="field-input" maxlength="2" style="text-transform:uppercase"/>
            </div>
          </div>

          <div class="section-block">
            <p class="section-label">Cidade *</p>
            <input v-model="endereco.cidade" type="text" placeholder="Cidade" class="field-input"/>
          </div>

          <div class="section-block">
            <p class="section-label">Nome do destinatário *</p>
            <input v-model="endereco.nome" type="text" placeholder="Nome completo" class="field-input"/>
          </div>

          <div class="section-block">
            <p class="section-label">Telefone *</p>
            <input v-model="endereco.telefone" type="text" placeholder="(00) 00000-0000"
              class="field-input" maxlength="15" @input="formatarTelefone"/>
          </div>

          <p v-if="erroStep" class="erro-msg">{{ erroStep }}</p>

          <div class="actions">
            <button class="btn-checkout" :disabled="!enderecoValido" @click="avancar">
              Escolher entrega
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             STEP 2: ENTREGA
        ══════════════════════════════════════ -->
        <div v-if="step === 2" class="panel">

          <!-- Endereço confirmado -->
          <div class="endereco-card">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff2d6f" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div class="endereco-card-info">
              <p class="ec-nome">{{ endereco.nome }}</p>
              <p class="ec-end">{{ endereco.logradouro }}, {{ endereco.numero }}{{ endereco.complemento ? ' — ' + endereco.complemento : '' }}</p>
              <p class="ec-end">{{ endereco.bairro }}, {{ endereco.cidade }}/{{ endereco.uf.toUpperCase() }} — CEP {{ endereco.cep }}</p>
            </div>
            <button class="edit-link" @click="step = 1">Editar</button>
          </div>

          <!-- Opções de entrega -->
          <p class="section-label" style="padding: 0 20px; margin-top: 14px;">Forma de entrega</p>
          <div class="entrega-options">
            <div v-for="op in opcoesEntrega" :key="op.id"
              class="entrega-opt" :class="{ selected: entregaSelecionada === op.id }"
              @click="entregaSelecionada = op.id">
              <div class="opt-radio"><div class="opt-dot" v-if="entregaSelecionada === op.id"></div></div>
              <div class="opt-info">
                <div class="opt-top">
                  <span class="opt-nome">{{ op.nome }}</span>
                  <span class="opt-prazo">{{ op.prazo }}</span>
                </div>
                <span class="opt-desc">{{ op.desc }}</span>
              </div>
              <span class="opt-preco" :class="{ green: op.preco === 0 }">
                {{ op.preco === 0 ? 'Grátis' : fmt(op.preco) }}
              </span>
            </div>
          </div>

          <!-- Resumo -->
          <div class="resumo" style="margin-top: 8px;">
            <div class="resumo-row"><span>Subtotal</span><span>{{ fmt(carrinho.subtotal()) }}</span></div>
            <div class="resumo-row">
              <span>Frete ({{ entregaEscolhida?.nome }})</span>
              <span :class="freteEntregaGratis ? 'green' : ''">{{ freteEntregaGratis ? 'Grátis' : fmt(entregaEscolhida?.preco) }}</span>
            </div>
            <div v-if="cupomAplicado" class="resumo-row green">
              <span>Cupom</span><span>− {{ fmt(carrinho.descontoCupom(cupomAplicado)) }}</span>
            </div>
            <div class="resumo-divider"></div>
            <div class="resumo-total"><span>Total</span><span class="total-value">{{ fmt(totalComEntrega) }}</span></div>
          </div>

          <div class="actions">
            <button class="btn-checkout" @click="avancar">
              Ir para pagamento
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             STEP 3: PAGAMENTO
        ══════════════════════════════════════ -->
        <div v-if="step === 3" class="panel">

          <!-- ══ PONTOS VIP ══ -->
          <div v-if="emailCliente && saldoPontos > 0" class="pontos-card">
            <div class="pontos-card-top">
              <div class="pontos-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div class="pontos-info">
                <p class="pontos-saldo">Você tem <strong>{{ saldoPontos }} pontos</strong></p>
                <p class="pontos-equiv">Equivale a {{ fmt(carrinho.descontoPontos(saldoPontos)) }} de desconto</p>
              </div>
            </div>
            <label class="pontos-toggle">
              <input type="checkbox" v-model="usarPontos" class="pix-check" @change="onToggleUsarPontos"/>
              <span>Usar meus pontos neste pedido</span>
            </label>
            <div v-if="usarPontos" class="pontos-slider-wrap">
              <input
                type="range"
                class="pontos-slider"
                :min="0"
                :max="pontosMaxUsaveis"
                step="1"
                v-model.number="pontosParaUsar"
              />
              <div class="pontos-slider-info">
                <span>{{ pontosParaUsar }} pontos</span>
                <span class="green">− {{ fmt(carrinho.descontoPontos(pontosParaUsar)) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="!emailCliente" class="pontos-card pontos-card-aviso">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Faça login para acumular e usar pontos VIP</span>
          </div>

          <!-- Opções de pagamento -->
          <p class="section-label" style="padding: 0 20px;">Forma de pagamento</p>
          <div class="entrega-options">
            <div v-for="pg in opcoesPagamento" :key="pg.id"
              class="entrega-opt" :class="{ selected: pagamentoSelecionado === pg.id }"
              @click="pagamentoSelecionado = pg.id">
              <div class="opt-radio"><div class="opt-dot" v-if="pagamentoSelecionado === pg.id"></div></div>
              <span class="pg-icon">{{ pg.icon }}</span>
              <div class="opt-info">
                <span class="opt-nome">{{ pg.nome }}</span>
                <span class="opt-desc">{{ pg.desc }}</span>
              </div>
              <span v-if="pg.badge" class="pg-badge">{{ pg.badge }}</span>
            </div>
          </div>

          <!-- Cartão -->
          <div v-if="pagamentoSelecionado === 'cartao'" class="section-block" style="margin-top: 4px;">
            <p class="section-label">Dados do cartão</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <input v-model="cartao.numero" type="text" placeholder="0000 0000 0000 0000"
                class="field-input" maxlength="19" @input="formatarCartao"/>
              <input v-model="cartao.nome" type="text" placeholder="Nome como no cartão" class="field-input"/>
              <div class="row-2">
                <input v-model="cartao.validade" type="text" placeholder="MM/AA"
                  class="field-input" maxlength="5" @input="formatarValidade"/>
                <input v-model="cartao.cvv" type="text" placeholder="CVV" class="field-input" maxlength="3"/>
              </div>
              <select v-model="cartao.parcelas" class="field-input field-select">
                <option v-for="p in parcelasDisponiveis" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>
          </div>

       <!-- Pix -->
<div v-if="pagamentoSelecionado === 'pix'" class="pix-block">

  <!-- Confirmado -->
  <div v-if="pixConfirmado" class="pix-confirmado">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <p class="pix-confirmado-txt">Pagamento confirmado!</p>
    <p class="pix-confirmado-sub">Finalizando seu pedido…</p>
  </div>

  <!-- Aguardando -->
  <template v-else>
    <div class="pix-qr-wrap" :class="{ 'pix-qr-blur': pixSimulando }">
      <canvas v-if="pixPayload" ref="pixCanvasEl" width="160" height="160"></canvas>
      <div v-else class="pix-qr-loading">Gerando QR Code…</div>
    </div>

    <div v-if="pixSimulando" class="pix-aguardando">
      <div class="pix-spinner"></div>
      <p class="pix-inst">Aguardando confirmação do pagamento…</p>
      <p class="pix-countdown">⏱ {{ pixSegundos }}s</p>
    </div>
    <p v-else class="pix-inst">Escaneie o QR Code com o app do seu banco</p>

    <p class="pix-valor">{{ fmt(totalComPagamento) }}</p>
    <button class="copiar-pix" @click="copiarPix">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      {{ pixCopiado ? 'Copiado!' : 'Copiar chave Pix' }}
    </button>
    <p class="pix-desc-txt">5% de desconto ao pagar com Pix</p>
  </template>
</div>
          <!-- Resumo final -->
          <div class="resumo" style="margin-top:8px;">
            <div class="resumo-row"><span>Subtotal</span><span>{{ fmt(carrinho.subtotal()) }}</span></div>
            <div class="resumo-row">
              <span>Frete</span>
              <span :class="freteEntregaGratis ? 'green' : ''">{{ freteEntregaGratis ? 'Grátis' : fmt(entregaEscolhida?.preco) }}</span>
            </div>
            <div v-if="cupomAplicado" class="resumo-row green"><span>Cupom ({{ cupomAplicado.label }})</span><span>− {{ fmt(carrinho.descontoCupom(cupomAplicado)) }}</span></div>
            <div v-if="pagamentoSelecionado === 'pix'" class="resumo-row green"><span>Desconto Pix (5%)</span><span>− {{ fmt(carrinho.subtotal() * 0.05) }}</span></div>
            <div v-if="usarPontos && pontosParaUsar > 0" class="resumo-row green"><span>Pontos VIP ({{ pontosParaUsar }} pts)</span><span>− {{ fmt(carrinho.descontoPontos(pontosParaUsar)) }}</span></div>
            <div class="resumo-divider"></div>
            <div class="resumo-total"><span>Total</span><span class="total-value">{{ fmt(totalComPagamento) }}</span></div>
            <p v-if="pagamentoSelecionado === 'cartao' && cartao.parcelas > 1" class="parcela-info">
              {{ cartao.parcelas }}x de {{ fmt(totalComPagamento / cartao.parcelas) }} sem juros
            </p>
            <p v-if="emailCliente" class="pontos-ganho-info">
              Você vai ganhar <strong>+{{ pontosAGanhar }} pontos</strong> com esta compra
            </p>
          </div>

          <p v-if="erroStep" class="erro-msg">{{ erroStep }}</p>

          <div class="actions">
            <button class="btn-checkout btn-finalizar" :disabled="!pagamentoValido || finalizando" @click="finalizarPedido">
              <span v-if="finalizando" class="spinner"></span>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {{ finalizando ? 'Finalizando...' : 'Finalizar pedido' }}
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             STEP 4: CONFIRMAÇÃO
        ══════════════════════════════════════ -->
        <div v-if="step === 4" class="panel confirmacao">
          <div class="check-anim">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="conf-titulo">Pedido realizado!</h3>
          <p class="conf-sub">Você receberá uma confirmação em breve.</p>

          <div v-if="ultimoResultadoPontos" class="conf-pontos-card">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <div>
              <p class="conf-pontos-t">+{{ ultimoResultadoPontos.pontosGanhos }} pontos ganhos nesta compra</p>
              <p class="conf-pontos-s">Saldo atual: {{ ultimoResultadoPontos.novoSaldo }} pontos</p>
            </div>
          </div>

          <div class="conf-card">
            <div class="conf-row"><span>Pedido</span><span class="conf-val bold">{{ numeroPedido }}</span></div>
            <div class="conf-row"><span>Itens</span><span class="conf-val">{{ itensPedido }} produto{{ itensPedido > 1 ? 's' : '' }}</span></div>
            <div class="conf-row"><span>Entrega</span><span class="conf-val">{{ entregaEscolhida?.prazo }}</span></div>
            <div class="conf-row"><span>Pagamento</span><span class="conf-val">{{ opcoesPagamento.find(p => p.id === pagamentoSelecionado)?.nome }}</span></div>
            <div class="conf-divider"></div>
            <div class="conf-row conf-total"><span>Total pago</span><span class="total-value">{{ fmt(totalPago) }}</span></div>
          </div>

          <div class="conf-end-card">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff2d6f" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p class="ec-nome">{{ endereco.nome }}</p>
              <p class="ec-end">{{ endereco.logradouro }}, {{ endereco.numero }}</p>
              <p class="ec-end">{{ endereco.cidade }}/{{ endereco.uf.toUpperCase() }}</p>
            </div>
          </div>

          <div class="actions">
            <button class="btn-checkout" @click="fecharAposCompra">Continuar comprando</button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { carrinho } from '@/stores/carrinho.js'
import PedidoTracker from './PedidoTracker.vue'
import { supabase } from '@/supabase.js'
import QRCode from 'qrcode'

const props = defineProps({ aberto: Boolean })
const emit = defineEmits(['fechar'])

// ─── Navigation ──────────────────────────────────────────
const step = ref(0)
const abaAtiva = ref('carrinho')
const stepLabels = ['Carrinho', 'Endereço', 'Entrega', 'Pagamento']
const stepTitulos = ['Meu Carrinho', 'Endereço', 'Entrega', 'Pagamento', 'Pedido Confirmado']

// O painel de "Pedidos" usa v-show (não v-if), então o PedidoTracker e o
// mapa Leaflet dentro dele podem ficar montados com display:none — o que
// faz o Leaflet calcular tamanho 0 e renderizar um mapa vazio. Esse
// computed avisa o PedidoTracker quando ele está de fato visível na tela,
// para que ele recalcule o mapa nesse momento (veja PedidoTracker.vue).
const painelPedidoVisivel = computed(() =>
  props.aberto && step.value === 0 && abaAtiva.value === 'pedido'
)

function fechar() {
  cancelarSimulacaoPix()
  emit('fechar')
}
function voltarStep() { if (step.value > 0) step.value-- }
function irParaEndereco() { step.value = 1 }
function avancar() { erroStep.value = ''; step.value++ }

// ─── Cupom & Pix ─────────────────────────────────────────
const codigoCupom   = ref('')
const cupomAplicado = ref(null)
const mensagemCupom = ref('')
const pagarPix      = ref(false)

function aplicarCupom() {
  const r = carrinho.validarCupom(codigoCupom.value)
  if (r) { cupomAplicado.value = r; mensagemCupom.value = `${r.label}` }
  else { mensagemCupom.value = 'Cupom inválido'; setTimeout(() => mensagemCupom.value = '', 3000) }
}
function removerCupom() { cupomAplicado.value = null; codigoCupom.value = ''; mensagemCupom.value = '' }

// ─── Totais ──────────────────────────────────────────────
const totalItens  = computed(() => carrinho.quantidadeTotal())
const freteGratis = computed(() => carrinho.total() >= 150)
const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Pontos VIP ──────────────────────────────────────────
const emailCliente   = ref(null)
const saldoPontos    = ref(0)
const usarPontos     = ref(false)
const pontosParaUsar = ref(0)
const ultimoResultadoPontos = ref(null) // { pontosGanhos, novoSaldo } — mostrado na tela de confirmação

// Não deixa usar mais pontos do que: (a) o saldo da pessoa, ou
// (b) o suficiente para zerar o total da compra (sem ficar negativo)
const pontosMaxUsaveis = computed(() => {
  if (!saldoPontos.value) return 0
  const totalAntesDosPontos = totalComEntregaEPagamentoSemPontos.value
  const maxPorValor = Math.floor(totalAntesDosPontos / 0.10) // 1 ponto = R$0,10
  return Math.max(0, Math.min(saldoPontos.value, maxPorValor))
})

function onToggleUsarPontos() {
  pontosParaUsar.value = usarPontos.value ? pontosMaxUsaveis.value : 0
}

async function carregarSaldoPontos() {
  try {
    const { data } = await supabase.auth.getUser()
    const email = data?.user?.email ?? null
    emailCliente.value = email
    if (email) {
      saldoPontos.value = await carrinho.buscarPontos(email)
    } else {
      saldoPontos.value = 0
    }
  } catch (e) {
    console.warn('Não foi possível carregar saldo de pontos:', e.message)
  }
}

// Carrega o saldo assim que a pessoa chega no step de pagamento
watch(step, (novo) => {
  if (novo === 3) carregarSaldoPontos()
})

// ─── Endereço ────────────────────────────────────────────
const endereco    = ref({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', nome: '', telefone: '' })
const buscandoCep = ref(false)
const erroStep    = ref('')

const enderecoValido = computed(() =>
  endereco.value.cep && endereco.value.logradouro && endereco.value.numero &&
  endereco.value.cidade && endereco.value.uf && endereco.value.nome && endereco.value.telefone
)

function formatarCep() {
  endereco.value.cep = endereco.value.cep.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9)
}
function formatarTelefone() {
  let v = endereco.value.telefone.replace(/\D/g, '').slice(0, 11)
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3')
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)$/, '($1) $2')
  endereco.value.telefone = v
}
async function buscarCep() {
  const cep = endereco.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  buscandoCep.value = true
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const d = await r.json()
    if (!d.erro) {
      endereco.value.logradouro = d.logradouro || ''
      endereco.value.bairro     = d.bairro     || ''
      endereco.value.cidade     = d.localidade || ''
      endereco.value.uf         = d.uf         || ''
    }
  } catch {}
  buscandoCep.value = false
}

// ─── Entrega ─────────────────────────────────────────────
const entregaSelecionada = ref('padrao')
const opcoesEntrega = [
  { id: 'express', nome: 'Expresso',   prazo: '1–2 dias úteis',  desc: 'Entrega prioritária', preco: 19.90 },
  { id: 'padrao',  nome: 'Padrão',     prazo: '3–5 dias úteis',  desc: 'Entrega comum',       preco: 8.90  },
  { id: 'eco',     nome: 'Econômico',  prazo: '7–10 dias úteis', desc: 'Mais demorado',       preco: 0     },
]
const entregaEscolhida   = computed(() => opcoesEntrega.find(o => o.id === entregaSelecionada.value))
const freteEntregaGratis = computed(() => (entregaEscolhida.value?.preco ?? 0) === 0 || freteGratis.value)

const totalComEntrega = computed(() => {
  let t = carrinho.subtotal()
  if (!freteEntregaGratis.value) t += entregaEscolhida.value?.preco || 0
  if (cupomAplicado.value?.tipo === 'percentual') t -= t * cupomAplicado.value.desconto
  return t
})

// ─── Pagamento ───────────────────────────────────────────
const pagamentoSelecionado = ref('cartao')
const opcoesPagamento = [
  { id: 'cartao', nome: 'Cartão',  desc: 'Crédito ou débito', badge: null },
  { id: 'pix',    nome: 'Pix',    desc: 'Aprovação imediata',  badge: '5% OFF' },
  { id: 'boleto', nome: 'Boleto', desc: 'Vence em 3 dias',   badge: null },
]
const cartao     = ref({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 })
const pixCopiado = ref(false)
const pixConfirmado   = ref(false)
const pixSegundos     = ref(0)
const pixSimulando    = ref(false)
let   pixPollTimer    = null
let   pixCountTimer   = null
const finalizando = ref(false)

const pagamentoValido = computed(() => {
  if (pagamentoSelecionado.value === 'cartao')
    return cartao.value.numero.replace(/\s/g,'').length === 16 && cartao.value.nome && cartao.value.validade.length === 5 && cartao.value.cvv.length === 3
  return true
})

function formatarCartao() {
  cartao.value.numero = cartao.value.numero.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ')
}
function formatarValidade() {
  cartao.value.validade = cartao.value.validade.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2')
}

// ─── Pix: geração do payload EMV / BR Code (padrão Banco Central) ─────────
// Dados do recebedor (chave Pix CPF/CNPJ, nome e cidade — exigidos pelo padrão).
const PIX_CHAVE  = '15352017621'
const PIX_NOME   = 'Maria Eduarda Rocha Silva' // máx 25 caracteres
const PIX_CIDADE = 'Sabara'                     // máx 15 caracteres, sem acento

// Monta um campo no formato EMV: ID + tamanho (2 dígitos) + valor
function campoEmv(id, valor) {
  const tamanho = String(valor.length).padStart(2, '0')
  return `${id}${tamanho}${valor}`
}

// CRC16/CCITT-FALSE, exigido como último campo (ID "63") do payload Pix
function crc16(payload) {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
      crc &= 0xFFFF
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Remove acentos para os campos que o padrão Pix exige em texto simples
function semAcento(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Gera o payload Pix (BR Code) completo, com valor fixo embutido,
 * pronto para ser transformado em QR code ou copiado no copia-e-cola.
 * @param {number} valor - valor da cobrança, ex: 49.90
 * @param {string} txid  - identificador da transação (até 25 caracteres alfanuméricos)
 */
function gerarPayloadPix(valor, txid = 'AURA') {
  const valorFormatado = Number(valor || 0).toFixed(2)
  const txidLimpo = (txid || 'AURA').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || 'AURA'

  const merchantAccountInfo =
    campoEmv('00', 'br.gov.bcb.pix') +
    campoEmv('01', PIX_CHAVE)

  const additionalDataField = campoEmv('05', txidLimpo)

  let payload =
    campoEmv('00', '01') +                                   // Payload Format Indicator
    campoEmv('26', merchantAccountInfo) +                     // Merchant Account Information (Pix)
    campoEmv('52', '0000') +                                  // Merchant Category Code
    campoEmv('53', '986') +                                   // Transaction Currency (BRL)
    campoEmv('54', valorFormatado) +                          // Transaction Amount
    campoEmv('58', 'BR') +                                    // Country Code
    campoEmv('59', semAcento(PIX_NOME).slice(0, 25)) +         // Merchant Name
    campoEmv('60', semAcento(PIX_CIDADE).slice(0, 15)) +       // Merchant City
    campoEmv('62', additionalDataField)                       // Additional Data Field (txid)

  payload += '6304' // ID + tamanho fixo do CRC, antes de calcular
  const crc = crc16(payload)
  return payload + crc
}

const pixPayload   = ref('')
const pixCanvasEl  = ref(null)

async function desenharQrPix() {
  if (!pixPayload.value || !pixCanvasEl.value) return
  try {
    await QRCode.toCanvas(pixCanvasEl.value, pixPayload.value, {
      width: 160,
      margin: 1,
      color: { dark: '#141414', light: '#ffffff' },
    })
  } catch (e) {
    console.error('Erro ao gerar QR Code do Pix:', e)
  }
}

function copiarPix() {
  if (!pixPayload.value) return
  navigator.clipboard?.writeText(pixPayload.value)
  pixCopiado.value = true; setTimeout(() => pixCopiado.value = false, 2000)
}

function iniciarSimulacaoPix() {
  if (pixSimulando.value || pagamentoSelecionado.value !== 'pix') return
  pixSimulando.value  = true
  pixConfirmado.value = false
  pixSegundos.value   = 60

  // Contador regressivo visível para o usuário
  pixCountTimer = setInterval(() => {
    pixSegundos.value--
    if (pixSegundos.value <= 0) {
      clearInterval(pixCountTimer)
      pixCountTimer = null
    }
  }, 1000)

  // Simula confirmação do gateway após 15 segundos
  pixPollTimer = setTimeout(() => {
    pixConfirmado.value = true
    pixSimulando.value  = false
    clearInterval(pixCountTimer)
    pixCountTimer = null
    // Finaliza automaticamente após confirmação
    setTimeout(() => finalizarPedido(), 1200)
  }, 60000)
}

function cancelarSimulacaoPix() {
  clearTimeout(pixPollTimer)
  clearInterval(pixCountTimer)
  pixPollTimer    = null
  pixCountTimer   = null
  pixSimulando.value  = false
  pixConfirmado.value = false
  pixSegundos.value   = 0
}

const parcelasDisponiveis = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: i === 0 ? `1x de ${fmt(totalComPagamento.value)} à vista` : `${i+1}x de ${fmt(totalComPagamento.value / (i+1))} sem juros`
  }))
)

// Total antes de aplicar o desconto de pontos (usado pra calcular o máximo de pontos usáveis)
const totalComEntregaEPagamentoSemPontos = computed(() => {
  let t = totalComEntrega.value
  if (pagamentoSelecionado.value === 'pix') t -= carrinho.subtotal() * 0.05
  return Math.max(t, 0)
})

const totalComPagamento = computed(() => {
  let t = totalComEntregaEPagamentoSemPontos.value
  if (usarPontos.value && pontosParaUsar.value > 0) {
    t -= carrinho.descontoPontos(pontosParaUsar.value)
  }
  return Math.max(t, 0)
})

// Sempre que o total a pagar mudar (cupom, frete, pontos, etc) ou a pessoa
// selecionar Pix como forma de pagamento, regenera o payload e redesenha o QR.
// (precisa vir depois de totalComPagamento estar declarado, pois depende dele)
watch([pagamentoSelecionado, totalComPagamento], async ([metodo, , oldMetodo]) => {
  if (metodo !== 'pix') {
    cancelarSimulacaoPix()
    return
  }
  pixPayload.value = gerarPayloadPix(totalComPagamento.value)
  await nextTick()
  desenharQrPix()
  iniciarSimulacaoPix()
}, { immediate: true })
// Quantos pontos a pessoa vai ganhar com esta compra (1 ponto por R$1 pago)
const pontosAGanhar = computed(() => Math.floor(totalComPagamento.value))

// Se o slider de pontos passar do novo máximo (ex: trocou forma de pagamento
// e o total mudou), reajusta para não deixar o total negativo
watch([pagamentoSelecionado, entregaSelecionada, cupomAplicado], () => {
  if (usarPontos.value && pontosParaUsar.value > pontosMaxUsaveis.value) {
    pontosParaUsar.value = pontosMaxUsaveis.value
  }
})

// ─── Pedido ──────────────────────────────────────────────
const pedidoAtivo = ref(null)

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .eq('user_id', user.id)
      .not('status', 'eq', 'entregue')
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      pedidoAtivo.value = {
        numero:          data.numero,
        previsaoEntrega: data.previsao_entrega,
        etapaAtiva:      data.etapa_ativa,
        pagamento:       data.pagamento,
        desconto:        data.desconto,
        endereco:        data.endereco_entrega,
        total:           fmt(data.total),
        codigoRastreio:  data.codigo_rastreio,
        itens: data.itens_pedido.map(i => ({
          nome:      i.nome,
          detalhe:   i.detalhe,
          preco:     fmt(i.preco),
          imagemUrl: i.imagem_url,
        })),
        mapa: {
          origem:     data.lat_origem ? { lat: data.lat_origem, lng: data.lng_origem } : null,
          destino:    data.lat_destino ? { lat: data.lat_destino, lng: data.lng_destino } : null,
          entregador: data.lat_entregador ? { lat: data.lat_entregador, lng: data.lng_entregador } : null,
        },
      }
    }
    const channel = supabase
  .channel('pedido-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'pedidos',
    filter: `user_id=eq.${user.id}`,
  }, (payload) => {
    if (pedidoAtivo.value) {
      pedidoAtivo.value = {
        ...pedidoAtivo.value,
        etapaAtiva: payload.new.etapa_ativa,
        mapa: {
          ...pedidoAtivo.value.mapa,
          entregador: payload.new.lat_entregador
            ? { lat: payload.new.lat_entregador, lng: payload.new.lng_entregador }
            : null,
        },
      }
    }
  })
  .subscribe()
  } catch (e) {
    console.warn('Sem pedido ativo:', e.message)
  }
})

function calcularPrevisao(entregaId) {
  const hoje = new Date()
  const diasMap = { express: 2, padrao: 5, eco: 10 }
  const dias = diasMap[entregaId] ?? 5
  hoje.setDate(hoje.getDate() + dias)
  return hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ─── Estoque ─────────────────────────────────────────────
/**
 * Dá baixa no estoque de todos os itens do carrinho, um por um,
 * usando a função atômica do banco (trava a linha, checa saldo,
 * decrementa). Se algum item não tiver estoque suficiente, para
 * imediatamente e desfaz (devolve) o estoque já debitado dos itens
 * anteriores, para não deixar a baixa parcial.
 *
 * @returns {Promise<{sucesso: boolean, mensagem?: string}>}
 */
async function baixarEstoqueCarrinho() {
  const debitados = [] // { id, qtd } — para rollback em caso de falha no meio do caminho

  for (const item of carrinho.itens) {
    try {
      const { error } = await supabase.rpc('baixar_estoque_produto', {
        p_produto_id: item.id,
        p_quantidade: item.qtd,
      })

      if (error) {
        // Estoque insuficiente para este item (ou produto não encontrado).
        // Desfaz os débitos já feitos nesta tentativa de compra.
        await reporEstoque(debitados)
        return {
          sucesso: false,
          mensagem: `Estoque insuficiente para "${item.nome}". Por favor, ajuste a quantidade no carrinho.`,
        }
      }

      debitados.push({ id: item.id, qtd: item.qtd })
    } catch (e) {
      await reporEstoque(debitados)
      return { sucesso: false, mensagem: 'Não foi possível verificar o estoque agora. Tente novamente.' }
    }
  }

  return { sucesso: true }
}

/**
 * Repõe o estoque de itens já debitados, usado quando a compra
 * precisa ser abortada no meio da baixa (outro item sem estoque)
 * ou se o pedido falhar ao ser salvo depois da baixa.
 */
async function reporEstoque(itens) {
  for (const it of itens) {
    try {
      await supabase.rpc('baixar_estoque_produto', {
        p_produto_id: it.id,
        p_quantidade: -it.qtd, // quantidade negativa = devolve ao estoque
      })
    } catch (e) {
      console.error('Falha ao repor estoque do produto', it.id, e.message)
    }
  }
}

async function finalizarPedido() {
  erroStep.value = ''
  finalizando.value = true

  // ── 0. Confere e debita o estoque de todos os itens primeiro.
  //      Se faltar estoque em qualquer item, interrompe aqui e
  //      nem chega a criar o pedido. ──────────────────────────
  const resultadoEstoque = await baixarEstoqueCarrinho()
  if (!resultadoEstoque.sucesso) {
    erroStep.value = resultadoEstoque.mensagem
    finalizando.value = false
    return
  }

  const numero   = Math.random().toString(36).slice(2, 8).toUpperCase()
  const rastreio = 'BR' + Math.random().toString(36).slice(2, 11).toUpperCase()

  const pgNomes = { cartao: 'Cartão de crédito', pix: 'Pix', boleto: 'Boleto bancário' }
  let pgLabel = pgNomes[pagamentoSelecionado.value] ?? pagamentoSelecionado.value
  if (pagamentoSelecionado.value === 'cartao' && cartao.value.parcelas > 1) {
    pgLabel += ` · ${cartao.value.parcelas}x de ${fmt(totalComPagamento.value / cartao.value.parcelas)}`
  }

  const endFormatado = [
    endereco.value.logradouro,
    endereco.value.numero,
    endereco.value.complemento ? '— ' + endereco.value.complemento : '',
    `· ${endereco.value.bairro}, ${endereco.value.cidade}/${endereco.value.uf.toUpperCase()}`
  ].filter(Boolean).join(', ')

  // Guarda os itens e quantidades atuais do carrinho ANTES de qualquer
  // limpeza, para poder repor o estoque caso o pedido falhe ao salvar.
  const itensParaRepor = carrinho.itens.map(i => ({ id: i.id, qtd: i.qtd }))

  // ── 1. Tenta salvar no banco (erro não bloqueia o fluxo) ──────────────────
  let pedidoInseridoId = null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: pedidoInserido, error: erroPedido } = await supabase
  .from('pedidos')
  .insert({
    user_id:          user?.id ?? null,
    numero,
    status:           'confirmado',
    etapa_ativa:      0,
    total:            totalComPagamento.value,
    pagamento:        pgLabel,
    desconto:         pagamentoSelecionado.value === 'pix' ? '5% OFF Pix' : null,
    desconto_pct:     pagamentoSelecionado.value === 'pix' ? 5 : null,
    previsao_entrega: calcularPrevisao(entregaSelecionada.value),
    codigo_rastreio:  rastreio,
    endereco_entrega: endFormatado,   // ← nome correto no banco
    lat_origem:       -19.9167,
    lng_origem:       -43.9345,
    lat_destino:      -19.9245,
    lng_destino:      -43.9468,
  })
      .select('id')
      .single()

    if (erroPedido) {
      console.warn('Aviso: erro ao salvar pedido no banco:', erroPedido.message)
      // Pedido não foi salvo — devolve o estoque já debitado.
      await reporEstoque(itensParaRepor)
    } else {
      pedidoInseridoId = pedidoInserido?.id ?? null

      // ── 2. Insere os itens ──────────────────────────────────────────────────
      if (pedidoInseridoId) {
        const itensBanco = carrinho.itens.map(item => ({
          pedido_id:  pedidoInseridoId,
          nome:       item.nome,
          detalhe:    `Qtd: ${item.qtd}${item.variacao ? ' · ' + item.variacao : ''}`,
          preco:      item.preco * item.qtd,
          imagem_url: item.img || item.imagem || null,
        }))
        const { error: erroItens } = await supabase.from('itens_pedido').insert(itensBanco)
        if (erroItens) console.warn('Aviso: erro ao salvar itens:', erroItens.message)
      }
    }
  } catch (e) {
    console.warn('Aviso: Supabase indisponível, continuando localmente:', e.message)
    // Não foi possível nem tentar salvar — devolve o estoque por segurança.
    await reporEstoque(itensParaRepor)
  }

  // ── 2.5. Pontos VIP: resgata os usados (se houver) e credita os ganhos ────
  ultimoResultadoPontos.value = null
  if (emailCliente.value) {
    try {
      // Se a pessoa optou por usar pontos como desconto, debita primeiro
      if (usarPontos.value && pontosParaUsar.value > 0) {
        const resgate = await carrinho.resgatarPontos(emailCliente.value, pontosParaUsar.value)
        if (!resgate.sucesso) {
          console.warn('Aviso: não foi possível resgatar pontos:', resgate.mensagem)
        }
      }

      // Credita os pontos ganhos nesta compra (valor já com todos os descontos aplicados)
      const resultado = await carrinho.finalizarCompra(emailCliente.value, totalComPagamento.value)
      if (resultado.sucesso) {
        ultimoResultadoPontos.value = {
          pontosGanhos: resultado.pontosGanhos,
          novoSaldo: resultado.novoSaldo,
        }
      }
    } catch (e) {
      console.warn('Aviso: erro ao processar pontos VIP:', e.message)
    }
  }

  // ── 3. Monta objeto para o PedidoTracker ───────────────────────────────────
  pedidoAtivo.value = {
    numero,
    previsaoEntrega: calcularPrevisao(entregaSelecionada.value),
    etapaAtiva:      0,
    pagamento:       pgLabel,
    desconto:        pagamentoSelecionado.value === 'pix' ? '5% OFF Pix' : null,
    endereco:        endFormatado,
    total:           fmt(totalComPagamento.value),
    codigoRastreio:  rastreio,
    itens: carrinho.itens.map(item => ({
      nome:      item.nome,
      detalhe:   `Qtd: ${item.qtd}${item.variacao ? ' · ' + item.variacao : ''}`,
      preco:     fmt(item.preco * item.qtd),
      imagemUrl: item.img || item.imagem || null,
    })),
    mapa: {
      origem:     { lat: -19.9167, lng: -43.9345 },
      destino:    { lat: -19.9245, lng: -43.9468 },
      entregador: null,
    },
  }

  // Nota: carrinho.finalizarCompra() já chama carrinho.limpar() internamente
  // quando tem email. Se não tiver email (pessoa não logada), garante a limpeza aqui.
  if (!emailCliente.value) carrinho.limpar()

  finalizando.value = false
  step.value = 0
  abaAtiva.value = 'pedido'
  usarPontos.value = false
  pontosParaUsar.value = 0
}

// ─── Helpers para a tela de confirmação ───────────────────
const numeroPedido = computed(() => pedidoAtivo.value?.numero ?? '')
const itensPedido  = computed(() => pedidoAtivo.value?.itens?.length ?? 0)
const totalPago    = computed(() => totalComPagamento.value)

function fecharAposCompra() {
  step.value = 0
  abaAtiva.value = 'pedido'
  ultimoResultadoPontos.value = null
  fechar()
}
</script>

<style scoped>
/* ══ OVERLAY & DRAWER ══ */
.drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 1000;
  display: flex; justify-content: flex-end;
}
.drawer {
  background: #141414; width: 100%; max-width: 420px;
  height: 100%; display: flex; flex-direction: column; overflow: hidden;
}

/* ══ HEADER ══ */
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 18px 0; flex-shrink: 0; gap: 8px;
}
.back-btn {
  width: 28px; height: 28px; border-radius: 6px; background: #1e1e1e;
  border: none; color: #aaa; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .15s;
}
.back-btn:hover { background: #2a2a2a; }
.header-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 16px; font-weight: 600; color: #fff; flex: 1;
}
.header-title.with-back { justify-content: center; }
.close-btn {
  width: 28px; height: 28px; border-radius: 6px; background: #1e1e1e;
  border: none; color: #666; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background .15s;
}
.close-btn:hover { background: #2a2a2a; color: #aaa; }

/* ══ STEPS BAR ══ */
.steps-bar { display: flex; align-items: center; padding: 12px 18px 0; flex-shrink: 0; }
.step-item { display: flex; align-items: center; flex: 1; }
.step-circle {
  width: 22px; height: 22px; border-radius: 50%;
  background: #1e1e1e; color: #444;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
  transition: background .2s, color .2s;
}
.step-item.active .step-circle { background: #ff2d6f; color: #fff; }
.step-item.done   .step-circle { background: #22c55e; color: #fff; }
.step-label { font-size: 9px; color: #444; margin-left: 4px; white-space: nowrap; transition: color .2s; }
.step-item.active .step-label { color: #ff2d6f; font-weight: 600; }
.step-item.done   .step-label { color: #22c55e; }
.step-line { flex: 1; height: 1.5px; background: #222; margin: 0 6px; transition: background .3s; }
.step-line.done { background: #22c55e; }

/* ══ TABS ══ */
.tabs { display: flex; gap: 6px; padding: 10px 18px 0; flex-shrink: 0; }
.tab {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
  padding: 8px 0; border-radius: 8px; border: none; cursor: pointer;
  font-size: 12.5px; font-weight: 500; transition: all .15s;
  background: #1a1a1a; color: #666;
}
.tab--active { background: #ff2d6f; color: #fff; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); color: inherit; border-radius: 20px;
  font-size: 10px; padding: 1px 5px; min-width: 16px;
}
.tab:not(.tab--active) .tab-badge { background: #252525; color: #555; }

/* ══ PANEL ══ */
.panel {
  flex: 1; overflow-y: auto; padding: 12px 18px 20px;
  scrollbar-width: thin; scrollbar-color: #252525 transparent;
  display: flex; flex-direction: column; gap: 0;
}
.panel::-webkit-scrollbar { width: 3px; }
.panel::-webkit-scrollbar-thumb { background: #252525; border-radius: 4px; }

/* ══ FRETE BANNER ══ */
.frete-banner {
  background: #1a1a1a; border-radius: 8px; padding: 10px 13px;
  font-size: 12px; color: #888; text-align: center; margin-bottom: 10px;
  display: flex; flex-direction: column; gap: 6px;
}
.frete-banner strong { color: #fff; }
.frete-progress { height: 3px; background: #2a2a2a; border-radius: 99px; overflow: hidden; }
.frete-fill { height: 100%; background: #22c55e; border-radius: 99px; transition: width .4s ease; }

/* ══ VAZIO ══ */
.vazio {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 48px 0; text-align: center;
}
.vazio-titulo { font-size: 14px; font-weight: 600; color: #fff; }
.vazio-sub { font-size: 12px; color: #555; max-width: 200px; line-height: 1.6; }
.btn-explorar {
  margin-top: 4px; background: #ff2d6f; color: #fff; border: none;
  border-radius: 20px; padding: 8px 20px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-explorar:hover { background: #e0205f; }

/* ══ LISTA ITENS ══ */
.lista-itens { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.item {
  display: flex; gap: 10px; background: #1a1a1a;
  border: 0.5px solid #252525; border-radius: 10px; padding: 10px;
  transition: border-color .15s;
}
.item:hover { border-color: #333; }
.item-img-wrap { width: 60px; height: 60px; flex-shrink: 0; border-radius: 7px; overflow: hidden; background: #222; }
.item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-nome { font-size: 12.5px; font-weight: 500; color: #fff; line-height: 1.3; }
.item-preco-unit { font-size: 11px; color: #555; }
.item-controles { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
.ctrl-btn {
  background: #252525; border: none; width: 22px; height: 22px; border-radius: 5px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #fff; transition: background .1s;
}
.ctrl-btn:hover { background: #333; }
.ctrl-qtd { font-size: 12px; font-weight: 700; min-width: 16px; text-align: center; color: #fff; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; }
.item-subtotal { font-size: 13px; font-weight: 600; color: #fff; }
.btn-remover {
  background: none; border: none; color: #444; cursor: pointer;
  padding: 3px; border-radius: 5px; display: flex; transition: color .15s, background .15s;
}
.btn-remover:hover { color: #ff4d6d; background: rgba(255,77,109,0.1); }

/* ══ SECTIONS ══ */
.section-block { margin-bottom: 12px; }
.section-label {
  font-size: 11.5px; font-weight: 600; color: #666;
  margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px;
}

/* ══ CUPOM ══ */
.cupom-row { display: flex; gap: 7px; }
.cupom-input {
  flex: 1; background: #1a1a1a; border: 0.5px solid #2a2a2a; border-radius: 8px;
  padding: 9px 12px; font-size: 13px; color: #fff; outline: none; transition: border-color .2s;
}
.cupom-input::placeholder { color: #444; }
.cupom-input:focus { border-color: #ff2d6f; }
.cupom-input:disabled { color: #555; }
.cupom-btn {
  background: #ff2d6f; color: #fff; border: none; border-radius: 8px;
  padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
}
.cupom-btn:hover { background: #e0205f; }
.cupom-msg { font-size: 11.5px; margin-top: 6px; }
.cupom-msg.ok  { color: #22c55e; }
.cupom-msg.erro { color: #ff4d6d; }

/* ══ PIX ROW ══ */
.pix-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px; padding: 10px 12px;
  background: #1a1a1a; border-radius: 8px; border: 0.5px solid #252525;
}
.pix-label { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #aaa; cursor: pointer; }
.pix-check { accent-color: #ff2d6f; cursor: pointer; }
.pix-badge { font-size: 11px; font-weight: 700; color: #22c55e; background: rgba(34,197,94,0.12); border-radius: 20px; padding: 2px 8px; }

/* ══ PONTOS VIP ══ */
.pontos-card {
  display: flex; flex-direction: column; gap: 10px;
  background: rgba(251,191,36,0.07); border: 0.5px solid rgba(251,191,36,0.25);
  border-radius: 10px; padding: 12px; margin-bottom: 14px;
}
.pontos-card-aviso {
  flex-direction: row; align-items: center; gap: 8px;
  background: #1a1a1a; border-color: #252525; color: #888; font-size: 12px;
}
.pontos-card-top { display: flex; align-items: flex-start; gap: 10px; }
.pontos-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: rgba(251,191,36,0.12); display: flex; align-items: center; justify-content: center;
}
.pontos-info { flex: 1; }
.pontos-saldo { font-size: 13px; color: #fff; margin: 0; }
.pontos-saldo strong { color: #fbbf24; }
.pontos-equiv { font-size: 11px; color: #888; margin: 2px 0 0; }
.pontos-toggle { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #ccc; cursor: pointer; }
.pontos-slider-wrap { display: flex; flex-direction: column; gap: 6px; padding-top: 2px; }
.pontos-slider { width: 100%; accent-color: #fbbf24; cursor: pointer; }
.pontos-slider-info { display: flex; justify-content: space-between; font-size: 11.5px; color: #888; }
.pontos-ganho-info { font-size: 11px; color: #fbbf24; text-align: right; margin-top: 6px; }
.pontos-ganho-info strong { font-weight: 700; }

/* ══ RESUMO ══ */
.resumo { border-top: 0.5px solid #1e1e1e; padding-top: 12px; margin-top: 4px; margin-bottom: 14px; }
.resumo-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #666; padding: 4px 0; }
.resumo-divider { height: 0.5px; background: #1e1e1e; margin: 8px 0; }
.resumo-total { display: flex; justify-content: space-between; font-size: 14.5px; font-weight: 600; color: #fff; padding: 3px 0; }
.total-value { color: #ff2d6f; }
.green { color: #22c55e !important; }
.muted { color: #444; font-size: 11px; }
.parcela-info { font-size: 11px; color: #555; text-align: right; margin-top: 4px; }

/* ══ ACTIONS ══ */
.actions { display: flex; flex-direction: column; gap: 7px; margin-top: 4px; }
.btn-checkout {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; background: #ff2d6f; color: #fff; border: none;
  border-radius: 10px; padding: 13px; font-size: 13.5px; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-checkout:hover:not(:disabled) { background: #e0205f; }
.btn-checkout:disabled { background: #2a2a2a; color: #555; cursor: not-allowed; }
.btn-finalizar { background: #22c55e; }
.btn-finalizar:hover:not(:disabled) { background: #16a34a; }
.btn-limpar {
  width: 100%; background: transparent; color: #555; border: 0.5px solid #252525;
  border-radius: 10px; padding: 10px; font-size: 12.5px; cursor: pointer; transition: all .15s;
}
.btn-limpar:hover { border-color: #ff2d6f; color: #ff2d6f; }

/* ══ FIELDS ══ */
.field-input {
  width: 100%; background: #1a1a1a; border: 0.5px solid #2a2a2a; border-radius: 8px;
  padding: 10px 12px; font-size: 13px; color: #fff; outline: none;
  transition: border-color .2s; box-sizing: border-box;
}
.field-input::placeholder { color: #444; }
.field-input:focus { border-color: #ff2d6f; }
.field-select { appearance: none; cursor: pointer; color: #ccc; }
.cep-row { display: flex; gap: 7px; }
.cep-btn {
  flex-shrink: 0; width: 38px; height: 38px; background: #1a1a1a;
  border: 0.5px solid #2a2a2a; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #888; transition: background .15s;
}
.cep-btn:hover:not(:disabled) { background: #252525; }
.cep-btn:disabled { cursor: wait; }
.row-2 { display: flex; gap: 8px; margin-bottom: 12px; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.spinner {
  width: 13px; height: 13px; border: 2px solid #333;
  border-top-color: #ff2d6f; border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.erro-msg { font-size: 12px; color: #ff4d6d; margin-top: 4px; margin-bottom: 8px; }

/* ══ ENDERECO CARD (step 2) ══ */
.endereco-card {
  display: flex; align-items: flex-start; gap: 8px;
  background: #1a1a1a; border: 0.5px solid #252525; border-radius: 10px;
  padding: 12px; margin-bottom: 4px;
}
.endereco-card-info { flex: 1; }
.ec-nome { font-size: 12.5px; font-weight: 600; color: #fff; margin-bottom: 2px; }
.ec-end { font-size: 11.5px; color: #666; line-height: 1.5; }
.edit-link { font-size: 12px; color: #ff2d6f; background: none; border: none; cursor: pointer; font-weight: 600; flex-shrink: 0; }

/* ══ ENTREGA OPTIONS ══ */
.entrega-options { display: flex; flex-direction: column; gap: 7px; padding: 8px 0 4px; }
.entrega-opt {
  display: flex; align-items: center; gap: 10px;
  border: 0.5px solid #252525; border-radius: 10px; padding: 12px;
  cursor: pointer; transition: border-color .15s, background .15s; background: #1a1a1a;
}
.entrega-opt:hover { border-color: #ff2d6f; }
.entrega-opt.selected { border-color: #ff2d6f; background: rgba(255,45,111,0.06); }
.opt-radio {
  width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #333;
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  transition: border-color .15s;
}
.entrega-opt.selected .opt-radio { border-color: #ff2d6f; }
.opt-dot { width: 9px; height: 9px; border-radius: 50%; background: #ff2d6f; }
.opt-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.opt-top { display: flex; align-items: center; gap: 7px; }
.opt-nome { font-size: 13px; font-weight: 600; color: #fff; }
.opt-prazo { font-size: 10.5px; color: #666; background: #252525; padding: 2px 6px; border-radius: 20px; }
.opt-desc { font-size: 11px; color: #555; }
.opt-preco { font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
.opt-preco.green { color: #22c55e; }
.pg-icon { font-size: 20px; flex-shrink: 0; }
.pg-badge { font-size: 10.5px; font-weight: 700; color: #22c55e; background: rgba(34,197,94,0.12); border-radius: 20px; padding: 2px 7px; flex-shrink: 0; }

/* ══ PIX BLOCK ══ */
.pix-block {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: #1a1a1a; border: 0.5px solid #252525; border-radius: 10px;
  padding: 16px; margin: 8px 0 4px;
}
.pix-qr-wrap { padding: 8px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; min-width: 160px; min-height: 160px; }
.pix-qr-loading { font-size: 11px; color: #999; text-align: center; }
.pix-inst { font-size: 12px; color: #888; text-align: center; }
.pix-valor { font-size: 18px; font-weight: 700; color: #fff; }
.copiar-pix {
  display: flex; align-items: center; gap: 6px; background: #252525;
  border: 0.5px solid #333; border-radius: 20px; padding: 7px 14px;
  font-size: 12.5px; font-weight: 600; cursor: pointer; color: #ccc; transition: background .15s;
}
.copiar-pix:hover { background: #2a2a2a; }
.pix-desc-txt { font-size: 11.5px; color: #22c55e; font-weight: 600; }

/* ══ CONFIRMAÇÃO ══ */
.confirmacao { align-items: center; text-align: center; gap: 14px; }
.check-anim {
  width: 72px; height: 72px; border-radius: 50%; background: #22c55e;
  display: flex; align-items: center; justify-content: center;
  animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both; margin-top: 12px;
}
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.conf-titulo { font-size: 19px; font-weight: 700; color: #fff; margin: 0; }
.conf-sub { font-size: 13px; color: #666; margin: 0; }
.conf-pontos-card {
  width: 100%; display: flex; align-items: center; gap: 10px;
  background: rgba(251,191,36,0.08); border: 0.5px solid rgba(251,191,36,0.25);
  border-radius: 10px; padding: 12px; text-align: left;
}
.conf-pontos-t { font-size: 13px; font-weight: 600; color: #fbbf24; margin: 0; }
.conf-pontos-s { font-size: 11.5px; color: #999; margin: 2px 0 0; }
.conf-card {
  width: 100%; background: #1a1a1a; border: 0.5px solid #252525;
  border-radius: 10px; padding: 14px; text-align: left;
}
.conf-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #666; padding: 4px 0; }
.conf-val { color: #ccc; }
.bold { font-weight: 700; color: #fff; }
.conf-divider { height: 0.5px; background: #252525; margin: 8px 0; }
.conf-total { font-size: 14px; font-weight: 600; color: #fff; }
.conf-end-card {
  width: 100%; display: flex; align-items: flex-start; gap: 8px;
  background: #1a1a1a; border: 0.5px solid #252525; border-radius: 10px;
  padding: 12px; text-align: left;
}

/* ══ LIST TRANSITIONS ══ */
.list-enter-active { transition: all .25s ease; }
.list-leave-active { transition: all .2s ease; }
.list-enter-from { opacity: 0; transform: translateX(16px); }
.list-leave-to   { opacity: 0; transform: translateX(-16px); }
.list-move { transition: transform .25s ease; }

/* ══ DRAWER TRANSITION ══ */
.drawer-enter-active, .drawer-leave-active { transition: opacity .25s ease; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .3s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }

.pix-confirmado {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 0; animation: popIn .4s cubic-bezier(.34,1.56,.64,1) both;
}
.pix-confirmado-txt { font-size: 16px; font-weight: 700; color: #22c55e; margin: 0; }
.pix-confirmado-sub { font-size: 12px; color: #666; margin: 0; }
.pix-aguardando { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.pix-countdown { font-size: 13px; font-weight: 700; color: #fbbf24; }
.pix-spinner {
  width: 20px; height: 20px;
  border: 2.5px solid #252525; border-top-color: #22c55e;
  border-radius: 50%; animation: spin .7s linear infinite;
}
.pix-qr-blur canvas { filter: none; }
</style>