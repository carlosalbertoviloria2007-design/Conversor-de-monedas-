# 💱 Conversor de Monedas Global con Banderas

Una aplicación web moderna, rápida y visual para la conversión de divisas en tiempo real, con diseño interactivo, banderas oficiales de alta resolución y soporte offline.

---

## ✨ Características Principales

- 💵 **Entrada de dinero dinámica**: Campo numérico con formateo instantáneo, botón para limpiar y chips de incremento rápido (+10, +50, +100, +500, +1,000).
- 🚩 **Banderas de países en alta definición**: Integradas a través de FlagCDN oficial para cada país y divisa.
- 🔍 **Desplegables personalizados con buscador**: Encuentra monedas escribiendo el código (ej. `USD`, `EUR`, `MXN`), el nombre de la moneda o el nombre del país en español.
- 🔄 **Botón de intercambio (Swap)**: Invierte las monedas de origen y destino con un clic y animación de rotación.
- 🌐 **Tasas de cambio en vivo y modo offline**:
  - Conexión automática con la API pública de ExchangeRate-API (sin necesidad de clave API).
  - Tasa de respaldo integrada con más de 45 monedas internacionales y latinoamericanas por si no hay conexión a internet.
- 📋 **Copiar al portapapeles**: Copia el desglose de conversión con confirmación mediante notificación toast emergente.
- 📊 **Tabla de equivalencias rápidas**: Matriz automática de valores para 1, 5, 10, 50, 100, 500 y 1,000 unidades.
- 🌍 **Otras monedas populares**: Vista previa rápida del valor en las principales divisas globales (USD, EUR, GBP, JPY, MXN, BRL).
- 🌓 **Modo Claro / Oscuro**: Selector de tema persistente que guarda tu preferencia en `localStorage`.

---

## 🚀 Cómo Usar

1. **Abrir directamente:**
   - Haz doble clic en el archivo `iniciar.bat` o abre `index.html` en cualquier navegador web (Google Chrome, Microsoft Edge, Firefox, Brave, Safari, etc.).
2. **Listo para usar**: No requiere instalación de Node.js, librerías ni compilación.

---

## 📁 Estructura del Proyecto

```text
Conversor/
├── index.html       # Estructura semántica de la aplicación y layout
├── style.css        # Estilos modernos, diseño responsive, animaciones y temas
├── app.js           # Lógica de conversión, búsquedas, eventos y llamadas a la API
├── currencies.js    # Base de datos de más de 45 divisas, banderas, símbolos y tasas de respaldo
├── iniciar.bat      # Acceso directo para abrir la app con un clic en Windows
└── README.md        # Documentación del proyecto
```

