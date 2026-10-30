// Estado global de la aplicación
const state = {
  fromCurrency: "USD",
  toCurrency: "EUR",
  amount: 100,
  rates: { ...FALLBACK_RATES_USD },
  isLive: false,
  lastUpdated: null,
  activeDropdown: null, // 'from' o 'to'
  highlightedIndex: -1
};

let toastTimeout = null;

// Elementos del DOM
const elements = {
  amountInput: document.getElementById("amountInput"),
  clearAmountBtn: document.getElementById("clearAmountBtn"),
  inputCurrencySymbol: document.getElementById("inputCurrencySymbol"),
  presetChips: document.querySelectorAll(".preset-chip"),
  
  // From Trigger & Popover
  fromCurrencyWrapper: document.getElementById("fromCurrencyWrapper"),
  fromTrigger: document.getElementById("fromTrigger"),
  fromFlag: document.getElementById("fromFlag"),
  fromCode: document.getElementById("fromCode"),
  fromName: document.getElementById("fromName"),
  fromPopover: document.getElementById("fromPopover"),
  fromSearch: document.getElementById("fromSearch"),
  fromOptions: document.getElementById("fromOptions"),
  
  // To Trigger & Popover
  toCurrencyWrapper: document.getElementById("toCurrencyWrapper"),
  toTrigger: document.getElementById("toTrigger"),
  toFlag: document.getElementById("toFlag"),
  toCode: document.getElementById("toCode"),
  toName: document.getElementById("toName"),
  toPopover: document.getElementById("toPopover"),
  toSearch: document.getElementById("toSearch"),
  toOptions: document.getElementById("toOptions"),
  
  // Controls & Results
  swapBtn: document.getElementById("swapBtn"),
  convertedAmount: document.getElementById("convertedAmount"),
  targetCurrencyCode: document.getElementById("targetCurrencyCode"),
  exchangeRateFormula: document.getElementById("exchangeRateFormula"),
  lastUpdatedText: document.getElementById("lastUpdatedText"),
  statusBadge: document.getElementById("statusBadge"),
  statusText: document.getElementById("statusText"),
  copyBtn: document.getElementById("copyBtn"),
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
  conversionMatrix: document.getElementById("conversionMatrix"),
  popularGrid: document.getElementById("popularGrid"),
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon")
};

