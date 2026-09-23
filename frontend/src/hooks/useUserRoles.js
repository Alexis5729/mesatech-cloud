import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";

function decodeJwtPayload(token) {
  const payload = token.split(".")[1];

  const base64 = payload
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const decoded = atob(base64);

  return JSON.parse(decoded);
}

export function useUserRoles() {
  const { instance, accounts } = useMsal();

  const account = accounts[0];

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const cargarRoles = async () => {
      if (!account) {
        setLoadingRoles(false);
        return;
      }

      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        const claims = decodeJwtPayload(
          response.accessToken
        );

        setRoles(claims.roles || []);

      } catch (error) {
        console.error(
          "Error obteniendo roles:",
          error
        );

        setRoles([]);

      } finally {
        setLoadingRoles(false);
      }
    };

    cargarRoles();
  }, [instance, account]);

  return {
    roles,
    loadingRoles,
    esCliente: roles.includes("CLIENTE"),
    esOperador: roles.includes("OPERADOR"),
    esAdministrador: roles.includes("ADMINISTRADOR"),
  };
}