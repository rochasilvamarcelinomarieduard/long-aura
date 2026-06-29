import { reactive } from "vue"
import { supabase } from "@/supabase.js"

const CUPONS = {
  'AURA10': { desconto: 0.10, tipo: 'percentual', label: '10% de desconto' },
  'FRETE0': { desconto: 0,    tipo: 'frete',      label: 'Frete grátis' },
}

export const carrinho = reactive({
  itens: [],

  adicionar(produto) {
    const existente = this.itens.find(i => i.id === produto.id)
    if (existente) {
      existente.qtd++
    } else {
      // Normaliza: aceita tanto `imagem` quanto `img`
      this.itens.push({
        ...produto,
        imagem: produto.imagem || produto.img || '',
        qtd: 1,
      })
    }
  },

  aumentar(id) {
    const item = this.itens.find(i => i.id === id)
    if (item) item.qtd++
  },

  diminuir(id) {
    const item = this.itens.find(i => i.id === id)
    if (!item) return
    item.qtd--
    if (item.qtd <= 0) this.remover(id)
  },

  remover(id) {
    this.itens = this.itens.filter(i => i.id !== id)
  },

  limpar() {
    this.itens = []
  },

  // ── Cálculos ──────────────────────────────────────────────

  total() {
    return this.itens.reduce((t, i) => t + i.preco * i.qtd, 0)
  },

  subtotal() {
    return this.total()
  },

  quantidadeTotal() {
    return this.itens.reduce((t, i) => t + i.qtd, 0)
  },

  descontoPix() {
    return this.total() * 0.05
  },

  /**
   * @param {object|null} cupomAplicado  - objeto retornado por validarCupom(), ou null
   */
  descontoCupom(cupomAplicado) {
    if (!cupomAplicado || typeof cupomAplicado !== 'object') return 0
    if (cupomAplicado.tipo === 'percentual') return this.total() * cupomAplicado.desconto
    return 0
  },

  /**
   * @param {number}      frete          - valor padrão do frete
   * @param {object|null} cupomAplicado  - objeto do cupom, ou null
   */
  freteCalculado(frete = 8.90, cupomAplicado = null) {
    if (cupomAplicado?.tipo === 'frete') return 0
    return this.total() >= 150 ? 0 : frete
  },

  /**
   * Quanto de desconto os pontos resgatados representam em R$.
   * Regra: 100 pontos = R$ 10,00 (ou seja, 1 ponto = R$ 0,10).
   * @param {number} pontosResgatados
   */
  descontoPontos(pontosResgatados = 0) {
    return (pontosResgatados || 0) * 0.10
  },

  /**
   * @param {number}      frete
   * @param {object|null} cupomAplicado
   * @param {boolean}     usarPix
   * @param {number}      pontosResgatados
   */
  totalFinal(frete = 8.90, cupomAplicado = null, usarPix = false, pontosResgatados = 0) {
    const totalComDescontos = (
      this.total()
      + this.freteCalculado(frete, cupomAplicado)
      - (usarPix ? this.descontoPix() : 0)
      - this.descontoCupom(cupomAplicado)
      - this.descontoPontos(pontosResgatados)
    )
    // nunca deixa o total ficar negativo
    return Math.max(totalComDescontos, 0)
  },

  // ── Cupons ────────────────────────────────────────────────

  /**
   * Retorna o objeto do cupom se válido, ou null.
   * Sempre use o retorno para guardar em cupomAplicado.
   */
  validarCupom(codigo) {
    if (!codigo) return null
    return CUPONS[codigo.trim().toUpperCase()] || null
  },

  // ── Helpers ───────────────────────────────────────────────

  isEmpty() {
    return this.itens.length === 0
  },

  contemProduto(id) {
    return this.itens.some(i => i.id === id)
  },

  quantidadeProduto(id) {
    const item = this.itens.find(i => i.id === id)
    return item ? item.qtd : 0
  },

  // ── Pontos de fidelidade VIP ─────────────────────────────────

  /**
   * Busca o saldo de pontos de um email na lista VIP.
   * Retorna 0 se o email não estiver cadastrado ainda.
   * @param {string} email
   */
  async buscarPontos(email) {
    if (!email) return 0
    const { data, error } = await supabase
      .from('vip_emails')
      .select('pontos')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar pontos VIP:', error)
      return 0
    }
    return data?.pontos ?? 0
  },

  /**
   * Resgata pontos do saldo do email (ex: ao aplicar desconto no checkout).
   * Retorna { sucesso, novoSaldo, mensagem }.
   * @param {string} email
   * @param {number} pontos
   */
  async resgatarPontos(email, pontos) {
    if (!email || !pontos || pontos <= 0) {
      return { sucesso: false, novoSaldo: 0, mensagem: 'Dados inválidos para resgate.' }
    }
    const { data, error } = await supabase.rpc('resgatar_pontos_vip', {
      p_email: email.trim().toLowerCase(),
      p_pontos: Math.floor(pontos),
    })

    if (error) {
      console.error('Erro ao resgatar pontos VIP:', error)
      return { sucesso: false, novoSaldo: 0, mensagem: 'Erro ao resgatar pontos.' }
    }

    const linha = data?.[0]
    return {
      sucesso: !!linha?.sucesso,
      novoSaldo: linha?.novo_total_pontos ?? 0,
      mensagem: linha?.mensagem ?? '',
    }
  },

  /**
   * Finaliza a compra: registra pontos ganhos (1 ponto por R$1 gasto)
   * vinculados ao email informado, e limpa o carrinho.
   * Use isso no passo final do checkout, depois do pagamento confirmado.
   *
   * @param {string} email             - email do cliente (mesmo da lista VIP)
   * @param {number} valorPagoFinal    - valor final realmente cobrado (já com descontos)
   * @returns {Promise<{sucesso: boolean, pontosGanhos: number, novoSaldo: number}>}
   */
  async finalizarCompra(email, valorPagoFinal) {
    if (!email) {
      return { sucesso: false, pontosGanhos: 0, novoSaldo: 0, mensagem: 'Email não informado.' }
    }

    const pontosGanhos = Math.floor(valorPagoFinal || 0) // 1 ponto por R$1

    const { data, error } = await supabase.rpc('somar_pontos_vip', {
      p_email: email.trim().toLowerCase(),
      p_pontos: pontosGanhos,
      p_tipo: 'compra',
      p_valor_reais: valorPagoFinal,
      p_detalhe: `Compra de ${this.quantidadeTotal()} item(ns)`,
    })

    if (error) {
      console.error('Erro ao registrar pontos da compra:', error)
      return { sucesso: false, pontosGanhos: 0, novoSaldo: 0, mensagem: 'Erro ao registrar pontos.' }
    }

    const novoSaldo = data?.[0]?.novo_total_pontos ?? 0
    this.limpar()

    return { sucesso: true, pontosGanhos, novoSaldo }
  },
})