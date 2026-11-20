
const API_URL =
    "https://ssi-test.unison.mx/Administrativo/SSPAmbiental/api/PalabraAdvertencia";

const boton = document.getElementById("btn-consultar");
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tabla-advertencias");

// Ejecutar la consulta al presionar el botón.
boton.addEventListener("click", consultarAdvertencias);

async function consultarAdvertencias() {

    try {

        mensaje.textContent = "Consultando catálogo...";
        boton.disabled = true;

        // Solicitar únicamente registros activos.
        const respuesta = await fetch(
            `${API_URL}?soloActivos=true`
        );

        // Comprobar si la solicitud fue exitosa.
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        // Convertir la respuesta a JSON.
        const advertencias = await respuesta.json();

        if (!Array.isArray(advertencias)) {
            throw new Error("La respuesta no tiene el formato esperado.");
        }

        // Limpiar la tabla antes de mostrar los resultados.
        tabla.replaceChildren();

        // Recorrer los registros recibidos.
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

            fila.append(id, nombre, descripcion, estado);
            tabla.appendChild(fila);

        });

        mensaje.textContent =
            `${advertencias.length} registros encontrados.`;

    } catch (error) {

        console.error("Error al consultar advertencias:", error);

        mensaje.textContent =
            "No fue posible consultar las palabras de advertencia.";

    } finally {

        boton.disabled = false;

    }
}
