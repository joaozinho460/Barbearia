/* ============================================================================
   BARBEARIA RICKGINO · MOTOR DE MARCAÇÃO ONLINE
   ============================================================================
   Fluxo: Serviço -> Barbeiro -> Data & Hora -> Dados -> Confirmação.

   ARQUITETURA PARA BASE DE DADOS (Supabase)
   -----------------------------------------
   Toda a persistência passa pela camada "BookingAPI" (no fim deste ficheiro).
   Hoje usa localStorage, mas está pronta para ligar ao Supabase:

   1. Instalar:  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   2. Em data.js, mudar SITE.BOOKING.STORAGE_MODE = "supabase".
   3. Preencher SUPABASE_URL / SUPABASE_ANON_KEY abaixo.
   4. Implementar SUPABASE_PROVIDER.save() / .getBookings() com a tabela
      "bookings" (id, service_id, barber_id, date, time, name, phone, status,
      created_at). A coluna única (barber_id, date, time) impede marcações
      duplicadas.

   O resto do site não precisa de mudanças.
   ============================================================================ */

(function () {
  "use strict";

  const BOOKING_KEY = "rickgino.bookings.v1";

  /* ---------------- estado do formulário ---------------- */
  const state = {
    step: 1,
    serviceId: null,
    barberId: null, // null = sem preferência
    date: null, // "YYYY-MM-DD"
    time: null, // "HH:MM"
    name: "",
    phone: "",
  };

  let bookings = loadLocalBookings();

  /* =====================================================
     UTILITÁRIOS
     ===================================================== */
  function loadLocalBookings() {
    try {
      const raw = localStorage.getItem(BOOKING_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalBookings() {
    try {
      localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
    } catch (e) {
      /* localStorage indisponível — as marcações ficam só em memória */
    }
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toISODate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  const PT_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const PT_DAYS_FULL = [
    "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
  ];
  const PT_MONTHS = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  function formatDateLong(iso) {
    const d = new Date(iso + "T00:00:00");
    return (
      PT_DAYS_FULL[d.getDay()] +
      ", " +
      d.getDate() +
      " de " +
      PT_MONTHS[d.getMonth()]
    );
  }

  function parsePhone(raw) {
    return String(raw || "").replace(/[\s.\-()]/g, "");
  }

  function isValidPhone(raw) {
    const p = parsePhone(raw);
    return /^(\+351)?9\d{8}$/.test(p);
  }

  function makeReference() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return (window.SITE.BOOKING.REFERENCE_PREFIX || "RG") + "-" + t + r;
  }

  /* =====================================================
     GERAÇÃO DE DIAS / HORAS
     ===================================================== */
  function getAvailableDates() {
    const cfg = window.SITE.BOOKING;
    const now = new Date();
    const dates = [];
    for (let i = 1; i <= cfg.MAX_BOOKING_DAYS; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      if (cfg.OPEN_DAYS.includes(d.getDay())) {
        dates.push({ iso: toISODate(d), day: PT_DAYS[d.getDay()], num: d.getDate() });
      }
    }
    return dates;
  }

  function buildTimeSlots() {
    const cfg = window.SITE.BOOKING;
    const [sh, sm] = cfg.OPENING_HOURS.start.split(":").map(Number);
    const [eh, em] = cfg.OPENING_HOURS.end.split(":").map(Number);
    const step = cfg.OPENING_HOURS.stepMinutes;
    const slots = [];
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    while (cur + step <= end) {
      slots.push(pad(Math.floor(cur / 60)) + ":" + pad(cur % 60));
      cur += step;
    }
    return slots;
  }

  /* Uma hora está ocupada se, para a (data, barbeiro) escolhidos, já existe
     uma marcação. Se não há preferência de barbeiro, só fica ocupada quando
     TODOS os barbeiros estão ocupados nessa hora. */
  function isSlotBooked(dateIso, time) {
    const sameDateTime = bookings.filter(
      (b) => b.date === dateIso && b.time === time
    );
    if (sameDateTime.length === 0) return false;

    if (state.barberId) {
      return sameDateTime.some((b) => b.barberId === state.barberId);
    }

    const totalBarbers = window.SITE.BARBERS.length || 1;
    return sameDateTime.length >= totalBarbers;
  }

  function getOpenSlots(dateIso) {
    return buildTimeSlots().filter((t) => !isSlotBooked(dateIso, t));
  }

  /* =====================================================
     RENDER · SERVICOS E BARBEIROS
     ===================================================== */
  function renderServicePicker() {
    const wrap = document.getElementById("servicePicker");
    if (!wrap) return;
    wrap.innerHTML = "";
    window.SITE.SERVICES.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "service-option" + (state.serviceId === s.id ? " is-selected" : "");
      btn.dataset.id = s.id;
      btn.innerHTML =
        '<span class="service-option-img"><img src="' +
        s.image +
        '" alt="" loading="lazy" /></span>' +
        '<span class="service-option-body">' +
        '<strong>' + escapeHtml(s.name) + "</strong>" +
        '<small>' +
        (s.duration && s.duration !== "—"
          ? '<span class="meta-duration">&#9201; ' + escapeHtml(s.duration) + "</span>"
          : "") +
        (s.price && s.price !== "—"
          ? '<span class="meta-price">' + escapeHtml(s.price) + "</span>"
          : '<span class="meta-price meta-unknown">preço a confirmar</span>') +
        "</small>" +
        "</span>" +
        '<span class="service-option-check">&#10003;</span>';
      btn.addEventListener("click", () => {
        state.serviceId = s.id;
        renderServicePicker();
        selectBarberStep();
      });
      wrap.appendChild(btn);
    });
  }

  function renderBarberPicker() {
    const wrap = document.getElementById("barberPicker");
    if (!wrap) return;
    wrap.innerHTML = "";

    const any = document.createElement("button");
    any.type = "button";
    any.className = "barber-option" + (state.barberId === null ? " is-selected" : "");
    any.innerHTML =
      '<span class="barber-avatar">&#8226;&#8226;&#8226;</span>' +
      '<strong>Sem preferência</strong>' +
      "<small>Indisponibilidade do 1º barbeiro é gerida automaticamente</small>";
    any.addEventListener("click", () => {
      state.barberId = null;
      renderBarberPicker();
      next();
    });
    wrap.appendChild(any);

    window.SITE.BARBERS.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "barber-option" + (state.barberId === b.id ? " is-selected" : "");
      btn.innerHTML =
        '<span class="barber-avatar">' +
        (b.image
          ? '<img src="' + b.image + '" alt="" loading="lazy" />'
          : "&#9997;") +
        "</span>" +
        "<strong>" + (b.name || "A anunciar") + "</strong>" +
        "<small>" + (b.specialty || "Barbeiro profissional") + "</small>";
      btn.addEventListener("click", () => {
        state.barberId = b.id;
        renderBarberPicker();
        next();
      });
      wrap.appendChild(btn);
    });
  }

  /* =====================================================
     RENDER · DATAS E HORAS
     ===================================================== */
  function renderDateSlots() {
    const wrap = document.getElementById("dateSlots");
    if (!wrap) return;
    wrap.innerHTML = "";
    const dates = getAvailableDates();
    dates.forEach((d) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "date-option" + (state.date === d.iso ? " is-selected" : "");
      btn.dataset.iso = d.iso;
      btn.innerHTML = "<small>" + d.day + "</small><strong>" + d.num + "</strong>";
      btn.addEventListener("click", () => {
        state.date = d.iso;
        state.time = null;
        renderDateSlots();
        renderTimeSlots();
      });
      wrap.appendChild(btn);
    });
  }

  function renderTimeSlots() {
    const wrap = document.getElementById("timeSlots");
    const hint = document.getElementById("slotHint");
    if (!wrap) return;

    wrap.innerHTML = "";
    if (!state.date) {
      hint.textContent = "Seleciona uma data para ver os horários disponíveis.";
      hint.hidden = false;
      return;
    }

    const slots = getOpenSlots(state.date);
    if (slots.length === 0) {
      hint.textContent =
        "Nenhum horário disponível neste dia. Escolhe outra data.";
      hint.hidden = false;
      return;
    }

    hint.hidden = true;
    slots.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time-option" + (state.time === t ? " is-selected" : "");
      btn.textContent = t;
      btn.addEventListener("click", () => {
        state.time = t;
        renderTimeSlots();
      });
      wrap.appendChild(btn);
    });
  }

  /* =====================================================
     RENDER · SUMÁRIO E SUCESSO
     ===================================================== */
  function getService(id) {
    return window.SITE.SERVICES.find((s) => s.id === id) || null;
  }

  function getBarber(id) {
    return window.SITE.BARBERS.find((b) => b.id === id) || null;
  }

  function renderSummary() {
    const wrap = document.getElementById("bookingSummary");
    if (!wrap) return;
    const svc = getService(state.serviceId);
    const barb = state.barberId ? getBarber(state.barberId) : null;

    wrap.innerHTML =
      row("Serviço", svc ? svc.name : "—") +
      row("Barbeiro", barb ? barb.name || "A anunciar" : "Sem preferência") +
      row("Data", state.date ? formatDateLong(state.date) : "—") +
      row("Hora", state.time || "—") +
      row("Nome", state.name) +
      row("Telemóvel", state.phone);

    function row(label, value) {
      return (
        '<div class="summary-row"><span>' +
        escapeHtml(label) +
        '</span><strong>' +
        escapeHtml(value) +
        "</strong></div>"
      );
    }
  }

  function showSuccess() {
    document.getElementById("successName").textContent = state.name.split(" ")[0];
    const ref = makeReference();
    document.getElementById("successRef").textContent = ref;
    const svc = getService(state.serviceId);
    const barb = state.barberId ? getBarber(state.barberId) : null;
    document.getElementById("successDetails").innerHTML =
      row(svc ? svc.name : "—") +
      row(barb ? barb.name || "A anunciar" : "Sem preferência") +
      row(formatDateLong(state.date)) +
      row(state.time);
    function row(text) {
      return "<span>" + escapeHtml(text) + "</span>";
    }
    return ref;
  }

  /* =====================================================
     NAVEGAÇÃO ENTRE PASSOS
     ===================================================== */
  const $ = (id) => document.getElementById(id);

  function currentStepValid() {
    switch (state.step) {
      case 1:
        return !!state.serviceId;
      case 2:
        return true; // "sem preferência" é válido
      case 3:
        return !!(state.date && state.time);
      case 4:
        return validateStep4();
      case 5:
        return true;
      default:
        return false;
    }
  }

  function validateStep4() {
    const nameOk = state.name.trim().length >= 2;
    const phoneOk = isValidPhone(state.phone);
    setFieldError("name", !nameOk);
    setFieldError("phone", !phoneOk);
    return nameOk && phoneOk;
  }

  function setFieldError(name, show) {
    const input = document.getElementById("bk" + name.charAt(0).toUpperCase() + name.slice(1));
    const err = document.querySelector('.field-error[data-for="' + name + '"]');
    if (input) input.classList.toggle("is-invalid", show);
    if (err) err.hidden = !show;
  }

  function goToStep(n) {
    state.step = n;
    const steps = document.querySelectorAll(".booking-step");
    steps.forEach((s) => {
      s.classList.toggle("is-active", Number(s.dataset.step) === n);
    });

    const backBtn = $("backBtn");
    const nextBtn = $("nextBtn");
    const submitBtn = $("submitBtn");

    backBtn.hidden = n === 1;
    nextBtn.hidden = n === 5;
    submitBtn.hidden = n !== 5;

    updateProgress(n);

    if (n === 3) renderDateSlots();
    if (n === 3) renderTimeSlots();
    if (n === 5) renderSummary();
  }

  function updateProgress(n) {
    const fill = $("progressFill");
    const labels = document.querySelectorAll(".step-label");
    fill.style.width = ((n - 1) / 4) * 100 + "%";
    labels.forEach((l) => {
      const s = Number(l.dataset.step);
      l.classList.toggle("is-active", s <= n);
    });
  }

  function next() {
    if (!currentStepValid()) {
      validateStep4();
      return;
    }
    if (state.step < 5) goToStep(state.step + 1);
  }

  function back() {
    if (state.step > 1) goToStep(state.step - 1);
  }

  function selectBarberStep() {
    if (currentStepValid()) goToStep(2);
  }

  /* =====================================================
     SUBMISSÃO
     ===================================================== */
  async function submitBooking() {
    if (state.step !== 5) return;

    const svc = getService(state.serviceId);
    const barb = state.barberId ? getBarber(state.barberId) : null;

    const booking = {
      id: makeReference(),
      serviceId: state.serviceId,
      serviceName: svc ? svc.name : "",
      barberId: state.barberId,
      barberName: barb ? barb.name : "",
      date: state.date,
      time: state.time,
      name: state.name.trim(),
      phone: parsePhone(state.phone),
      createdAt: new Date().toISOString(),
      status: "pendente",
    };

    /* A confirmação visual não acontece antes de a camada de persistência
       ter aceite a marcação (protege contra duplicados). */
    const ok = await window.BookingAPI.create(booking);
    if (!ok) {
      alert(
        "O horário escolhido foi entretanto ocupado. Por favor, seleciona outro."
      );
      goToStep(3);
      renderTimeSlots();
      return;
    }

    bookings = loadLocalBookings();

    const ref = showSuccess();
    document.querySelector(".booking-progress").style.display = "none";
    const form = $("bookingForm");
    form.style.display = "none";

    const successEl = $("bookingSuccess");
    successEl.hidden = false;
    successEl.classList.add("is-visible");

    if (window.gtag) {
      window.gtag("event", "generate_lead", { value: booking.id });
    }
    window.scrollTo({ top: $("marcacao").offsetTop - 80, behavior: "smooth" });
  }

  function resetForm() {
    bookings = loadLocalBookings();
    Object.assign(state, {
      step: 1,
      serviceId: null,
      barberId: null,
      date: null,
      time: null,
      name: "",
      phone: "",
    });

    $("bookingForm").style.display = "";
    document.querySelector(".booking-progress").style.display = "";
    $("bookingSuccess").hidden = true;
    $("bookingSuccess").classList.remove("is-visible");
    $("bkName").value = "";
    $("bkPhone").value = "";
    setFieldError("name", false);
    setFieldError("phone", false);

    renderServicePicker();
    renderBarberPicker();
    goToStep(1);
  }

  /* =====================================================
     INICIALIZAÇÃO
     ===================================================== */
  function init() {
    renderServicePicker();
    renderBarberPicker();

    $("nextBtn").addEventListener("click", next);
    $("backBtn").addEventListener("click", back);
    $("submitBtn").addEventListener("click", (e) => {
      e.preventDefault();
      submitBooking();
    });
    $("newBookingBtn").addEventListener("click", resetForm);

    $("bkName").addEventListener("input", (e) => {
      state.name = e.target.value;
      setFieldError("name", false);
    });
    $("bkPhone").addEventListener("input", (e) => {
      state.phone = e.target.value;
      setFieldError("phone", false);
    });

    goToStep(1);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* =====================================================
     ESCAPING (prevenção de XSS)
     ===================================================== */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();

/* ============================================================================
   CAMADA DE PERSISTÊNCIA · BookingAPI
   ============================================================================
   É aqui que se liga a base de dados. Ver instruções no topo do ficheiro.
   ============================================================================ */
window.BookingAPI = (function () {
  "use strict";

  const LOCAL_KEY = "rickgino.bookings.v1";

  /* ------- CONFIGURAÇÃO SUPABASE (preencher para ativar) ------- */
  const SUPABASE_URL = ""; // ex.: "https://xxxx.supabase.co"
  const SUPABASE_ANON_KEY = ""; // ex.: "eyJhbGciOi..."

  const supabaseClient =
    window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      : null;

  /* ---------------- provedor local (storage) ---------------- */
  const localProvider = {
    async list() {
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return JSON.parse(raw) || [];
      } catch (e) {
        return [];
      }
    },
    async create(booking) {
      const all = await this.list();
      /* Protege contra duplicados na mesma (data, hora, barbeiro) */
      const duplicated = all.some(
        (b) =>
          b.date === booking.date &&
          b.time === booking.time &&
          b.barberId === booking.barberId
      );
      if (duplicated) return false;

      all.push(booking);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
      return true;
    },
  };

  /* ---------------- provedor supabase ---------------- */
  const supabaseProvider = {
    async list() {
      const { data, error } = await supabaseClient
        .from("bookings")
        .select("*")
        .in("status", ["pendente", "confirmado"]);
      if (error) throw error;
      return data || [];
    },
    async create(booking) {
      /* A tabela deve ter uma restrição UNIQUE em (barber_id, date, time).
         Em caso de conflito o Supabase devolve erro 23505 -> marcação duplicada. */
      const { error } = await supabaseClient.from("bookings").insert(booking);
      if (error) {
        if (error.code === "23505") return false;
        throw error;
      }
      return true;
    },
  };

  function provider() {
    const mode = (window.SITE.BOOKING && window.SITE.BOOKING.STORAGE_MODE) || "local";
    if (mode === "supabase" && supabaseClient) return supabaseProvider;
    return localProvider;
  }

  return {
    list: () => provider().list(),
    create: (booking) => provider().create(booking),
  };
})();
