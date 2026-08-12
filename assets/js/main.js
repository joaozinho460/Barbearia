/* ============================================================================
BARBEARIA RICKGINO · MAIN.JS
INTERAÇÕES + LOGIN GOOGLE + SUPABASE + MARCAÇÕES
============================================================================= */

(function () {
  "use strict";

  /* ==========================================================================
  CONFIGURAÇÃO
  ========================================================================== */

  const SITE = window.SITE || {};

  const SUPABASE_URL =
    "https://yfbtcynkjewuggqxabqv.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_jBZxtMgKPbl601_8UmFIBw_lthLAMNn";

  let supabaseClient = null;

  /* ==========================================================================
  HEADER STICKY
  ========================================================================== */

  const header = document.getElementById("siteHeader");

  function onScroll() {
    if (!header) return;

    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ==========================================================================
  MENU MOBILE
  ========================================================================== */

  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");

      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));

      document.body.classList.toggle("nav-locked", open);
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-locked");
      });
    });
  }

  /* ==========================================================================
  REVEAL ON SCROLL
  ========================================================================== */

  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealEls.forEach((el) => io.observe(el));

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();

      if (rect.top < window.innerHeight) {
        el.classList.add("is-visible");
      }
    });
  } else {
    revealEls.forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  /* ==========================================================================
  CONTADORES
  ========================================================================== */

  function animateCount(el) {
    if (!el) return;

    const rawText = el.textContent || "";

    const target = parseFloat(
      el.dataset.count ||
        rawText.replace(/[^\d.,]/g, "").replace(",", ".") ||
        "0"
    );

    const decimals = parseInt(
      el.dataset.decimals || "0",
      10
    );

    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;

      if (decimals > 0) {
        el.textContent = value
          .toFixed(decimals)
          .replace(".", ",");
      } else {
        el.textContent = Math.round(value)
          .toLocaleString("pt-PT");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll(".stat-num");

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numEl =
              entry.target.querySelector("[data-count]") ||
              entry.target;

            animateCount(numEl);

            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5
      }
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach((counter) => {
      animateCount(counter);
    });
  }

  /* ==========================================================================
  ESCAPE HTML
  ========================================================================== */

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================================================================
  RENDER · SERVIÇOS
  ========================================================================== */

  function renderServices() {
    const grid = document.getElementById("servicesGrid");

    if (!grid || !SITE.SERVICES) return;

    grid.innerHTML = "";

    SITE.SERVICES.forEach((service, index) => {
      const card = document.createElement("article");

      card.className = "service-card reveal";

      card.style.transitionDelay =
        index * 60 + "ms";

      card.innerHTML =
        '<div class="service-media">' +

          '<img src="' +
          escapeHtml(service.image || "") +
          '" alt="' +
          escapeHtml(service.name || "Serviço") +
          '" loading="lazy" />' +

          '<span class="service-tag">' +
          (
            service.duration &&
            service.duration !== "—"
              ? escapeHtml(service.duration)
              : "Duração a confirmar"
          ) +
          "</span>" +

        "</div>" +

        '<div class="service-body">' +

          '<div class="service-head">' +

            "<h3>" +
            escapeHtml(service.name || "Serviço") +
            "</h3>" +

            (
              service.price &&
              service.price !== "—"
                ? '<span class="service-price">' +
                  escapeHtml(service.price) +
                  "</span>"
                : '<span class="service-price price-unknown">' +
                  "Sob consulta" +
                  "</span>"
            ) +

          "</div>" +

          "<p>" +
          escapeHtml(service.description || "") +
          "</p>" +

          '<a href="#marcacao" class="service-link">' +
          "Marcar este serviço &#8594;" +
          "</a>" +

        "</div>";

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
  RENDER · BARBEIROS
  ========================================================================== */

  function renderBarbers() {
    const grid = document.getElementById("barbersGrid");

    if (!grid || !SITE.BARBERS) return;

    grid.innerHTML = "";

    SITE.BARBERS.forEach((barber, index) => {
      const card = document.createElement("article");

      card.className = "barber-card reveal";

      card.style.transitionDelay =
        index * 80 + "ms";

      const image = barber.image
        ? '<img src="' +
          escapeHtml(barber.image) +
          '" alt="' +
          escapeHtml(barber.name || "Barbeiro") +
          '" loading="lazy" />'
        : `
          <div class="barber-placeholder">
            <svg
              viewBox="0 0 80 80"
              width="54"
              height="54"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="40" cy="28" r="12"/>
              <path d="M20 66c0-11 9-17 20-17s20 6 20 17"/>
            </svg>
          </div>
        `;

      card.innerHTML =
        '<div class="barber-photo">' +
          image +
        "</div>" +

        '<div class="barber-body">' +

          "<h3>" +
          escapeHtml(barber.name || "A anunciar") +
          "</h3>" +

          '<p class="barber-specialty">' +
          escapeHtml(
            barber.specialty ||
            "Barbeiro profissional"
          ) +
          "</p>" +

          "<p>" +
          escapeHtml(
            barber.description ||
            "Brevemente vais conhecer os profissionais que fazem da RickGino um espaço de referência."
          ) +
          "</p>" +

        "</div>";

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
  ANO FOOTER
  ========================================================================== */

  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent =
      new Date().getFullYear();
  }

  /* ==========================================================================
  SUPABASE
  ========================================================================== */

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {
    try {
      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );

      console.log(
        "Supabase inicializado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao inicializar o Supabase:",
        error
      );
    }
  } else {
    console.warn(
      "Supabase não foi carregado. Verifica o script no index.html."
    );
  }

  /* ==========================================================================
  ELEMENTOS DO LOGIN
  ========================================================================== */

  const googleLoginBtn =
    document.getElementById("googleLoginBtn");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const userMenu =
    document.getElementById("userMenu");

  const userAvatar =
    document.getElementById("userAvatar");

  const userName =
    document.getElementById("userName");

  /* ==========================================================================
  ESTADO · LOGOUT
  ========================================================================== */

  function showLoggedOutState() {
    if (googleLoginBtn) {
      googleLoginBtn.hidden = false;
      googleLoginBtn.disabled = false;
      googleLoginBtn.textContent = "Entrar";
    }

    if (userMenu) {
      userMenu.hidden = true;
    }

    if (userAvatar) {
      userAvatar.removeAttribute("src");
      userAvatar.alt = "Avatar";
    }

    if (userName) {
      userName.textContent = "";
    }
  }

  /* ==========================================================================
  ESTADO · LOGIN
  ========================================================================== */

  function showLoggedInState(user) {
    if (!user) {
      showLoggedOutState();
      return;
    }

    if (googleLoginBtn) {
      googleLoginBtn.hidden = true;
    }

    if (userMenu) {
      userMenu.hidden = false;
    }

    const metadata =
      user.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      user.email ||
      "Utilizador";

    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      "";

    if (userName) {
      userName.textContent = name;
    }

    if (userAvatar) {
      if (avatar) {
        userAvatar.src = avatar;
        userAvatar.alt =
          "Foto de perfil de " + name;
      } else {
        userAvatar.removeAttribute("src");
        userAvatar.alt = "Avatar";
      }
    }
  }

  /* ==========================================================================
  GUARDAR PERFIL NA TABELA profiles
  ========================================================================== */

  async function saveUserProfile(user) {
    if (!supabaseClient || !user) return;

    const metadata =
      user.user_metadata || {};

    const nome =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      user.email ||
      "Utilizador";

    try {
      const { error } =
        await supabaseClient
          .from("profiles")
          .upsert(
            {
              id: user.id,
              nome: nome
            },
            {
              onConflict: "id"
            }
          );

      if (error) {
        console.error(
          "Erro ao guardar perfil:",
          error
        );
      } else {
        console.log(
          "Perfil guardado na tabela profiles."
        );
      }
    } catch (error) {
      console.error(
        "Erro ao guardar perfil:",
        error
      );
    }
  }

  /* ==========================================================================
  OBTER UTILIZADOR ATUAL
  ========================================================================== */

  async function updateUserInterface() {
    if (!supabaseClient) {
      showLoggedOutState();
      return;
    }

    try {
      const {
        data,
        error
      } =
        await supabaseClient.auth.getUser();

      if (error) {
        console.error(
          "Erro ao obter utilizador:",
          error
        );

        showLoggedOutState();
        return;
      }

      if (data && data.user) {
        showLoggedInState(data.user);

        await saveUserProfile(
          data.user
        );
      } else {
        showLoggedOutState();
      }

    } catch (error) {
      console.error(
        "Erro ao verificar sessão:",
        error
      );

      showLoggedOutState();
    }
  }

  /* ==========================================================================
  LOGIN GOOGLE
  ========================================================================== */

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener(
      "click",
      async () => {

        if (!supabaseClient) {
          alert(
            "O Supabase não foi carregado. Verifica o index.html."
          );

          return;
        }

        try {
          googleLoginBtn.disabled = true;
          googleLoginBtn.textContent =
            "A entrar...";

          const {
            error
          } =
            await supabaseClient.auth
              .signInWithOAuth({
                provider: "google",

                options: {
                  redirectTo:
                    window.location.origin
                }
              });

          if (error) {
            console.error(
              "Erro ao entrar com Google:",
              error
            );

            alert(
              "Não foi possível iniciar o login com Google: " +
              error.message
            );

            googleLoginBtn.disabled = false;
            googleLoginBtn.textContent =
              "Entrar";
          }

        } catch (error) {
          console.error(
            "Erro no login:",
            error
          );

          alert(
            "Ocorreu um erro ao tentar entrar: " +
            error.message
          );

          googleLoginBtn.disabled = false;
          googleLoginBtn.textContent =
            "Entrar";
        }
      }
    );
  }

  /* ==========================================================================
  LOGOUT
  ========================================================================== */

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      async () => {

        if (!supabaseClient) return;

        try {
          logoutBtn.disabled = true;
          logoutBtn.textContent =
            "A sair...";

          const {
            error
          } =
            await supabaseClient.auth.signOut();

          if (error) {
            console.error(
              "Erro ao sair:",
              error
            );

            alert(
              "Não foi possível terminar a sessão."
            );

            return;
          }

          showLoggedOutState();

        } catch (error) {
          console.error(
            "Erro ao terminar sessão:",
            error
          );

        } finally {
          logoutBtn.disabled = false;
          logoutBtn.textContent = "Sair";
        }
      }
    );
  }

  /* ==========================================================================
  AUTENTICAÇÃO AUTOMÁTICA
  ========================================================================== */

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {

        console.log(
          "Estado de autenticação:",
          event
        );

        if (session && session.user) {
          showLoggedInState(
            session.user
          );

          await saveUserProfile(
            session.user
          );
        } else {
          showLoggedOutState();
        }
      }
    );
  }

  /* ==========================================================================
  SISTEMA DE MARCAÇÕES
  ========================================================================== */

  const bookingForm =
    document.getElementById("bookingForm");

  const servicePicker =
    document.getElementById("servicePicker");

  const barberPicker =
    document.getElementById("barberPicker");

  const dateSlots =
    document.getElementById("dateSlots");

  const timeSlots =
    document.getElementById("timeSlots");

  const slotHint =
    document.getElementById("slotHint");

  const bookingSummary =
    document.getElementById("bookingSummary");

  const bookingSuccess =
    document.getElementById("bookingSuccess");

  const successName =
    document.getElementById("successName");

  const successDetails =
    document.getElementById("successDetails");

  const successRef =
    document.getElementById("successRef");

  const newBookingBtn =
    document.getElementById("newBookingBtn");

  const nextBtn =
    document.getElementById("nextBtn");

  const backBtn =
    document.getElementById("backBtn");

  const submitBtn =
    document.getElementById("submitBtn");

  const progressFill =
    document.getElementById("progressFill");

  const stepLabels =
    document.querySelectorAll(".step-label");

  const bookingSteps =
    document.querySelectorAll(".booking-step");

  let currentStep = 1;

  let selectedService = null;
  let selectedBarber = null;
  let selectedDate = null;
  let selectedTime = null;

  /* ==========================================================================
  GERAR DATAS
  ========================================================================== */

  function generateDates() {
    if (!dateSlots) return;

    dateSlots.innerHTML = "";

    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const isoDate =
        date.toISOString().split("T")[0];

      const dayName =
        date.toLocaleDateString(
          "pt-PT",
          { weekday: "short" }
        );

      const dayNumber =
        date.toLocaleDateString(
          "pt-PT",
          { day: "2-digit" }
        );

      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "date-slot";

      button.dataset.date =
        isoDate;

      button.innerHTML =
        "<strong>" +
        dayNumber +
        "</strong>" +
        "<span>" +
        dayName +
        "</span>";

      button.addEventListener(
        "click",
        () => {
          document
            .querySelectorAll(".date-slot")
            .forEach((btn) => {
              btn.classList.remove(
                "is-selected"
              );
            });

          button.classList.add(
            "is-selected"
          );

          selectedDate = isoDate;
          selectedTime = null;

          loadAvailableTimes();
        }
      );

      dateSlots.appendChild(button);
    }
  }

  /* ==========================================================================
  HORÁRIOS
  ========================================================================== */

  function loadAvailableTimes() {
    if (!timeSlots) return;

    timeSlots.innerHTML = "";

    if (!selectedDate) {
      if (slotHint) {
        slotHint.textContent =
          "Seleciona uma data para ver os horários disponíveis.";
      }

      return;
    }

    if (slotHint) {
      slotHint.textContent =
        "Escolhe um horário disponível.";
    }

    const times = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00"
    ];

    times.forEach((time) => {
      const button =
        document.createElement("button");

      button.type = "button";
      button.className = "time-slot";
      button.textContent = time;

      button.dataset.time = time;

      button.addEventListener(
        "click",
        async () => {

          if (!supabaseClient) {
            alert(
              "O sistema de marcações não está ligado ao Supabase."
            );
            return;
          }

          /* Verificar se já está ocupado */

          const {
            data,
            error
          } =
            await supabaseClient
              .from("bookings")
              .select("id")
              .eq(
                "booking_date",
                selectedDate
              )
              .eq(
                "booking_time",
                time
              )
              .neq(
                "status",
                "cancelled"
              )
              .limit(1);

          if (error) {
            console.error(
              "Erro ao verificar horário:",
              error
            );

            alert(
              "Não foi possível verificar este horário."
            );

            return;
          }

          if (data && data.length > 0) {
            alert(
              "Este horário já está ocupado. Escolhe outro."
            );

            button.disabled = true;

            return;
          }

          document
            .querySelectorAll(".time-slot")
            .forEach((btn) => {
              btn.classList.remove(
                "is-selected"
              );
            });

          button.classList.add(
            "is-selected"
          );

          selectedTime = time;
        }
      );

      timeSlots.appendChild(button);
    });
  }

  /* ==========================================================================
  SERVIÇOS NO BOOKING
  ========================================================================== */

  function renderBookingServices() {
    if (!servicePicker || !SITE.SERVICES) {
      return;
    }

    servicePicker.innerHTML = "";

    SITE.SERVICES.forEach(
      (service) => {

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "service-option";

        button.dataset.service =
          service.name || "";

        button.innerHTML =
          "<strong>" +
          escapeHtml(
            service.name || "Serviço"
          ) +
          "</strong>" +
          (
            service.price
              ? "<span>" +
                escapeHtml(
                  service.price
                ) +
                "</span>"
              : ""
          );

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".service-option"
              )
              .forEach((btn) => {
                btn.classList.remove(
                  "is-selected"
                );
              });

            button.classList.add(
              "is-selected"
            );

            selectedService =
              service.name || "";
          }
        );

        servicePicker.appendChild(
          button
        );
      }
    );
  }

  /* ==========================================================================
  BARBEIROS NO BOOKING
  ========================================================================== */

  function renderBookingBarbers() {
    if (!barberPicker || !SITE.BARBERS) {
      return;
    }

    barberPicker.innerHTML = "";

    SITE.BARBERS.forEach(
      (barber) => {

        const button =
          document.createElement("button");

        button.type = "button";
        button.className =
          "barber-option";

        button.dataset.barber =
          barber.name || "";

        button.innerHTML =
          "<strong>" +
          escapeHtml(
            barber.name || "Barbeiro"
          ) +
          "</strong>" +

          "<span>" +
          escapeHtml(
            barber.specialty ||
            "Barbeiro profissional"
          ) +
          "</span>";

        button.addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".barber-option"
              )
              .forEach((btn) => {
                btn.classList.remove(
                  "is-selected"
                );
              });

            button.classList.add(
              "is-selected"
            );

            selectedBarber =
              barber.name || "";
          }
        );

        barberPicker.appendChild(
          button
        );
      }
    );
  }

  /* ==========================================================================
  MOSTRAR STEP
  ========================================================================== */

  function showStep(step) {
    currentStep = step;

    bookingSteps.forEach(
      (section) => {
        const sectionStep =
          Number(
            section.dataset.step
          );

        section.hidden =
          sectionStep !== step;
      }
    );

    stepLabels.forEach(
      (label) => {
        const labelStep =
          Number(
            label.dataset.step
          );

        label.classList.toggle(
          "is-active",
          labelStep <= step
        );
      }
    );

    if (progressFill) {
      progressFill.style.width =
        ((step - 1) / 4) * 100 +
        "%";
    }

    if (backBtn) {
      backBtn.hidden =
        step === 1;
    }

    if (nextBtn) {
      nextBtn.hidden =
        step === 5;
    }

    if (submitBtn) {
      submitBtn.hidden =
        step !== 5;
    }
  }

  /* ==========================================================================
  VALIDAR PASSO
  ========================================================================== */

  function validateStep(step) {

    if (step === 1) {
      if (!selectedService) {
        alert(
          "Escolhe primeiro um serviço."
        );

        return false;
      }
    }

    if (step === 2) {
      if (!selectedBarber) {
        alert(
          "Escolhe primeiro um barbeiro."
        );

        return false;
      }
    }

    if (step === 3) {
      if (!selectedDate) {
        alert(
          "Escolhe uma data."
        );

        return false;
      }

      if (!selectedTime) {
        alert(
          "Escolhe um horário."
        );

        return false;
      }
    }

    if (step === 4) {
      const nameInput =
        document.getElementById(
          "bkName"
        );

      const phoneInput =
        document.getElementById(
          "bkPhone"
        );

      if (
        !nameInput ||
        !nameInput.value.trim()
      ) {
        alert(
          "Indica o teu nome."
        );

        return false;
      }

      if (
        !phoneInput ||
        !phoneInput.value.trim()
      ) {
        alert(
          "Indica o teu número de telemóvel."
        );

        return false;
      }
    }

    return true;
  }

  /* ==========================================================================
  RESUMO
  ========================================================================== */

  function renderBookingSummary() {
    if (!bookingSummary) return;

    const name =
      document.getElementById(
        "bkName"
      )?.value || "";

    const phone =
      document.getElementById(
        "bkPhone"
      )?.value || "";

    bookingSummary.innerHTML = `
      <div class="summary-row">
        <span>Serviço</span>
        <strong>${escapeHtml(selectedService || "")}</strong>
      </div>

      <div class="summary-row">
        <span>Barbeiro</span>
        <strong>${escapeHtml(selectedBarber || "")}</strong>
      </div>

      <div class="summary-row">
        <span>Data</span>
        <strong>${escapeHtml(selectedDate || "")}</strong>
      </div>

      <div class="summary-row">
        <span>Hora</span>
        <strong>${escapeHtml(selectedTime || "")}</strong>
      </div>

      <div class="summary-row">
        <span>Nome</span>
        <strong>${escapeHtml(name)}</strong>
      </div>

      <div class="summary-row">
        <span>Telemóvel</span>
        <strong>${escapeHtml(phone)}</strong>
      </div>
    `;
  }

  /* ==========================================================================
  PRÓXIMO PASSO
  ========================================================================== */

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      () => {

        if (!validateStep(currentStep)) {
          return;
        }

        if (currentStep === 4) {
          renderBookingSummary();
        }

        if (currentStep < 5) {
          showStep(
            currentStep + 1
          );
        }
      }
    );
  }

  /* ==========================================================================
  VOLTAR
  ========================================================================== */

  if (backBtn) {
    backBtn.addEventListener(
      "click",
      () => {

        if (currentStep > 1) {
          showStep(
            currentStep - 1
          );
        }
      }
    );
  }

  /* ==========================================================================
  CONFIRMAR MARCAÇÃO
  ========================================================================== */

  if (bookingForm) {
    bookingForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        if (!supabaseClient) {
          alert(
            "O Supabase não está disponível."
          );

          return;
        }

        /* Verificar login */

        const {
          data: userData,
          error: userError
        } =
          await supabaseClient.auth
            .getUser();

        if (
          userError ||
          !userData ||
          !userData.user
        ) {
          alert(
            "Para fazer uma marcação tens de entrar com a tua conta Google."
          );

          if (googleLoginBtn) {
            googleLoginBtn.click();
          }

          return;
        }

        const user =
          userData.user;

        const nameInput =
          document.getElementById(
            "bkName"
          );

        const phoneInput =
          document.getElementById(
            "bkPhone"
          );

        const nome =
          nameInput?.value.trim() || "";

        if (!nome) {
          alert(
            "Indica o teu nome."
          );
          showStep(4);
          return;
        }

        if (!selectedService) {
          alert(
            "Serviço em falta."
          );
          showStep(1);
          return;
        }

        if (!selectedBarber) {
          alert(
            "Barbeiro em falta."
          );
          showStep(2);
          return;
        }

        if (!selectedDate || !selectedTime) {
          alert(
            "Data ou horário em falta."
          );
          showStep(3);
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent =
            "A confirmar...";
        }

        try {

          /* --------------------------------------------------------------
          GUARDAR / ATUALIZAR PROFILE
          -------------------------------------------------------------- */

          const {
            error: profileError
          } =
            await supabaseClient
              .from("profiles")
              .upsert(
                {
                  id: user.id,
                  nome: nome
                },
                {
                  onConflict: "id"
                }
              );

          if (profileError) {
            console.error(
              "Erro no profile:",
              profileError
            );
          }

          /* --------------------------------------------------------------
          VERIFICAR NOVAMENTE SE O HORÁRIO FOI OCUPADO
          -------------------------------------------------------------- */

          const {
            data: existingBooking,
            error: checkError
          } =
            await supabaseClient
              .from("bookings")
              .select("id")
              .eq(
                "booking_date",
                selectedDate
              )
              .eq(
                "booking_time",
                selectedTime
              )
              .neq(
                "status",
                "cancelled"
              )
              .limit(1);

          if (checkError) {
            throw checkError;
          }

          if (
            existingBooking &&
            existingBooking.length > 0
          ) {
            alert(
              "Este horário acabou de ser ocupado. Escolhe outro."
            );

            selectedTime = null;
            loadAvailableTimes();
            showStep(3);

            return;
          }

          /* --------------------------------------------------------------
          GUARDAR BOOKING
          -------------------------------------------------------------- */

          const serviceName =
            selectedService +
            " — " +
            selectedBarber;

          const {
            data: booking,
            error: bookingError
          } =
            await supabaseClient
              .from("bookings")
              .insert({
                user_id: user.id,

                service_name:
                  serviceName,

                booking_date:
                  selectedDate,

                booking_time:
                  selectedTime,

                status:
                  "confirmed"
              })
              .select()
              .single();

          if (bookingError) {
            throw bookingError;
          }

          /* --------------------------------------------------------------
          SUCESSO
          -------------------------------------------------------------- */

          if (successName) {
            successName.textContent =
              nome;
          }

          if (successDetails) {
            successDetails.innerHTML = `
              <p>
                <strong>Serviço:</strong>
                ${escapeHtml(selectedService)}
              </p>

              <p>
                <strong>Barbeiro:</strong>
                ${escapeHtml(selectedBarber)}
              </p>

              <p>
                <strong>Data:</strong>
                ${escapeHtml(selectedDate)}
              </p>

              <p>
                <strong>Hora:</strong>
                ${escapeHtml(selectedTime)}
              </p>
            `;
          }

          if (successRef) {
            successRef.textContent =
              booking.id;
          }

          bookingForm
            .querySelectorAll(
              ".booking-step"
            )
            .forEach((step) => {
              step.hidden = true;
            });

          if (bookingSuccess) {
            bookingSuccess.hidden =
              false;
          }

          if (nextBtn) {
            nextBtn.hidden = true;
          }

          if (backBtn) {
            backBtn.hidden = true;
          }

          if (submitBtn) {
            submitBtn.hidden = true;
          }

          console.log(
            "Marcação criada:",
            booking
          );

        } catch (error) {

          console.error(
            "Erro ao criar marcação:",
            error
          );

          alert(
            "Não foi possível confirmar a marcação: " +
            (error.message || "Erro desconhecido")
          );

        } finally {

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent =
              "Confirmar marcação";
          }
        }
      }
    );
  }

  /* ==========================================================================
  NOVA MARCAÇÃO
  ========================================================================== */

  if (newBookingBtn) {
    newBookingBtn.addEventListener(
      "click",
      () => {

        selectedService = null;
        selectedBarber = null;
        selectedDate = null;
        selectedTime = null;

        document
          .querySelectorAll(
            ".service-option, .barber-option, .date-slot, .time-slot"
          )
          .forEach((button) => {
            button.classList.remove(
              "is-selected"
            );
          });

        if (bookingSuccess) {
          bookingSuccess.hidden = true;
        }

        bookingSteps.forEach(
          (step) => {
            step.hidden = true;
          }
        );

        showStep(1);
      }
    );
  }

  /* ==========================================================================
  INICIALIZAR BOOKING
  ========================================================================== */

  renderBookingServices();
  renderBookingBarbers();
  generateDates();
  showStep(1);

  /* ==========================================================================
  VERIFICAR SESSÃO
  ========================================================================== */

  updateUserInterface();

  /* ==========================================================================
  INICIALIZAR CONTEÚDO
  ========================================================================== */

  renderServices();
  renderBarbers();

  /* ==========================================================================
  RE-OBSERVAR ELEMENTOS DINÂMICOS
  ========================================================================== */

  document
    .querySelectorAll(".reveal")
    .forEach((el) => {

      if (
        !el.classList.contains(
          "is-visible"
        )
      ) {

        const rect =
          el.getBoundingClientRect();

        if (
          rect.top <
          window.innerHeight
        ) {
          el.classList.add(
            "is-visible"
          );
        }
      }
    });

})();
