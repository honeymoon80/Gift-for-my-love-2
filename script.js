/* =============================================
   SCRIPT.JS — Matrix Romántica para May
   Canvas 2D: matrix de fondo + partículas de clic
   ============================================= */
'use strict';

// ════════════════════════════════════════════
// ESTADO GLOBAL
// ════════════════════════════════════════════
let matrixCanvas, matrixCtx;
let clickFxCanvas, clickFxCtx;
let terminalBox, terminalBody;
let centerPhraseText, centerPhraseCursor;
let finalScreen, finalConfettiCanvas, finalConfettiCtx, finalHeartsBg;
let finalTitulo, finalPhoto, finalSubtitulo, finalMensaje;
let playerWrap, playerToggle, playerPanel, playerDisc, playerSongName;
let playerCurTime, playerTotalTime, playerProgressFill, playerProgressThumb, playerProgressTrack;
let playerPlay, playerPrev, playerNext, playerVol, playerListBtn, playerSongList;
let matrixAudio;

let currentSongIdx = 0;
let isPlaying = false;
let playerMinimized = false;

let matrixColumns = [];      // columnas de caracteres sueltos
let matrixFraseDrops = [];   // frases que caen por el fondo
let matrixAnimRunning = false;

let clickParticles = [];
let clickFxLoopRunning = false;
const MAX_CLICK_PARTICLES = 500;

document.addEventListener('DOMContentLoaded', () => {
  resolveDomRefs();
  resizeAllCanvases();
  window.addEventListener('resize', resizeAllCanvases);

  startMatrixBackground();
  bindClickParticles();
  bindPlayer();

  // Secuencia: terminal -> frases centrales -> celebración final
  if (CONFIG.terminal && CONFIG.terminal.enabled) {
    startTerminalTyping();
  }
  startCenterPhrasesSequence();

  initPlayerWithFirstSong();
});

function resolveDomRefs() {
  matrixCanvas   = document.getElementById('matrixCanvas');
  matrixCtx      = matrixCanvas.getContext('2d');
  clickFxCanvas  = document.getElementById('clickFxCanvas');
  clickFxCtx     = clickFxCanvas.getContext('2d');

  terminalBox  = document.getElementById('terminalBox');
  terminalBody = document.getElementById('terminalBody');

  centerPhraseText   = document.getElementById('centerPhraseText');
  centerPhraseCursor = document.getElementById('centerPhraseCursor');

  finalScreen          = document.getElementById('finalScreen');
  finalConfettiCanvas  = document.getElementById('finalConfettiCanvas');
  finalConfettiCtx     = finalConfettiCanvas.getContext('2d');
  finalHeartsBg        = document.getElementById('finalHeartsBg');
  finalTitulo    = document.getElementById('finalTitulo');
  finalPhoto     = document.getElementById('finalPhoto');
  finalSubtitulo = document.getElementById('finalSubtitulo');
  finalMensaje   = document.getElementById('finalMensaje');

  playerWrap          = document.getElementById('playerWrap');
  playerToggle        = document.getElementById('playerToggle');
  playerPanel         = document.getElementById('playerPanel');
  playerDisc          = document.getElementById('playerDisc');
  playerSongName      = document.getElementById('playerSongName');
  playerCurTime       = document.getElementById('playerCurTime');
  playerTotalTime     = document.getElementById('playerTotalTime');
  playerProgressFill  = document.getElementById('playerProgressFill');
  playerProgressThumb = document.getElementById('playerProgressThumb');
  playerProgressTrack = document.getElementById('playerProgressTrack');
  playerPlay          = document.getElementById('playerPlay');
  playerPrev          = document.getElementById('playerPrev');
  playerNext          = document.getElementById('playerNext');
  playerVol           = document.getElementById('playerVol');
  playerListBtn       = document.getElementById('playerListBtn');
  playerSongList      = document.getElementById('playerSongList');

  matrixAudio = document.getElementById('matrixAudio');
}

