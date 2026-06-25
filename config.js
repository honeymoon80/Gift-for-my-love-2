/* =============================================
   CONFIG.JS — Matrix Romántica para May
   TODA la personalización va en este archivo.
   ============================================= */
'use strict';

const CONFIG = {

  // ╔══════════════════════════════════════════╗
  // ║  🎨 COLORES                              ║
  // ╚══════════════════════════════════════════╝
  colors: {
    primary:    "#FFB6C1", // Rosa principal
    secondary:  "#FF6B81", // Rojo suave
    tertiary:   "#D4A5F5", // Morado pastel
    background: "#1A0A1A", // Fondo oscuro suave
    text:       "#FFB6C1", // Color del texto
    accent:     "#FF69B4", // Color de acento
  },

  // ╔══════════════════════════════════════════╗
  // ║  🌧️ MATRIX FALLING (fondo)               ║
  // ╚══════════════════════════════════════════╝
  matrixFalling: {
    // Frases románticas que caerán mezcladas con los caracteres
    frases: [
      "Te amo May 💗",
      "Eres mi luz ✨",
      "Siempre juntos 🌸",
      "Mi amor eterno ❤️",
      "Eres perfecta 💕",
      "Mi razón de ser 🌷",
      "Te quiero infinito 💫",
      "Eres mi todo 🌹",
      "Amor sin fin 💗",
      "Eres mi sueño ✨",
    ],
    // Caracteres sueltos que también caen (letras, números, emojis)
    // Se repiten varias veces los binarios (0 y 1) para que predominen en la mezcla
    caracteres: "01010101010101010101ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789💗✨🌸❤️💕🌷💫🌹💞🩷💐",
    fallSpeed: 0.8,        // Velocidad de caída (mayor = más rápido)
    density: 1,            // Cantidad de columnas activas (0 a 1) — al máximo
    fontSize: 14,           // Tamaño de letra de los caracteres sueltos
    fontSizeFrases: 18,     // Tamaño de letra de las frases
    opacityMin: 0.1,        // Opacidad mínima
    opacityMax: 0.6,        // Opacidad máxima
    color: "#FFB6C1",       // Color principal de los caracteres
    useGradient: true,      // Si los colores varían entre los de la paleta (colors.*)
    stringLength: 12,        // Longitud de cada cadena de caracteres que cae por columna
  },

  // ╔══════════════════════════════════════════╗
  // ║  🖥️ TERMINAL (esquina superior izquierda)║
  // ╚══════════════════════════════════════════╝
  terminal: {
    enabled: true,
    lines: [
      "> USER: May 💗",
      "> STATUS: Enamorado(a) ❤️",
      "> DATE: 15 de Junio, 2026",
      "> MESSAGE: Eres mi razón de ser...",
      "> SYSTEM: Conectado(a) 💕",
    ],
    typingSpeed: 80,   // ms por letra
    lineDelay: 1000,   // ms de espera entre líneas
  },

  // ╔══════════════════════════════════════════╗
  // ║  💬 FRASES CENTRALES                     ║
  // ╚══════════════════════════════════════════╝
  frases: [
    "Desde que llegaste a mi vida, todo es más bonito 💗",
    "Cada día a tu lado es un regalo del universo ✨",
    "Eres mi persona favorita en este mundo 🌸",
    "Contigo aprendí que el amor sí existe ❤️",
    "16 meses a tu lado y sigo sintiendo mariposas 🦋",
    "Te amo más de lo que las palabras pueden expresar 💕",
    "Eres mi hogar, mi paz y mi alegría 🌷",
    "Gracias por existir, May. Eres mi todo 💗",
  ],
  fraseTypingSpeed: 120, // ms por letra en las frases centrales (el doble de lento que antes)
  fraseDelay: 2500,      // ms de espera tras terminar de escribir cada frase (antes de poder hacer clic)

  // ╔══════════════════════════════════════════╗
  // ║  🎉 CELEBRACIÓN FINAL                    ║
  // ╚══════════════════════════════════════════╝
  final: {
    titulo: "🎉 ¡FELICES 16 MESES MAY! 🎉",
    subtitulo: "Gracias por cada sonrisa, cada abrazo y cada momento juntos 💗",
    foto: "aniversario16.webp",  // Carpeta: assets/img/
    mensaje: "Eres el amor de mi vida. Te amo infinitamente.",
    confetiCount: 150,
  },

  // ╔══════════════════════════════════════════╗
  // ║  🎵 MÚSICA                               ║
  // ╚══════════════════════════════════════════╝
  canciones: [
    { nombre: "Nuestra Canción ❤️", archivo: "cancion1.mp3" },
    { nombre: "Para Siempre 💗",    archivo: "cancion2.mp3" },
  ],

  // ╔══════════════════════════════════════════╗
  // ║  💥 CLICK PARTICLES                      ║
  // ╚══════════════════════════════════════════╝
  emojisClick: ["💗","✨","🌸","🌷","💫","❤️‍🔥","💞","🦋"],
  frasesClic: ["Te amo May","Eres mi todo","Siempre juntos","Mi amor eterno"],

};
