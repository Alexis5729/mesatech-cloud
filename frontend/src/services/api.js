const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, token, options = {}) {

  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error API: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}