/* ============================================================================
   BARBEARIA RICKGINO · DADOS DO SITE
   ============================================================================
   Este ficheiro contém TODAS as informações editáveis do site
   (serviços, barbeiros, horários, contacto).

   COMO EDITAR:
   1. Serviços  -> altera o array SERVICES abaixo (nome, descrição, duração, preço).
   2. Barbeiros -> altera o array BARBERS (nome, especialidade, descrição, foto).
   3. Horário de funcionamento -> altera BOOKING.OPENING_HOURS.
   4. Para ligar a uma base de dados (Supabase) -> ver BOOKING_API / SUPABASE no
      fim do ficheiro assets/js/booking.js.

   VALORES "—" (traço) = informação ainda não confirmada. O site mostra-a de
   forma neutra, sem inventar dados.
   ============================================================================ */

window.SITE = window.SITE || {};

/* ---------------------------------------------------------------------------
   CONTACTO
--------------------------------------------------------------------------- */
window.SITE.CONTACT = {
  name: "Barbearia RickGino",
  address: "R. Dr. António Manuel Gamito 2, 2900-481 Setúbal",
  phoneDisplay: "934 892 154",
  phoneTel: "+351934892154",
  instagramUrl: "https://www.instagram.com/barbearia_rickgino/",
  instagramHandle: "@barbearia_rickgino",
  googleMapsEmbed:
    "https://www.google.com/maps?q=R.%20Dr.%20Ant%C3%B3nio%20Manuel%20Gamito%202%2C%202900-481%20Set%C3%BAbal&output=embed",
  googleRating: "4,8",
  googleReviewsCount: "mais de 60",
};

/* ---------------------------------------------------------------------------
   SERVIÇOS
   ---------------------------------------------------------------------------
   Cada serviço:
   - id:         identificador único
   - name:       nome do serviço
   - description:breve descrição
   - duration:   duração estimada (ex.: "45 min"). Use "—" se não confirmado.
   - price:      preço (ex.: "18 €"). Use "—" se não confirmado.
   - image:      caminho da imagem do card
--------------------------------------------------------------------------- */
window.SITE.SERVICES = [
  {
    id: "corte",
    name: "Corte de Cabelo",
    description:
      "Corte personalizado, adaptado ao teu estilo e formato de rosto, com acabamento rigoroso.",
    duration: "—",
    price: "—",
    image: "assets/images/service-corte.jpg",
  },
  {
    id: "barba",
    name: "Barba",
    description:
      "Desenho, aparo e cuidado completo da barba com toalha quente e produtos de qualidade.",
    duration: "—",
    price: "—",
    image: "assets/images/service-barba.jpg",
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description:
      "O tratamento completo: corte de cabelo e barba em harmonia, para um visual impecável.",
    duration: "—",
    price: "—",
    image: "assets/images/service-pacote.jpg",
  },
  {
    id: "grooming",
    name: "Grooming & Acabamentos",
    description:
      "Ritual de cuidados: lavagem, hidratação, acabamentos e pormenores de imagem.",
    duration: "—",
    price: "—",
    image: "assets/images/service-corte.jpg",
  },
  {
    id: "kids",
    name: "Corte Infantil",
    description:
      "Cortes para os mais novos, com paciência, simpatia e toda a atenção que merecem.",
    duration: "—",
    price: "—",
    image: "assets/images/service-barba.jpg",
  },
  {
    id: "premium",
    name: "Pacote Premium",
    description:
      "A experiência completa RickGino: tudo o que precisas, tratado ao pormenor.",
    duration: "—",
    price: "—",
    image: "assets/images/service-pacote.jpg",
  },
];

/* ---------------------------------------------------------------------------
   BARBEIROS
   ---------------------------------------------------------------------------
   Cada barbeiro:
   - name:       nome (use "" para mostrar "A anunciar")
   - specialty:  especialidade (use "" para mostrar "A definir")
   - description:pequena descrição (use "" para mostrar texto neutro)
   - image:      caminho da foto (use "" para mostrar placeholder elegante)
--------------------------------------------------------------------------- */
window.SITE.BARBERS = [
  {
    id: "barber-1",
    name: "",
    specialty: "",
    description: "",
    image: "",
  },
  {
    id: "barber-2",
    name: "",
    specialty: "",
    description: "",
    image: "",
  },
  {
    id: "barber-3",
    name: "",
    specialty: "",
    description: "",
    image: "",
  },
];

/* ---------------------------------------------------------------------------
   MARCAÇÃO ONLINE
--------------------------------------------------------------------------- */
window.SITE.BOOKING = {
  /* Horário de funcionamento usado para gerar os horários disponíveis.
     EDITAR conforme o horário real da barbearia. (formato 24h) */
  OPENING_HOURS: {
    start: "09:00",
    end: "19:00",
    stepMinutes: 45,
  },

  /* Dias da semana em que a barbearia está aberta. 0 = Domingo, 6 = Sábado.
     Ex.: abrir de Segunda a Sábado -> [1,2,3,4,5,6] */
  OPEN_DAYS: [1, 2, 3, 4, 5, 6],

  /* Quantos dias no futuro o cliente pode marcar. */
  MAX_BOOKING_DAYS: 14,

  /* Local onde as marcações ficam guardadas enquanto não existe base de dados.
     Valores possíveis:
     - "local"    : guarda no browser (localStorage). Indicado para fase inicial.
     - "supabase" : liga à base de dados Supabase (ver SUPABASE_* no booking.js). */
  STORAGE_MODE: "local",

  /* Formato da referência da marcação. */
  REFERENCE_PREFIX: "RG",
};
