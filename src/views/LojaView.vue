<template>
  <div class="loja">

    <!-- BANNER CARROSSEL -->
    <div
      class="banner"
      @mouseenter="pausarBanner"
      @mouseleave="retomarBanner"
    >
      <div class="banner-track" :style="{ transform: `translateX(-${bannerAtivo * 100}%)` }">
        <div
          v-for="(slide, i) in bannerSlides"
          :key="i"
          class="banner-slide"
          :style="{ background: slide.bg }"
        >
          <div class="banner-slide-inner">
            <div class="banner-content">
              <div class="banner-tag" :style="{ color: slide.tagColor }">
                <span class="banner-tag-dot" :style="{ background: slide.tagColor }"/>
                {{ slide.tag }}
              </div>
              <div class="banner-titulo">{{ slide.titulo }}</div>
              <div class="banner-sub">{{ slide.sub }}</div>
              <button
                class="banner-cta"
                :style="{ background: slide.ctaBg }"
                @click="slide.acao && slide.acao()"
              >
                {{ slide.cta }}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
            <div class="banner-visual">
              <div class="banner-visual-ring" :style="{ borderColor: slide.ringColor }"/>
              <div class="banner-visual-icon" :style="{ color: slide.tagColor }">
                <component :is="'svg'" v-html="slide.icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"/>
              </div>
              <div class="banner-kpi-wrap">
                <div class="banner-kpi" v-for="k in slide.kpis" :key="k.label">
                  <span class="banner-kpi-n" :style="{ color: slide.tagColor }">{{ k.valor }}</span>
                  <span class="banner-kpi-l">{{ k.label }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="banner-glow" :style="{ background: slide.glowColor }"/>
        </div>
      </div>

      <button class="banner-arrow banner-prev" @click="bannerAnterior">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="banner-arrow banner-next" @click="bannerProximo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div class="banner-dots">
        <button
          v-for="(_, i) in bannerSlides"
          :key="i"
          class="banner-dot"
          :class="{ on: bannerAtivo === i }"
          @click="bannerAtivo = i"
        />
      </div>

      <div class="banner-progress">
        <div class="banner-progress-bar" :style="{ animationDuration: bannerDuracao + 'ms', animationPlayState: bannerPausado ? 'paused' : 'running' }" :key="bannerAtivo"/>
      </div>
    </div>

    <div class="hero">
      <div class="hero-left">
        <div class="hero-eyebrow">Moda de Rua Premium</div>
        <div class="hero-title">Compre<br/><span class="grad-text">a Coleção</span></div>
        <div class="hero-sub">Peças selecionadas para os ousados e distintos</div>
      </div>
      <div class="hero-right">
        <div class="kpi">
          <div class="kpi-n grad-num">{{ produtosFiltrados.length }}</div>
          <div class="kpi-l">Itens</div>
        </div>
        <div class="kpi">
          <div class="kpi-n grad-num">{{ produtosPromo.length }}</div>
          <div class="kpi-l">Em Promoção</div>
        </div>
        <div class="kpi">
          <div class="kpi-n grad-num">{{ maxDesconto }}%</div>
          <div class="kpi-l">Máx. Desconto</div>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="cats">
        <button
          v-for="cat in categorias"
          :key="cat"
          :class="['cat', { on: categoriaAtiva === cat }]"
          @click="selecionarCategoria(cat)"
        >{{ cat }}</button>
      </div>
      <div class="toolbar-right">
        <button v-if="pesquisa || categoriaAtiva !== 'All' || ordenacao || filtroEspecial" class="btn-limpar" @click="limparFiltros">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Limpar filtros
        </button>
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

    <!-- PROMO STRIP -->
    <div v-if="produtosPromo.length && !pesquisa" class="promo-strip">
      <div class="ps-glow"/>
      <div class="ps-left">
        <div class="ps-tag">Oferta por Tempo Limitado</div>
        <div class="ps-title">Promoção da Temporada Ativa</div>
        <div class="ps-sub">Descontos exclusivos em peças selecionadas</div>
      </div>
      <div class="ps-right">
        <div class="ps-kpi">
          <div class="ps-kpi-n grad-num">{{ produtosPromo.length }}</div>
          <div class="ps-kpi-l">Itens em promoção</div>
        </div>
        <div class="ps-kpi">
          <div class="ps-kpi-n grad-num">{{ maxDesconto }}%</div>
          <div class="ps-kpi-l">Até de desconto</div>
        </div>
        <button class="ps-btn" @click="filtrarPromo">Ver promoções</button>
      </div>
    </div>

    <!-- SECTION HEAD -->
    <div class="sec-head">
      <div class="sec-title">
        <span v-if="filtroEspecial === 'novos'">Lançamentos</span>
        <span v-else-if="filtroEspecial === 'maisVendidos'"> Mais Vendidos</span>
        <span v-else-if="filtroEspecial === 'promo'"> Promoções</span>
        <span v-else-if="categoriaAtiva !== 'All'">{{ categoriaAtiva }}</span>
        <span v-else-if="pesquisa">Resultados para "{{ pesquisa }}"</span>
        <span v-else>Todos os Produtos</span>
      </div>
      <div class="sec-count">{{ produtosFiltrados.length }} itens</div>
    </div>

    <!-- BARRA DE PESQUISA -->
    <div class="prod-search-bar">
      <div class="prod-search-wrap">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          v-model="pesquisa"
          class="prod-search-input"
          placeholder="Buscar por nome ou categoria..."
          @keydown.escape="pesquisa = ''"
          @input="filtroEspecial = ''"
        />
        <Transition name="clear-btn">
          <button v-if="pesquisa" class="prod-search-clear" @click="pesquisa = ''">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </Transition>
      </div>
      <div v-if="pesquisa" class="prod-search-info">
        <span class="grad-num" style="font-weight:700">{{ produtosFiltrados.length }}</span>
        resultado{{ produtosFiltrados.length !== 1 ? 's' : '' }} para
        <em>"{{ pesquisa }}"</em>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loadingProdutos" class="grid">
      <div class="card-skeleton" v-for="i in 8" :key="i" />
    </div>

    <!-- GRID DE PRODUTOS -->
    <div v-else class="grid">
      <div
        v-for="(produto, i) in produtosFiltrados"
        :key="produto.id"
        class="card"
        :style="{ animationDelay: i * 0.04 + 's' }"
        @click="verProduto(produto.id)"
      >
        <div class="card-top">
          <img class="card-img" :src="produto.img" :alt="produto.nome" loading="lazy"/>
          <div class="card-overlay">
            <button class="btn-cta" @click.stop="verProduto(produto.id)">Ver Produto</button>
            <button class="btn-cart" @click.stop="adicionarCarrinho(produto)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Adicionar ao Carrinho
            </button>
          </div>
          <div v-if="desconto(produto)" class="badge badge-sale">−{{ desconto(produto) }}%</div>
          <div v-else-if="produto.novo" class="badge badge-new">Novo</div>
          <Transition name="toast">
            <div v-if="toastId === produto.id" class="card-toast">✓ Adicionado</div>
          </Transition>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-cat" @click.stop="selecionarCategoria(produto.categoria)" style="cursor:pointer">{{ produto.categoria }}</span>
            <span v-if="desconto(produto)" class="card-disc">Economize {{ desconto(produto) }}%</span>
          </div>
          <div class="card-name">{{ produto.nome }}</div>
          <div class="card-foot">
            <div>
              <span class="card-price grad-text">R$ {{ produto.preco.toFixed(2) }}</span>
              <span v-if="produto.original" class="card-orig">R$ {{ produto.original.toFixed(2) }}</span>
            </div>
            <button class="card-add" @click.stop="adicionarCarrinho(produto)" title="Adicionar ao carrinho">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="!produtosFiltrados.length" class="nenhum">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <div>Nenhum resultado encontrado</div>
        <button class="btn-limpar-vazio" @click="limparFiltros">Limpar filtros</button>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer">

      <!-- Lista VIP -->
      <div class="ft-vip">
        <div class="ft-vip-glow-l"/>
        <div class="ft-vip-glow-r"/>
        <div class="ft-vip-inner">

          <div class="ft-vip-left">
            <div class="ft-vip-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Lista VIP
            </div>
            <div class="ft-vip-title">
              Drops que<br/>
              <span class="grad-text">só a lista vê.</span>
            </div>
            <div class="ft-vip-desc">
              Peças em quantidade limitada, lançadas sem aviso prévio. Quem está na lista chega primeiro.
            </div>
            <div class="ft-vip-members">
              <div class="ft-vip-avatars">
                <div class="ft-vip-av" style="background:#ff2e88"/>
                <div class="ft-vip-av" style="background:#ff6030"/>
                <div class="ft-vip-av" style="background:#ff8c00"/>
                <div class="ft-vip-av" style="background:#c0206a"/>
              </div>
              <div class="ft-vip-members-text">
                <span class="grad-num" style="font-weight:700;font-size:14px;">+2.400</span>
                <span> pessoas já estão dentro</span>
              </div>
            </div>
          </div>

          <div class="ft-vip-right">
            <div class="ft-vip-perks">
              <div class="ft-vip-perk">
                <div class="ft-vip-perk-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div>
                  <div class="ft-vip-perk-t">Acesso 48h antes</div>
                  <div class="ft-vip-perk-s">Compre antes de todo mundo</div>
                </div>
              </div>
              <div class="ft-vip-perk">
                <div class="ft-vip-perk-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div>
                  <div class="ft-vip-perk-t">Desconto exclusivo VIP</div>
                  <div class="ft-vip-perk-s">Até 20% só para membros</div>
                </div>
              </div>
              <div class="ft-vip-perk">
                <div class="ft-vip-perk-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div>
                  <div class="ft-vip-perk-t">Colabs &amp; edições limitadas</div>
                  <div class="ft-vip-perk-s">Drops surpresa exclusivos</div>
                </div>
              </div>
            </div>

            <Transition name="vip-success">
              <div v-if="vipSucesso" class="ft-vip-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <div class="ft-vip-success-t">Você está dentro da Lista VIP! 🎉</div>
                  <div class="ft-vip-success-s">Você ganhou <strong style="color:#ff8c00">{{ vipPontos }} pontos</strong> de boas-vindas</div>
                </div>
              </div>
              <div v-else class="ft-vip-form-wrap">
                <Transition name="err-fade">
                  <div v-if="vipErro" class="ft-vip-err" style="position:static;margin-bottom:10px;display:block">{{ vipErro }}</div>
                </Transition>
                <button class="ft-vip-btn" :class="{ loading: vipLoading }" @click="entrarVip" :disabled="vipLoading" style="width:100%;justify-content:center">
                  <span v-if="!vipLoading">
                    Entrar na Lista VIP
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                  <span v-else class="btn-spinner"/>
                </button>
                <div class="ft-vip-note">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Dados protegidos · LGPD · Saia quando quiser
                </div>
              </div>
            </Transition>
          </div>

        </div>
      </div>

      <!-- Corpo do footer -->
      <div class="ft-body">
        <div class="ft-col ft-col-brand">
          <div class="ft-logo" style="cursor:default">Long<em>Aura</em></div>
          <div class="ft-brand-desc">Aura Beauty — produtos de beleza premium para quem valoriza qualidade, identidade e bem-estar. Cada peça, uma experiência única.</div>
          <div class="ft-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener" class="ft-social" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener" class="ft-social" aria-label="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener" class="ft-social" aria-label="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
          <div class="ft-seals">
            <div class="ft-seal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Site Seguro SSL</span>
            </div>
            <div class="ft-seal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <span>Pagamento Seguro</span>
            </div>
          </div>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">Loja</div>
          <ul class="ft-links">
            <li><a href="#" @click.prevent="limparFiltros">Todos os Produtos</a></li>
            <li><a href="#" @click.prevent="filtrarNovos">Lançamentos</a></li>
            <li><a href="#" @click.prevent="filtrarPromo">Promoções</a></li>
            <li><a href="#" @click.prevent="filtrarMaisVendidos">Mais Vendidos</a></li>
            <li><a href="#" @click.prevent="scrollParaCategorias">Coleções</a></li>
          </ul>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">Atendimento</div>
          <ul class="ft-links">
            <li><a href="#" @click.prevent="abrirModal('ajuda')">Central de Ajuda</a></li>
            <li><a href="#" @click.prevent="abrirModal('pedido')">Meu Pedido</a></li>
            <li><a href="#" @click.prevent="abrirModal('trocas')">Trocas e Devoluções</a></li>
            <li><a href="#" @click.prevent="abrirModal('entrega')">Prazo de Entrega</a></li>
            <li><a href="https://wa.me/5511999999999" target="_blank" rel="noopener">Fale Conosco</a></li>
          </ul>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">Informações</div>
          <ul class="ft-links">
            <li><a href="#" @click.prevent="abrirModal('sobre')">Sobre a Aura Beauty</a></li>
            <li><a href="#" @click.prevent="abrirModal('privacidade')">Política de Privacidade</a></li>
            <li><a href="#" @click.prevent="abrirModal('termos')">Termos de Uso</a></li>
            <li><a href="#" @click.prevent="abrirModal('cookies')">Política de Cookies</a></li>
            <li><a href="#" @click.prevent="abrirModal('lgpd')">LGPD</a></li>
          </ul>
        </div>

        <div class="ft-col">
          <div class="ft-col-title">Contato</div>
          <ul class="ft-contacts">
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:contato@aurabeauty.com.br">contato@aurabeauty.com.br</a>
            </li>
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href="tel:+5511999999999">(11) 9 9999-9999</a>
            </li>
            <li>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Seg–Sex, 9h às 18h</span>
            </li>
          </ul>
          <div class="ft-pay-title">Pagamentos aceitos</div>
          <div class="ft-pay-icons">
            <div class="ft-pay-icon">Pix</div>
            <div class="ft-pay-icon">Visa</div>
            <div class="ft-pay-icon">MC</div>
            <div class="ft-pay-icon">Elo</div>
            <div class="ft-pay-icon">Boleto</div>
          </div>
        </div>
      </div>

      <div class="ft-bottom">
        <div class="ft-bottom-left">
          © {{ new Date().getFullYear() }} Aura Beauty. Todos os direitos reservados.
          <span class="ft-bottom-sep">·</span>
          CNPJ 00.000.000/0001-00
        </div>
        <div class="ft-bottom-right">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Seus dados são protegidos pela LGPD
          <span class="ft-bottom-sep">·</span>
          Desenvolvido com ♥ no Brasil
        </div>
      </div>

    </footer>

    <!-- MODAL INFORMATIVO -->
    <Transition name="modal">
      <div v-if="modalAtivo" class="modal-overlay" @click.self="fecharModal">
        <div class="modal">
          <button class="modal-close" @click="fecharModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img v-if="modalConteudo.img" :src="modalConteudo.img" class="modal-img" :alt="modalConteudo.titulo" />
          <div class="modal-title">{{ modalConteudo.titulo }}</div>
          <div class="modal-body" style="white-space:pre-line">{{ modalConteudo.texto }}</div>
          <div v-if="modalConteudo.produto" style="display:flex;gap:10px;margin-top:16px">
            <button class="modal-btn" style="flex:1" @click="adicionarCarrinho(modalConteudo.produto); fecharModal()">
              Adicionar ao Carrinho
            </button>
            <button class="modal-btn" style="flex:1;background:transparent;border:1px solid #333" @click="fecharModal">Fechar</button>
          </div>
          <button v-else class="modal-btn" @click="fecharModal">Entendido</button>
        </div>
      </div>
    </Transition>

    <!-- TOAST GLOBAL -->
    <Transition name="gtoast">
      <div v-if="globalToast" class="global-toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {{ globalToast }}
      </div>
    </Transition>

    <!-- BOTÃO FLUTUANTE DO CARRINHO -->
    <button class="fab-cart" @click="carrinhoAberto = true" :class="{ pulse: cartPulse }">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import { ref, computed, onMounted, onUnmounted } from "vue"
import { carrinho } from "../stores/carrinho"
import CarrinhoFlutuante from "../components/CarrinhoFlutuante.vue"
import { supabase } from "@/supabase.js"
import { authState } from "@/auth.js"

const carrinhoAberto = ref(false)

const pesquisa        = ref("")
const ordenacao       = ref("")
const categoriaAtiva  = ref("All")
const toastId         = ref(null)
const cartPulse       = ref(false)

const filtroEspecial = ref("")

// ── Produtos (Supabase) ─────────────────────────────────────────
// Promoção automática todo dia 30 do mês, aplicada em cima do
// preço/original que vierem do banco (mesmo comportamento de antes).
const hoje = new Date()
const isDia30 = hoje.getDate() === 30

const produtosRaw    = ref([])
const loadingProdutos = ref(true)

async function loadProdutos() {
  loadingProdutos.value = true
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
    if (error) throw error
    produtosRaw.value = data || []
  } catch (e) {
    console.error('Erro ao carregar produtos:', e)
    produtosRaw.value = []
  } finally {
    loadingProdutos.value = false
  }
}

