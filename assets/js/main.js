/* ============================================================================
BARBEARIA RICKGINO · INTERAÇÕES GLOBAIS + LOGIN + MARCAÇÕES
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

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {
    try {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

      console.log("Supabase inicializado com sucesso.");
    } catch (error) {
      console.error("Erro ao inicializar Supabase:", error);
    }
  } else {
    console.warn(
      "Supabase não foi carregado. Verifica o script no index.html."
    );
  }

  /* ==========================================================================
     HEADER
  ========================================================================== */

  const header = document.getElementById("siteHeader");

  function onScroll() {
    if (!header) return;

    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 40
    );
  }

  window.addEventListener("scroll", onScroll, {
    passive: true
  });

  onScroll();

  /* ==========================================================================
     MENU MOBILE
  ========================================================================== */

  const navToggle =
    document.getElementById("navToggle");

  const nav =
    document.getElementById("siteNav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open =
        nav.classList.toggle("is-open");

      navToggle.classList.toggle(
        "is-open",
        open
      );

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

  function setupReveal() {
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

                obs.unobserve(
                  entry.target
                );
              }
            });
          },
          {
            threshold: 0.12,
            rootMargin:
              "0px 0px -40px 0px"
          }
        );

      revealEls.forEach((el) =>
        io.observe(el)
      );

      revealEls.forEach((el) => {
        const rect =
          el.getBoundingClientRect();

        if (rect.top < window.innerHeight) {
          el.classList.add(
            "is-visible"
          );
        }
      });
    } else {
      revealEls.forEach((el) =>
        el.classList.add("is-visible")
      );
    }
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
    const start =
      performance.now();

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
    document.querySelectorAll(
      ".stat-num"
    );

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

    counters.forEach((counter) =>
      counterObserver.observe(counter)
    );
  } else {
    counters.forEach((counter) =>
      animateCount(counter)
    );
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

    if (!grid || !SITE.SERVICES) return;

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
          '" loading="lazy">' +
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
              : '<span class="service-price price-unknown">Sob consulta</span>'
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

    setupReveal();
  }

  /* ==========================================================================
     BARBEIROS
  ========================================================================== */

  function renderBarbers() {
    const grid =
      document.getElementById(
        "barbersGrid"
      );

    if (!grid || !SITE.BARBERS) return;

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
              '" loading="lazy">'
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
              "Profissional dedicado a oferecer um serviço de excelência."
          ) +
          "</p>" +

          "</div>";

        grid.appendChild(card);
      }
    );

    setupReveal();
  }

  /* ==========================================================================
     ANO
  ========================================================================== */

  const yearEl =
    document.getElementById("year");

  if (yearEl) {
    yearEl.textContent =
      new Date().getFullYear();
  }

  /* ==========================================================================
     LOGIN / PERFIL
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
      userName.textContent = "";
    }
  }

  async function saveProfile(user) {
    if (!supabaseClient || !user)
      return;

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
      null;

    try {
      const { error } =
        await supabaseClient
          .from("profiles")
          .upsert(
            {
              id: user.id,
              email: user.email,
              nome: name,
              avatar: avatar
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
      }
    } catch (error) {
      console.error(
        "Erro no perfil:",
        error
      );
    }
  }

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
        userAvatar.src = avatar;
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

    saveProfile(user);
  }

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
                provider: "google",

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
            "Ocorreu um erro ao tentar entrar."
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
        if (!supabaseClient)
          return;

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
          logoutBtn.disabled =
            false;

          logoutBtn.textContent =
            "Sair";
        }
      }
    );
  }

  /* ==========================================================================
     ESTADO DA AUTENTICAÇÃO
  ========================================================================== */

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
      (event, session) => {
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

  let currentStep = 1;

  let bookingData = {
    service: null,
    barber: null,
    date: null,
    time: null,
    name: "",
    phone: ""
  };

  /* --------------------------------------------------------------------------
     MOSTRAR STEP
  -------------------------------------------------------------------------- */

  function showBookingStep(step) {
    currentStep = step;

    document
      .querySelectorAll(
        ".booking-step"
      )
      .forEach((el) => {
        el.hidden =
          Number(
            el.dataset.step
          ) !== step;
      });

    if (progressFill) {
      progressFill.style.width =
        ((step - 1) / 4) *
          100 +
        "%";
    }

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

  /* --------------------------------------------------------------------------
     SERVIÇOS DO BOOKING
  -------------------------------------------------------------------------- */

  function renderBookingServices() {
    if (!servicePicker) return;

    servicePicker.innerHTML = "";

    if (!SITE.SERVICES) return;

    SITE.SERVICES.forEach(
      (service, index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "booking-option";

        button.dataset.index =
          index;

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
            bookingData.service =
              service;

            servicePicker
              .querySelectorAll(
                ".booking-option"
              )
              .forEach((el) =>
                el.classList.remove(
                  "is-selected"
                )
              );

            button.classList.add(
              "is-selected"
            );
          }
        );

        servicePicker.appendChild(
          button
        );
      }
    );
  }

  /* --------------------------------------------------------------------------
     BARBEIROS DO BOOKING
  -------------------------------------------------------------------------- */

  function renderBookingBarbers() {
    if (!barberPicker) return;

    barberPicker.innerHTML = "";

    if (!SITE.BARBERS) return;

    SITE.BARBERS.forEach(
      (barber, index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "booking-option";

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
            bookingData.barber =
              barber;

            barberPicker
              .querySelectorAll(
                ".booking-option"
              )
              .forEach((el) =>
                el.classList.remove(
                  "is-selected"
                )
              );

            button.classList.add(
              "is-selected"
            );

            if (
              bookingData.date
            ) {
              loadAvailableTimes();
            }
          }
        );

        barberPicker.appendChild(
          button
        );
      }
    );
  }

  /* --------------------------------------------------------------------------
     DATAS
  -------------------------------------------------------------------------- */

  function renderDates() {
    if (!dateSlots) return;

    dateSlots.innerHTML = "";

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
          bookingData.date =
            value;

          bookingData.time =
            null;

          dateSlots
            .querySelectorAll(
              ".date-slot"
            )
            .forEach((el) =>
              el.classList.remove(
                "is-selected"
              )
            );

          button.classList.add(
            "is-selected"
          );

          await loadAvailableTimes();
        }
      );

      dateSlots.appendChild(
        button
      );
    }
  }

  /* --------------------------------------------------------------------------
     HORÁRIOS
  -------------------------------------------------------------------------- */

  async function loadAvailableTimes() {
    if (!timeSlots)
      return;

    timeSlots.innerHTML = "";

    if (!bookingData.date) {
      if (slotHint) {
        slotHint.textContent =
          "Seleciona uma data para ver os horários disponíveis.";
      }

      return;
    }

    if (!bookingData.barber) {
      if (slotHint) {
        slotHint.textContent =
          "Seleciona primeiro o barbeiro.";
      }

      return;
    }

    if (slotHint) {
      slotHint.textContent =
        "A verificar horários disponíveis...";
    }

    const allTimes = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
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

    let occupied = [];

    try {
      const {
        data,
        error
      } =
        await supabaseClient
          .from("bookings")
          .select("*")
          .eq(
            "date",
            bookingData.date
          );

      if (error) {
        console.error(
          "Erro ao procurar marcações:",
          error
        );
      } else if (data) {
        occupied = data;
      }
    } catch (error) {
      console.error(
        "Erro ao consultar horários:",
        error
      );
    }

    allTimes.forEach(
      (time) => {
        const isOccupied =
          occupied.some(
            (booking) =>
              booking.time ===
                time &&
              (
                booking.barber_id ===
                  bookingData
                    .barber
                    ?.id ||
                booking.barber ===
                  bookingData
                    .barber
                    ?.name ||
                booking.barber_name ===
                  bookingData
                    .barber
                    ?.name
              )
          );

        const button =
          document.createElement(
            "button"
          );

        button.type = "button";
        button.className =
          "time-slot";

        button.textContent =
          time;

        if (isOccupied) {
          button.disabled = true;
          button.classList.add(
            "is-disabled"
          );
        } else {
          button.addEventListener(
            "click",
            () => {
              bookingData.time =
                time;

              timeSlots
                .querySelectorAll(
                  ".time-slot"
                )
                .forEach((el) =>
                  el.classList.remove(
                    "is-selected"
                  )
                );

              button.classList.add(
                "is-selected"
              );

              if (slotHint) {
                slotHint.textContent =
                  "Horário selecionado: " +
                  time;
              }
            }
          );
        }

        timeSlots.appendChild(
          button
        );
      }
    );

    if (slotHint) {
      slotHint.textContent =
        "Escolhe um dos horários disponíveis.";
    }
  }

  /* --------------------------------------------------------------------------
     VALIDAÇÃO
  -------------------------------------------------------------------------- */

  function validateStep() {
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
      if (
        !bookingData.date ||
        !bookingData.time
      ) {
        alert(
          "Escolhe a data e o horário."
        );

        return false;
      }
    }

    if (currentStep === 4) {
      const name =
        document.getElementById(
          "bkName"
        );

      const phone =
        document.getElementById(
          "bkPhone"
        );

      if (
        !name ||
        !name.value.trim()
      ) {
        alert(
          "Indica o teu nome."
        );

        name?.focus();

        return false;
      }

      if (
        !phone ||
        !phone.value.trim()
      ) {
        alert(
          "Indica o teu telemóvel."
        );

        phone?.focus();

        return false;
      }

      bookingData.name =
        name.value.trim();

      bookingData.phone =
        phone.value.trim();
    }

    return true;
  }

  /* --------------------------------------------------------------------------
     RESUMO
  -------------------------------------------------------------------------- */

  function renderBookingSummary() {
    if (!bookingSummary)
      return;

    const date =
      bookingData.date
        ? new Date(
            bookingData.date +
              "T12:00:00"
          ).toLocaleDateString(
            "pt-PT"
          )
        : "";

    bookingSummary.innerHTML = `
      <div class="summary-row">
        <span>Serviço</span>
        <strong>
          ${escapeHtml(
            bookingData.service
              ?.name || ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>Barbeiro</span>
        <strong>
          ${escapeHtml(
            bookingData.barber
              ?.name || ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>Data</span>
        <strong>
          ${escapeHtml(date)}
        </strong>
      </div>

      <div class="summary-row">
        <span>Hora</span>
        <strong>
          ${escapeHtml(
            bookingData.time || ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>Cliente</span>
        <strong>
          ${escapeHtml(
            bookingData.name || ""
          )}
        </strong>
      </div>

      <div class="summary-row">
        <span>Telemóvel</span>
        <strong>
          ${escapeHtml(
            bookingData.phone || ""
          )}
        </strong>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     NEXT
  -------------------------------------------------------------------------- */

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      () => {
        if (!validateStep())
          return;

        if (
          currentStep === 4
        ) {
          renderBookingSummary();
        }

        if (
          currentStep < 5
        ) {
          showBookingStep(
            currentStep + 1
          );
        }
      }
    );
  }

  /* --------------------------------------------------------------------------
     BACK
  -------------------------------------------------------------------------- */

  if (backBtn) {
    backBtn.addEventListener(
      "click",
      () => {
        if (
          currentStep > 1
        ) {
          showBookingStep(
            currentStep - 1
          );
        }
      }
    );
  }

  /* --------------------------------------------------------------------------
     ENVIAR MARCAÇÃO
  -------------------------------------------------------------------------- */

  if (bookingForm) {
    bookingForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        if (!supabaseClient) {
          alert(
            "O sistema de marcações não está disponível."
          );

          return;
        }

        if (
          !bookingData.service ||
          !bookingData.barber ||
          !bookingData.date ||
          !bookingData.time ||
          !bookingData.name ||
          !bookingData.phone
        ) {
          alert(
            "Faltam dados na marcação."
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
          const {
            data: userData
          } =
            await supabaseClient.auth.getUser();

          const user =
            userData?.user || null;

          const reference =
            "RG-" +
            Date.now()
              .toString()
              .slice(-8);

          const payload = {
            user_id:
              user?.id || null,

            name:
              bookingData.name,

            phone:
              bookingData.phone,

            service:
              bookingData.service
                ?.name || "",

            barber:
              bookingData.barber
                ?.name || "",

            date:
              bookingData.date,

            time:
              bookingData.time,

            status:
              "confirmed",

            reference:
              reference
          };

          const {
            error
          } =
            await supabaseClient
              .from("bookings")
              .insert(
                payload
              );

          if (error) {
            console.error(
              "Erro ao criar marcação:",
              error
            );

            alert(
              "Não foi possível registar a marcação: " +
              error.message
            );

            return;
          }

          if (successName) {
            successName.textContent =
              bookingData.name;
          }

          if (successRef) {
            successRef.textContent =
              reference;
          }

          if (successDetails) {
            const date =
              new Date(
                bookingData.date +
                  "T12:00:00"
              ).toLocaleDateString(
                "pt-PT"
              );

            successDetails.innerHTML = `
              <p>
                <strong>Serviço:</strong>
                ${escapeHtml(
                  bookingData.service
                    ?.name || ""
                )}
              </p>

              <p>
                <strong>Barbeiro:</strong>
                ${escapeHtml(
                  bookingData.barber
                    ?.name || ""
                )}
              </p>

              <p>
                <strong>Data:</strong>
                ${escapeHtml(
                  date
                )}
              </p>

              <p>
                <strong>Hora:</strong>
                ${escapeHtml(
                  bookingData.time
                )}
              </p>
            `;
          }

          if (bookingForm) {
            bookingForm
              .querySelectorAll(
                ".booking-step, .booking-nav"
              )
              .forEach(
                (el) => {
                  el.hidden = true;
                }
              );
          }

          if (bookingSuccess) {
            bookingSuccess.hidden =
              false;
          }

          console.log(
            "Marcação criada:",
            reference
          );
        } catch (error) {
          console.error(
            "Erro ao criar marcação:",
            error
          );

          alert(
            "Ocorreu um erro ao guardar a marcação."
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

  /* --------------------------------------------------------------------------
     NOVA MARCAÇÃO
  -------------------------------------------------------------------------- */

  if (newBookingBtn) {
    newBookingBtn.addEventListener(
      "click",
      () => {
        bookingData = {
          service: null,
          barber: null,
          date: null,
          time: null,
          name: "",
          phone: ""
        };

        const name =
          document.getElementById(
            "bkName"
          );

        const phone =
          document.getElementById(
            "bkPhone"
          );

        if (name)
          name.value = "";

        if (phone)
          phone.value = "";

        if (bookingSuccess) {
          bookingSuccess.hidden =
            true;
        }

        if (bookingForm) {
          bookingForm
            .querySelectorAll(
              ".booking-step, .booking-nav"
            )
            .forEach(
              (el) => {
                el.hidden = false;
              }
            );
        }

        renderBookingServices();
        renderBookingBarbers();
        renderDates();

        showBookingStep(1);

        document
          .querySelector(
            "#marcacao"
          )
          ?.scrollIntoView({
            behavior: "smooth"
          });
      }
    );
  }

  /* ==========================================================================
     INICIALIZAÇÃO
  ========================================================================== */

  renderServices();
  renderBarbers();

  renderBookingServices();
  renderBookingBarbers();
  renderDates();

  showBookingStep(1);

  updateUserInterface();

  setupReveal();

})();
