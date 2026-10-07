const TIEMPO_POR_PREGUNTA = 15; // segundos

// Valor (value) de la respuesta correcta de cada pregunta, en orden p1 a p5
const respuestasCorrectas = ["2", "1", "1", "2", "1"];

const contenedor = document.querySelector(".quiz-container");
const instrucciones = document.querySelector(".quiz-instructions");
const form = document.querySelector("form");
const tarjetas = document.querySelectorAll(".quiz-card");
const boton = document.querySelector(".submit-btn");

// Elementos que crea el JS
const panelInfo = document.createElement("div");
panelInfo.innerHTML = `
  <div class="barra"><div id="progreso"></div></div>
  <div class="info">
    <span id="contador"></span>
    <span id="tiempo"></span>
  </div>`;
contenedor.insertBefore(panelInfo, form);

const mensaje = document.createElement("p");
mensaje.className = "mensaje";
form.insertBefore(mensaje, boton);

const resultado = document.createElement("section");
resultado.className = "resultado oculto";
resultado.innerHTML = `
  <p>Tu puntaje final:</p>
  <p id="puntaje"></p>
  <ul id="detalle"></ul>
  <button type="button" id="reiniciar" class="submit-btn">Reiniciar</button>`;
contenedor.appendChild(resultado);

let indice, puntaje, resultados, intervalo, tiempoRestante, respondida;

function iniciar() {
  indice = 0;
  puntaje = 0;
  resultados = [];
  form.reset();
  resultado.classList.add("oculto");
  form.classList.remove("oculto");
  panelInfo.classList.remove("oculto");
  instrucciones.classList.remove("oculto");
  mostrarPregunta();
}

function mostrarPregunta() {
  respondida = false;
  const total = tarjetas.length;

  tarjetas.forEach((t, i) => {
    t.classList.toggle("oculto", i !== indice);
    t.value = i + 1; // mantiene la numeración correcta de la lista
    t.querySelectorAll("label").forEach((l) =>
      l.classList.remove("correcta", "incorrecta")
    );
  });

  document.getElementById("contador").textContent =
    `Pregunta ${indice + 1} de ${total}`;
  document.getElementById("progreso").style.width =
    `${(indice / total) * 100}%`;

  mensaje.textContent = "";
  boton.disabled = true;
  boton.textContent = indice === total - 1 ? "Ver resultado" : "Siguiente";

  iniciarTemporizador();
}

function iniciarTemporizador() {
  clearInterval(intervalo);
  tiempoRestante = TIEMPO_POR_PREGUNTA;
  actualizarTiempo();
  intervalo = setInterval(() => {
    tiempoRestante--;
    actualizarTiempo();
    if (tiempoRestante <= 0) {
      responder(null); // se acabó el tiempo
    }
  }, 1000);
}

function actualizarTiempo() {
  const t = document.getElementById("tiempo");
  t.textContent = `⏱ ${tiempoRestante}s`;
  t.classList.toggle("urgente", tiempoRestante <= 5);
}

function responder(valor) {
  if (respondida) return;
  respondida = true;
  clearInterval(intervalo);

  const correcta = respuestasCorrectas[indice];
  const acierto = valor === correcta;
  resultados.push({ acierto: acierto, sinTiempo: valor === null });

  // Retroalimentación inmediata
  tarjetas[indice].querySelectorAll("input[type='radio']").forEach((r) => {
    r.disabled = true;
    const label = r.closest("label");
    if (r.value === correcta) {
      label.classList.add("correcta");
    } else if (r.checked) {
      label.classList.add("incorrecta");
    }
  });

  if (acierto) {
    puntaje++;
    mensaje.textContent = " ¡Correcto!";
  } else if (valor === null) {
    mensaje.textContent = " Se acabó el tiempo.";
  } else {
    mensaje.textContent = " Incorrecto.";
  }

  boton.disabled = false;
}

function terminar() {
  clearInterval(intervalo);
  form.classList.add("oculto");
  panelInfo.classList.add("oculto");
  instrucciones.classList.add("oculto");
  resultado.classList.remove("oculto");

  const nota = Math.round((puntaje / tarjetas.length) * 100);
  document.getElementById("puntaje").textContent = `${nota} / 100`;

  const detalle = document.getElementById("detalle");
  detalle.innerHTML = "";
 tarjetas.forEach((t, i) => {
    t.classList.toggle("oculto", i !== indice);
    t.value = i + 1; // mantiene la numeración correcta de la lista
    t.querySelectorAll("label").forEach((l) =>
      l.classList.remove("correcta", "incorrecta")
    );
    t.querySelectorAll("input").forEach((r) => {
      r.disabled = false; // desbloquea las opciones al reiniciar
      r.checked = false;  // limpia lo marcado
    });
  });
}

// Eventos
form.addEventListener("change", (e) => {
  if (e.target.type === "radio") responder(e.target.value);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!respondida) return;
  indice++;
  if (indice < tarjetas.length) {
    mostrarPregunta();
  } else {
    terminar();
  }
});

document.getElementById("reiniciar").addEventListener("click", iniciar);

iniciar();