onMounted(loadProdutos)

// Normaliza os campos do banco para o formato usado pelos templates,
// aplicando a promoção do dia 30 por cima do preço original do banco.
const produtos = computed(() => {
  return produtosRaw.value.map(p => {
    const precoBase    = Number(p.preco) || 0
    const originalBase = p.original != null ? Number(p.original) : null

    // Se já está em promo no banco, ou se é dia 30 (e há desconto possível),
    // aplica 30% adicional sobre o preço base como "preço do dia 30",
    // preservando a lógica de "preço cai, original mostra o de antes".
    let preco    = precoBase
    let original = originalBase
    let promo    = !!p.promo

    if (isDia30) {
      const refOriginal = originalBase ?? precoBase
      const precoDia30  = Math.round(refOriginal * 0.7 * 100) / 100 // ~30% off
      if (precoDia30 < refOriginal) {
        preco    = precoDia30
        original = refOriginal
        promo    = true
      }
    }

    return {
      id: p.id,
      nome: p.nome,
      preco,
      original,
      promo,
      novo: !!p.novo,
      categoria: p.categoria || 'outros',
      img: p.img,
      descricao: p.descricao,
      beneficios: p.beneficios,
      uso: p.uso,
    }
  })
})

const bannerAtivo   = ref(0)
const bannerPausado = ref(false)
const bannerDuracao = 4800
let   bannerTimer   = null

