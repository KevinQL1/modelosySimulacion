import { login } from '../connectionBackend/apiConnection';

document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const doc = document.getElementById('doc').value.trim();
  const errorDiv = document.getElementById('error');

  if (!/^\d+$/.test(doc)) {
    errorDiv.textContent = "El documento debe ser numérico.";
    return;
  }

  errorDiv.textContent = "";

  login(doc)
    .then(response => {
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('idUser', response.data.user.id);
        localStorage.setItem('scope', response.data.user.scope);

        if (response.data.user.scope === "estudiante") {
          window.location.href = "grupo_estu.html";
        } else if (response.data.user.scope === "administrador") {
          window.location.href = "asignaturas-admin.html";
        }
      } else {
        errorDiv.textContent = "Documento no válido o usuario no encontrado.";
      }
    })
    .catch(err => {
      console.error('Error en login:', err);
      errorDiv.textContent = "Error en el servidor o en los datos.";
    });
}); 