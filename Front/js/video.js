 function editarActividad(boton) {
      const span = boton.previousElementSibling;
      if (span.isContentEditable) {
        span.contentEditable = "false";
        boton.textContent = "✏️";
      } else {
        span.contentEditable = "true";
        span.focus();
        boton.textContent = "💾";
      }
    }

//cerrar sesion
     
    document.getElementById('logout-btn').addEventListener('click', function() {
    // Elimina posibles datos de sesión (ajusta según tu app)
    localStorage.clear();
    sessionStorage.clear();

    // Si usas cookies para auth, aquí podrías eliminarlas (depende de cómo esté hecho tu backend)
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirige al login
    window.location.href = 'login.html';  // Cambia a la ruta de tu login
  });