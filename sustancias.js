
// ==========================================
// CONFIGURACIÓN DE LA API
// ==========================================

const API_URL =
    "https://ssi-test.unison.mx/Administrativo/SSPAmbiental/api/Sustancia";


// ==========================================
// ELEMENTOS HTML
// ==========================================

// Consulta
const formularioConsulta = document.getElementById("form-consulta");
const campoId = document.getElementById("id-sustancia");
const soloActivas = document.getElementById("solo-activas");
const botonLimpiar = document.getElementById("btn-limpiar");

// Mensajes y resultados
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tabla-sustancias");

// Formulario de registro
const formularioSustancia = document.getElementById("form-sustancia");
const tituloFormulario = document.getElementById("titulo-formulario");
const registroId = document.getElementById("registro-id");
const botonCancelar = document.getElementById("btn-cancelar-edicion");
const botonGuardar = document.getElementById("btn-guardar");


// ==========================================
// EVENTOS
// ==========================================

formularioConsulta.addEventListener("submit", consultarSustancias);

botonLimpiar.addEventListener("click", () => {
    formularioConsulta.reset();
    consultarSustancias();
});

formularioSustancia.addEventListener("submit", guardarSustancia);

botonCancelar.addEventListener("click", limpiarFormulario);


// ==========================================
// MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje-${tipo}`;
}


// ==========================================
// LECTURA DE RESPUESTAS DE LA API
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
                    error = "No se encontró el recurso solicitado.";
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
// CONSULTAR SUSTANCIAS (GET)
// ==========================================

async function consultarSustancias(evento) {

    if (evento) {
        evento.preventDefault();
    }

    try {

        mostrarMensaje("Consultando sustancias...", "info");

        tabla.replaceChildren();

        const id = campoId.value.trim();

        let url = API_URL;

        // Consultar una sustancia específica
        if (id !== "") {

            const idNumerico = Number(id);

            if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
                throw new Error("El ID debe ser un entero positivo.");
            }

            url += `/${idNumerico}`;

        } else {

            // Consultar todas las sustancias
            const parametros = new URLSearchParams();

            if (soloActivas.checked) {
                parametros.append("soloActivas", "true");
            }

            const query = parametros.toString();

            if (query !== "") {
                url += `?${query}`;
            }
        }

        const datos = await solicitarAPI(url);

        const sustancias = Array.isArray(datos)
            ? datos
            : [datos];

        mostrarSustancias(sustancias);

        if (sustancias.length === 0) {

            mostrarMensaje("No se encontraron sustancias.", "info");

        } else {

            mostrarMensaje(
                `${sustancias.length} sustancias encontradas.`,
                "exito"
            );
        }

    } catch (error) {

        console.error("Error al consultar sustancias:", error);

        mostrarMensaje(error.message, "error");
    }
}


// ==========================================
// MOSTRAR RESULTADOS EN LA TABLA
// ==========================================

