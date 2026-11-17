const API_URL =
    "https://ssi-dev.unison.mx/Net10/Adm/SSPAmbiental/api/PalabraAdvertencia";

const boton = document.getElementById("btn-consultar");
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tabla-advertencias");

boton.addEventListener("click", consultarAdvertencias);

async function consultarAdvertencias() {

    try {

        mensaje.textContent = "Consultando catálogo...";

        const respuesta = await fetch(`${API_URL}?soloActivos=true`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const advertencias = await respuesta.json();

        tabla.innerHTML = "";

        advertencias.forEach(advertencia => {

            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${advertencia.idPalabraAdvertencia}</td>
                <td>${advertencia.nombre}</td>
                <td>${advertencia.descripcion ?? ""}</td>
                <td>${advertencia.activo ? "Activo" : "Inactivo"}</td>
            `;

            tabla.appendChild(fila);

        });

        mensaje.textContent =
            `${advertencias.length} registros encontrados.`;

    } catch (error) {

        console.error(error);

        mensaje.textContent =
            "No fue posible consultar las palabras de advertencia.";

    }
}