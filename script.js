const method = document.getElementById("method");
const url = document.getElementById("url");

const id = document.getElementById("id");
const nivel = document.getElementById("nivel");
const estante = document.getElementById("estante");
const nombre = document.getElementById("nombre");
const cas = document.getElementById("cas");
const marca = document.getElementById("marca");
const cantidad = document.getElementById("cantidad");
const unidades = document.getElementById("unidades");
const fecha_ad = document.getElementById("fecha_ad");
const fecha_ap = document.getElementById("fecha_ap");
const fecha_cad = document.getEleemntById("fecha_cad");

const pel_cor = document.getElementById("pel_cor");
const pel_tox = document.getElementById("pel_tox");
const pel_mut = document.getElementById("pel_mut");
const pel_inf = document.getElementById("pel_inf");
const pel_irr = document.getElementById("pel_irr");
const pel_exp = document.getElementById("pel_exp");
const pel_com = document.getElementById("pel_com");
const pel_gas = document.getElementById("pel_gas");

const obs = document.getElementById("obs");
const indicaciones = document.getElementById("indicaciones");

const execute = document.getElementById("execute");
const response = document.getElementById("response");

// Convierte números vacíos en null, no en cero.
function numeroOTextoVacio(valor) {
    return valor === "" ? null : Number(valor);
}

execute.addEventListener("click", async () => {

    const selectedMethod = method.value;
    const requestUrl = new URL(url.value);

    // PATCH y DELETE necesitan un ID.
    if (selectedMethod === "PATCH" ||
        selectedMethod === "DELETE") {

        if (!id.value) {
            response.textContent = "Debes introducir un ID.";
            return;
        }

        // Agrega el filtro id=eq.<valor>.
        requestUrl.searchParams.set("id", "eq." + id.value);
    }

    const options = {
        method: selectedMethod,
        headers: {
            "Accept": "application/json"
        }
    };

    // POST y PATCH envían los datos del formulario.
    if (selectedMethod === "POST" ||
        selectedMethod === "PATCH") {

        options.headers["Content-Type"] = "application/json";

        // Solicita a PostgREST que devuelva las filas afectadas.
        options.headers["Prefer"] = "return=representation";

        const data = {
            nivel: numeroOTextoVacio(nivel.value),
            estante: estante.value,
            nombre: nombre.value,
            marca: marca.value,
            cantidad: cantidad.value,
            unidades: numeroOTextoVacio(unidades.value),
			cas: cas.value,

            fecha_ad: fecha_ad.value,
            fecha_ap: fecha_ap.value,
			fecha_cad: fecha_cad.value,

            pel_cor: pel_cor.checked,
            pel_tox: pel_tox.checked,
            pel_mut: pel_mut.checked,
            pel_inf: pel_inf.checked,
            pel_irr: pel_irr.checked,
            pel_exp: pel_exp.checked,
            pel_com: pel_com.checked,
            pel_gas: pel_gas.checked,
			
			obs: obs.value,
			indicaciones: indicaciones.value
        };

        options.body = JSON.stringify(data);
    }

    // También solicita la representación de las filas eliminadas.
    if (selectedMethod === "DELETE") {
        options.headers["Prefer"] = "return=representation";
    }

    response.textContent = "Procesando petición...";

    try {
        const result = await fetch(requestUrl.toString(), options);
        const text = await result.text();

        response.textContent =
            "HTTP " + result.status +
            " " + result.statusText +
            "\n\n" +
            (text || "(La API no devolvió contenido en el cuerpo de la respuesta.)");

    } catch (error) {
        response.textContent =
            "ERROR DE CONEXIÓN:\n" + error.message +
            "\n\nComprueba que PostgREST esté activo, " +
            "que la URL sea correcta y que CORS permita la petición.";
    }
});