# 💱 CONVERSOR DE DIVISAS
> **Tu dinero En Otra Moneda - Un cambio sencillo al instante**

Una aplicación web y móvil moderna, rápida y visual para la conversión de divisas en tiempo real, con diseño interactivo, banderas oficiales de alta resolución y soporte offline.

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

1. **Abrir directamente en PC:**
   - Haz doble clic en el archivo `iniciar.bat` o abre `index.html` en cualquier navegador web (Google Chrome, Microsoft Edge, Firefox, Brave, Safari, etc.).
2. **Listo para usar**: No requiere instalación de Node.js, librerías ni compilación.

---

## 📱 Cómo Convertirla a una App para Teléfono (Móvil)

Esta aplicación ya está configurada con soporte para **PWA (Progressive Web App)**, incluyendo `manifest.json`, iconos (`icon-192.png`, `icon-512.png`) y `sw.js` (Service Worker).

Tienes **3 opciones** para usarla o distribuirla en teléfonos:

### Opción 1: Instalarla Directamente en tu Teléfono (PWA - Sin Instalar Nada Extra)
Es la forma más rápida y moderna. La app funciona en pantalla completa, tiene su propio icono en el inicio y funciona sin conexión:
1. Sube los archivos a cualquier hosting gratuito (ejemplo: **GitHub Pages**, **Vercel**, **Netlify** o **Firebase Hosting**).
2. Abre el enlace desde tu teléfono:
   - **En Android (Chrome):** Toca los tres puntos `⋮` y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
   - **En iPhone / iOS (Safari):** Toca el botón Compartir (icono de cuadrado con flecha hacia arriba) y selecciona **"Agregar al inicio"**.
3. ¡Listo! Se abrirá como una aplicación nativa independiente sin barra del navegador.

### Opción 2: Generar un archivo instalador APK para Android (Gratis y sin programar)
Si quieres un archivo instalador `.apk` para compartirlo por WhatsApp o subirlo a la Google Play Store:
1. **Con PWABuilder (Recomendado de Microsoft):**
   - Una vez subida tu app a la web, entra en [PWABuilder.com](https://www.pwabuilder.com/).
   - Ingresa la URL de tu conversor y haz clic en **"Start"**.
   - Haz clic en **"Package for Android"** y descarga el archivo APK o el paquete listo para Google Play Store.
2. **Con WebIntoApp:**
   - Entra en [WebIntoApp.com](https://www.webintoapp.com/).
   - Sube la carpeta comprimida en `.zip` de este proyecto o introduce tu enlace.
   - Genera y descarga el archivo `.apk` directamente en tu teléfono.

### Opción 3: Compilarla como App Nativa con Capacitor (Para desarrolladores)
Si tienes Node.js y Android Studio en tu computadora:
```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Conversor" "com.conversor.app" --web-dir "."
npx cap add android
npx cap open android
```
Luego desde Android Studio haces clic en **Build > Build Bundle(s) / APK(s) > Build APK(s)** para generar tu archivo final.

---

## 📁 Estructura del Proyecto

```text
Conversor/
├── index.html       # Estructura semántica de la aplicación y layout
├── style.css        # Estilos modernos, diseño responsive, animaciones y temas
├── app.js           # Lógica de conversión, búsquedas, eventos y Service Worker
├── currencies.js    # Base de datos de más de 45 divisas, banderas, símbolos y tasas de respaldo
├── manifest.json    # Configuración PWA para instalación móvil (nombre, tema, pantalla completa)
├── sw.js            # Service Worker para funcionamiento offline en el teléfono
├── icon-192.png     # Icono de la app para pantallas móviles estándar
├── icon-512.png     # Icono de alta resolución para splash screen y tiendas
├── iniciar.bat      # Acceso directo para abrir la app con un clic en Windows
└── README.md        # Documentación del proyecto
```

