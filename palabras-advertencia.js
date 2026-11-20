const API_URL =
    "https://ssi-test.unison.mx/Administrativo/SSPAmbiental/api/PalabraAdvertencia";

const botonConsultar = document.getElementById("btn-consultar");
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tabla-advertencias");

const formulario = document.getElementById("form-advertencia");
const campoId = document.getElementById("id-advertencia");
const campoNombre = document.getElementById("nombre-advertencia");
const campoDescripcion = document.getElementById("descripcion-advertencia");
const botonCancelar = document.getElementById("btn-cancelar");

// Consultar catálogo.
botonConsultar.addEventListener("click", consultarAdvertencias);

// Registrar o modificar.
formulario.addEventListener("submit", guardarAdvertencia);

// Limpiar formulario.
botonCancelar.addEventListener("click", limpiarFormulario);


// Convierte la respuesta del servidor a JSON.
async function leerRespuesta(respuesta) {

    const texto = await respuesta.text();

    let datos = {};

    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            throw new Error("El servidor devolvió una respuesta no válida.");
        }
    }

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje || `Error HTTP: ${respuesta.status}`
        );
    }

    return datos;
}


// ======================================
// GET: CONSULTAR PALABRAS DE ADVERTENCIA
// ======================================

async function consultarAdvertencias() {

    try {

        mensaje.textContent = "Consultando catálogo...";
        botonConsultar.disabled = true;

        const respuesta = await fetch(
            `${API_URL}?soloActivos=true`
        );

        const advertencias = await leerRespuesta(respuesta);

        if (!Array.isArray(advertencias)) {
            throw new Error("La respuesta no tiene el formato esperado.");
        }

        tabla.replaceChildren();

        advertencias.forEach(advertencia => {

            const fila = document.createElement("tr");

            const id = document.createElement("td");
            id.textContent = advertencia.idPalabraAdvertencia;

            const nombre = document.createElement("td");
            nombre.textContent = advertencia.nombre;

            const descripcion = document.createElement("td");
            descripcion.textContent = advertencia.descripcion ?? "";

            const estado = document.createElement("td");
            estado.textContent = advertencia.activo
                ? "Activo"
                : "Inactivo";

            const acciones = document.createElement("td");

            // Botón para modificar.
            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.textContent = "Modificar";

            botonEditar.addEventListener("click", () => {
                editarAdvertencia(advertencia);
            });

            // Botón para dar de baja.
            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.textContent = "Dar de baja";

            botonEliminar.addEventListener("click", () => {
                eliminarAdvertencia(advertencia.idPalabraAdvertencia);
            });

            acciones.append(botonEditar, botonEliminar);

            fila.append(
                id,
                nombre,
                descripcion,
                estado,
                acciones
            );

            tabla.appendChild(fila);

        });

        mensaje.textContent =
            `${advertencias.length} registros activos encontrados.`;

    } catch (error) {

        console.error("Error al consultar:", error);
        mensaje.textContent = error.message;

    } finally {

        botonConsultar.disabled = false;

    }
}


// ======================================
// POST: REGISTRAR O MODIFICAR
// ======================================

async function guardarAdvertencia(evento) {

    evento.preventDefault();

    try {

        const idTexto = campoId.value.trim();
        const nombre = campoNombre.value.trim();
        const descripcion = campoDescripcion.value.trim();

        // Si el ID está vacío, se envía null.
        const id = idTexto === "" ? null : Number(idTexto);

        if (!nombre) {
            throw new Error("Debes ingresar un nombre.");
        }

        if (id !== null && (!Number.isInteger(id) || id <= 0)) {
            throw new Error("El ID debe ser un número entero positivo.");
        }

        const datos = {
            idPalabraAdvertencia: id,
            nombre: nombre,
            descripcion: descripcion || null
        };

        mensaje.textContent = "Guardando información...";

        const respuesta = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        const resultado = await leerRespuesta(respuesta);

        mensaje.textContent =
            resultado.mensaje || "Operación realizada correctamente.";

        limpiarFormulario();

        // Actualizar la tabla después de guardar.
        await consultarAdvertencias();

        mensaje.textContent =
            resultado.mensaje || "Operación realizada correctamente.";

    } catch (error) {

        console.error("Error al guardar:", error);
        mensaje.textContent = error.message;

    }

}


// ======================================
// CARGAR DATOS PARA MODIFICAR
// ======================================

function editarAdvertencia(advertencia) {

    campoId.value = advertencia.idPalabraAdvertencia;
    campoNombre.value = advertencia.nombre;
    campoDescripcion.value = advertencia.descripcion ?? "";

    mensaje.textContent =
        `Modificando el registro ${advertencia.idPalabraAdvertencia}.`;

}


// ======================================
// DELETE: BAJA LÓGICA
// ======================================

async function eliminarAdvertencia(id) {

    const confirmar = window.confirm(
        `¿Deseas dar de baja la palabra de advertencia con ID ${id}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        mensaje.textContent = "Procesando baja...";

        const respuesta = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await leerRespuesta(respuesta);

        // Actualizar la tabla después de eliminar.
        await consultarAdvertencias();

        mensaje.textContent =
            resultado.mensaje || "Registro dado de baja correctamente.";

        // Limpiar el formulario si tenía cargado ese registro.
        if (Number(campoId.value) === id) {
            limpiarFormulario();
        }

    } catch (error) {

        console.error("Error al dar de baja:", error);
        mensaje.textContent = error.message;

    }

}


// ======================================
// LIMPIAR FORMULARIO
// ======================================

function limpiarFormulario() {

    formulario.reset();

}
