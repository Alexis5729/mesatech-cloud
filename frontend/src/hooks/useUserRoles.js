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


export function useUserRoles(account) {

  const { instance } = useMsal();

  const [roles, setRoles] =
    useState([]);

  const [loadingRoles, setLoadingRoles] =
    useState(true);


  const accountId =
    account?.homeAccountId || null;


  useEffect(() => {

    let cancelled = false;


    const cargarRoles = async () => {

      if (!account || !accountId) {

        if (!cancelled) {
          setRoles([]);
          setLoadingRoles(false);
        }

        return;
      }


      /*
       * Al cambiar de usuario eliminamos
       * temporalmente los roles anteriores.
       */
      if (!cancelled) {
        setRoles([]);
        setLoadingRoles(true);
      }


      try {

        const response =
          await instance.acquireTokenSilent({
            ...loginRequest,
            account,
          });


        const claims =
          decodeJwtPayload(
            response.accessToken
          );


        if (!cancelled) {

          setRoles(
            claims.roles || []
          );

        }


      } catch (error) {

        console.error(
          "Error obteniendo roles:",
          error
        );


        if (!cancelled) {
          setRoles([]);
        }


      } finally {

        if (!cancelled) {
          setLoadingRoles(false);
        }

      }

    };


    cargarRoles();


    return () => {
      cancelled = true;
    };


  }, [
    instance,
    accountId
  ]);


  return {

    roles,

    loadingRoles,

    esCliente:
      roles.includes("CLIENTE"),

    esOperador:
      roles.includes("OPERADOR"),

    esAdministrador:
      roles.includes("ADMINISTRADOR"),

  };

}