// Normalizar texto para búsquedas (elimina tildes y mayúsculas: ej. "dólar" -> "dolar")
function normalizeText(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Obtener datos de la moneda
function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

// Generar URL de la bandera oficial con FlagCDN
function getFlagUrl(flagCode) {
  if (!flagCode) return "icon-192.png";
  return `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
}

// Inicialización de la aplicación
async function initApp() {
  initTheme();
  renderSelectedCurrencies();
  renderOptionsList("from");
  renderOptionsList("to");
  attachEventListeners();
  updateClearButtonVisibility();
  
  // Obtener tasas en tiempo real
  await fetchLiveRates();
  
  // Realizar conversión inicial
  calculateConversion();

  // Refrescar iconos Lucide o fallback offline
  refreshIcons();
}

// Manejar iconos con soporte offline si falla el CDN de Lucide
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Obtener tasas de cambio en vivo desde API gratuita y sin CORS
async function fetchLiveRates() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-cache",
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Error en la respuesta de la red");
    
    const data = await response.json();
    if (data && data.rates) {
      state.rates = { ...FALLBACK_RATES_USD, ...data.rates };
      state.isLive = true;
      state.lastUpdated = new Date();
      updateStatusBadge(true);
    }
  } catch (error) {
    console.warn("No se pudieron cargar tasas en vivo (o conexión local offline). Usando tasas de reserva:", error.message);
    state.isLive = false;
    updateStatusBadge(false);
  }
}

// Actualizar el estado visual de la conexión
function updateStatusBadge(isLive) {
  if (isLive) {
    elements.statusBadge.classList.remove("offline");
    elements.statusText.textContent = "Tasas en vivo";
  } else {
    elements.statusBadge.classList.add("offline");
    elements.statusText.textContent = "Modo respaldo";
  }
}

// Renderizar las monedas seleccionadas en los botones de gatillo
function renderSelectedCurrencies() {
  const from = getCurrency(state.fromCurrency);
  const to = getCurrency(state.toCurrency);

  elements.fromFlag.src = getFlagUrl(from.flag);
  elements.fromFlag.alt = `Bandera de ${from.country}`;
  elements.fromFlag.onerror = function() {
    this.onerror = null;
    this.src = "icon-192.png";
  };
  elements.fromCode.textContent = from.code;
  elements.fromName.textContent = `${from.name} (${from.country})`;

  elements.toFlag.src = getFlagUrl(to.flag);
  elements.toFlag.alt = `Bandera de ${to.country}`;
  elements.toFlag.onerror = function() {
    this.onerror = null;
    this.src = "icon-192.png";
  };
  elements.toCode.textContent = to.code;
  elements.toName.textContent = `${to.name} (${to.country})`;

  elements.inputCurrencySymbol.textContent = from.symbol || "$";
  elements.targetCurrencyCode.textContent = to.code;
}

// Renderizar la lista de opciones para un desplegable con soporte para tildes
function renderOptionsList(type, filterQuery = "") {
  const container = type === "from" ? elements.fromOptions : elements.toOptions;
  const currentSelected = type === "from" ? state.fromCurrency : state.toCurrency;
  
  const query = normalizeText(filterQuery);
  
  const filtered = CURRENCIES.filter(curr => {
    return (
      normalizeText(curr.code).includes(query) ||
      normalizeText(curr.name).includes(query) ||
      normalizeText(curr.country).includes(query)
    );
  });

  state.highlightedIndex = -1;

  if (filtered.length === 0) {
    container.innerHTML = `<li style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No se encontraron monedas para "${filterQuery}"</li>`;
    return;
  }

  container.innerHTML = filtered.map((curr, idx) => {
    const isSelected = curr.code === currentSelected;
    return `
      <li class="currency-option ${isSelected ? 'selected' : ''}" data-code="${curr.code}" data-type="${type}" data-index="${idx}">
        <div class="option-left">
          <img class="flag-img" src="${getFlagUrl(curr.flag)}" alt="${curr.country}" loading="lazy" onerror="this.onerror=null; this.src='icon-192.png'">
          <div class="option-info">
            <span class="option-code">${curr.code}</span>
            <span class="option-country">${curr.name} • ${curr.country}</span>
          </div>
        </div>
        <span class="option-symbol">${curr.symbol}</span>
      </li>
    `;
  }).join("");

  // Añadir listeners a las opciones
  container.querySelectorAll(".currency-option").forEach(item => {
    item.addEventListener("click", () => {
      const selectedCode = item.getAttribute("data-code");
      selectCurrency(type, selectedCode);
    });
  });
}

// Manejar la selección de una moneda
function selectCurrency(type, code) {
  if (type === "from") {
    state.fromCurrency = code;
  } else {
    state.toCurrency = code;
  }
  
  closeDropdowns();
  renderSelectedCurrencies();
  calculateConversion();
}

// Apertura y cierre de desplegables
function toggleDropdown(type) {
  if (state.activeDropdown === type) {
    closeDropdowns();
    return;
  }

  closeDropdowns();
  state.activeDropdown = type;

  if (type === "from") {
    elements.fromCurrencyWrapper.classList.add("open");
    elements.fromPopover.classList.add("open");
    elements.fromTrigger.classList.add("active");
    elements.fromSearch.value = "";
    renderOptionsList("from");
    setTimeout(() => elements.fromSearch.focus(), 60);
  } else {
    elements.toCurrencyWrapper.classList.add("open");
    elements.toPopover.classList.add("open");
    elements.toTrigger.classList.add("active");
    elements.toSearch.value = "";
    renderOptionsList("to");
    setTimeout(() => elements.toSearch.focus(), 60);
  }
}

function closeDropdowns() {
  state.activeDropdown = null;
  elements.fromCurrencyWrapper.classList.remove("open");
  elements.toCurrencyWrapper.classList.remove("open");
  elements.fromPopover.classList.remove("open");
  elements.fromTrigger.classList.remove("active");
  elements.toPopover.classList.remove("open");
  elements.toTrigger.classList.remove("active");
  state.highlightedIndex = -1;
}

// Actualizar visibilidad del botón de limpiar cantidad
function updateClearButtonVisibility() {
  if (!elements.clearAmountBtn) return;
  const val = elements.amountInput.value;
  if (val && parseFloat(val) > 0) {
    elements.clearAmountBtn.classList.remove("hidden");
  } else {
    elements.clearAmountBtn.classList.add("hidden");
  }
}

// Calcular la tasa y el resultado
function calculateConversion() {
  const rawValue = elements.amountInput.value;
  let amount = parseFloat(rawValue);

  if (isNaN(amount) || amount < 0) {
    amount = 0;
  }
  state.amount = amount;
  updateClearButtonVisibility();

  const rateFrom = state.rates[state.fromCurrency] || 1;
  const rateTo = state.rates[state.toCurrency] || 1;

  // Tasa unitaria con protección de división por cero
  const unitRate = rateFrom > 0 ? (1 / rateFrom) * rateTo : 0;
  const total = amount * unitRate;

  // Formatear cantidades
  const formattedResult = formatCurrencyValue(total, state.toCurrency);
  elements.convertedAmount.textContent = formattedResult;

  // Fórmula de tasa de cambio
  const formattedUnitRate = unitRate < 0.0001 ? unitRate.toFixed(6) : unitRate < 1 ? unitRate.toFixed(4) : unitRate.toFixed(2);
  const inverseUnitRate = unitRate > 0 ? (1 / unitRate) : 0;
  const formattedInverse = inverseUnitRate < 0.0001 ? inverseUnitRate.toFixed(6) : inverseUnitRate < 1 ? inverseUnitRate.toFixed(4) : inverseUnitRate.toFixed(2);

  elements.exchangeRateFormula.textContent = `1 ${state.fromCurrency} = ${formattedUnitRate} ${state.toCurrency} • 1 ${state.toCurrency} = ${formattedInverse} ${state.fromCurrency}`;

  if (state.lastUpdated) {
    elements.lastUpdatedText.textContent = `Actualizado: ${state.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    elements.lastUpdatedText.textContent = "Tasas de referencia";
  }

  // Renderizar secciones secundarias
  renderConversionMatrix(unitRate);
  renderPopularGrid(amount, rateFrom);
}

// Formato de números con separador de miles
function formatCurrencyValue(val, currencyCode) {
  // Monedas sin decimales habituales
  const noDecimals = ["JPY", "KRW", "CLP", "COP", "PYG", "HUF", "IDR"];
  const maximumFractionDigits = noDecimals.includes(currencyCode) ? 0 : val < 1 && val > 0 ? 4 : 2;

  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: noDecimals.includes(currencyCode) ? 0 : 2,
    maximumFractionDigits: maximumFractionDigits
  }).format(val);
}

