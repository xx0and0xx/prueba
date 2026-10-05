// ===== Configuración de dificultades =====
// Cada nivel define el tamaño del tablero, cuántas minas hay y cómo se colocan.
//  - zonaSegura: al primer clic, ¿cuántas celdas alrededor quedan libres de minas?
//      1 = el clic y sus 8 vecinas (casi siempre se abre una zona grande)
//      0 = solo la celda donde haces clic (puede salir un número y a adivinar)
//  - agrupadas: de 0 a 1, qué tan seguido una mina se coloca pegada a otra.
//      Con 0 las minas se reparten al azar; con valores altos se forman racimos,
//      y los racimos obligan a razonar más (y a veces a arriesgar).
//  - tam: tamaño de cada celda en píxeles.
const DIFICULTADES = {
  facil:    { filas: 9,  columnas: 9,  minas: 10,  zonaSegura: 1, agrupadas: 0,   tam: 34 },
  medio:    { filas: 16, columnas: 16, minas: 40,  zonaSegura: 1, agrupadas: 0,   tam: 30 },
  dificil:  { filas: 16, columnas: 30, minas: 99,  zonaSegura: 0, agrupadas: 0.4, tam: 28 },
  demencia: { filas: 22, columnas: 40, minas: 230, zonaSegura: 0, agrupadas: 0.7, tam: 26 },
};

// ===== Estado del juego =====
// "tablero" es una lista de filas; cada fila es una lista de celdas.
// Cada celda es un objeto: { mina, abierta, bandera, vecinas }
let nivel = DIFICULTADES.facil; // la dificultad que se está jugando
let tablero;
let juegoTerminado;
let primerClic;
let segundos;
let temporizador;

// ===== Elementos de la página =====
const divTablero = document.getElementById("tablero");
const spanMinas = document.getElementById("minas-restantes");
const spanTiempo = document.getElementById("tiempo");
const botonReiniciar = document.getElementById("reiniciar");
const botonesNivel = document.querySelectorAll(".dificultad");

botonReiniciar.addEventListener("click", iniciarJuego);

// Cada botón de dificultad cambia el nivel y empieza una partida nueva
botonesNivel.forEach((boton) => {
  boton.addEventListener("click", () => {
    nivel = DIFICULTADES[boton.dataset.nivel];
    botonesNivel.forEach((b) => b.classList.toggle("activo", b === boton));
    iniciarJuego();
  });
});

// ===== Crear una partida nueva =====
function iniciarJuego() {
  clearInterval(temporizador);
  segundos = 0;
  spanTiempo.textContent = 0;
  juegoTerminado = false;
  primerClic = true;
  botonReiniciar.textContent = "🙂";

  // Crea la cuadrícula vacía
  tablero = [];
  for (let f = 0; f < nivel.filas; f++) {
    const fila = [];
    for (let c = 0; c < nivel.columnas; c++) {
      fila.push({ mina: false, abierta: false, bandera: false, vecinas: 0 });
    }
    tablero.push(fila);
  }

  actualizarContadorMinas();
  dibujar();
}

// Las minas se colocan en el primer clic, así nunca pierdes en el primer movimiento
function colocarMinas(filaClic, colClic) {
  // ¿Esta celda está dentro de la zona que debe quedar libre de minas?
  const esZonaSegura = (f, c) =>
    Math.abs(f - filaClic) <= nivel.zonaSegura && Math.abs(c - colClic) <= nivel.zonaSegura;

  const minas = []; // coordenadas [f, c] de las minas ya colocadas
  while (minas.length < nivel.minas) {
    let f, c;

    if (minas.length > 0 && Math.random() < nivel.agrupadas) {
      // Modo "racimo": elige una mina que ya existe y pon la nueva a su lado
      const [mf, mc] = minas[Math.floor(Math.random() * minas.length)];
      const lista = vecinos(mf, mc);
      [f, c] = lista[Math.floor(Math.random() * lista.length)];
    } else {
      // Modo normal: una posición cualquiera del tablero
      f = Math.floor(Math.random() * nivel.filas);
      c = Math.floor(Math.random() * nivel.columnas);
    }

    // Si la celda no sirve (ya tiene mina o es zona segura), se intenta de nuevo
    if (tablero[f][c].mina || esZonaSegura(f, c)) continue;

    tablero[f][c].mina = true;
    minas.push([f, c]);
  }

  // Cuenta cuántas minas hay alrededor de cada celda
  for (let f = 0; f < nivel.filas; f++) {
    for (let c = 0; c < nivel.columnas; c++) {
      tablero[f][c].vecinas = vecinos(f, c).filter(([vf, vc]) => tablero[vf][vc].mina).length;
    }
  }
}