function resizeAllCanvases() {
  [matrixCanvas, clickFxCanvas, finalConfettiCanvas].forEach(c => {
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });
  // Reconstruir columnas del matrix al cambiar tamaño de pantalla
  setupMatrixColumns();
}

// ════════════════════════════════════════════
// MATRIX DE FONDO — caracteres + frases cayendo
// ════════════════════════════════════════════

// Color desde la paleta (con variación si useGradient está activo)
function getMatrixColor() {
  const cfg = CONFIG.matrixFalling;
  if (!cfg.useGradient) return cfg.color;
  const palette = [CONFIG.colors.primary, CONFIG.colors.tertiary, CONFIG.colors.secondary, CONFIG.colors.accent];
  return palette[Math.floor(Math.random() * palette.length)];
}

function setupMatrixColumns() {
  const cfg = CONFIG.matrixFalling;
  const colWidth = cfg.fontSize + 4;
  const totalCols = Math.ceil(window.innerWidth / colWidth);
  const strLen = cfg.stringLength || 1;

  matrixColumns = [];
  for (let i = 0; i < totalCols; i++) {
    // `density` controla cuántas columnas están activas desde el inicio
    const active = Math.random() < cfg.density;
    matrixColumns.push({
      x: i * colWidth,
      y: active ? Math.random() * -window.innerHeight : -9999, // las inactivas esperan fuera de pantalla
      speed: (Math.random() * 0.6 + 0.7) * cfg.fallSpeed,
      chars: buildCharChain(strLen),  // cadena de varios caracteres que caen juntos
      color: getMatrixColor(),
      opacity: randomOpacity(),
      changeTimer: Math.random() * 30,
    });
  }

  // Frases que caen — cantidad proporcional a density (mínimo 3, máximo según frases configuradas)
  const fraseCount = Math.max(3, Math.round(cfg.frases.length * Math.max(0.4, cfg.density)));
  matrixFraseDrops = [];
  for (let i = 0; i < fraseCount; i++) {
    matrixFraseDrops.push(spawnFraseDrop(true));
  }
}

// Crea una cadena de N caracteres aleatorios (la "estela" vertical de cada columna)
function buildCharChain(length) {
  const chain = [];
  for (let i = 0; i < length; i++) chain.push(randomMatrixChar());
  return chain;
}

function randomMatrixChar() {
  const chars = CONFIG.matrixFalling.caracteres;
  return chars[Math.floor(Math.random() * chars.length)];
}
function randomOpacity() {
  const cfg = CONFIG.matrixFalling;
  return Math.random() * (cfg.opacityMax - cfg.opacityMin) + cfg.opacityMin;
}

function spawnFraseDrop(randomStart) {
  const cfg = CONFIG.matrixFalling;
  const frase = cfg.frases[Math.floor(Math.random() * cfg.frases.length)];
  return {
    text: frase,
    x: Math.random() * (window.innerWidth - 220),
    y: randomStart ? Math.random() * -window.innerHeight : -40,
    speed: (Math.random() * 0.5 + 0.5) * cfg.fallSpeed,
    color: getMatrixColor(),
    opacity: randomOpacity(),
  };
}

function startMatrixBackground() {
  setupMatrixColumns();
  matrixAnimRunning = true;
  requestAnimationFrame(loopMatrixBackground);
}

