import { getGroups, createGroup, deleteGroup, getUsers, updateUserGroup } from '../connectionBackend/apiConnection';

const gruposCrudDiv = document.getElementById('grupos-crud');
let grupos = [];
let editIndex = null;
let usuariosSinGrupo = [];
let grupoSeleccionadoParaGestionar = null;

// Obtener id de la asignatura desde la URL
function getAsignaturaId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatFecha(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  return d.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function cargarUsuariosSinGrupoYDelGrupo(grupoId) {
  try {
    const res = await getUsers();
    const sinGrupo = res.data.filter(u => u.scope === 'estudiante' && (!u.groupId || u.groupId === ''));
    const enGrupo = res.data.filter(u => u.scope === 'estudiante' && u.groupId === grupoId);
    return { sinGrupo, enGrupo };
  } catch (err) {
    return { sinGrupo: [], enGrupo: [] };
  }
}

function renderGrupos() {
  let html = `
    <h3>Agregar nuevo grupo</h3>
    <form id="form-grupo">
      <input type="text" id="grupo-name" placeholder="Nombre del grupo" required />
      <button type="submit">Agregar</button>
    </form>
    <h3>Lista de grupos</h3>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha de creación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  grupos.forEach((grupo, idx) => {
    if (editIndex === idx) {
      html += `
        <tr>
          <td>${grupo.id}</td>
          <td><input type='text' value='${grupo.name}' id='edit-name'/></td>
          <td>${formatFecha(grupo.createdAt)}</td>
          <td>
            <button onclick='guardarEdicionGrupo(${idx})'>Guardar</button>
            <button onclick='cancelarEdicionGrupo()'>Cancelar</button>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr class="grupo-row" data-grupo-id="${grupo.id}" data-curso-id="${grupo.idCourse}">
          <td>${grupo.id}</td>
          <td>${grupo.name}</td>
          <td>${formatFecha(grupo.createdAt)}</td>
          <td>
            <button onclick='editarGrupo(${idx})'>Editar</button>
            <button onclick='eliminarGrupo("${grupo.name}")'>Eliminar</button>
            ${(localStorage.getItem('scope') === 'administrador') ? `<button onclick='mostrarGestionarUsuarios("${grupo.id}", event)'>Gestionar estudiantes</button>` : ''}
          </td>
        </tr>
      `;
      if (grupoSeleccionadoParaGestionar === grupo.id) {
        html += `
          <tr><td colspan="4"><div id="panel-gestionar-${grupo.id}"></div></td></tr>
        `;
      }
    }
  });
  html += '</tbody></table>';
  gruposCrudDiv.innerHTML = html;

  // Asignar evento al formulario
  const form = document.getElementById('form-grupo');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('grupo-name').value.trim();
      const idCourse = getAsignaturaId();
      if (!idCourse) {
        alert('Error: No se encontró la asignatura. Vuelve a la página de asignaturas y selecciona una.');
        return;
      }
      try {
        await createGroup({ name, idCourse });
        await cargarGrupos();
        form.reset();
      } catch (err) {
        alert('Error al crear grupo: ' + (err.response?.data?.message || err.message));
      }
    };
  }

  // Renderizar panel de gestión de estudiantes si corresponde
  if (grupoSeleccionadoParaGestionar) {
    renderPanelGestionar(grupoSeleccionadoParaGestionar);
  }

  // Redirección a videos-grupo.html al hacer clic en una fila de grupo
  document.querySelectorAll('.grupo-row').forEach(row => {
    row.addEventListener('click', function(e) {
      // Evitar redirección si se hace clic en un botón
      if (e.target.tagName === 'BUTTON') return;
      const grupoId = this.getAttribute('data-grupo-id');
      const cursoId = this.getAttribute('data-curso-id');
      window.location.href = `videos-grupo.html?idGrupo=${grupoId}&idCourse=${cursoId}`;
    });
  });
}

// Cargar grupos desde el backend
async function cargarGrupos() {
  try {
    const allGrupos = await getGroups();
    
    const idCourse = getAsignaturaId();
    
    grupos = allGrupos.data.filter(g => g.idCourse === idCourse);
    
    editIndex = null;
    renderGrupos();
    await cargarUsuariosSinGrupo();
  } catch (err) {
    gruposCrudDiv.innerHTML = '<p style="color:red;">Error al cargar grupos: ' + (err.response?.data?.message || err.message) + '</p>';
  }
}

// Eliminar grupo
window.eliminarGrupo = async function(nombre) {
  if (!confirm('¿Eliminar este grupo?')) return;
  try {
    await deleteGroup(nombre);
    await cargarGrupos();
  } catch (err) {
    alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
  }
};

// Editar grupo
window.editarGrupo = function(idx) {
  editIndex = idx;
  renderGrupos();
};

// Guardar edición
window.guardarEdicionGrupo = async function(idx) {
  const name = document.getElementById('edit-name').value.trim();
  const idCourse = getAsignaturaId();
  try {
    // El backend no tiene update, así que eliminamos y creamos
    await deleteGroup(grupos[idx].name);
    await createGroup({ name, idCourse });
    await cargarGrupos();
  } catch (err) {
    alert('Error al editar: ' + (err.response?.data?.message || err.message));
  }
};

window.cancelarEdicionGrupo = function() {
  editIndex = null;
  renderGrupos();
};

async function cargarUsuariosSinGrupo() {
  try {
    const res = await getUsers();
    const idCourse = getAsignaturaId();
    // Solo estudiantes sin grupo y que sean del curso actual (si quieres filtrar por curso)
    usuariosSinGrupo = res.data.filter(u => u.scope === 'estudiante' && (!u.groupId || u.groupId === ''));
  } catch (err) {
    usuariosSinGrupo = [];
  }
}

window.mostrarGestionarUsuarios = async function(grupoId, event) {
  event.stopPropagation();
  grupoSeleccionadoParaGestionar = grupoId;
  renderGrupos();
};

window.cerrarGestionarUsuarios = function() {
  grupoSeleccionadoParaGestionar = null;
  renderGrupos();
};

async function renderPanelGestionar(grupoId) {
  const panel = document.getElementById(`panel-gestionar-${grupoId}`);
  if (!panel) return;
  panel.innerHTML = '<div style="padding:20px;">Cargando estudiantes...</div>';
  const { sinGrupo, enGrupo } = await cargarUsuariosSinGrupoYDelGrupo(grupoId);
  // Unir ambos arrays para mostrar todos los estudiantes relevantes
  const todos = [...enGrupo, ...sinGrupo.filter(u => !enGrupo.some(eu => eu.id === u.id))];
  panel.innerHTML = `
    <div class="asignar-usuarios">
      <h4>Gestionar estudiantes de este grupo</h4>
      <form id="form-gestionar-${grupoId}">
        <div class="gestionar-lista">
          <label>
            <input type="checkbox" id="select-all-estudiantes-${grupoId}">
            Seleccionar todos
          </label>
          ${todos.map(u => `
            <label><input type="checkbox" name="estudiantes" value="${u.id}" ${enGrupo.some(eu => eu.id === u.id) ? 'checked' : ''}>${u.name} (${u.id})</label>
          `).join('')}
        </div>
        <button type="submit">Guardar cambios</button>
        <button type="button" onclick="cerrarGestionarUsuarios()">Cerrar</button>
        <div id="gestionar-usuarios-feedback-${grupoId}"></div>
      </form>
    </div>
  `;
  document.getElementById(`form-gestionar-${grupoId}`).onsubmit = async (e) => {
    e.preventDefault();
    const checked = Array.from(panel.querySelectorAll('input[name="estudiantes"]:checked')).map(cb => cb.value);
    const unchecked = todos.filter(u => !checked.includes(u.id)).map(u => u.id);
    const feedback = document.getElementById(`gestionar-usuarios-feedback-${grupoId}`);
    try {
      // Asignar los seleccionados
      for (const userId of checked) {
        await updateUserGroup(userId, grupoId);
      }
      // Quitar los no seleccionados
      for (const userId of unchecked) {
        await updateUserGroup(userId, null);
      }
      feedback.textContent = 'Cambios guardados correctamente.';
      await cargarGrupos();
      grupoSeleccionadoParaGestionar = null;
    } catch (err) {
      feedback.textContent = 'Error al guardar cambios.';
    }
  };
  // Lógica de seleccionar todos
  const selectAll = panel.querySelector(`#select-all-estudiantes-${grupoId}`);
  const checkboxes = panel.querySelectorAll('input[name="estudiantes"]');
  if (selectAll) {
    selectAll.addEventListener('change', function() {
      checkboxes.forEach(cb => cb.checked = selectAll.checked);
    });
    // Si todos están seleccionados al abrir, marca el checkbox "Seleccionar todos"
    selectAll.checked = Array.from(checkboxes).every(cb => cb.checked);
    // Si se desmarca alguno manualmente, desmarca "Seleccionar todos"
    checkboxes.forEach(cb => {
      cb.addEventListener('change', function() {
        selectAll.checked = Array.from(checkboxes).every(cb => cb.checked);
      });
    });
  }
}

// Inicializar
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const scope = localStorage.getItem('scope');
    
    if (!token) {
      alert('No hay sesión activa. Por favor, inicia sesión.');
      window.location.href = 'index.html';
      return;
    }
    
    if (scope !== 'administrador') {
      alert('Acceso denegado. Solo administradores pueden acceder a esta página.');
      window.location.href = 'index.html';
      return;
    }
    
    if (window.renderHeaderDinamico) renderHeaderDinamico();
    
    const idCourse = getAsignaturaId();
    
    if (!idCourse) {
      alert('Error: No se encontró la asignatura. Vuelve a la página de asignaturas y selecciona una.');
      window.location.href = 'asignaturas-admin.html';
      return;
    }
    
    await cargarGrupos();
  } catch (error) {
    alert('Error al inicializar la página: ' + error.message);
  }
}); 