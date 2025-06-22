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