import {
  msalInstance,
  loginRequest,
} from "../auth/msalConfig";

// =====================================================
// URL DEL BFF
// =====================================================

const API_URL = "https://72q5moiwq9.execute-api.us-east-1.amazonaws.com";


// =====================================================
// OBTENER ACCESS TOKEN
// =====================================================

export async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();

  if (!accounts || accounts.length === 0) {
    throw new Error(
      "No hay ningún usuario autenticado."
    );
  }

  const account = accounts[0];

  try {
    const response =
      await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

    if (!response.accessToken) {
      throw new Error(
        "Microsoft Entra ID no devolvió un Access Token."
      );
    }

    console.log(
      "Access Token obtenido para API"
    );

    return response.accessToken;

  } catch (error) {

    console.error(
      "Error obteniendo Access Token:",
      error
    );

    throw new Error(
      "No fue posible obtener el Access Token."
    );
  }
}


// =====================================================
// FUNCIÓN GENERAL PARA CONSUMIR API
// =====================================================

async function request(
  endpoint,
  options = {}
) {

  const token = await getAccessToken();

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`,

        ...(options.headers || {}),
      },
    }
  );


  // ===================================================
  // MANEJO DE RESPUESTA
  // ===================================================

  if (!response.ok) {

    let mensaje =
      `Error HTTP ${response.status}`;

    try {

      const errorData =
        await response.json();

      if (errorData.message) {
        mensaje = errorData.message;
      }

    } catch {
      // La respuesta no tenía JSON
    }

    throw new Error(mensaje);
  }


  // ===================================================
  // RESPUESTA SIN CONTENIDO
  // ===================================================

  if (response.status === 204) {
    return null;
  }


  // ===================================================
  // RESPUESTA JSON
  // ===================================================

  return response.json();
}


// =====================================================
// GET
// =====================================================

export async function apiGet(endpoint) {

  return request(endpoint, {
    method: "GET",
  });

}


// =====================================================
// POST
// =====================================================

export async function apiPost(
  endpoint,
  data
) {

  return request(endpoint, {
    method: "POST",

    body: JSON.stringify(data),
  });

}


// =====================================================
// PUT
// =====================================================

export async function apiPut(
  endpoint,
  data
) {

  return request(endpoint, {
    method: "PUT",

    body: JSON.stringify(data),
  });

}


// =====================================================
// DELETE
// =====================================================

export async function apiDelete(
  endpoint
) {

  return request(endpoint, {
    method: "DELETE",
  });

}