function loopMatrixBackground() {
  if (!matrixAnimRunning) return;
  try {
    const cfg = CONFIG.matrixFalling;
    // Fade suave en vez de clearRect total, para dar la estela típica del efecto Matrix
    matrixCtx.fillStyle = 'rgba(26,10,26,0.18)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    // ── Caracteres sueltos (cadenas verticales tipo Matrix) ──
    matrixCtx.font = `${cfg.fontSize}px monospace`;
    matrixCtx.textAlign = 'center';
    matrixCtx.textBaseline = 'middle';
    const charSpacing = cfg.fontSize + 4;
    matrixColumns.forEach(col => {
      if (col.y < -1000) return; // columna inactiva, no se dibuja ni avanza
      col.y += col.speed;
      col.changeTimer--;
      if (col.changeTimer <= 0) {
        // Cambia un carácter aleatorio dentro de la cadena (efecto "parpadeo" típico del Matrix)
        const idx = Math.floor(Math.random() * col.chars.length);
        col.chars[idx] = randomMatrixChar();
        col.changeTimer = Math.random()*30 + 15;
      }
      if (col.y > window.innerHeight + 20) {
        col.y = -20;
        col.opacity = randomOpacity();
        col.color = getMatrixColor();
        col.chars = buildCharChain(col.chars.length);
      }
      // Dibuja toda la cadena: el primer carácter (cabeza) más brillante, los demás se desvanecen
      for (let c = 0; c < col.chars.length; c++) {
        const charY = col.y - c * charSpacing;
        if (charY < -20 || charY > window.innerHeight + 20) continue;
        const fade = 1 - (c / col.chars.length) * 0.85;
        matrixCtx.globalAlpha = col.opacity * fade;
        matrixCtx.fillStyle = c === 0 ? '#ffffff' : col.color;
        matrixCtx.fillText(col.chars[c], col.x, charY);
      }
    });

    // ── Frases cayendo ──
    matrixCtx.font = `italic ${cfg.fontSizeFrases}px 'Cormorant Garamond', serif`;
    matrixCtx.textAlign = 'left';
    matrixFraseDrops.forEach(f => {
      f.y += f.speed;
      if (f.y > window.innerHeight + 30) {
        const fresh = spawnFraseDrop(false);
        Object.assign(f, fresh);
      }
      matrixCtx.globalAlpha = f.opacity;
      matrixCtx.fillStyle = f.color;
      matrixCtx.fillText(f.text, f.x, f.y);
    });

    matrixCtx.globalAlpha = 1;
  } catch (err) {
    console.error('Error en el fondo Matrix:', err);
  }
  requestAnimationFrame(loopMatrixBackground);
}

// ════════════════════════════════════════════
// TERMINAL — efecto máquina de escribir
// ════════════════════════════════════════════
function startTerminalTyping() {
  terminalBox.classList.remove('hidden');
  const cfg = CONFIG.terminal;
  let lineIdx = 0;

  function showLine() {
    if (lineIdx >= cfg.lines.length) return;
    const line = cfg.lines[lineIdx];
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';
    lineEl.textContent = line; // la línea aparece completa de una sola vez
    terminalBody.appendChild(lineEl);

    lineIdx++;
    setTimeout(showLine, cfg.lineDelay);
  }
  showLine();
}

// ════════════════════════════════════════════
// FRASES CENTRALES — efecto máquina de escribir
// ════════════════════════════════════════════
// Bandera global: true cuando el sistema está esperando un clic del usuario
// para avanzar a la siguiente frase central (lo usa el listener de clic global).
let waitingForPhraseAdvance = false;
let advanceToNextPhrase = null; // función que avanza, asignada dinámicamente

function startCenterPhrasesSequence() {
  const frases = CONFIG.frases;
  const typingSpeed = CONFIG.fraseTypingSpeed;
  const delay = CONFIG.fraseDelay;
  let fraseIdx = 0;

  function typeFrase() {
    if (fraseIdx >= frases.length) {
      // Todas las frases terminaron -> mostrar celebración final (automático, sin clic)
      setTimeout(showFinalCelebration, 600);
      return;
    }
    const frase = frases[fraseIdx];
    const isLastFrase = fraseIdx === frases.length - 1;
    let charIdx = 0;
    centerPhraseText.textContent = '';

    const typeChar = () => {
      if (charIdx <= frase.length) {
        centerPhraseText.textContent = frase.slice(0, charIdx);
        charIdx++;
        setTimeout(typeChar, typingSpeed);
      } else {
        // La frase terminó de escribirse completamente.
        fraseIdx++;
        if (isLastFrase) {
          // Última frase: pasa sola a la celebración, sin esperar clic.
          setTimeout(typeFrase, delay);
        } else {
          // Frases intermedias: esperar un clic en cualquier parte para avanzar.
          // No se muestra ningún mensaje/indicador visual, solo se activa la bandera.
          setTimeout(() => {
            waitingForPhraseAdvance = true;
            advanceToNextPhrase = typeFrase;
          }, delay);
        }
      }
    };
    typeChar();
  }
  typeFrase();
}