// Devuelve las coordenadas de las (hasta 8) celdas que rodean a una celda
function vecinos(f, c) {
  const lista = [];
  for (let df = -1; df <= 1; df++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (df === 0 && dc === 0) continue; // saltar la celda misma
      const nf = f + df;
      const nc = c + dc;
      if (nf >= 0 && nf < nivel.filas && nc >= 0 && nc < nivel.columnas) {
        lista.push([nf, nc]);
      }
    }
  }
  return lista;
}

// ===== Acciones del jugador =====
function descubrir(f, c) {
  if (juegoTerminado) return;
  const celda = tablero[f][c];
  if (celda.abierta || celda.bandera) return;

  if (primerClic) {
    primerClic = false;
    colocarMinas(f, c);
    temporizador = setInterval(() => {
      segundos++;
      spanTiempo.textContent = segundos;
    }, 1000);
  }

  if (celda.mina) {
    celda.abierta = true;
    perder();
    return;
  }

  abrirCelda(f, c);
  dibujar(); // se dibuja una sola vez, aunque se hayan abierto muchas celdas
  comprobarVictoria();
}

// Abre una celda y, si no tiene minas alrededor, abre también sus vecinas (cascada).
// No dibuja nada: solo cambia el estado. Así el tablero grande no se vuelve lento.
function abrirCelda(f, c) {
  const celda = tablero[f][c];
  if (celda.abierta || celda.bandera) return;

  celda.abierta = true;

  if (celda.vecinas === 0) {
    for (const [vf, vc] of vecinos(f, c)) {
      abrirCelda(vf, vc);
    }
  }
}

function alternarBandera(f, c) {
  if (juegoTerminado || primerClic) return;
  const celda = tablero[f][c];
  if (celda.abierta) return;
  celda.bandera = !celda.bandera;
  actualizarContadorMinas();
  dibujar();
}

// ===== Fin del juego =====
function perder() {
  juegoTerminado = true;
  clearInterval(temporizador);
  botonReiniciar.textContent = "😵";
  // Muestra todas las minas
  for (const fila of tablero) {
    for (const celda of fila) {
      if (celda.mina) celda.abierta = true;
    }
  }
  dibujar();
}

function comprobarVictoria() {
  // Ganas cuando todas las celdas sin mina están abiertas
  const ganado = tablero.every(fila => fila.every(celda => celda.mina || celda.abierta));
  if (ganado) {
    juegoTerminado = true;
    clearInterval(temporizador);
    botonReiniciar.textContent = "😎";
  }
}

function actualizarContadorMinas() {
  const banderas = tablero.flat().filter(celda => celda.bandera).length;
  spanMinas.textContent = nivel.minas - banderas;
}

// ===== Dibujar el tablero en la página =====
function dibujar() {
  divTablero.innerHTML = "";
  divTablero.style.gridTemplateColumns = `repeat(${nivel.columnas}, ${nivel.tam}px)`;
  divTablero.style.setProperty("--tam", nivel.tam + "px");

  for (let f = 0; f < nivel.filas; f++) {
    for (let c = 0; c < nivel.columnas; c++) {
      const celda = tablero[f][c];
      const div = document.createElement("div");
      div.className = "celda";

      if (celda.abierta) {
        div.classList.add("abierta");
        if (celda.mina) {
          div.classList.add("mina");
          div.textContent = "💣";
        } else if (celda.vecinas > 0) {
          div.textContent = celda.vecinas;
          div.classList.add("n" + celda.vecinas);
        }
      } else if (celda.bandera) {
        div.textContent = "🚩";
      }

      div.addEventListener("click", () => descubrir(f, c));
      div.addEventListener("contextmenu", (evento) => {
        evento.preventDefault(); // evita el menú del clic derecho
        alternarBandera(f, c);
      });

      divTablero.appendChild(div);
    }
  }
}

iniciarJuego();
