import { ref, watch, onUnmounted } from 'vue'
import { supabase } from '@/supabase.js'

export function usePedido(userId) {
  const pedido     = ref(null)
  const carregando = ref(false)
  const erro       = ref(false)

  let channel = null

  async function buscarPedidoAtivo() {
    if (!userId.value) return

    carregando.value = true
    erro.value       = false

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          user_id,
          numero,
          status,
          etapa_ativa,
          codigo_rastreio,
          tipo_entrega,
          codigo_rastreio_correios,
          previsao_entrega,
          pagamento,
          desconto_pct,
          desconto,
          endereco_entrega,
          total,
          pix_payload,
          lat_origem,
          lng_origem,
          lat_destino,
          lng_destino,
          lat_entregador,
          lng_entregador,
          criado_em,
          itens_pedido (
            id,
            pedido_id,
            nome,
            detalhe,
            preco,
            imagem_url,
            criado_em
          )
        `)
        .eq('user_id', userId.value)
        .neq('status', 'entregue')
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        pedido.value = null
        return
      }

      pedido.value = {
        numero:                  data.numero,
        previsaoEntrega:         data.previsao_entrega,
        etapaAtiva:              data.etapa_ativa ?? 0,
        pagamento:               data.pagamento,
        desconto:                data.desconto,
        endereco:                data.endereco_entrega,
        total:                   formatarMoeda(data.total),
        codigoRastreio:          data.codigo_rastreio,
        tipoEntrega:             data.tipo_entrega || 'proprio',
        codigoRastreioCorreios:  data.codigo_rastreio_correios || null,
        pixPayload:              data.pix_payload,
        itens: (data.itens_pedido ?? []).map(i => ({
          id:        i.id,
          nome:      i.nome,
          detalhe:   i.detalhe,
          preco:     formatarMoeda(i.preco),
          imagemUrl: i.imagem_url,
        })),
        mapa: {
          origem:     data.lat_origem
            ? { lat: data.lat_origem, lng: data.lng_origem }
            : null,
          destino:    data.lat_destino
            ? { lat: data.lat_destino, lng: data.lng_destino }
            : null,
          entregador: data.lat_entregador
            ? { lat: data.lat_entregador, lng: data.lng_entregador }
            : null,
        },
      }
    } catch (e) {
      console.error('[usePedido] Erro ao buscar pedido:', e)
      erro.value = true
    } finally {
      carregando.value = false
    }
  }

  function iniciarRealtime(id) {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }

    channel = supabase
      .channel(`pedido-realtime-${id}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'pedidos',
          filter: `user_id=eq.${id}`,
        },
        () => buscarPedidoAtivo()
      )
      .subscribe()
  }

  watch(userId, (id) => {
    if (!id) return
    buscarPedidoAtivo()
    iniciarRealtime(id)
  }, { immediate: true })

  onUnmounted(() => {
    if (channel) supabase.removeChannel(channel)
  })

  return { pedido, carregando, erro, buscarPedidoAtivo }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}