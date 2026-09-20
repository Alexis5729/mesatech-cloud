import { useMsal } from "@azure/msal-react";

function Home() {
  const { accounts } = useMsal();

  const account = accounts[0];

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

    </div>
  );
}

export default Home;