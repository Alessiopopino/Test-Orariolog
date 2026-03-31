document.addEventListener("DOMContentLoaded", async () => {
  // ===== DETERRENTE PER STRUMENTI DI SVILUPPO =====
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
    }
  });

  const calendarContainer = document.getElementById("calendar");
  const searchInput = document.getElementById("search-input");
  const daySelect = document.getElementById("day-select");
  const themeToggle = document.getElementById("theme-toggle");
  const footer = document.querySelector("footer");

  const searchBar = document.getElementById("search-bar");
  const dayFilter = document.getElementById("day-filter");
  const searchWrapper = document.getElementById("search-wrapper");

  // ===== MODALITÀ MANUTENZIONE =====
  const MAINTENANCE_MODE = false; // Cambia in true per attivare la manutenzione

  // ===== FUNZIONE ESCAPE XSS =====
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ===== TEMA =====
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
  });

  // ===== CREA CARD =====
  function createCard(item, index) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-date", item.data);
    card.setAttribute("data-materia", item.materia.toLowerCase());
    card.setAttribute("data-docente", item.docente.toLowerCase());

    const date = new Date(item.data + "T00:00:00");
    const dayName = date.toLocaleDateString("it-IT", { weekday: "long" });
    const formattedDate = `${dayName} ${date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    })}`;

    const safeMateria = escapeHtml(item.materia);
    const safeDocente = escapeHtml(item.docente);
    const safeOrario = escapeHtml(item.orario);
    const mapsUrl = item.maps;

    card.innerHTML = `
      <div class="date">${formattedDate}</div>
      <div class="lesson">
        <strong>${safeMateria}</strong><br>
        ${safeDocente}<br>
        ${safeOrario}<br>
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer">📍 Apri su Maps</a>
      </div>
    `;

    calendarContainer.appendChild(card);
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 60);
  }

  // ===== CARICA DATI =====
  async function loadOrario() {
    try {
      const response = await fetch("orario.json", { cache: "no-store" });
      return await response.json();
    } catch {
      calendarContainer.innerHTML = "<p>Errore nel caricamento dell'orario.</p>";
      return [];
    }
  }

  // ===== MESSAGGIO MANUTENZIONE =====
  function showMaintenanceMessage() {
    calendarContainer.innerHTML = `
      <div class="maintenance-message">
        <h2>🔧 Sito in manutenzione</h2>
        <p>Torneremo presto con l'orario aggiornato.</p>
        <p>Grazie per la pazienza!</p>
      </div>
    `;
    footer.classList.add("visible");
  }

  // ===== FILTRI =====
  function applyFilters() {
    const text = searchInput.value.toLowerCase().trim();
    const day = daySelect.value;

    const cards = document.querySelectorAll(".card");
    let visibleCount = 0;

    cards.forEach(card => {
      const docente = card.getAttribute("data-docente") || "";
      const dataISO = card.getAttribute("data-date") || "";
      const dateText = card.querySelector(".date").textContent.toLowerCase();

      const fullText = `${docente} ${dateText} ${dataISO}`.toLowerCase();

      const matchText = text === "" || fullText.includes(text);
      const matchDay = day === "all" || dateText.includes(day);

      if (matchText && matchDay) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    let noResultsMsg = document.getElementById("no-results");
    if (visibleCount === 0 && cards.length > 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement("p");
        noResultsMsg.id = "no-results";
        noResultsMsg.style.textAlign = "center";
        noResultsMsg.style.marginTop = "2rem";
        noResultsMsg.style.fontStyle = "italic";
        calendarContainer.appendChild(noResultsMsg);
      }
      noResultsMsg.textContent = "Nessun risultato trovato.";
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }

  // ===== EFFETTO SCROLL: fade in/out della barra di ricerca =====
  let scrollTimeout;
  function handleScroll() {
    if (!searchWrapper) return;
    // Aggiunge la classe di trasparenza
    searchWrapper.classList.add("fade-scroll");
    // Resetta il timeout precedente
    clearTimeout(scrollTimeout);
    // Dopo 300 ms dalla fine dello scroll, rimuove la classe
    scrollTimeout = setTimeout(() => {
      searchWrapper.classList.remove("fade-scroll");
    }, 300);
  }

  function resetOpacity() {
    if (!searchWrapper) return;
    clearTimeout(scrollTimeout);
    searchWrapper.classList.remove("fade-scroll");
  }

  // ===== AVVIO =====
  if (MAINTENANCE_MODE) {
    searchBar.style.display = "none";
    dayFilter.style.display = "none";
    showMaintenanceMessage();
  } else {
    searchBar.style.display = "";
    dayFilter.style.display = "";
    const data = await loadOrario();
    data
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .forEach((item, index) => createCard(item, index));

    const totalAnimationTime = data.length * 60 + 300;
    setTimeout(() => {
      footer.classList.add("visible");
    }, totalAnimationTime);

    searchInput.addEventListener("input", applyFilters);
    daySelect.addEventListener("change", applyFilters);
  }

  // ===== APPLICA EFFETTI SCROLL E INTERAZIONE =====
  window.addEventListener("scroll", handleScroll);
  // Se l'utente interagisce con la barra, torna opaca subito
  searchWrapper.addEventListener("mouseenter", resetOpacity);
  searchInput.addEventListener("focus", resetOpacity);
  daySelect.addEventListener("focus", resetOpacity);
  // Opzionale: clic su qualsiasi parte del wrapper
  searchWrapper.addEventListener("click", resetOpacity);

  // ===== TITOLO CLICCABILE PER RIAVVIARE =====
  const title = document.querySelector("header h1");
  title.style.cursor = "pointer";
  title.addEventListener("click", () => {
    window.location.reload();
  });

  // ===== CHANGELOG NEL FOOTER =====
  function addChangelogToFooter() {
    if (!footer) return;
    if (footer.querySelector(".changelog")) return;

    const changelogDiv = document.createElement("div");
    changelogDiv.className = "changelog";
    changelogDiv.innerHTML = `
      <div class="changelog-header">
        <span class="changelog-toggle">📋 Aggiornamenti recenti ▼</span>
      </div>
      <div class="changelog-content" style="display: none;">
        <ul>
          <li><strong>Modalità manutenzione</strong> – attivabile tramite costante nello script</li>
          <li><strong>Sicurezza XSS</strong> – escape di tutti i campi testuali</li>
          <li><strong>Deterrente ispezione</strong> – blocco tasto destro e combinazioni (F12, Ctrl+Shift+I, Ctrl+U)</li>
          <li><strong>Link mappe</strong> – aggiunto attributo <code>rel="noopener noreferrer"</code></li>
          <li><strong>Filtri migliorati</strong> – messaggio "Nessun risultato" quando non ci sono corrispondenze</li>
          <li><strong>Ricerca sticky con fade</strong> – la barra diventa semi-trasparente durante lo scroll e torna visibile all'interazione</li>
        </ul>
        <p class="changelog-date">Ultimo aggiornamento: 31 marzo 2026</p>
      </div>
    `;

    const footerP = footer.querySelector("p");
    if (footerP) {
      footer.insertBefore(changelogDiv, footerP.nextSibling);
    } else {
      footer.appendChild(changelogDiv);
    }

    const header = changelogDiv.querySelector(".changelog-toggle");
    const content = changelogDiv.querySelector(".changelog-content");
    header.addEventListener("click", () => {
      const isHidden = content.style.display === "none";
      content.style.display = isHidden ? "block" : "none";
      header.innerHTML = isHidden ? "📋 Aggiornamenti recenti ▲" : "📋 Aggiornamenti recenti ▼";
    });
  }

  setTimeout(addChangelogToFooter, 800);
});