// ════════════════════════════════════════════
// CELEBRACIÓN FINAL
// ════════════════════════════════════════════
function showFinalCelebration() {
  const cfg = CONFIG.final;
  finalTitulo.textContent    = cfg.titulo || '';
  finalSubtitulo.textContent = cfg.subtitulo || '';
  finalMensaje.textContent   = cfg.mensaje || '';
  finalPhoto.src = `assets/img/${cfg.foto}`;
  finalPhoto.onerror = () => {
    finalPhoto.style.background = 'linear-gradient(135deg, var(--rosa-pastel), var(--morado-pastel))';
    finalPhoto.removeAttribute('src');
  };

  // Ocultar la secuencia anterior (terminal + frase central) y mostrar la celebración
  document.getElementById('centerPhraseWrap')?.classList.add('hidden');
  terminalBox?.classList.add('hidden');

  finalScreen.classList.remove('hidden');
  launchFinalConfetti(cfg.confetiCount || 150);
  startFinalFloatingHearts();
}

// ── Confeti de la celebración final ──────────────────
let finalConfettiParticles = [];
let finalConfettiRunning = false;

function launchFinalConfetti(count) {
  finalConfettiParticles = [];
  const colors = [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.tertiary, CONFIG.colors.accent, '#fff'];
  for (let i = 0; i < count; i++) {
    finalConfettiParticles.push({
      x: Math.random() * finalConfettiCanvas.width,
      y: -Math.random() * finalConfettiCanvas.height,
      size: Math.random()*8+5,
      speedY: Math.random()*2.5+1.5,
      speedX: (Math.random()-0.5)*1.5,
      rotation: Math.random()*360,
      rotSpeed: (Math.random()-0.5)*8,
      color: colors[Math.floor(Math.random()*colors.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    });
  }
  finalConfettiRunning = true;
  requestAnimationFrame(loopFinalConfetti);
}

function loopFinalConfetti() {
  if (!finalConfettiRunning) return;
  finalConfettiCtx.clearRect(0, 0, finalConfettiCanvas.width, finalConfettiCanvas.height);
  let anyVisible = false;
  finalConfettiParticles.forEach(p => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;
    if (p.y < finalConfettiCanvas.height + 20) anyVisible = true;
    if (p.y > finalConfettiCanvas.height + 20) return; // ya cayó, no se redibuja

    finalConfettiCtx.save();
    finalConfettiCtx.translate(p.x, p.y);
    finalConfettiCtx.rotate(p.rotation * Math.PI/180);
    finalConfettiCtx.fillStyle = p.color;
    if (p.shape === 'circle') {
      finalConfettiCtx.beginPath();
      finalConfettiCtx.arc(0, 0, p.size/2, 0, Math.PI*2);
      finalConfettiCtx.fill();
    } else {
      finalConfettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    }
    finalConfettiCtx.restore();
  });

  if (anyVisible && !finalScreen.classList.contains('hidden')) {
    requestAnimationFrame(loopFinalConfetti);
  } else {
    finalConfettiRunning = false;
  }
}

// ── Corazones flotando en la celebración final ───────
function startFinalFloatingHearts() {
  const hearts = ['💗','💕','🌸','✨','💖','🦋'];
  const spawn = () => {
    if (finalScreen.classList.contains('hidden')) return;
    const el = document.createElement('div');
    el.className = 'final-float-heart';
    el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    el.style.left = Math.random()*100+'%';
    el.style.animationDuration = (Math.random()*6+7)+'s';
    el.style.fontSize = (Math.random()*14+14)+'px';
    el.style.opacity = (Math.random()*0.35+0.25).toFixed(2);
    finalHeartsBg.appendChild(el);
    setTimeout(() => el.remove(), 14000);
  };
  for (let i = 0; i < 6; i++) setTimeout(spawn, i*450);
  setInterval(spawn, 800);
}

// ════════════════════════════════════════════
// CLICK PARTICLES — partículas al hacer clic
// (sistema optimizado: sin sombras, sin rotación,
//  cantidad limitada y tope global de memoria)
// ════════════════════════════════════════════
function bindClickParticles() {
  document.addEventListener('click', e => {
    if (e.target.closest('.player-wrap, .terminal-box, button, input')) return;
    spawnClickParticles(e.clientX, e.clientY, 12);
    tryAdvancePhraseOnClick();
  });
  document.addEventListener('touchstart', e => {
    if (e.target.closest('.player-wrap, .terminal-box, button, input')) return;
    const t = e.touches[0];
    spawnClickParticles(t.clientX, t.clientY, 12);
    tryAdvancePhraseOnClick();
  }, {passive:true});
}

// Si el sistema está esperando un clic para avanzar de frase, lo dispara aquí.
// No muestra ningún mensaje ni indicador visual, solo avanza en silencio.
function tryAdvancePhraseOnClick() {
  if (waitingForPhraseAdvance && advanceToNextPhrase) {
    waitingForPhraseAdvance = false;
    const advance = advanceToNextPhrase;
    advanceToNextPhrase = null;
    advance();
  }
}

function spawnClickParticles(x, y, count) {
  const safeCount = Math.min(count, 15);
  for (let i = 0; i < safeCount; i++) {
    if (clickParticles.length >= MAX_CLICK_PARTICLES) break;
    const useEmoji = Math.random() > 0.4;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3.2 + 1.3;
    clickParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.4,
      gravity: 0.05,
      life: 1,
      decay: 0.022,
      size: useEmoji ? (Math.random()*13+15) : (Math.random()*4+10),
      text: useEmoji
        ? CONFIG.emojisClick[Math.floor(Math.random()*CONFIG.emojisClick.length)]
        : CONFIG.frasesClic[Math.floor(Math.random()*CONFIG.frasesClic.length)],
      isEmoji: useEmoji,
      color: useEmoji ? null : [CONFIG.colors.primary, CONFIG.colors.tertiary, CONFIG.colors.accent][Math.floor(Math.random()*3)],
    });
  }
  if (!clickFxLoopRunning) {
    clickFxLoopRunning = true;
    requestAnimationFrame(loopClickFx);
  }
}

