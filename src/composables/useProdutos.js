import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

export function useProdutos() {
  const produtos   = ref([])
  const carregando = ref(true)
  const erro       = ref(null)

  async function buscarProdutos() {
    carregando.value = true
    erro.value = null
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, descricao, beneficios, preco, original, img, promo, mais_vendido, qtd_estoque, ativo, destaque, estoque, criado_em')
        .eq('ativo', true)
        .order('criado_em', { ascending: false })

      if (error) throw error

      produtos.value = (data || []).map(p => ({
        ...p,
        // aliases para compatibilidade com LojaView e carrinho
        imagem:   p.img || '',
        preco:    Number(p.preco),
        original: p.original ? Number(p.original) : null,
        novo:     p.destaque || false,
        estoque:  p.estoque ?? p.qtd_estoque ?? 0,
      }))
    } catch (e) {
      erro.value = e.message
      console.error('Erro ao buscar produtos:', e)
    } finally {
      carregando.value = false
    }
  }

  onMounted(buscarProdutos)

  return { produtos, carregando, erro, buscarProdutos }
}