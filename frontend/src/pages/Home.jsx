import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

import { loginRequest } from "../auth/msalConfig";
import { apiFetch } from "../services/api";

function Home() {
  const { instance, accounts } = useMsal();

  const account = accounts[0];

  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {

    const cargarCategorias = async () => {

      try {

        if (!account) {
          return;
        }

        const tokenResponse =
          await instance.acquireTokenSilent({
            ...loginRequest,
            account,
          });

        const datos = await apiFetch(
          "/v1/catalogo/categorias",
          tokenResponse.accessToken
        );

        setCategorias(datos);


      } catch (error) {

        console.error(
          "Error cargando categorías:",
          error
        );

        setError(
          "No fue posible cargar las categorías."
        );
      }
    };

    cargarCategorias();

  }, [instance, account]);

  return (
    <div className="home-page">

      <h1>
        MESATECH CLOUD
      </h1>

      <h2>
        Bienvenido
      </h2>

      <p>
        Usuario: {account?.name}
      </p>

      <p>
        Correo: {account?.username}
      </p>

      <hr />

      <h3>
        Panel principal
      </h3>

      <p>
        Desde aquí podrás gestionar las solicitudes de soporte.
      </p>

      <h3>Categorías disponibles</h3>

      {error && (
        <p>{error}</p>
      )}

      <ul>
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            {categoria.nombre}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default Home;