function loopClickFx() {
  clickFxCtx.clearRect(0, 0, clickFxCanvas.width, clickFxCanvas.height);
  clickFxCtx.textAlign = 'center';
  clickFxCtx.textBaseline = 'middle';

  for (let i = clickParticles.length - 1; i >= 0; i--) {
    const p = clickParticles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += p.gravity;
    p.life -= p.decay;
    if (p.life <= 0) { clickParticles.splice(i, 1); continue; }

    clickFxCtx.globalAlpha = Math.max(0, p.life);
    clickFxCtx.font = p.isEmoji
      ? `${p.size}px sans-serif`
      : `600 ${p.size}px 'Dancing Script', cursive`;
    clickFxCtx.fillStyle = p.color || '#fff';
    clickFxCtx.fillText(p.text, p.x, p.y);
  }
  clickFxCtx.globalAlpha = 1;

  if (clickParticles.length > 0) {
    requestAnimationFrame(loopClickFx);
  } else {
    clickFxLoopRunning = false;
  }
}

// ════════════════════════════════════════════
// REPRODUCTOR DE MÚSICA
// ════════════════════════════════════════════
function bindPlayer() {
  playerToggle.addEventListener('click', e => { e.stopPropagation(); togglePlayerPanel(); });
  playerPlay.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
  playerPrev.addEventListener('click', e => { e.stopPropagation(); changeSong(-1); });
  playerNext.addEventListener('click', e => { e.stopPropagation(); changeSong(1); });
  playerListBtn.addEventListener('click', e => { e.stopPropagation(); playerSongList.classList.toggle('hidden'); });

  playerVol.addEventListener('input', e => {
    e.stopPropagation();
    matrixAudio.volume = e.target.value;
    const pct = e.target.value * 100;
    e.target.style.background = `linear-gradient(90deg,${CONFIG.colors.secondary} ${pct}%,rgba(255,182,193,0.2) ${pct}%)`;
  });

  playerProgressTrack.addEventListener('click', e => {
    if (!matrixAudio.duration) return;
    const r = playerProgressTrack.getBoundingClientRect();
    matrixAudio.currentTime = ((e.clientX - r.left) / r.width) * matrixAudio.duration;
  });

  matrixAudio.addEventListener('timeupdate', updatePlayerProgress);
  matrixAudio.addEventListener('play',  () => { isPlaying = true;  playerPlay.textContent='⏸'; playerDisc.classList.add('playing'); });
  matrixAudio.addEventListener('pause', () => { isPlaying = false; playerPlay.textContent='▶'; playerDisc.classList.remove('playing'); });
  matrixAudio.addEventListener('ended', () => changeSong(1));

  buildSongList();
}

