function actualizarFechaYHora() {
    const ahora = new Date();

    const fecha = ahora.toLocaleDateString('es-ES');
    const hora = ahora.toLocaleTimeString('es-ES');

    document.getElementById("fecha").textContent = fecha;
    document.getElementById("hora").textContent = hora;
  }

  actualizarFechaYHora();
  setInterval(actualizarFechaYHora, 10000); 