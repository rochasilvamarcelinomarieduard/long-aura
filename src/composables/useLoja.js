import { ref } from 'vue'
import { supabase } from '@/supabase.js'

// ─────────────────────────────────────────────────────────
// useLoja — composable principal da loja
// Compatível com Vue puro (sem Nuxt)
// Tabelas reais: produtos, itens_pedido, pedidos
// ─────────────────────────────────────────────────────────

export function useLoja() {

  // ══════════════════════════════════════════════════════
  // PRODUTOS
  // ══════════════════════════════════════════════════════

  /** Lista todos os produtos ativos */
  const listarProdutos = async (filtros = {}) => {
    let query = supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (filtros.categoria)           query = query.eq('tímpano', filtros.categoria)
    if (filtros.promocao !== undefined) query = query.eq('promoção', filtros.promocao)
    if (filtros.destaque !== undefined) query = query.eq('destaque', filtros.destaque)
    if (filtros.novo !== undefined)     query = query.eq('novo', filtros.novo)

    const { data, error } = await query
    if (error) throw error
    return data
  }

  /** Busca um produto pelo ID */
  const buscarProduto = async (id) => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('eu ia', id)
      .single()

    if (error) throw error
    return data
  }

  /** Lista categorias únicas (coluna tímpano) */
  const listarCategorias = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('tímpano')
      .eq('ativo', true)

    if (error) throw error
    return [...new Set(data.map(p => p['tímpano']).filter(Boolean))]
  }

  // ══════════════════════════════════════════════════════
  // PEDIDOS
  // ══════════════════════════════════════════════════════

  /** Lista pedidos do usuário */
  const listarPedidos = async (userId) => {
    if (!userId) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens_pedido (*)
      `)
      .eq('ID do usuário', userId)
      .order('número', { ascending: false })

    if (error) throw error
    return data
  }

  /** Busca um pedido específico pelo ID */
  const buscarPedido = async (id) => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        itens_pedido (*)
      `)
      .eq('eu ia', id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Cria um pedido com seus itens de uma vez.
   *
   * @param {object} params
   * @param {string} params.userId
   * @param {string} params.endereco
   * @param {number} params.latDestino
   * @param {number} params.lngDestino
   * @param {string} [params.pagamento]   - ex: 'pix', 'cartão'
   * @param {number} [params.desconto]    - valor fixo de desconto
   * @param {Array}  params.itens         - [{ nome, detalhe, preco, imagemUrl, produtoId }]
   */
  const criarPedido = async (params) => {
    if (!params.userId) throw new Error('Usuário não autenticado')
    if (!params.itens || params.itens.length === 0) throw new Error('Nenhum item no pedido')

    // 1. Cria o pedido
    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        'ID do usuário': params.userId,
        status:          'pendente',
        etapa_ativa:     1,
        endereco:        params.endereco,
        lat_destino:     params.latDestino,
        lng_destino:     params.lngDestino,
        pagamento:       params.pagamento ?? null,
        desconto:        params.desconto  ?? 0,
      })
      .select()
      .single()

    if (errPedido) throw errPedido

    // 2. Insere os itens
    const itensPedido = params.itens.map(item => ({
      pedido_id:    pedido['eu ia'],
      produto_id:   item.produtoId ?? null,
      nome:         item.nome,
      detalhe:      item.detalhe ?? null,
      'preço':      item.preco,
      url_da_imagem: item.imagemUrl ?? null,
    }))

    const { error: errItens } = await supabase
      .from('itens_pedido')
      .insert(itensPedido)

    if (errItens) throw errItens

    return pedido
  }

  /** Atualiza status/etapa de um pedido */
  const atualizarPedido = async (id, campos) => {
    const { data, error } = await supabase
      .from('pedidos')
      .update(campos)
      .eq('eu ia', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ══════════════════════════════════════════════════════
  return {
    // Produtos
    listarProdutos,
    buscarProduto,
    listarCategorias,

    // Pedidos
    listarPedidos,
    buscarPedido,
    criarPedido,
    atualizarPedido,
  }
}