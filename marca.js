
 // ==========================================
 // CONFIGURACIÓN DE LA API
 // ==========================================

const API_URL =
    "https://ssi-test.unison.mx/Administrativo/SSPAmbiental/api/Marca";


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
const tabla = document.getElementById("tabla-marcas");

// Formulario de marca
const formulario = document.getElementById("form-marca");
const campoId = document.getElementById("idmarca");
const campoNombre = document.getElementById("marcaNombre");
const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("btn-guardar");
const botonCancelar = document.getElementById("btn-cancelar");


// ==========================================
// EVENTOS
// ==========================================

formularioConsulta.addEventListener("submit", consultarMarcas);

botonLimpiarConsulta.addEventListener("click", () => {
    formularioConsulta.reset();
    consultarMarcas();
});

formulario.addEventListener("submit", guardarMarca);

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
                    error = "No se encontró la marca solicitada.";
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
// GET: CONSULTAR MARCAS
// ==========================================

async function consultarMarcas(evento) {

    if (evento) {
        evento.preventDefault();
    }

    try {

        mostrarMensaje("Consultando marcas...", "info");

        botonConsultar.disabled = true;
        tabla.replaceChildren();

        const id = campoIdConsulta.value.trim();

        let url = API_URL;

        // Consultar una marca específica.
        if (id !== "") {

            const idNumerico = Number(id);

            if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
                throw new Error("El ID debe ser un entero positivo.");
            }

            url += `/${idNumerico}`;

        } else {

            // Consultar todas las marcas.
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

        const marcas = Array.isArray(datos) ? datos : [datos];

        mostrarMarcas(marcas);

        if (marcas.length === 0) {

            mostrarMensaje("No se encontraron marcas.", "info");

        } else {

            mostrarMensaje(
                `${marcas.length} marcas encontradas.`,
                "exito"
            );
        }

    } catch (error) {

        console.error("Error al consultar marcas:", error);

        mostrarMensaje(error.message, "error");

    } finally {

        botonConsultar.disabled = false;

    }
}


// ==========================================
// MOSTRAR MARCAS EN LA TABLA
// ==========================================

function mostrarMarcas(marcas) {

    tabla.replaceChildren();

    // Revisar la estructura real de la respuesta.
    //console.log("Marcas recibidas de la API:", marcas);

    marcas.forEach(marca => {

        const fila = document.createElement("tr");

        // ID
        agregarCelda(fila, marca.idMarca);
        agregarCelda(fila, marca.marcaNombre);

        agregarCelda(
            fila,
            marca.activo ? "Activo" : "Inactivo"
        );

        // Acciones
        const celdaAcciones = document.createElement("td");

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.textContent = "Modificar";

        botonEditar.addEventListener("click", () => {
            editarMarca(marca);
        });
		
		//Dar de Baja
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Dar de baja";
        botonEliminar.disabled = !marca.activo;

        botonEliminar.addEventListener("click", () => {
            eliminarMarca(marca.idMarca);
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
// CARGAR MARCA PARA MODIFICAR
// ==========================================

function editarMarca(marca) {

    campoId.value = marca.idMarca;

    campoNombre.value = marca.marcaNombre ?? "";

    tituloFormulario.textContent = "Modificar marca";

    botonGuardar.textContent = "Guardar cambios";

    mostrarMensaje(
        `Modificando la marca con ID ${marca.idMarca}.`,
        "info"
    );

    formulario.scrollIntoView({
        behavior: "smooth"
    });
}

// ==========================================
// POST: REGISTRAR O MODIFICAR MARCA
// ==========================================

async function guardarMarca(evento) {

    evento.preventDefault();

    try {

        mostrarMensaje("Guardando marca...", "info");

        const idTexto = campoId.value.trim();

        const nombre = campoNombre.value.trim();

        const id = idTexto === "" ? null : Number(idTexto);

        if (!nombre) {
            throw new Error("Debes ingresar el nombre de la marca.");
        }

        if (id !== null && (!Number.isInteger(id) || id <= 0)) {
            throw new Error("El ID debe ser un entero positivo.");
        }

        // Modelo de solicitud definido en la sección 5.3.
        const datos = {
            idMarca: id,
            marca: nombre
        };

        const resultado = await solicitarAPI(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(datos)

        });

        mostrarMensaje(
            resultado.mensaje || "Marca guardada correctamente.",
            "exito"
        );

        limpiarFormulario();

        await consultarMarcas();

    } catch (error) {

        console.error("Error al guardar marca:", error);

        mostrarMensaje(error.message, "error");

    }
}


// ==========================================
// DELETE: BAJA LÓGICA
// ==========================================

async function eliminarMarca(id) {

    const confirmar = window.confirm(
        `¿Deseas dar de baja la marca con ID ${id}?`
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

        await consultarMarcas();

        mostrarMensaje(
            resultado.mensaje || "Marca dada de baja correctamente.",
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

    tituloFormulario.textContent = "Registrar marca";

    botonGuardar.textContent = "Guardar marca";
}


// ==========================================
// CONSULTA AUTOMÁTICA AL ABRIR LA PÁGINA
// ==========================================

consultarMarcas();
