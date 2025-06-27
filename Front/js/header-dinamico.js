import { createUser } from '../connectionBackend/apiConnection';

// Header dinámico reutilizable
function renderHeaderDinamico() {
  const userInfoDiv = document.getElementById('user-info');
  const adminActionsDiv = document.getElementById('admin-actions');
  const userScope = localStorage.getItem('scope') || 'desconocido';
  const idUser = localStorage.getItem('idUser') || '';
  
  // Botón de logout como icono rojo (primero a la izquierda)
  const logoutButton = document.createElement('button');
  logoutButton.id = 'btn-logout';
  logoutButton.className = 'logout-btn';
  logoutButton.innerHTML = '🚪';
  logoutButton.title = 'Cerrar Sesión';
  logoutButton.onclick = function() {
    // Limpiar datos de sesión
    localStorage.clear();
    sessionStorage.clear();
    // Redirigir al login
    window.location.href = 'index.html';
  };
  
  // Información del usuario según el rol
  let userInfoContent = '';
  if (userScope === 'administrador') {
    userInfoContent = `
      <span class="user-icon">👤</span>
      <span class="user-role">Administrador</span>
    `;
  } else {
    // Para estudiantes, mostrar solo el nombre (ID del usuario)
    userInfoContent = `
      <span class="user-icon">👤</span>
      <span class="user-name">${idUser}</span>
    `;
  }
  
  // Estructura del header: logout a la izquierda, info del usuario en el centro, acciones a la derecha
  userInfoDiv.innerHTML = `
    ${userInfoContent}
  `;
  
  // Agregar botón de logout al inicio del header-left
  if (!document.getElementById('btn-logout')) {
    userInfoDiv.insertBefore(logoutButton, userInfoDiv.firstChild);
  }

  // Acciones específicas para administradores
  if (userScope === 'administrador') {
    adminActionsDiv.innerHTML = `
      <button id="btn-exportar-excel" class="header-action-btn">Exportar DB</button>
      <button id="btn-importar-estudiantes" class="header-action-btn">Subir Estudiantes</button>
    `;
    
    // Configurar el botón de exportar DB
    document.getElementById('btn-exportar-excel').onclick = async () => {
      if (typeof exportarBaseDeDatos === 'function') {
        await exportarBaseDeDatos();
      } else {
        alert('Función de exportación no disponible. Asegúrate de que database-export.js esté cargado.');
      }
    };
    
    // Panel para subir estudiantes
    let panel = document.getElementById('panel-subir-estudiantes');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'panel-subir-estudiantes';
      panel.style.display = 'none';
      panel.style.background = '#f4f8ff';
      panel.style.padding = '18px 24px';
      panel.style.borderRadius = '10px';
      panel.style.margin = '18px 0';
      panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.05)';
      panel.innerHTML = `
        <h4>Importar estudiantes desde Excel</h4>
        <input type="file" id="input-excel-estudiantes" accept=".xlsx,.xls" />
        <button id="btn-enviar-excel">Subir</button>
        <button id="btn-cerrar-panel-excel">Cerrar</button>
        <div id="feedback-excel"></div>
      `;
      document.body.insertBefore(panel, document.body.firstChild.nextSibling);
    }
    
    document.getElementById('btn-importar-estudiantes').onclick = () => {
      panel.style.display = 'block';
    };
    
    document.getElementById('btn-cerrar-panel-excel').onclick = () => {
      panel.style.display = 'none';
      document.getElementById('input-excel-estudiantes').value = '';
      document.getElementById('feedback-excel').textContent = '';
    };
    
    document.getElementById('btn-enviar-excel').onclick = async () => {
      const input = document.getElementById('input-excel-estudiantes');
      const feedback = document.getElementById('feedback-excel');
      if (!input.files || input.files.length === 0) {
        feedback.textContent = 'Selecciona un archivo Excel.';
        return;
      }
      const file = input.files[0];
      try {
        const res = await createUser(file);
        const data = res.data;
        let msg = '';
        if (data.exitosos && data.exitosos.length > 0) {
          msg += `✔️ ${data.exitosos.length} estudiantes importados correctamente.<br>`;
        }
        if (data.errores && data.errores.length > 0) {
          msg += `<b>Errores:</b><ul style='color:#b30000;'>`;
          data.errores.forEach(e => {
            msg += `<li>${e.usuario.name || '(sin nombre)'} (${e.usuario.id || 'sin cédula'}): ${e.error}</li>`;
          });
          msg += '</ul>';
        }
        if (!msg) msg = 'No se importó ningún estudiante.';
        feedback.innerHTML = msg;
      } catch (err) {
        feedback.textContent = 'Error al importar estudiantes: ' + (err.response?.data?.message || err.message);
      }
    };
  } else {
    adminActionsDiv.innerHTML = '';
    const panel = document.getElementById('panel-subir-estudiantes');
    if (panel) panel.style.display = 'none';
  }
}

window.renderHeaderDinamico = renderHeaderDinamico; 