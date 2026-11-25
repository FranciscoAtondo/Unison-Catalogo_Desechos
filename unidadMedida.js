
 // ==========================================
 // CONFIGURACIÓN DE LA API
 // ==========================================

const API_URL =
    "https://ssi-test.unison.mx/Administrativo/SSPAmbiental/api/UnidadMedida";


// ==========================================
// ELEMENTOS HTML
// ==========================================

// Consulta
const formularioConsulta = document.getElementById("form-consulta");
const campoIdConsulta = document.getElementById("id-consulta");
const soloActivas = document.getElementById("solo-activas");
const botonConsultar = document.getElementById("btn-consultar");
const botonLimpiarConsulta = document.getElementById("btn-limpiar-consulta");

// Mensajes y tabla
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tabla-unidades");

// Formulario de unidades
const formulario = document.getElementById("form-unidad");
const campoId = document.getElementById("idunidad");
const campoNombre = document.getElementById("unidadNombre");
const campoAbreviatura = document.getElementById("abreviatura");
const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("btn-guardar");
const botonCancelar = document.getElementById("btn-cancelar");


// ==========================================
// EVENTOS
// ==========================================

formularioConsulta.addEventListener("submit", consultarUnidades);

botonLimpiarConsulta.addEventListener("click", () => {
    formularioConsulta.reset();
    consultarUnidades();
});

formulario.addEventListener("submit", guardarUnidad);

botonCancelar.addEventListener("click", limpiarFormulario);


// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-${tipo}`;
}


// ==========================================
// LEER RESPUESTAS DE LA API
// ==========================================

async function leerRespuesta(respuesta) {

    const texto = await respuesta.text();

    let datos = {};

    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch {
            throw new Error(
                "El servidor devolvió una respuesta que no es JSON válido."
            );
        }
    }

    if (!respuesta.ok) {

        let error = datos.mensaje;

        if (!error) {
            switch (respuesta.status) {

                case 400:
                    error = "La solicitud contiene datos incorrectos.";
                    break;

                case 401:
                    error = "No tienes autorización para realizar esta operación.";
                    break;

                case 403:
                    error = "El servidor rechazó el acceso por falta de permisos.";
                    break;

                case 404:
                    error = "No se encontró la unidad de medida solicitada.";
                    break;

                case 405:
                    error = "El servidor no permite utilizar este método HTTP.";
                    break;

                case 500:
                    error = "Ocurrió un error interno en el servidor.";
                    break;

                default:
                    error = `Error HTTP: ${respuesta.status}`;
            }
        }

        throw new Error(error);
    }

    return datos;
}


// ==========================================
// SOLICITUDES A LA API
// ==========================================

async function solicitarAPI(url, opciones = {}) {

    let respuesta;

    try {

        respuesta = await fetch(url, opciones);

    } catch (error) {

        console.error("Error de conexión:", error);

        throw new Error(
            "No fue posible conectar con la API. Verifica tu conexión, los permisos CORS y que el servidor esté disponible."
        );
    }

    return await leerRespuesta(respuesta);
}


// ==========================================
// GET: CONSULTAR TIPOS DE UNIDADES DE MEDIDA
// ==========================================

async function consultarUnidades(evento) {

    if (evento) {
        evento.preventDefault();
    }

    try {

        mostrarMensaje("Consultando unidades de medida...", "info");

        botonConsultar.disabled = true;
        tabla.replaceChildren();

        const id = campoIdConsulta.value.trim();

        let url = API_URL;

        // Consultar una unidad específica.
        if (id !== "") {

            const idNumerico = Number(id);

            if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
                throw new Error("El ID debe ser un entero positivo.");
            }

            url += `/${idNumerico}`;

        } else {

            // Consultar todas las unidades.
            const parametros = new URLSearchParams();

            if (soloActivas.checked) {
                parametros.append("soloActivos", "true");
            }

            const query = parametros.toString();

            if (query !== "") {
                url += `?${query}`;
            }
        }

        const datos = await solicitarAPI(url);

        const unidades = Array.isArray(datos) ? datos : [datos];

        mostrarUnidades(unidades);

        if (unidades.length === 0) {

            mostrarMensaje(
                "No se encontraron unidades de medida.",
                "info"
            );

        } else {

            mostrarMensaje(
                `${unidades.length} unidades de medida encontradas.`,
                "exito"
            );
        }

    } catch (error) {

        console.error("Error al consultar unidades:", error);

        mostrarMensaje(error.message, "error");

    } finally {

        botonConsultar.disabled = false;

    }
}


