/* ============================================================================
   BARBEARIA RICKGINO · INTERAÇÕES GLOBAIS + SUPABASE + LOGIN + MARCAÇÕES
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
     HEADER
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

  window.addEventListener("scroll", onScroll, {
    passive: true
  });

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
      navToggle.setAttribute(
        "aria-expanded",
        String(open)
      );

      document.body.classList.toggle(
        "nav-locked",
        open
      );
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.classList.remove("is-open");

        navToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        document.body.classList.remove(
          "nav-locked"
        );
      });
    });
  }

  /* ==========================================================================
     REVEAL
  ========================================================================== */

  const revealEls =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io =
      new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "is-visible"
              );

              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px"
        }
      );

    revealEls.forEach((el) => {
      io.observe(el);
    });

    revealEls.forEach((el) => {
      const rect =
        el.getBoundingClientRect();

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

    const rawText =
      el.textContent || "";

    const target = parseFloat(
      el.dataset.count ||
        rawText
          .replace(/[^\d.,]/g, "")
          .replace(",", ".") ||
        "0"
    );

    const decimals =
      parseInt(
        el.dataset.decimals || "0",
        10
      );

    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress =
        Math.min(
          (now - start) / duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      const value =
        target * eased;

      if (decimals > 0) {
        el.textContent =
          value
            .toFixed(decimals)
            .replace(".", ",");
      } else {
        el.textContent =
          Math.round(value)
            .toLocaleString("pt-PT");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const counters =
    document.querySelectorAll(".stat-num");

  if ("IntersectionObserver" in window) {
    const counterObserver =
      new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const numEl =
                entry.target.querySelector(
                  "[data-count]"
                ) || entry.target;

              animateCount(numEl);

              obs.unobserve(
                entry.target
              );
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
    return String(
      str == null ? "" : str
    )
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================================================================
     SERVIÇOS
  ========================================================================== */

  function renderServices() {
    const grid =
      document.getElementById(
        "servicesGrid"
      );

    if (
      !grid ||
      !SITE.SERVICES
    ) {
      return;
    }

    grid.innerHTML = "";

    SITE.SERVICES.forEach(
      (service, index) => {
        const card =
          document.createElement(
            "article"
          );

        card.className =
          "service-card reveal";

        card.style.transitionDelay =
          index * 60 + "ms";

        card.innerHTML =
          '<div class="service-media">' +

          '<img src="' +
          escapeHtml(
            service.image || ""
          ) +
          '" alt="' +
          escapeHtml(
            service.name ||
              "Serviço"
          ) +
          '" loading="lazy" />' +

          '<span class="service-tag">' +
          (
            service.duration &&
            service.duration !== "—"
              ? escapeHtml(
                  service.duration
                )
              : "Duração a confirmar"
          ) +
          "</span>" +

          "</div>" +

          '<div class="service-body">' +

          '<div class="service-head">' +

          "<h3>" +
          escapeHtml(
            service.name ||
              "Serviço"
          ) +
          "</h3>" +

          (
            service.price &&
            service.price !== "—"
              ? '<span class="service-price">' +
                escapeHtml(
                  service.price
                ) +
                "</span>"
              : '<span class="service-price price-unknown">' +
                "Sob consulta" +
                "</span>"
          ) +

          "</div>" +

          "<p>" +
          escapeHtml(
            service.description ||
              ""
          ) +
          "</p>" +

          '<a href="#marcacao" class="service-link">' +
          "Marcar este serviço →" +
          "</a>" +

          "</div>";

        grid.appendChild(card);
      }
    );
  }

  /* ==========================================================================
     BARBEIROS
  ========================================================================== */

  function renderBarbers() {
    const grid =
      document.getElementById(
        "barbersGrid"
      );

    if (
      !grid ||
      !SITE.BARBERS
    ) {
      return;
    }

    grid.innerHTML = "";

    SITE.BARBERS.forEach(
      (barber, index) => {
        const card =
          document.createElement(
            "article"
          );

        card.className =
          "barber-card reveal";

        card.style.transitionDelay =
          index * 80 + "ms";

        const image =
          barber.image
            ? '<img src="' +
              escapeHtml(
                barber.image
              ) +
              '" alt="' +
              escapeHtml(
                barber.name ||
                  "Barbeiro"
              ) +
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
          escapeHtml(
            barber.name ||
              "A anunciar"
          ) +
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
              "Profissional da Barbearia RickGino."
          ) +
          "</p>" +

          "</div>";

        grid.appendChild(card);
      }
    );
  }

  /* ==========================================================================
     ANO
  ========================================================================== */

  const yearEl =
    document.getElementById(
      "year"
    );

  if (yearEl) {
    yearEl.textContent =
      new Date().getFullYear();
  }

  /* ==========================================================================
     INICIALIZAR SUPABASE
  ========================================================================== */

  if (
    window.supabase &&
    typeof window.supabase
      .createClient ===
      "function"
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
        "Erro ao inicializar Supabase:",
        error
      );
    }
  } else {
    console.error(
      "Supabase não foi carregado. Verifica o index.html."
    );
  }

  /* ==========================================================================
     ELEMENTOS DO LOGIN
  ========================================================================== */

  const googleLoginBtn =
    document.getElementById(
      "googleLoginBtn"
    );

  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );

  const userMenu =
    document.getElementById(
      "userMenu"
    );

  const userAvatar =
    document.getElementById(
      "userAvatar"
    );

  const userName =
    document.getElementById(
      "userName"
    );

  /* ==========================================================================
     ESTADO LOGOUT
  ========================================================================== */

  function showLoggedOutState() {
    if (googleLoginBtn) {
      googleLoginBtn.hidden = false;
      googleLoginBtn.disabled = false;
      googleLoginBtn.textContent =
        "Entrar";
    }

    if (userMenu) {
      userMenu.hidden = true;
    }

    if (userAvatar) {
      userAvatar.removeAttribute(
        "src"
      );

      userAvatar.alt =
        "Avatar";
    }

    if (userName) {
      userName.textContent =
        "";
    }
  }

  /* ==========================================================================
     ESTADO LOGIN
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
      userName.textContent =
        name;
    }

    if (userAvatar) {
      if (avatar) {
        userAvatar.src =
          avatar;

        userAvatar.alt =
          "Foto de perfil de " +
          name;
      } else {
        userAvatar.removeAttribute(
          "src"
        );

        userAvatar.alt =
          "Avatar";
      }
    }
  }

  /* ==========================================================================
     PROFILES
     ========================================================================== */

  async function saveUserProfile(user) {
    if (
      !supabaseClient ||
      !user
    ) {
      return;
    }

    const metadata =
      user.user_metadata || {};

    const nome =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      user.email ||
      "Utilizador";

    try {
      const {
        error
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

      if (error) {
        console.error(
          "Erro ao guardar perfil:",
          error
        );
      } else {
        console.log(
          "Perfil guardado com sucesso."
        );
      }
    } catch (error) {
      console.error(
        "Erro no perfil:",
        error
      );
    }
  }

  /* ==========================================================================
     OBTER UTILIZADOR
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

      if (
        data &&
        data.user
      ) {
        showLoggedInState(
          data.user
        );

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
            "O Supabase não foi carregado."
          );

          return;
        }

        try {
          googleLoginBtn.disabled =
            true;

          googleLoginBtn.textContent =
            "A entrar...";

          const {
            error
          } =
            await supabaseClient.auth
              .signInWithOAuth({
                provider:
                  "google",

                options: {
                  redirectTo:
                    window.location.origin
                }
              });

          if (error) {
            console.error(
              "Erro Google:",
              error
            );

            alert(
              "Não foi possível iniciar o login: " +
              error.message
            );

            googleLoginBtn.disabled =
              false;

            googleLoginBtn.textContent =
              "Entrar";
          }
        } catch (error) {
          console.error(
            "Erro no login:",
            error
          );

          alert(
            "Ocorreu um erro no login."
          );

          googleLoginBtn.disabled =
            false;

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
        if (!supabaseClient) {
          return;
        }

        try {
          logoutBtn.disabled =
            true;

          logoutBtn.textContent =
            "A sair...";

          const {
            error
          } =
            await supabaseClient.auth
              .signOut();

          if (error) {
            console.error(
              "Erro logout:",
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
            "Erro logout:",
            error
          );
        } finally {
          logoutBtn.disabled =
            false;

          logoutBtn.textContent =
            "Sair";
        }
      }
    );
  }

  /* ==========================================================================
     AUTH STATE
  ========================================================================== */

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          "Estado de autenticação:",
          event
        );

        if (
          session &&
          session.user
        ) {
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
     MARCAÇÕES
  ========================================================================== */

  const bookingForm =
    document.getElementById(
      "bookingForm"
    );

  const servicePicker =
    document.getElementById(
      "servicePicker"
    );

  const barberPicker =
    document.getElementById(
      "barberPicker"
    );

  const dateSlots =
    document.getElementById(
      "dateSlots"
    );

  const timeSlots =
    document.getElementById(
      "timeSlots"
    );

  const slotHint =
    document.getElementById(
      "slotHint"
    );

  const bookingSummary =
    document.getElementById(
      "bookingSummary"
    );

  const nextBtn =
    document.getElementById(
      "nextBtn"
    );

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const submitBtn =
    document.getElementById(
      "submitBtn"
    );

  const bookingSuccess =
    document.getElementById(
      "bookingSuccess"
    );

  const successName =
    document.getElementById(
      "successName"
    );

  const successDetails =
    document.getElementById(
      "successDetails"
    );

  const successRef =
    document.getElementById(
      "successRef"
    );

  const newBookingBtn =
    document.getElementById(
      "newBookingBtn"
    );

  const progressFill =
    document.getElementById(
      "progressFill"
    );

  const stepLabels =
    document.querySelectorAll(
      ".step-label"
    );

  const bookingSteps =
    document.querySelectorAll(
      ".booking-step"
    );

  let currentStep = 1;

  const bookingData = {
    service: null,
    barber: null,
    date: null,
    time: null,
    name: null
  };

  /* ==========================================================================
     SERVIÇOS DO BOOKING
  ========================================================================== */

  function renderBookingServices() {
    if (
      !servicePicker ||
      !SITE.SERVICES
    ) {
      return;
    }

    servicePicker.innerHTML =
      "";

    SITE.SERVICES.forEach(
      (service) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "booking-option";

        button.dataset.service =
          service.name || "";

        button.innerHTML =
          "<strong>" +
          escapeHtml(
            service.name ||
              "Serviço"
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
            servicePicker
              .querySelectorAll(
                ".booking-option"
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    "is-selected"
                  )
              );

            button.classList.add(
              "is-selected"
            );

            bookingData.service =
              service.name;

            updateBookingSummary();
          }
        );

        servicePicker.appendChild(
          button
        );
      }
    );
  }

  /* ==========================================================================
     BARBEIROS DO BOOKING
  ========================================================================== */

  function renderBookingBarbers() {
    if (
      !barberPicker ||
      !SITE.BARBERS
    ) {
      return;
    }

    barberPicker.innerHTML =
      "";

    SITE.BARBERS.forEach(
      (barber) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "booking-option";

        button.dataset.barber =
          barber.name || "";

        button.innerHTML =
          "<strong>" +
          escapeHtml(
            barber.name ||
              "Barbeiro"
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
            barberPicker
              .querySelectorAll(
                ".booking-option"
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    "is-selected"
                  )
              );

            button.classList.add(
              "is-selected"
            );

            bookingData.barber =
              barber.name;

            updateBookingSummary();
          }
        );

        barberPicker.appendChild(
          button
        );
      }
    );
  }

  /* ==========================================================================
     DATAS
  ========================================================================== */

  function renderDates() {
    if (!dateSlots) {
      return;
    }

    dateSlots.innerHTML =
      "";

    const today =
      new Date();

    for (
      let i = 0;
      i < 14;
      i++
    ) {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() + i
      );

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      const value =
        `${year}-${month}-${day}`;

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";
      button.className =
        "date-slot";

      button.dataset.date =
        value;

      button.innerHTML =
        "<strong>" +
        date.toLocaleDateString(
          "pt-PT",
          {
            weekday: "short"
          }
        ) +
        "</strong>" +

        "<span>" +
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "</span>";

      button.addEventListener(
        "click",
        async () => {
          dateSlots
            .querySelectorAll(
              ".date-slot"
            )
            .forEach(
              (item) =>
                item.classList.remove(
                  "is-selected"
                )
            );

          button.classList.add(
            "is-selected"
          );

          bookingData.date =
            value;

          bookingData.time =
            null;

          await loadAvailableTimes();

          updateBookingSummary();
        }
      );

      dateSlots.appendChild(
        button
      );
    }
  }

  /* ==========================================================================
     HORÁRIOS
  ========================================================================== */

  const DEFAULT_TIMES = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00"
  ];

  async function loadAvailableTimes() {
    if (!timeSlots) {
      return;
    }

    timeSlots.innerHTML =
      "";

    if (
      !bookingData.date
    ) {
      return;
    }

    let occupied = [];

    if (supabaseClient) {
      try {
        const {
          data,
          error
        } =
          await supabaseClient
            .from("bookings")
            .select(
              "booking_time"
            )
            .eq(
              "booking_date",
              bookingData.date
            )
            .neq(
              "status",
              "cancelled"
            );

        if (error) {
          console.error(
            "Erro ao procurar horários:",
            error
          );
        } else {
          occupied =
            (data || []).map(
              (item) =>
                item.booking_time
            );
        }
      } catch (error) {
        console.error(
          "Erro horários:",
          error
        );
      }
    }

    const available =
      DEFAULT_TIMES.filter(
        (time) =>
          !occupied.includes(
            time
          )
      );

    if (
      available.length === 0
    ) {
      if (slotHint) {
        slotHint.textContent =
          "Não existem horários disponíveis para esta data.";
      }

      return;
    }

    if (slotHint) {
      slotHint.textContent =
        "Escolhe um dos horários disponíveis.";
    }

    available.forEach(
      (time) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "time-slot";

        button.textContent =
          time;

        button.addEventListener(
          "click",
          () => {
            timeSlots
              .querySelectorAll(
                ".time-slot"
              )
              .forEach(
                (item) =>
                  item.classList.remove(
                    "is-selected"
                  )
              );

            button.classList.add(
              "is-selected"
            );

            bookingData.time =
              time;

            updateBookingSummary();
          }
        );

        timeSlots.appendChild(
          button
        );
      }
    );
  }

  /* ==========================================================================
     RESUMO
  ========================================================================== */

  function updateBookingSummary() {
    if (!bookingSummary) {
      return;
    }

    const dateText =
      bookingData.date
        ? new Date(
            bookingData.date +
              "T12:00:00"
          ).toLocaleDateString(
            "pt-PT"
          )
        : "—";

    bookingSummary.innerHTML =
      `
        <div>
          <strong>Serviço</strong>
          <span>${escapeHtml(
            bookingData.service ||
              "—"
          )}</span>
        </div>

        <div>
          <strong>Barbeiro</strong>
          <span>${escapeHtml(
            bookingData.barber ||
              "—"
          )}</span>
        </div>

        <div>
          <strong>Data</strong>
          <span>${escapeHtml(
            dateText
          )}</span>
        </div>

        <div>
          <strong>Hora</strong>
          <span>${escapeHtml(
            bookingData.time ||
              "—"
          )}</span>
        </div>
      `;
  }

  /* ==========================================================================
     TROCA DE STEP
  ========================================================================== */

  function showStep(step) {
    currentStep =
      Math.max(
        1,
        Math.min(5, step)
      );

    bookingSteps.forEach(
      (section) => {
        const sectionStep =
          Number(
            section.dataset.step
          );

        section.hidden =
          sectionStep !==
          currentStep;
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
          labelStep ===
            currentStep
        );

        label.classList.toggle(
          "is-complete",
          labelStep <
            currentStep
        );
      }
    );

    if (progressFill) {
      progressFill.style.width =
        (
          (currentStep - 1) /
          4 *
          100
        ) +
        "%";
    }

    if (backBtn) {
      backBtn.hidden =
        currentStep === 1;
    }

    if (nextBtn) {
      nextBtn.hidden =
        currentStep === 5;
    }

    if (submitBtn) {
      submitBtn.hidden =
        currentStep !== 5;
    }
  }

  /* ==========================================================================
     VALIDAR STEP
  ========================================================================== */

  async function validateStep() {
    if (currentStep === 1) {
      if (!bookingData.service) {
        alert(
          "Escolhe um serviço primeiro."
        );

        return false;
      }
    }

    if (currentStep === 2) {
      if (!bookingData.barber) {
        alert(
          "Escolhe um barbeiro primeiro."
        );

        return false;
      }
    }

    if (currentStep === 3) {
      if (!bookingData.date) {
        alert(
          "Escolhe uma data."
        );

        return false;
      }

      if (!bookingData.time) {
        alert(
          "Escolhe um horário."
        );

        return false;
      }
    }

    if (currentStep === 4) {
      const nameInput =
        document.getElementById(
          "bkName"
        );

      const phoneInput =
        document.getElementById(
          "bkPhone"
        );

      const name =
        nameInput
          ? nameInput.value.trim()
          : "";

      const phone =
        phoneInput
          ? phoneInput.value.trim()
          : "";

      if (!name) {
        alert(
          "Indica o teu nome."
        );

        return false;
      }

      if (
        !/^(?:\+351\s?)?9\d{8}$/.test(
          phone.replace(
            /\s/g,
            ""
          )
        )
      ) {
        alert(
          "Indica um número de telemóvel válido."
        );

        return false;
      }

      bookingData.name =
        name;
    }

    return true;
  }

  /* ==========================================================================
     BOTÃO CONTINUAR
  ========================================================================== */

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      async () => {
        const valid =
          await validateStep();

        if (!valid) {
          return;
        }

        if (
          currentStep === 4
        ) {
          updateBookingSummary();
        }

        showStep(
          currentStep + 1
        );
      }
    );
  }

  /* ==========================================================================
     BOTÃO VOLTAR
  ========================================================================== */

  if (backBtn) {
    backBtn.addEventListener(
      "click",
      () => {
        showStep(
          currentStep - 1
        );
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

        /* ---------------------------------
           VERIFICAR LOGIN
        --------------------------------- */

        const {
          data: userData,
          error: userError
        } =
          await supabaseClient.auth.getUser();

        if (
          userError ||
          !userData ||
          !userData.user
        ) {
          alert(
            "Tens de entrar com o Google antes de fazer uma marcação."
          );

          return;
        }

        const user =
          userData.user;

        /* ---------------------------------
           VALIDAR DADOS
        --------------------------------- */

        const valid =
          await validateStep();

        if (!valid) {
          return;
        }

        if (
          !bookingData.service ||
          !bookingData.date ||
          !bookingData.time
        ) {
          alert(
            "Preenche todos os dados da marcação."
          );

          return;
        }

        if (submitBtn) {
          submitBtn.disabled =
            true;

          submitBtn.textContent =
            "A confirmar...";
        }

        try {
          /* ------------------------------
             GUARDAR / ATUALIZAR PROFILE
          ------------------------------ */

          await saveUserProfile(
            user
          );

          /* ------------------------------
             VERIFICAR HORÁRIO NOVAMENTE
          ------------------------------ */

          const {
            data: existing,
            error: existingError
          } =
            await supabaseClient
              .from("bookings")
              .select("id")
              .eq(
                "booking_date",
                bookingData.date
              )
              .eq(
                "booking_time",
                bookingData.time
              )
              .neq(
                "status",
                "cancelled"
              )
              .limit(1);

          if (existingError) {
            throw existingError;
          }

          if (
            existing &&
            existing.length > 0
          ) {
            alert(
              "Este horário acabou de ser ocupado. Escolhe outro horário."
            );

            await loadAvailableTimes();

            showStep(3);

            return;
          }

          /* ------------------------------
             INSERIR BOOKING
          ------------------------------ */

          const {
            data: booking,
            error: bookingError
          } =
            await supabaseClient
              .from("bookings")
              .insert({
                user_id:
                  user.id,

                service_name:
                  bookingData.service,

                booking_date:
                  bookingData.date,

                booking_time:
                  bookingData.time,

                status:
                  "confirmed"
              })
              .select()
              .single();

          if (bookingError) {
            throw bookingError;
          }

          /* ------------------------------
             SUCESSO
          ------------------------------ */

          if (successName) {
            successName.textContent =
              bookingData.name ||
              user.user_metadata
                ?.full_name ||
              user.email ||
              "cliente";
          }

          if (successDetails) {
            const dateText =
              new Date(
                bookingData.date +
                  "T12:00:00"
              ).toLocaleDateString(
                "pt-PT"
              );

            successDetails.innerHTML =
              `
                <div>
                  <strong>Serviço</strong>
                  <span>${escapeHtml(
                    bookingData.service
                  )}</span>
                </div>

                <div>
                  <strong>Data</strong>
                  <span>${escapeHtml(
                    dateText
                  )}</span>
                </div>

                <div>
                  <strong>Hora</strong>
                  <span>${escapeHtml(
                    bookingData.time
                  )}</span>
                </div>
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
            .forEach(
              (step) => {
                step.hidden =
                  true;
              }
            );

          if (bookingSuccess) {
            bookingSuccess.hidden =
              false;
          }

          if (nextBtn) {
            nextBtn.hidden =
              true;
          }

          if (backBtn) {
            backBtn.hidden =
              true;
          }

          if (submitBtn) {
            submitBtn.hidden =
              true;
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
            "Não foi possível guardar a marcação: " +
            (
              error.message ||
              "erro desconhecido"
            )
          );
        } finally {
          if (submitBtn) {
            submitBtn.disabled =
              false;

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
        bookingData.service =
          null;

        bookingData.barber =
          null;

        bookingData.date =
          null;

        bookingData.time =
          null;

        bookingData.name =
          null;

        if (bookingSuccess) {
          bookingSuccess.hidden =
            true;
        }

        if (bookingForm) {
          bookingForm.reset();
        }

        document
          .querySelectorAll(
            ".booking-option, .date-slot, .time-slot"
          )
          .forEach(
            (item) => {
              item.classList.remove(
                "is-selected"
              );
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
  renderDates();

  showStep(1);

  /* ==========================================================================
     INICIALIZAR CONTEÚDO
  ========================================================================== */

  renderServices();
  renderBarbers();

  /* ==========================================================================
     VERIFICAR SESSÃO
  ========================================================================== */

  updateUserInterface();

  /* ==========================================================================
     RE-OBSERVAR REVEALS
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