function buildSongList() {
  playerSongList.innerHTML = '';
  CONFIG.canciones.forEach((song, i) => {
    const item = document.createElement('div');
    item.className = 'player-song-item' + (i === currentSongIdx ? ' active' : '');
    item.innerHTML = `<span class="num">${i+1}.</span><span>${song.nombre}</span>`;
    item.addEventListener('click', e => {
      e.stopPropagation();
      loadSong(i, true);
      playerSongList.classList.add('hidden');
    });
    playerSongList.appendChild(item);
  });
}

function initPlayerWithFirstSong() {
  if (!CONFIG.canciones.length) return;
  loadSong(0, false);
  const tryPlay = () => {
    matrixAudio.play().catch(() => {});
    document.removeEventListener('click', tryPlay);
    document.removeEventListener('touchstart', tryPlay);
  };
  document.addEventListener('click', tryPlay, {once:true});
  document.addEventListener('touchstart', tryPlay, {once:true, passive:true});
}

function loadSong(idx, autoplay) {
  currentSongIdx = ((idx % CONFIG.canciones.length) + CONFIG.canciones.length) % CONFIG.canciones.length;
  const song = CONFIG.canciones[currentSongIdx];
  matrixAudio.src = `assets/music/${song.archivo}`;
  playerSongName.textContent = song.nombre;
  if (autoplay) matrixAudio.play().catch(() => {});
  buildSongList();
}

function togglePlay() {
  if (isPlaying) matrixAudio.pause();
  else matrixAudio.play().catch(() => {});
}
function changeSong(dir) { loadSong(currentSongIdx + dir, true); }
function updatePlayerProgress() {
  if (!matrixAudio.duration) return;
  const pct = matrixAudio.currentTime / matrixAudio.duration * 100;
  playerProgressFill.style.width = pct + '%';
  playerProgressThumb.style.left = pct + '%';
  playerCurTime.textContent = fmtTime(matrixAudio.currentTime);
  playerTotalTime.textContent = fmtTime(matrixAudio.duration);
}
function fmtTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s/60), ss = Math.floor(s%60);
  return m + ':' + (ss<10?'0':'') + ss;
}
function togglePlayerPanel() {
  playerMinimized = !playerMinimized;
  playerPanel.classList.toggle('minimized', playerMinimized);
}