const bannerSlides = [
  {
    tag:       "Promoção Relâmpago",
    tagColor:  "#ff2e88",
    titulo:    "Até 40% OFF em selecionados",
    sub:       "Só hoje: produtos Aura Beauty com desconto exclusivo. Corre que acaba!",
    cta:       "Ver promoções",
    ctaBg:     "linear-gradient(90deg,#ff2e88,#ff8c00)",
    bg:        "linear-gradient(135deg, #0d0005 0%, #1a0008 60%, #0a0000 100%)",
    glowColor: "radial-gradient(circle at 80% 50%, rgba(255,46,136,.18), transparent 60%)",
    ringColor: "rgba(255,46,136,.15)",
    icon:      '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    kpis: [
      { valor: "40%",  label: "desconto" },
      { valor: "48h",  label: "restam" },
    ],
    acao: () => { filtrarPromo(); window.scrollTo({ top: 300, behavior: "smooth" }) }
  },
  {
    tag:       " Novidade",
    tagColor:  "#a78bfa",
    titulo:    "Nova coleção chegou",
    sub:       "Lançamentos exclusivos Aura Beauty. Peças únicas para quem chegou primeiro.",
    cta:       "Ver lançamentos",
    ctaBg:     "linear-gradient(90deg,#7c3aed,#a78bfa)",
    bg:        "linear-gradient(135deg, #05000d 0%, #0e0018 60%, #030008 100%)",
    glowColor: "radial-gradient(circle at 80% 50%, rgba(167,139,250,.15), transparent 60%)",
    ringColor: "rgba(167,139,250,.15)",
    icon:      '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    kpis: [
      { valor: "12",   label: "novos itens" },
      { valor: "Ed. Limitada", label: "exclusivo" },
    ],
    acao: () => { filtrarNovos(); window.scrollTo({ top: 300, behavior: "smooth" }) }
  },
  {
    tag:       " Frete Grátis",
    tagColor:  "#34d399",
    titulo:    "Frete grátis acima de R$ 299",
    sub:       "Entrega para todo o Brasil em até 10 dias úteis. Compre mais e economize!",
    cta:       "Aproveitar agora",
    ctaBg:     "linear-gradient(90deg,#059669,#34d399)",
    bg:        "linear-gradient(135deg, #000d06 0%, #001a0c 60%, #00080300 100%)",
    glowColor: "radial-gradient(circle at 80% 50%, rgba(52,211,153,.12), transparent 60%)",
    ringColor: "rgba(52,211,153,.12)",
    icon:      '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    kpis: [
      { valor: "R$299",  label: "pedido mín." },
      { valor: "10d",    label: "prazo máx." },
    ],
    acao: () => { window.scrollTo({ top: 300, behavior: "smooth" }) }
  },
  {
    tag:       "⭐ Lista VIP",
    tagColor:  "#fbbf24",
    titulo:    "Acesso antecipado para membros",
    sub:       "Entre na lista VIP e compre 48h antes do lançamento com desconto exclusivo.",
    cta:       "Quero ser VIP",
    ctaBg:     "linear-gradient(90deg,#d97706,#fbbf24)",
    bg:        "linear-gradient(135deg, #0d0800 0%, #1a1000 60%, #080500 100%)",
    glowColor: "radial-gradient(circle at 80% 50%, rgba(251,191,36,.12), transparent 60%)",
    ringColor: "rgba(251,191,36,.12)",
    icon:      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    kpis: [
      { valor: "+2.4k", label: "membros" },
      { valor: "20%",   label: "desconto VIP" },
    ],
    acao: () => { document.querySelector(".ft-vip")?.scrollIntoView({ behavior: "smooth" }) }
  },
]

