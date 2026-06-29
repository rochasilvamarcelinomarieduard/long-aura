// Promoção ativa todo dia 30 do mês
const hoje = new Date()
const isDia30 = hoje.getDate() === 30

export const produtos = [

  /* ================= SKINCARE ================= */

  {
    id: 1,
    nome: "Sérum Vitamina C Glow",
    preco: isDia30 ? 62.90 : 89.90,
    original: isDia30 ? 89.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/serum-vitamina-c.jpg",
    descricao: "Hidrata e ilumina a pele com vitamina C pura.",
    beneficios: "Antioxidante, anti manchas e uniformizador do tom.",
    uso: "Aplicar pela manhã antes do protetor solar."
  },

  {
    id: 2,
    nome: "Hidratante Facial Hyaluronic",
    preco: isDia30 ? 48.90 : 69.90,
    original: isDia30 ? 69.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/Hidratantefacial.jpg",
    descricao: "Hidratação profunda com ácido hialurônico de alta concentração.",
    beneficios: "Preenche linhas finas e devolve luminosidade.",
    uso: "Usar após limpeza, manhã e noite."
  },

  {
    id: 3,
    nome: "Geleia de Limpeza Facial",
    preco: 49.90,
    original: null,
    promo: false,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/GeleiaDeLimpesa.jpg",
    descricao: "Remove impurezas sem ressecar a pele.",
    beneficios: "Controle de oleosidade e poros limpos.",
    uso: "Usar manhã e noite com água morna."
  },

  {
    id: 4,
    nome: "Protetor Solar FPS60",
    preco: isDia30 ? 55.90 : 79.90,
    original: isDia30 ? 79.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/protetor solar rosa pastel.png",
    descricao: "Proteção diária contra raios UVA e UVB.",
    beneficios: "Toque seco, base para maquiagem e sem oleosidade.",
    uso: "Aplicar 20 min antes de se expor ao sol."
  },

  {
    id: 5,
    nome: "Creme Anti-Idade Repair",
    preco: 119.90,
    original: 159.90,
    promo: true,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/cremeantiidade.png",
    descricao: "Tecnologia anti-idade com retinol e colágeno marinho.",
    beneficios: "Reduz rugas profundas e devolve firmeza à pele.",
    uso: "Uso noturno após higienização."
  },

  {
    id: 6,
    nome: "Bruma Removedora De Impurezas Facial",
    preco: 59.90,
    original: null,
    promo: false,
    novo: true,
    categoria: "skincare",
    img: "/src/assets/produtos/splaybrilho.jpg",
    descricao: "Limpeza profunda com ação desobstruidora de poros.",
    beneficios: "Remove cravos e impurezas visíveis.",
    uso: "Aplicar 2x por semana com massagem circular."
  },

  {
    id: 7,
    nome: "Hidratante Corporal",
    preco: isDia30 ? 38.90 : 55.90,
    original: isDia30 ? 55.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "skincare",
    img: "/src/assets/produtos/hidratante12.jpg",
    descricao: "Textura sedosa com brilho sofisticado e perfume exclusivo.",
    beneficios: "Hidratação intensa por até 24h.",
    uso: "Passar em todo o corpo após o banho."
  },

  /* ================= CUIDADOS ================= */

  {
    id: 8,
    nome: "Óleo Corporal",
    preco: 32.90,
    original: 49.90,
    promo: true,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/oleoCorporal.jpg",
    descricao: "Óleo seco de absorção rápida com brilho acetinado.",
    beneficios: "Nutre, hidrata e deixa a pele sedosa.",
    uso: "Aplicar no corpo massageando até absorver."
  },

  {
    id: 9,
    nome: "Kit Blush",
    preco: isDia30 ? 39.90 : 59.90,
    original: isDia30 ? 59.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado1.png",
    descricao: "Blush em pó com pigmentação intensa e acabamento natural.",
    beneficios: "À prova d'água e longa duração.",
    uso: "Aplicar nas maçãs do rosto com pincel."
  },

  {
    id: 10,
    nome: "Kit Viagem Hidratação",
    preco: 45.90,
    original: null,
    promo: false,
    novo: true,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado2.jpg",
    descricao: "Kit completo de hidratação em versão travel size.",
    beneficios: "Prático, leve e aprovado em aviões.",
    uso: "Aplicar conforme cada produto do kit."
  },

  {
    id: 11,
    nome: "Kit Hialurônico",
    preco: 70.00,
    original: 99.90,
    promo: true,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado3.jpg",
    descricao: "Dupla de hidratação com sérum e creme de ácido hialurônico.",
    beneficios: "Hidratação profunda e limpeza suave da pele.",
    uso: "Aplicar sérum primeiro, depois o creme."
  },

  {
    id: 12,
    nome: "Kit de Limpeza Facial",
    preco: 80.00,
    original: null,
    promo: false,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado4.jpg",
    descricao: "Kit completo para rotina de limpeza facial diária.",
    beneficios: "Pele limpa, suave e sem resíduos.",
    uso: "Seguir a rotina manhã e noite."
  },

  {
    id: 13,
    nome: "Kit Beleza",
    preco: isDia30 ? 19.90 : 29.90,
    original: isDia30 ? 29.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado5.jpg",
    descricao: "Kit de maquiagem essencial para o dia a dia.",
    beneficios: "À prova d'água e fácil de aplicar.",
    uso: "Aplicação rápida para looks naturais."
  },

  {
    id: 14,
    nome: "Kit Vitaminas",
    preco: 99.90,
    original: 139.90,
    promo: true,
    novo: false,
    categoria: "cuidados",
    img: "/src/assets/produtos/cuidado6.jpg",
    descricao: "Complexo vitamínico para pele radiante e nutrida.",
    beneficios: "Hidrata, ilumina e protege a pele.",
    uso: "Aplicar à noite como último passo da rotina."
  },

  /* ================= CABELO ================= */

  {
    id: 15,
    nome: "Máscara Intensa",
    preco: isDia30 ? 32.90 : 49.90,
    original: isDia30 ? 49.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/mascaraintensa.jpg",
    descricao: "Máscara de volume e nutrição com proteínas da seda.",
    beneficios: "Volume intenso e alongamento dos fios.",
    uso: "Aplicar nos fios após shampoo, aguardar 10 min."
  },

  {
    id: 16,
    nome: "Óleo Intenso Repara os Fios",
    preco: 89.90,
    original: 119.90,
    promo: true,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/oleointenso.jpg",
    descricao: "Óleo de argan e queratina para fios danificados.",
    beneficios: "Nutre, repara e sela as cutículas.",
    uso: "Aplicar nas pontas dos fios úmidos ou secos."
  },

  {
    id: 17,
    nome: "Protetor Térmico",
    preco: 74.90,
    original: null,
    promo: false,
    novo: true,
    categoria: "cabelo",
    img: "/src/assets/produtos/protetortermico.jpg",
    descricao: "Proteção até 230°C contra chapinha e babyliss.",
    beneficios: "72h de efeito e brilho espelhado.",
    uso: "Aplicar nos fios antes de usar calor."
  },

  {
    id: 18,
    nome: "Shampoo Hidratante Repair",
    preco: isDia30 ? 34.90 : 49.90,
    original: isDia30 ? 49.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/blue.png",
    descricao: "Shampoo com queratina e pantenol para cabelos secos.",
    beneficios: "Limpeza nutritiva com brilho intenso.",
    uso: "Aplicar no couro cabeludo, massagear e enxaguar."
  },

  {
    id: 19,
    nome: "Máscara Capilar Reconstrução",
    preco: 69.90,
    original: 89.90,
    promo: true,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/mascara2.jpg",
    descricao: "Reconstrução intensa para fios extremamente danificados.",
    beneficios: "Devolve força, brilho e elasticidade.",
    uso: "Aplicar 1x por semana por 20 minutos."
  },

  {
    id: 20,
    nome: "Óleo Capilar Argan",
    preco: 59.90,
    original: null,
    promo: false,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/oleo0.jpg",
    descricao: "100% óleo de argan marroquino puro.",
    beneficios: "Nutrição profunda, anti frizz e brilho.",
    uso: "Aplicar nas pontas secas ou úmidas."
  },

  {
    id: 21,
    nome: "Tônico Shampoo Crescimento Capilar",
    preco: isDia30 ? 54.90 : 79.90,
    original: isDia30 ? 79.90 : null,
    promo: isDia30,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/shampoo.jpg",
    descricao: "Fórmula com biotina e zinco para estimular o crescimento.",
    beneficios: "Estimula crescimento e fortalece a raiz.",
    uso: "Aplicar no couro cabeludo com massagem."
  },

  {
    id: 22,
    nome: "Shampoo Natural",
    preco: 69.90,
    original: 89.90,
    promo: true,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/shampoo2.png",
    descricao: "Fórmula vegana com extrato de aloe vera e camomila.",
    beneficios: "Limpeza profunda e anti oleosidade.",
    uso: "Aplicar no couro cabeludo, massagear e enxaguar."
  },

  {
    id: 23,
    nome: "Kit Natural",
    preco: isDia30 ? 62.90 : 89.90,
    original: isDia30 ? 89.90 : null,
    promo: isDia30,
    novo: true,
    categoria: "cabelo",
    img: "/src/assets/produtos/kitnatural.png",
    descricao: "Kit vegano completo com shampoo, condicionador e máscara.",
    beneficios: "Limpeza profunda e controle de oleosidade.",
    uso: "Seguir a sequência do kit."
  },

  {
    id: 24,
    nome: "Hidratação Natural",
    preco: 89.90,
    original: 119.90,
    promo: true,
    novo: false,
    categoria: "cabelo",
    img: "/src/assets/produtos/hidrataçaonatural.png",
    descricao: "Tratamento intensivo com manteiga de karité e coco.",
    beneficios: "Cabelo brilhoso, macio e com iluminosidade.",
    uso: "Aplicar no comprimento, aguardar 15 min e enxaguar."
  },

]