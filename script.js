const method = document.getElementById("method");
const url = document.getElementById("url");

const id = document.getElementById("id");
const nombre = document.getElementById("nombre");

const execute = document.getElementById("execute");
const response = document.getElementById("response");


execute.addEventListener("click", async () => {

    const selectedMethod = method.value;
    let requestUrl = url.value;

    // Configuración básica de la petición
    const options = {
        method: selectedMethod
    };

    // Ejecutar petición
    try {

        const result =
            await fetch(requestUrl, options);


        const text =
            await result.text();


        response.textContent =
            "HTTP " +
            result.status +
            "\n\n" +
            text;

    }

    catch (error) {

        response.textContent =
            "ERROR:\n" +
            error;

    }

});