function mostrarSustancias(sustancias) {

    tabla.replaceChildren();

    sustancias.forEach(sustancia => {

        const fila = document.createElement("tr");

        agregarCelda(fila, sustancia.idSustancia);
        agregarCelda(fila, sustancia.nombre);
        agregarCelda(fila, sustancia.formulaQuimica);
        agregarCelda(fila, sustancia.cas);
        agregarCelda(fila, sustancia.estadoFisico);
        agregarCelda(fila, sustancia.idPalabraAdvertencia);

        agregarCelda(
            fila,
            sustancia.activo ? "Activo" : "Inactivo"
        );

        // Columna de acciones
        const celdaAcciones = document.createElement("td");

        // Botón editar
        const botonEditar = document.createElement("button");

        botonEditar.type = "button";
        botonEditar.textContent = "Editar";

        botonEditar.addEventListener("click", () => {
            cargarFormulario(sustancia);
        });

        celdaAcciones.appendChild(botonEditar);

        // Botón eliminar
        const botonEliminar = document.createElement("button");

        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";

        botonEliminar.disabled = !sustancia.activo;

        botonEliminar.addEventListener("click", () => {
            eliminarSustancia(sustancia.idSustancia);
        });

        celdaAcciones.appendChild(botonEliminar);

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
// CARGAR FORMULARIO PARA MODIFICAR
// ==========================================

function cargarFormulario(sustancia) {

    registroId.value = sustancia.idSustancia;

    document.getElementById("nombre").value =
        sustancia.nombre ?? "";

    document.getElementById("nombre-quimico").value =
        sustancia.nombreQuimico ?? "";

    document.getElementById("formula-quimica").value =
        sustancia.formulaQuimica ?? "";

    document.getElementById("cas").value =
        sustancia.cas ?? "";

    document.getElementById("ce").value =
        sustancia.ce ?? "";

    document.getElementById("numero-onu").value =
        sustancia.numeroONU ?? "";

    document.getElementById("peso-molecular").value =
        sustancia.pesoMolecular ?? "";

    document.getElementById("estado-fisico").value =
        sustancia.estadoFisico ?? "";

    document.getElementById("densidad").value =
        sustancia.densidad ?? "";

    document.getElementById("pureza").value =
        sustancia.pureza ?? "";

    document.getElementById("concentracion").value =
        sustancia.concentracion ?? "";

    document.getElementById("unidad-concentracion").value =
        sustancia.unidadConcentracion ?? "";

    document.getElementById("descripcion").value =
        sustancia.descripcion ?? "";

    document.getElementById("id-palabra-advertencia").value =
        sustancia.idPalabraAdvertencia ?? "";

    // Si la API devuelve el ID del usuario, se carga también.
    document.getElementById("id-usuario").value =
        sustancia.idUsuario ?? "";

    tituloFormulario.textContent = "Modificar sustancia";
    botonGuardar.textContent = "Guardar cambios";

    formularioSustancia.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// REGISTRAR O MODIFICAR SUSTANCIA (POST)
// ==========================================

async function guardarSustancia(evento) {

    evento.preventDefault();

    try {

        mostrarMensaje("Guardando sustancia...", "info");

        const id = registroId.value.trim();

        const sustancia = {

            idSustancia: id === "" ? null : Number(id),

            nombre: document.getElementById("nombre").value.trim(),

            nombreQuimico: obtenerTexto("nombre-quimico"),

            formulaQuimica: obtenerTexto("formula-quimica"),

            cas: obtenerTexto("cas"),

            ce: obtenerTexto("ce"),

            numeroONU: obtenerTexto("numero-onu"),

            pesoMolecular: obtenerNumero("peso-molecular"),

            estadoFisico: obtenerTexto("estado-fisico"),

            densidad: obtenerNumero("densidad"),

            pureza: obtenerNumero("pureza"),

            concentracion: obtenerNumero("concentracion"),

            unidadConcentracion: obtenerTexto("unidad-concentracion"),

            descripcion: obtenerTexto("descripcion"),

            idPalabraAdvertencia:
                obtenerNumeroEntero("id-palabra-advertencia"),

            idUsuario:
                obtenerNumeroEntero("id-usuario")
        };

        if (!sustancia.nombre) {
            throw new Error("El nombre de la sustancia es obligatorio.");
        }

        if (
            !Number.isInteger(sustancia.idUsuario) ||
            sustancia.idUsuario <= 0
        ) {
            throw new Error("Debes indicar un ID de usuario válido.");
        }

        const resultado = await solicitarAPI(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(sustancia)

        });

        mostrarMensaje(
            resultado.mensaje || "Sustancia guardada correctamente.",
            "exito"
        );

        limpiarFormulario();

        await consultarSustancias();

    } catch (error) {

        console.error("Error al guardar sustancia:", error);

        mostrarMensaje(error.message, "error");
    }
}


// ==========================================
// ELIMINAR SUSTANCIA (DELETE)
// ==========================================

async function eliminarSustancia(id) {

    const confirmar = window.confirm(
        `¿Estás seguro de que deseas dar de baja la sustancia con ID ${id}?`
    );

    if (!confirmar) {
        return;
    }

    try {

        mostrarMensaje("Eliminando sustancia...", "info");

        const resultado = await solicitarAPI(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        mostrarMensaje(
            resultado.mensaje || "Sustancia eliminada correctamente.",
            "exito"
        );

        await consultarSustancias();

    } catch (error) {

        console.error("Error al eliminar sustancia:", error);

        mostrarMensaje(error.message, "error");
    }
}


// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function obtenerTexto(id) {

    const valor = document.getElementById(id).value.trim();

    return valor === "" ? null : valor;
}


function obtenerNumero(id) {

    const valor = document.getElementById(id).value.trim();

    return valor === "" ? null : Number(valor);
}


function obtenerNumeroEntero(id) {

    const valor = document.getElementById(id).value.trim();

    return valor === "" ? null : Number(valor);
}


// ==========================================
// LIMPIAR FORMULARIO
// ==========================================

function limpiarFormulario() {

    formularioSustancia.reset();

    registroId.value = "";

    tituloFormulario.textContent = "Registrar sustancia";

    botonGuardar.textContent = "Guardar sustancia";
}


// ==========================================
// CONSULTA AUTOMÁTICA AL ABRIR LA PÁGINA
// ==========================================

consultarSustancias();