function bannerProximo() {
  bannerAtivo.value = (bannerAtivo.value + 1) % bannerSlides.length
  reiniciarTimer()
}
function bannerAnterior() {
  bannerAtivo.value = (bannerAtivo.value - 1 + bannerSlides.length) % bannerSlides.length
  reiniciarTimer()
}
function pausarBanner()  { bannerPausado.value = true;  clearInterval(bannerTimer) }
function retomarBanner() { bannerPausado.value = false; iniciarTimer() }

function iniciarTimer() {
  bannerTimer = setInterval(bannerProximo, bannerDuracao)
}
function reiniciarTimer() {
  clearInterval(bannerTimer)
  if (!bannerPausado.value) iniciarTimer()
}

onMounted(iniciarTimer)
onUnmounted(() => clearInterval(bannerTimer))

const emit = defineEmits(["abrirCarrinho"])

const categorias = computed(() => ["All", ...new Set(produtos.value.map(p => p.categoria))])

function desconto(p) {
  return p.original ? Math.round((1 - p.preco / p.original) * 100) : 0
}

const produtosFiltrados = computed(() => {
  let list = [...produtos.value]

  if (filtroEspecial.value === 'novos') {
    list = list.filter(p => p.novo)
  } else if (filtroEspecial.value === 'promo') {
    list = list.filter(p => p.promo || p.original)
  } else if (filtroEspecial.value === 'maisVendidos') {
    // sem filtro — mostra todos os produtos como "mais vendidos"
  }

  if (categoriaAtiva.value !== 'All') {
    list = list.filter(p => p.categoria === categoriaAtiva.value)
  }

  if (pesquisa.value) {
    const q = pesquisa.value.toLowerCase()
    list = list.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    )
  }

  if (ordenacao.value === "asc")  list = list.sort((a, b) => a.preco - b.preco)
  if (ordenacao.value === "desc") list = list.sort((a, b) => b.preco - a.preco)
  if (ordenacao.value === "disc") list = list.sort((a, b) => desconto(b) - desconto(a))

  return list
})

const produtosPromo   = computed(() => produtos.value.filter(p => p.promo || p.original))
const maxDesconto     = computed(() => {
  const d = produtosPromo.value.map(p => desconto(p)).filter(Boolean)
  return d.length ? Math.max(...d) : 0
})
const totalItensCarrinho = computed(() => carrinho.itens.reduce((s, i) => s + i.qtd, 0))

