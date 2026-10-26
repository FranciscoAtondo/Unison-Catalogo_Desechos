const API_CUENTAS = "http://localhost:3000/cuentas";

const loginForm = document.getElementById("login-form");
const nombreInput = document.getElementById("nombre");
const contrasenaInput = document.getElementById("contrasena");
const loginButton = document.getElementById("login-button");
const loginResponse = document.getElementById("login-response");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    const contrasena = contrasenaInput.value;

    if (!nombre || !contrasena) {
        loginResponse.textContent =
            "Introduce el nombre de cuenta y la contraseña.";
        return;
    }

    loginButton.disabled = true;
    loginResponse.textContent = "Consultando la tabla cuentas...";

    try {
        // Construir la consulta a la tabla cuentas.
        const url = new URL(API_CUENTAS);

        url.searchParams.set("select", "id,nombre");
        url.searchParams.set("nombre", `eq.${nombre}`);
        url.searchParams.set("contrasena", `eq.${contrasena}`);

        // Consultar exclusivamente las cuentas que coincidan.
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status}. ` +
                "Comprueba los permisos y la configuración de PostgREST."
            );
        }

        const cuentas = await response.json();

        if (!Array.isArray(cuentas)) {
            throw new Error(
                "La respuesta de la base de datos no tiene el formato esperado."
            );
        }

        if (cuentas.length === 0) {
            loginResponse.textContent =
                "Nombre de cuenta o contraseña incorrectos.";
            return;
        }

        // Se encontró una coincidencia en la tabla cuentas.
        loginResponse.textContent =
            "Acceso correcto. Abriendo el catálogo...";

        contrasenaInput.value = "";

        window.location.href = "index.html";

    } catch (error) {
        loginResponse.textContent =
            "No se pudo consultar la tabla cuentas.\n" +
            error.message +
            "\n\nVerifica que PostgreSQL y PostgREST estén funcionando.";
    } finally {
        loginButton.disabled = false;
    }
});
