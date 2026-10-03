// ===== Configuración =====
// Cambia estos números para hacer el juego más fácil o difícil
const FILAS = 9;
const COLUMNAS = 9;
const MINAS = 10;

// ===== Estado del juego =====
// "tablero" es una lista de filas; cada fila es una lista de celdas.
// Cada celda es un objeto: { mina, abierta, bandera, vecinas }
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

botonReiniciar.addEventListener("click", iniciarJuego);

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
  for (let f = 0; f < FILAS; f++) {
    const fila = [];
    for (let c = 0; c < COLUMNAS; c++) {
      fila.push({ mina: false, abierta: false, bandera: false, vecinas: 0 });
    }
    tablero.push(fila);
  }

  actualizarContadorMinas();
  dibujar();
}

// Las minas se colocan en el primer clic, así nunca pierdes en el primer movimiento
function colocarMinas(filaSegura, colSegura) {
  let colocadas = 0;
  while (colocadas < MINAS) {
    const f = Math.floor(Math.random() * FILAS);
    const c = Math.floor(Math.random() * COLUMNAS);
    const esPrimerClic = f === filaSegura && c === colSegura;
    if (!tablero[f][c].mina && !esPrimerClic) {
      tablero[f][c].mina = true;
      colocadas++;
    }
  }

  // Cuenta cuántas minas hay alrededor de cada celda
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLUMNAS; c++) {
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
      if (nf >= 0 && nf < FILAS && nc >= 0 && nc < COLUMNAS) {
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

  celda.abierta = true;

  if (celda.mina) {
    perder();
    return;
  }

  // Si no hay minas alrededor, abre también los vecinos (efecto cascada)
  if (celda.vecinas === 0) {
    for (const [vf, vc] of vecinos(f, c)) {
      descubrir(vf, vc);
    }
  }

  dibujar();
  comprobarVictoria();
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
  spanMinas.textContent = MINAS - banderas;
}

// ===== Dibujar el tablero en la página =====
function dibujar() {
  divTablero.innerHTML = "";
  divTablero.style.gridTemplateColumns = `repeat(${COLUMNAS}, 32px)`;

  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLUMNAS; c++) {
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
