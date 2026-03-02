document.addEventListener("DOMContentLoaded", async () => {

  const calendarContainer = document.getElementById("calendar");
  const searchInput = document.getElementById("search-input");
  const daySelect = document.getElementById("day-select");
  const themeToggle = document.getElementById("theme-toggle");

  /* === TEMA === */
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") document.body.classList.add("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
  });

  /* === CREA CARD === */
  function createCard(item, index) {
    const card = document.createElement("div");
    card.classList.add("card");

    const date = new Date(item.data + "T00:00:00");
    const dayName = date.toLocaleDateString("it-IT", { weekday: "long" });

    const formattedDate = `${dayName} ${date.toLocaleDateString("it-IT", {
      day: "2-digit", month: "2-digit", year: "numeric"
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

  /* === CARICAMENTO DATI === */
  async function loadOrario() {
    try {
      const response = await fetch("orario.json", { cache: "no-store" });
      return await response.json();
    } catch {
      calendarContainer.innerHTML = "<p>Errore nel caricamento dell'orario.</p>";
      return [];
    }
  }

  /* === RENDER === */
  const data = await loadOrario();

  data
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .forEach((item, index) => createCard(item, index));

  /* === FILTRI === */
  function applyFilters() {
    const text = searchInput.value.toLowerCase();
    const day = daySelect.value;

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      const content = card.textContent.toLowerCase();
      const dateText = card.querySelector(".date").textContent.toLowerCase();

      const matchText = content.includes(text);
      const matchDay = (day === "all") || dateText.includes(day);

      card.style.display = matchText && matchDay ? "" : "none";
    });
  }

  searchInput.addEventListener("input", applyFilters);
  daySelect.addEventListener("change", applyFilters);

});