function verProduto(id) {
  const p = produtos.value.find(x => x.id === id)
  if (p) abrirModal('produto', p)
}

function selecionarCategoria(cat) {
  categoriaAtiva.value = cat
  filtroEspecial.value = ""
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function limparFiltros() {
  pesquisa.value       = ""
  ordenacao.value      = ""
  categoriaAtiva.value = "All"
  filtroEspecial.value = ""
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function filtrarNovos() {
  filtroEspecial.value = "novos"
  pesquisa.value       = ""
  categoriaAtiva.value = "All"
  ordenacao.value      = ""
  window.scrollTo({ top: 0, behavior: "smooth" })
  mostrarToast(" Mostrando lançamentos")
}

function filtrarPromo() {
  filtroEspecial.value = "promo"
  pesquisa.value       = ""
  categoriaAtiva.value = "All"
  ordenacao.value      = "disc"
  window.scrollTo({ top: 0, behavior: "smooth" })
  mostrarToast(" Mostrando promoções")
}

function filtrarMaisVendidos() {
  filtroEspecial.value = "maisVendidos"
  pesquisa.value       = ""
  categoriaAtiva.value = "All"
  ordenacao.value      = ""
  window.scrollTo({ top: 0, behavior: "smooth" })
  mostrarToast(" Mostrando mais vendidos")
}

function scrollParaCategorias() {
  document.querySelector(".toolbar")?.scrollIntoView({ behavior: "smooth" })
}

function adicionarCarrinho(produto) {
  carrinho.adicionar({ id: produto.id, nome: produto.nome, preco: produto.preco, img: produto.img, qtd: 1 })
  toastId.value = produto.id
  setTimeout(() => { if (toastId.value === produto.id) toastId.value = null }, 1400)
  cartPulse.value = true
  setTimeout(() => cartPulse.value = false, 600)
  carrinhoAberto.value = true
}

// Lista VIP: pega o email de quem já está logado e grava no banco

async function obterEmailLogado() {
  if (authState?.user?.email) {
    return authState.user.email
  }
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user?.email) return null
  return data.user.email
}

// Lista VIP
const vipErro    = ref("")
const vipLoading = ref(false)
const vipSucesso = ref(false)
const vipPontos  = ref(0)

async function entrarVip() {
  vipLoading.value = true
  vipErro.value = ""

  try {
    const email = await obterEmailLogado()

    if (!email) {
      vipErro.value = "Você precisa estar logado para entrar na Lista VIP"
      vipLoading.value = false
      return
    }

    const { data: dadosVip, error: erroRpc } = await supabase.rpc("cadastrar_vip", {
      p_email: email,
    })

    if (erroRpc) throw erroRpc

    const resultado = dadosVip?.[0]
    vipPontos.value = resultado?.pontos ?? 0
    vipSucesso.value = true
  } catch (e) {
    console.error("Erro ao entrar na lista VIP:", e)
    vipErro.value = "Não foi possível concluir agora. Tente novamente."
  } finally {
    vipLoading.value = false
  }
}

const modalAtivo    = ref(false)
const modalConteudo = ref({ titulo: "", texto: "" })

const globalToast = ref("")

const modaisConteudo = {
  ajuda:       { titulo: "Central de Ajuda",        texto: "Nossa equipe está disponível de segunda a sexta, das 9h às 18h. Entre em contato pelo WhatsApp ou e-mail para dúvidas sobre produtos, pedidos e entregas." },
  pedido:      { titulo: "Meu Pedido",               texto: "Para rastrear seu pedido, acesse sua conta ou entre em contato com nosso suporte informando o número do pedido recebido por e-mail." },
  trocas:      { titulo: "Trocas e Devoluções",      texto: "Você tem até 7 dias após o recebimento para solicitar troca ou devolução. O produto deve estar sem uso, com etiquetas e na embalagem original." },
  entrega:     { titulo: "Prazo de Entrega",         texto: "Entregamos para todo o Brasil. O prazo varia de 3 a 10 dias úteis conforme sua região. Frete grátis para compras acima de R$ 299." },
  sobre:       { titulo: "Sobre a Aura Beauty",      texto: "Aura Beauty é uma marca de beleza e bem-estar premium focada em produtos únicos e edições limitadas. Criada para quem valoriza qualidade e identidade própria." },
  privacidade: { titulo: "Política de Privacidade",  texto: "Coletamos apenas os dados necessários para processar seus pedidos. Nunca vendemos ou compartilhamos suas informações com terceiros sem sua autorização." },
  termos:      { titulo: "Termos de Uso",            texto: "Ao utilizar nosso site, você concorda com nossas políticas de uso. Todo o conteúdo é protegido por direitos autorais e pertence à Aura Beauty." },
  cookies:     { titulo: "Política de Cookies",      texto: "Utilizamos cookies para melhorar sua experiência de navegação. Você pode gerenciar suas preferências nas configurações do seu navegador." },
  lgpd:        { titulo: "LGPD",                     texto: "Seguimos rigorosamente a Lei Geral de Proteção de Dados (Lei 13.709/2018). Você tem direito ao acesso, correção e exclusão dos seus dados a qualquer momento." },
}

function abrirModal(tipo, produto = null) {
  if (tipo === 'produto' && produto) {
    modalConteudo.value = {
      titulo: produto.nome,
      texto: `${produto.descricao}\n\nBenefícios: ${produto.beneficios}\n\nModo de uso: ${produto.uso}\n\nPreço: R$ ${produto.preco.toFixed(2)}`,
      img: produto.img,
      produto
    }
  } else {
    modalConteudo.value = modaisConteudo[tipo] || { titulo: "", texto: "" }
  }
  modalAtivo.value = true
  document.body.style.overflow = "hidden"
}

function fecharModal() {
  modalAtivo.value = false
  document.body.style.overflow = ""
}

let toastTimer = null
function mostrarToast(msg) {
  globalToast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { globalToast.value = "" }, 2200)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.loja {
  --grad: linear-gradient(90deg, #ff2e88, #ff8c00);
  --bg: #000000;
  --s1: #060606;
  --s2: #0a0a0a;
  --s3: #101010;
  --b1: #111111;
  --b2: #1c1c1c;
  --b3: #282828;
  --t1: #f0f0f0;
  --t2: #888888;
  --t3: #444444;

  background: var(--bg);
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.grad-text,
.grad-num {
  color: #ff2e88;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 0 48px;
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--b1);
  background: rgba(0, 0, 0, 0.96);
  backdrop-filter: blur(20px);
}

.logo {
  font-family: 'Syne', sans-serif;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--t1);
  flex-shrink: 0;
  cursor: pointer;
  transition: opacity .2s;
}
.logo:hover { opacity: .8; }
.logo em {
  font-style: normal;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.banner {
  position: relative;
  overflow: hidden;
  height: 280px;
  border-bottom: 1px solid var(--b1);
  cursor: grab;
}
.banner:active { cursor: grabbing; }

.banner-track {
  display: flex;
  height: 100%;
  transition: transform .6s cubic-bezier(.4, 0, .2, 1);
}

.banner-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.banner-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.banner-slide-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 0 64px;
}

.banner-content { flex: 1; max-width: 520px; }

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.banner-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: tagPulse 1.8s ease infinite;
  flex-shrink: 0;
}
@keyframes tagPulse {
  0%, 100% { opacity: 1;  transform: scale(1);    }
  50%       { opacity: .5; transform: scale(1.4); }
}