// Renderizar tabla de equivalencias rápidas
function renderConversionMatrix(unitRate) {
  const steps = [1, 5, 10, 50, 100, 500, 1000];
  
  elements.conversionMatrix.innerHTML = steps.map(qty => {
    const converted = qty * unitRate;
    return `
      <div class="matrix-row">
        <span class="matrix-from">${qty} ${state.fromCurrency}</span>
        <span class="matrix-to">${formatCurrencyValue(converted, state.toCurrency)} ${state.toCurrency}</span>
      </div>
    `;
  }).join("");
}

// Renderizar cuadrícula con monedas populares
function renderPopularGrid(amount, rateFrom) {
  const candidates = ["USD", "EUR", "GBP", "JPY", "MXN", "BRL"];
  const popular = candidates
    .filter(code => code !== state.fromCurrency && code !== state.toCurrency)
    .slice(0, 4);

  elements.popularGrid.innerHTML = popular.map(targetCode => {
    const curr = getCurrency(targetCode);
    const targetRate = state.rates[targetCode] || 1;
    const result = rateFrom > 0 ? (amount / rateFrom) * targetRate : 0;

    return `
      <div class="popular-item" data-code="${curr.code}">
        <div class="popular-top">
          <img class="popular-flag" src="${getFlagUrl(curr.flag)}" alt="${curr.country}" onerror="this.onerror=null; this.src='icon-192.png'">
          <span class="popular-code">${curr.code}</span>
        </div>
        <span class="popular-value">${curr.symbol} ${formatCurrencyValue(result, curr.code)}</span>
      </div>
    `;
  }).join("");

  // Al hacer clic en una moneda popular, convertir hacia ella
  elements.popularGrid.querySelectorAll(".popular-item").forEach(item => {
    item.addEventListener("click", () => {
      const code = item.getAttribute("data-code");
      state.toCurrency = code;
      renderSelectedCurrencies();
      calculateConversion();
    });
  });
}

// Intercambiar monedas (Swap)
function handleSwap() {
  const temp = state.fromCurrency;
  state.fromCurrency = state.toCurrency;
  state.toCurrency = temp;

  renderSelectedCurrencies();
  calculateConversion();

  // Animación del botón
  elements.swapBtn.style.transform = "rotate(180deg) scale(0.95)";
  setTimeout(() => {
    elements.swapBtn.style.transform = "";
  }, 300);
}

