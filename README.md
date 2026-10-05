# Buscaminas

Un buscaminas hecho con HTML, CSS y JavaScript, para aprender a programar con GitHub.

## Cómo jugar

Abre `index.html` en tu navegador (doble clic al archivo).

- Clic izquierdo: descubrir una celda
- Clic derecho: poner o quitar una bandera 🚩
- Gana quien descubre todas las celdas sin mina

## Dificultades

| Nivel | Tablero | Minas | Cómo se colocan |
|---|---|---|---|
| Fácil | 9 × 9 | 10 | Al azar. El primer clic y sus vecinas son seguras |
| Medio | 16 × 16 | 40 | Al azar. El primer clic y sus vecinas son seguras |
| Difícil | 16 × 30 | 99 | Algunas en racimos. Solo el primer clic es seguro |
| Demencia | 22 × 40 | 230 | Muchas en racimos. Solo el primer clic es seguro |

Los racimos son grupos de minas pegadas, que obligan a razonar más y a veces a arriesgar.

## Qué hace cada archivo

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La estructura de la página |
| `style.css` | Los colores y el aspecto |
| `juego.js` | La lógica del juego |

## Ideas para practicar

1. En `juego.js`, busca `DIFICULTADES` y cambia los números de cada nivel.
2. Añade un quinto nivel (por ejemplo, "Personalizado").
3. Cambia los colores en `style.css`.
4. Muestra un mensaje "¡Ganaste!" cuando se gane.
5. Guarda el mejor tiempo de cada dificultad con `localStorage`.

Cada cambio que hagas es una buena oportunidad para practicar `git commit` y `git push`.