.banner-titulo {
  font-family: 'Syne', sans-serif;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -1px;
  color: var(--t1);
  margin-bottom: 10px;
}
.banner-sub {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.6;
  margin-bottom: 22px;
  max-width: 400px;
}
.banner-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  color: white;
  border: none;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
}
.banner-cta:hover { opacity: .88; transform: translateY(-1px); }

.banner-visual {
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.banner-visual-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid;
  animation: ringRotate 12s linear infinite;
}
.banner-visual-ring::before {
  content: '';
  position: absolute;
  top: -4px; left: 50%;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: currentColor;
  transform: translateX(-50%);
}
@keyframes ringRotate { to { transform: rotate(360deg); } }

.banner-visual-icon {
  position: absolute;
  opacity: .12;
}
.banner-visual-icon svg { display: block; }

.banner-kpi-wrap {
  display: flex;
  gap: 28px;
  position: relative;
  z-index: 1;
}
.banner-kpi { text-align: center; }
.banner-kpi-n {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  display: block;
}
.banner-kpi-l {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #555;
  margin-top: 3px;
}

.banner-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.1);
  background: rgba(0, 0, 0, .5);
  color: var(--t1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: opacity .2s, background .2s, border-color .2s;
  backdrop-filter: blur(4px);
}
.banner:hover .banner-arrow { opacity: 1; }
.banner-arrow:hover { background: rgba(255,46,136,.25); border-color: rgba(255,46,136,.4); }
.banner-prev { left: 16px; }
.banner-next { right: 16px; }

.banner-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}
.banner-dot {
  width: 6px;
  height: 6px;
  border-radius: 20px;
  border: none;
  background: rgba(255,255,255,.2);
  cursor: pointer;
  transition: all .3s;
  padding: 0;
}
.banner-dot.on {
  width: 22px;
  background: white;
}

.banner-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255,255,255,.06);
  z-index: 10;
}
.banner-progress-bar {
  height: 100%;
  background: var(--grad);
  animation: progressBar linear forwards;
  transform-origin: left;
}
@keyframes progressBar {
  from { width: 0%; }
  to   { width: 100%; }
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 52px 48px 44px;
  border-bottom: 1px solid var(--b1);
}

.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #ff2e88;
  margin-bottom: 10px;
}
.hero-title {
  font-family: 'Syne', sans-serif;
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  color: var(--t1);
}
.hero-sub {
  font-size: 13px;
  color: var(--t2);
  margin-top: 10px;
}

.hero-right { display: flex; gap: 40px; flex-shrink: 0; }

.kpi { text-align: center; }
.kpi-n {
  font-family: 'Syne', sans-serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  display: block;
}
.kpi-l {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #555;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 48px;
  border-bottom: 1px solid var(--b1);
  background: var(--bg);
}

.cats { display: flex; gap: 8px; flex-wrap: wrap; }

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
.cat:hover { border-color: #ff2e88; color: var(--t1); }
.cat.on    { background: var(--grad); border-color: transparent; color: white; font-weight: 600; }

.toolbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.btn-limpar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 4px;
  border: 1px solid var(--b3);
  background: transparent;
  color: #666;
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
  color: #666;
  white-space: nowrap;
}
select {
  background: var(--s1);
  border: 1px solid var(--b2);
  border-radius: 6px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  padding: 9px 14px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  transition: border-color .2s;
}
select:focus { border-color: #ff2e88; }

.promo-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 48px;
  padding: 28px 36px;
  background: var(--s1);
  border: 1px solid var(--b2);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.promo-strip::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--grad);
  border-radius: 2px 0 0 2px;
}

.ps-glow {
  position: absolute;
  left: -60px; top: -60px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 46, 136, .12), transparent 70%);
  pointer-events: none;
}

.ps-tag {
  font-size: 9px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #ff2e88;
  margin-bottom: 8px;
}
.ps-title {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 4px;
}
.ps-sub { font-size: 12px; color: var(--t2); }

.ps-right {
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 1;
}

.ps-kpi { text-align: center; }
.ps-kpi-n {
  font-family: 'Syne', sans-serif;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  display: block;
}
.ps-kpi-l {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #555;
  margin-top: 4px;
}

.ps-btn {
  padding: 9px 20px;
  background: var(--grad);
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
}
.ps-btn:hover { opacity: .88; transform: translateY(-1px); }

.sec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px 16px;
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
  width: 3px;
  height: 13px;
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
  padding: 0 48px 20px;
  background: var(--bg);
}