// Copiar resultado al portapapeles
async function handleCopyResult() {
  const fromCurr = getCurrency(state.fromCurrency);
  const toCurr = getCurrency(state.toCurrency);
  const textToCopy = `${state.amount} ${fromCurr.code} = ${elements.convertedAmount.textContent} ${toCurr.code}`;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // Fallback para entornos locales o navegadores sin Clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    showToast(`¡Copiado: ${textToCopy}!`);
  } catch (err) {
    showToast("No se pudo copiar al portapapeles");
  }
}

// Mostrar notificación Toast con control de temporizadores
function showToast(msg) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  elements.toastMessage.textContent = msg;
  elements.toast.classList.add("show");
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2500);
}

// Manejo del tema Claro/Oscuro
function initTheme() {
  const savedTheme = localStorage.getItem("converter-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("converter-theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (theme === "light") {
    elements.themeIcon.setAttribute("data-lucide", "moon");
  } else {
    elements.themeIcon.setAttribute("data-lucide", "sun");
  }
  refreshIcons();
}

// Navegación por teclado en listas desplegables
function handleSearchKeydown(e, type) {
  const container = type === "from" ? elements.fromOptions : elements.toOptions;
  const options = container.querySelectorAll(".currency-option");
  if (!options.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.highlightedIndex = Math.min(state.highlightedIndex + 1, options.length - 1);
    updateHighlight(options);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.highlightedIndex = Math.max(state.highlightedIndex - 1, 0);
    updateHighlight(options);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const targetIdx = state.highlightedIndex >= 0 ? state.highlightedIndex : 0;
    if (options[targetIdx]) {
      const selectedCode = options[targetIdx].getAttribute("data-code");
      selectCurrency(type, selectedCode);
    }
  }
}

function updateHighlight(options) {
  options.forEach((opt, idx) => {
    if (idx === state.highlightedIndex) {
      opt.classList.add("highlighted");
      opt.scrollIntoView({ block: "nearest" });
    } else {
      opt.classList.remove("highlighted");
    }
  });
}

// Event Listeners
function attachEventListeners() {
  // Input de cantidad
  elements.amountInput.addEventListener("input", () => {
    calculateConversion();
  });

  // Evitar valores negativos o caracteres exponenciales
  elements.amountInput.addEventListener("keydown", (e) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  });

  // Evitar cambios bruscos al hacer scroll con la rueda del ratón
  elements.amountInput.addEventListener("wheel", (e) => {
    e.target.blur();
  }, { passive: true });

  // Limpiar cantidad
  if (elements.clearAmountBtn) {
    elements.clearAmountBtn.addEventListener("click", () => {
      elements.amountInput.value = "";
      elements.amountInput.focus();
      calculateConversion();
    });
  }

  // Botones de incremento rápido (+10, +50, +100...)
  elements.presetChips.forEach(btn => {
    btn.addEventListener("click", () => {
      const increment = parseFloat(btn.getAttribute("data-amount")) || 0;
      const current = parseFloat(elements.amountInput.value) || 0;
      elements.amountInput.value = (current + increment).toFixed(0);
      calculateConversion();
    });
  });

  // Botón intercambiar
  elements.swapBtn.addEventListener("click", handleSwap);

  // Gatillo desplegable From
  elements.fromTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("from");
  });

  // Gatillo desplegable To
  elements.toTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown("to");
  });

  // Búsqueda en desplegables
  elements.fromSearch.addEventListener("input", (e) => {
    renderOptionsList("from", e.target.value);
  });
  elements.fromSearch.addEventListener("keydown", (e) => handleSearchKeydown(e, "from"));

  elements.toSearch.addEventListener("input", (e) => {
    renderOptionsList("to", e.target.value);
  });
  elements.toSearch.addEventListener("keydown", (e) => handleSearchKeydown(e, "to"));

  // Prevenir que el clic dentro del popover lo cierre
  elements.fromPopover.addEventListener("click", (e) => e.stopPropagation());
  elements.toPopover.addEventListener("click", (e) => e.stopPropagation());

  // Cerrar desplegables al hacer clic fuera o pulsar Esc
  document.addEventListener("click", () => closeDropdowns());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdowns();
  });

  // Botón copiar
  elements.copyBtn.addEventListener("click", handleCopyResult);

  // Toggle de tema
  elements.themeToggle.addEventListener("click", toggleTheme);
}

// Registro de Service Worker para PWA (solo en servidores web HTTP/HTTPS)
function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => console.log("PWA Service Worker registrado con éxito:", reg.scope))
        .catch((err) => console.warn("Aviso Service Worker:", err.message));
    });
  }
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  initApp();
  registerServiceWorker();
});
