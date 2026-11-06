SHOW server_encoding;
SHOW client_encoding;

SELECT
    datname,
    pg_encoding_to_char(encoding) AS encoding
FROM pg_database
WHERE datname = current_database();

CREATE ROLE web_anon NOLOGIN;

GRANT USAGE ON SCHEMA public TO web_anon;

CREATE SCHEMA api;

CREATE TABLE api.cuentas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    contrasena TEXT NOT NULL
);

GRANT USAGE ON SCHEMA api TO web_anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE api.cuentas TO web_anon;

GRANT USAGE, SELECT
ON SEQUENCE api.cuentas_id_seq TO web_anon;

CREATE TABLE api.substancias (
    id SERIAL PRIMARY KEY,
	id_est INT NOT NULL,
	niv_est TEXT,
	cas TEXT NOT NULL,
    nombre TEXT NOT NULL,
    marca TEXT NOT NULL,
    cantidad INT NOT NULL,
	unidades TEXT NOT NULL,
	fecha_ad TEXT DEFAULT 'Sin dato',
	fecha_ap TEXT DEFAULT 'Sin dato',
	fecha_cad TEXT DEFAULT 'No Aplica',
	pel_non BOOLEAN DEFAULT FALSE,
	pel_cor BOOLEAN DEFAULT FALSE,
	pel_tox BOOLEAN DEFAULT FALSE,
	pel_mut BOOLEAN DEFAULT FALSE,
	pel_inf BOOLEAN DEFAULT FALSE,
	pel_irr BOOLEAN DEFAULT FALSE,
	pel_exp BOOLEAN DEFAULT FALSE,
	pel_com BOOLEAN DEFAULT FALSE,
	pel_gas BOOLEAN DEFAULT FALSE,
	obs TEXT,
	indicaciones TEXT DEFAULT 'X'

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE api.substancias
TO web_anon;

INSERT INTO api.substancias (id_est, niv_est, nombre, cas, marca, cantidad, unidades, pel_irr)
VALUES
    (1, 'A', 'Acetato de Amonio', '631-61-6', 'Sigma', '200', 'Gramos', TRUE);