// ==========================================
// MOSTRAR TIPOS DE UNIDADES EN LA TABLA
// ==========================================

function mostrarUnidades(unidades) {

    tabla.replaceChildren();

    console.log("Unidades recibidas de la API:", unidades);

    unidades.forEach(unidad => {

        const fila = document.createElement("tr");

        // ID
        agregarCelda(fila, unidad.idUnidadMedida);

        // Nombre
        agregarCelda(fila, unidad.nombre);

        // Abreviatura
        agregarCelda(fila, unidad.abreviatura);

        // Estado
        agregarCelda(
            fila,
            unidad.activo ? "Activo" : "Inactivo"
        );

        // Acciones
        const celdaAcciones = document.createElement("td");

        // Botón modificar
        const botonEditar = document.createElement("button");

        botonEditar.type = "button";
        botonEditar.textContent = "Modificar";

        botonEditar.addEventListener("click", () => {
            editarUnidad(unidad);
        });

        // Botón dar de baja
        const botonEliminar = document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.textContent = "Dar de baja";
        botonEliminar.disabled = !unidad.activo;

        botonEliminar.addEventListener("click", () => {
            eliminarUnidad(unidad.idUnidadMedida);
        });

        celdaAcciones.append(botonEditar, botonEliminar);

        fila.appendChild(celdaAcciones);

        tabla.appendChild(fila);
    });
}


// ==========================================
// CREAR CELDAS DE LA TABLA
// ==========================================

function agregarCelda(fila, valor) {

    const celda = document.createElement("td");

    celda.textContent =
        valor === null || valor === undefined || valor === ""
            ? "—"
            : valor;

    fila.appendChild(celda);
}


// ==========================================
// CARGAR TIPO DE UNIDAD PARA MODIFICAR
// ==========================================

function editarUnidad(unidad) {

    campoId.value = unidad.idUnidadMedida;

    campoNombre.value = unidad.nombre ?? "";

    campoAbreviatura.value = unidad.abreviatura ?? "";

    tituloFormulario.textContent = "Modificar unidad de medida";

    botonGuardar.textContent = "Guardar cambios";

    mostrarMensaje(
        `Modificando la unidad con ID ${unidad.idUnidadMedida}.`,
        "info"
    );

    formulario.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// POST: REGISTRAR O MODIFICAR UNIDAD
// ==========================================

async function guardarUnidad(evento) {

    evento.preventDefault();

    try {

        mostrarMensaje("Guardando unidad de medida...", "info");

        const idTexto = campoId.value.trim();

        const nombre = campoNombre.value.trim();

        const abreviatura = campoAbreviatura.value.trim();

        const id = idTexto === "" ? null : Number(idTexto);

        if (!nombre) {
            throw new Error("Debes ingresar el nombre de la unidad.");
        }

        if (!abreviatura) {
            throw new Error("Debes ingresar la abreviatura.");
        }

        if (id !== null && (!Number.isInteger(id) || id <= 0)) {
            throw new Error("El ID debe ser un entero positivo.");
        }

        // Modelo de solicitud definido en la sección 5.4.
        const datos = {
            idUnidadMedida: id,
            nombre: nombre,
            abreviatura: abreviatura
        };

        const resultado = await solicitarAPI(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        limpiarFormulario();

        await consultarUnidades();

        mostrarMensaje(
            resultado.mensaje || "Unidad de medida guardada correctamente.",
            "exito"
        );

    } catch (error) {

        console.error("Error al guardar unidad:", error);

        mostrarMensaje(error.message, "error");

    }
}


// ==========================================
// DELETE: BAJA LÓGICA
// ==========================================

async function eliminarUnidad(id) {

    const confirmar = window.confirm(
        `¿Deseas dar de baja la unidad de medida con ID ${id}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        mostrarMensaje("Procesando baja...", "info");

        const resultado = await solicitarAPI(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        limpiarFormulario();

        await consultarUnidades();

        mostrarMensaje(
            resultado.mensaje || "Unidad de medida dada de baja correctamente.",
            "exito"
        );

    } catch (error) {

        console.error("Error al dar de baja:", error);

        mostrarMensaje(error.message, "error");

    }
}


// ==========================================
// LIMPIAR FORMULARIO
// ==========================================

function limpiarFormulario() {

    formulario.reset();

    campoId.value = "";

    tituloFormulario.textContent = "Registrar Tipo de Unidad";

    botonGuardar.textContent = "Guardar Tipo de Unidad";
}


// ==========================================
// CONSULTA AUTOMÁTICA AL ABRIR LA PÁGINA
// ==========================================

consultarUnidades();
