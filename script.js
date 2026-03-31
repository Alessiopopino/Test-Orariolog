document.addEventListener("DOMContentLoaded", async () => {
  const calendarContainer = document.getElementById("calendar");
  const searchInput = document.getElementById("search-input");
  const daySelect = document.getElementById("day-select");
  const themeToggle = document.getElementById("theme-toggle");
  const footer = document.querySelector("footer");

  // Elementi da nascondere in manutenzione
  const searchBar = document.getElementById("search-bar");
  const dayFilter = document.getElementById("day-filter");

  // ===== MODALITÀ MANUTENZIONE =====
  // Imposta a true per attivare la manutenzione (sito offline)
  const MAINTENANCE_MODE = true;   // <--- Cambia qui in true quando serve

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

  // ===== CREA CARD CON ATTRIBUTI DATA =====
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

    card.innerHTML = `
      <div class="date">${formattedDate}</div>
      <div class="lesson">
        <strong>${item.materia}</strong><br>
        ${item.docente}<br>
        ${item.orario}<br>
        <a href="${item.maps}" target="_blank">📍 Apri su Maps</a>
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

  // ===== AVVIO =====
  if (MAINTENANCE_MODE) {
    // Nasconde i controlli e mostra il messaggio di manutenzione
    searchBar.style.display = "none";
    dayFilter.style.display = "none";
    showMaintenanceMessage();
  } else {
    // Modalità normale: mostra i controlli e carica l'orario
    searchBar.style.display = "";
    dayFilter.style.display = "";
    const data = await loadOrario();
    data
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .forEach((item, index) => createCard(item, index));

    // Ritardo per far comparire il footer
    const totalAnimationTime = data.length * 60 + 300;
    setTimeout(() => {
      footer.classList.add("visible");
    }, totalAnimationTime);

    // Collega i filtri
    searchInput.addEventListener("input", applyFilters);
    daySelect.addEventListener("change", applyFilters);
  }

  // ===== TITOLO CLICCABILE PER RIAVVIARE LA PAGINA =====
  const title = document.querySelector("header h1");
  title.style.cursor = "pointer";
  title.addEventListener("click", () => {
    window.location.reload();
  });
});
