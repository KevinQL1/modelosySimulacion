// Lógica para CRUD de asignaturas irá aquí 

// CRUD de asignaturas (cursos)
// Requiere que apiConnection.js esté cargado globalmente

const asignaturasCrudDiv = document.getElementById('asignaturas-crud');
let cursos = [];
let editIndex = null;

function formatFecha(fechaIso) {
  if (!fechaIso) return '';
  const d = new Date(fechaIso);
  return d.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Renderizar tabla y formulario
function renderCursos() {
  let html = `
    <h3>Agregar nueva asignatura</h3>
    <form id="form-curso">
      <input type="text" id="curso-name" placeholder="Nombre de la asignatura" required />
      <button type="submit">Agregar</button>
    </form>
    <h3>Lista de asignaturas</h3>
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
  cursos.forEach((curso, idx) => {
    if (editIndex === idx) {
      html += `
        <tr>
          <td>${curso.id}</td>
          <td><input type='text' value='${curso.name}' id='edit-name'/></td>
          <td>${formatFecha(curso.createdAt)}</td>
          <td>
            <button onclick='guardarEdicionCurso(${idx})'>Guardar</button>
            <button onclick='cancelarEdicionCurso()'>Cancelar</button>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr style="cursor:pointer;" onclick="redirigirAGrupos('${curso.id}')">
          <td>${curso.id}</td>
          <td>${curso.name}</td>
          <td>${formatFecha(curso.createdAt)}</td>
          <td>
            <button onclick='event.stopPropagation(); editarCurso(${idx})'>Editar</button>
            <button onclick='event.stopPropagation(); eliminarCurso("${curso.name}")'>Eliminar</button>
          </td>
        </tr>
      `;
    }
  });
  html += '</tbody></table>';
  asignaturasCrudDiv.innerHTML = html;

  // Asignar evento al formulario
  const form = document.getElementById('form-curso');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('curso-name').value.trim();
      try {
        await createCourse({ name });
        await cargarCursos();
        form.reset();
      } catch (err) {
        alert('Error al crear asignatura: ' + (err.response?.data?.message || err.message));
      }
    };
  }
}

// Cargar cursos desde el backend
async function cargarCursos() {
  try {
    const res = await getCourses();
    cursos = Array.isArray(res.data) ? res.data : [];
    editIndex = null;
    renderCursos();
  } catch (err) {
    asignaturasCrudDiv.innerHTML = '<p style="color:red;">Error al cargar asignaturas</p>';
  }
}

// Eliminar curso
window.eliminarCurso = async function(nombre) {
  if (!confirm('¿Eliminar esta asignatura?')) return;
  try {
    await deleteCourse(nombre);
    await cargarCursos();
  } catch (err) {
    alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
  }
};

// Editar curso
window.editarCurso = function(idx) {
  editIndex = idx;
  renderCursos();
};

// Guardar edición
window.guardarEdicionCurso = async function(idx) {
  const name = document.getElementById('edit-name').value.trim();
  try {
    // El backend no tiene update, así que eliminamos y creamos
    await deleteCourse(cursos[idx].name);
    await createCourse({ name });
    await cargarCursos();
  } catch (err) {
    alert('Error al editar: ' + (err.response?.data?.message || err.message));
  }
};

window.cancelarEdicionCurso = function() {
  editIndex = null;
  renderCursos();
};

// Redirigir a grupos de la asignatura
window.redirigirAGrupos = function(id) {
  window.location.href = `grupos-admin.html?id=${id}`;
};

// Inicializar
window.addEventListener('DOMContentLoaded', () => {
  if (window.renderHeaderDinamico) renderHeaderDinamico();
  cargarCursos();
}); 