.prod-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 560px;
}
.prod-search-wrap > svg {
  position: absolute;
  left: 16px;
  color: #444;
  pointer-events: none;
  flex-shrink: 0;
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
.prod-search-input:focus {
  border-color: #ff2e88;
  box-shadow: 0 0 0 3px rgba(255, 46, 136, .08);
}
.prod-search-input::placeholder { color: #444; }

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

.clear-btn-enter-active,
.clear-btn-leave-active { transition: all .15s ease; }
.clear-btn-enter-from,
.clear-btn-leave-to     { opacity: 0; transform: scale(.7); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1px;
  padding: 0 48px 24px;
  background: var(--b1);
}

.card-skeleton {
  background: var(--s1);
  height: 380px;
  background: linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.card {
  background: var(--s1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background .2s;
  animation: up .4s ease both;
}
.card:hover                { background: var(--s2); }
.card:hover .card-img      { transform: scale(1.04); }
.card:hover .card-overlay  { opacity: 1; transform: translateY(0); }
.card:hover .card-body     { background: var(--s2); }

.card-top {
  overflow: hidden;
  position: relative;
  height: 285px;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--s3);
  transition: transform .55s cubic-bezier(.22, .68, 0, 1.2);
}

.card-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 40px 14px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, .95) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 7px;
  opacity: 0;
  transform: translateY(6px);
  transition: all .3s;
}

.btn-cta {
  width: 100%;
  padding: 9px 12px;
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
.btn-cta:hover { opacity: .88; }

.btn-cart {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  background: var(--grad);
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
.btn-cart:hover { opacity: .88; }

.badge {
  position: absolute;
  top: 12px; left: 0;
  padding: 5px 12px 5px 13px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: white;
  clip-path: polygon(0 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
}
.badge-sale { background: #ff2e88; }
.badge-new  { background: #0d5c3a; }

.card-toast {
  position: absolute;
  top: 12px; right: 12px;
  padding: 5px 12px;
  background: var(--grad);
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
  transition: color .2s;
}
.card-cat:hover { color: #ff2e88; }

.card-disc {
  font-size: 9px;
  letter-spacing: .5px;
  color: #ff2e88;
  border: 1px solid rgba(255, 46, 136, .2);
  padding: 2px 7px;
  border-radius: 3px;
}

.card-name {
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--t1);
  margin-bottom: 12px;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-price {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 700;
}
.card-orig {
  font-size: 11px;
  color: #555;
  text-decoration: line-through;
  margin-left: 6px;
}

.card-add {
  width: 30px;
  height: 30px;
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
.card-add:hover { background: var(--grad); border-color: transparent; color: white; }

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
.nenhum div {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
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

.toast-enter-active { transition: all .25s ease; }
.toast-leave-active { transition: all .3s ease; }
.toast-enter-from,
.toast-leave-to     { opacity: 0; transform: translateY(-6px); }

@keyframes up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

.ft-vip {
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--b2);
  background: var(--s1);
}

.ft-vip-glow-l {
  position: absolute;
  left: -100px; top: -100px;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 46, 136, .07), transparent 65%);
  pointer-events: none;
}
.ft-vip-glow-r {
  position: absolute;
  right: -80px; bottom: -80px;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 140, 0, .07), transparent 65%);
  pointer-events: none;
}

.ft-vip-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 56px 48px;
  border-left: 3px solid #ff2e88;
}

.ft-vip-left { flex: 1; max-width: 380px; }

.ft-vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  margin-bottom: 18px;
  background: rgba(255, 46, 136, .08);
  border: 1px solid rgba(255, 46, 136, .2);
  border-radius: 20px;
  color: #ff2e88;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
}
.ft-vip-badge svg { color: #ff8c00; flex-shrink: 0; }

.ft-vip-title {
  font-family: 'Syne', sans-serif;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -1px;
  color: var(--t1);
  margin-bottom: 14px;
}
.ft-vip-desc {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.7;
  max-width: 300px;
  margin-bottom: 24px;
}

.ft-vip-members { display: flex; align-items: center; gap: 12px; }
.ft-vip-avatars { display: flex; }
.ft-vip-av {
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 2px solid var(--bg);
  margin-left: -7px;
}
.ft-vip-av:first-child { margin-left: 0; }
.ft-vip-members-text { font-size: 12px; color: var(--t2); }

.ft-vip-right { flex-shrink: 0; width: 420px; }

.ft-vip-perks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 20px;
  margin-bottom: 28px;
  background: rgba(255, 255, 255, .02);
  border: 1px solid var(--b2);
  border-radius: 10px;
}
.ft-vip-perk { display: flex; align-items: flex-start; gap: 14px; }
.ft-vip-perk-icon {
  width: 34px; height: 34px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(255, 46, 136, .08);
  border: 1px solid rgba(255, 46, 136, .15);
  color: #ff2e88;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ft-vip-perk-t { font-size: 13px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.ft-vip-perk-s { font-size: 11px; color: var(--t2); }

.ft-vip-form { display: flex; gap: 8px; margin-bottom: 10px; }
.ft-vip-input-wrap { flex: 1; position: relative; }

.ft-vip-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--s3);
  border: 1px solid var(--b2);
  border-radius: 7px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.ft-vip-input:focus {
  border-color: #ff2e88;
  box-shadow: 0 0 0 3px rgba(255, 46, 136, .08);
}
.ft-vip-input::placeholder { color: #444; }
.ft-vip-input-err { border-color: #ff2e88 !important; }

.ft-vip-err {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  font-size: 10px;
  color: #ff2e88;
  letter-spacing: .5px;
}

.ft-vip-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  white-space: nowrap;
  background: var(--grad);
  color: white;
  border: none;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
}
.ft-vip-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.ft-vip-btn:disabled  { opacity: .6; cursor: not-allowed; }
.ft-vip-btn.loading   { pointer-events: none; }

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ft-vip-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 10px;
  color: #3a3a3a;
  letter-spacing: .5px;
}
.ft-vip-note svg { color: #555; flex-shrink: 0; }

.ft-vip-success {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: rgba(13, 92, 58, .15);
  border: 1px solid rgba(13, 92, 58, .3);
  border-radius: 10px;
}
.ft-vip-success svg  { color: #2ecc71; flex-shrink: 0; }
.ft-vip-success-t    { font-size: 14px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.ft-vip-success-s    { font-size: 12px; color: var(--t2); }

.vip-success-enter-active,
.vip-success-leave-active { transition: all .35s ease; }
.vip-success-enter-from,
.vip-success-leave-to     { opacity: 0; transform: translateY(8px); }

.err-fade-enter-active,
.err-fade-leave-active { transition: all .2s; }
.err-fade-enter-from,
.err-fade-leave-to     { opacity: 0; transform: translateY(-4px); }

.ft-body {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.4fr;
  gap: 40px;
  padding: 52px 48px 44px;
  border-top: 1px solid var(--b1);
}

.ft-col-title {
  font-family: 'Syne', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--t1);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ft-col-title::before {
  content: '';
  width: 14px; height: 2px;
  background: var(--grad);
  border-radius: 1px;
  flex-shrink: 0;
}

.ft-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.ft-links a {
  font-size: 12px;
  color: var(--t2);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color .2s;
}
.ft-links a::before {
  content: '';
  width: 0; height: 1px;
  background: var(--grad);
  display: inline-block;
  transition: width .25s;
}
.ft-links a:hover             { color: var(--t1); }
.ft-links a:hover::before     { width: 10px; }

.ft-logo {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--t1);
  margin-bottom: 14px;
}
.ft-logo em {
  font-style: normal;
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ft-brand-desc {
  font-size: 12px;
  color: var(--t2);
  line-height: 1.7;
  max-width: 240px;
  margin-bottom: 20px;
}

.ft-socials { display: flex; gap: 8px; margin-bottom: 24px; }
.ft-social {
  width: 36px; height: 36px;
  border: 1px solid var(--b2);
  border-radius: 8px;
  background: var(--s3);
  color: var(--t2);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all .2s;
}
.ft-social:hover {
  border-color: #ff2e88;
  background: rgba(255, 46, 136, .08);
  color: #ff2e88;
}

.ft-seals { display: flex; flex-direction: column; gap: 8px; }
.ft-seal {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  color: #444;
  letter-spacing: .5px;
}
.ft-seal svg { color: #ff2e88; flex-shrink: 0; }

.ft-contacts { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 22px; }
.ft-contacts li { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--t2); }
.ft-contacts a  { color: var(--t2); text-decoration: none; transition: color .2s; }
.ft-contacts a:hover { color: #ff2e88; }
.ft-contacts svg { color: #ff2e88; flex-shrink: 0; }

.ft-pay-title {
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 10px;
}
.ft-pay-icons { display: flex; flex-wrap: wrap; gap: 6px; }
.ft-pay-icon {
  padding: 4px 9px;
  border: 1px solid var(--b2);
  border-radius: 4px;
  background: var(--s3);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: #666;
}

.ft-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 48px;
  border-top: 1px solid var(--b1);
}

.ft-bottom-left,
.ft-bottom-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: #3a3a3a;
  letter-spacing: .5px;
}
.ft-bottom-right svg { color: #ff2e88; }
.ft-bottom-sep { color: #282828; }

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, .85);
  backdrop-filter: blur(6px);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 460px;
  padding: 36px;
  background: var(--s1);
  border: 1px solid var(--b2);
  border-radius: 12px;
}

.modal-close {
  position: absolute;
  top: 16px; right: 16px;
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 1px solid var(--b2);
  background: var(--s3);
  color: var(--t2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
}
.modal-close:hover { border-color: #ff2e88; color: #ff2e88; }

.modal-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.modal-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--t1);
  margin-bottom: 14px;
}
.modal-body {
  font-size: 13px;
  color: var(--t2);
  line-height: 1.8;
  margin-bottom: 24px;
}

.modal-btn {
  padding: 11px 28px;
  background: var(--grad);
  color: white;
  border: none;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity .2s;
}
.modal-btn:hover { opacity: .88; }

.modal-enter-active,
.modal-leave-active { transition: all .25s ease; }
.modal-enter-from,
.modal-leave-to     { opacity: 0; }
.modal-enter-from .modal,
.modal-leave-to .modal { transform: scale(.96) translateY(8px); }

.global-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--grad);
  color: white;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .5px;
  border-radius: 20px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 24px rgba(255, 46, 136, .3);
}

.gtoast-enter-active,
.gtoast-leave-active { transition: all .3s ease; }
.gtoast-enter-from,
.gtoast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(12px); }

.fab-cart {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2e88, #ff8c00);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 150;
  box-shadow: 0 4px 24px rgba(255,46,136,.4);
  transition: transform .2s, box-shadow .2s;
}
.fab-cart:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 32px rgba(255,46,136,.55);
}
.fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
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
  40%      { transform: scale(1.2); }
  70%      { transform: scale(.93); }
}
.fab-cart.pulse { animation: fabPop .5s ease; }

@media (max-width: 900px) {
  .nav,
  .hero,
  .toolbar,
  .sec-head,
  .prod-search-bar,
  .grid          { padding-left: 20px; padding-right: 20px; }
  .promo-strip   { margin-left: 20px; margin-right: 20px; }

  .banner            { height: 220px; }
  .banner-slide-inner { padding: 0 20px; gap: 16px; }
  .banner-titulo     { font-size: 22px; }
  .banner-sub        { font-size: 12px; margin-bottom: 14px; }
  .banner-visual     { width: 120px; height: 120px; }
  .banner-kpi-n      { font-size: 18px; }
  .banner-arrow      { display: none; }

  .nav-center { display: none; }

  .hero          { flex-direction: column; align-items: flex-start; padding-top: 32px; }
  .hero-title    { font-size: 32px; }
  .hero-right    { gap: 24px; }
  .kpi-n         { font-size: 26px; }

  .toolbar       { flex-direction: column; align-items: flex-start; gap: 12px; }
  .toolbar-right { align-self: flex-end; }

  .promo-strip   { flex-direction: column; gap: 20px; padding: 22px 20px; }
  .ps-right      { flex-wrap: wrap; }

  .grid          { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); padding-bottom: 16px; }
  .card-top      { height: 210px; }

  .ft-vip-inner  { flex-direction: column; padding: 36px 20px; gap: 32px; }
  .ft-vip-title  { font-size: 28px; }
  .ft-vip-right  { width: 100%; }
  .ft-vip-form   { flex-direction: column; }
  .ft-vip-btn    { justify-content: center; }

  .ft-body       { grid-template-columns: 1fr 1fr; padding: 36px 20px 32px; gap: 32px; }
  .ft-col-brand  { grid-column: 1 / -1; }

  .ft-bottom     { flex-direction: column; align-items: flex-start; padding: 18px 20px; gap: 8px; }
}
</style>