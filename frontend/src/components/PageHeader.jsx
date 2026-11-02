import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import {
  ArrowLeft,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserRoundCog,
  LogOut,
} from "lucide-react";

import { loginRequest } from "../auth/msalConfig";
import { useUserRoles } from "../hooks/useUserRoles";

import logo from "../assets/mesatech-logo.png";

import "./PageHeader.css";

function PageHeader({
  account,
  setAccount,
  theme,
  setTheme,
  onBack,
}) {
  const {
    instance,
    inProgress,
  } = useMsal();

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const {
    esCliente,
    esOperador,
    esAdministrador,
  } = useUserRoles(account);

  const nombre =
    account?.name || "Usuario";

  const correo =
    account?.username || "Sin correo";

  const rol =
    esAdministrador
      ? "Administrador"
      : esOperador
        ? "Operador"
        : esCliente
          ? "Cliente"
          : "Usuario";

  const toggleTheme = () => {
    const nuevoTema =
      theme === "light"
        ? "dark"
        : "light";

    setTheme(nuevoTema);

    localStorage.setItem(
      "mesatech-theme",
      nuevoTema
    );
  };

  const handleSwitchAccount =
    async () => {
      if (
        inProgress !==
        InteractionStatus.None
      ) {
        return;
      }

      setShowProfileMenu(false);

      try {
        const response =
          await instance.loginPopup({
            ...loginRequest,
            prompt: "select_account",
          });

        if (!response?.account) {
          return;
        }

        instance.setActiveAccount(
          response.account
        );

        setAccount(
          response.account
        );
      } catch (error) {
        console.error(
          "Error al cambiar de usuario:",
          error
        );
      }
    };

  const handleLogout = async () => {
    if (
      inProgress !==
      InteractionStatus.None
    ) {
      return;
    }

    setShowProfileMenu(false);

    try {
      await instance.logoutPopup({
        mainWindowRedirectUri: "/",
      });
    } catch (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );
    }
  };

  return (
    <header className="page-common-header">

      <div className="page-common-left">
        {onBack && (
          <button
            type="button"
            className="page-common-back"
            onClick={onBack}
          >
            <ArrowLeft size={17} />

            <span>
              Volver
            </span>
          </button>
        )}
      </div>

      <div className="page-common-brand">
        <img
          src={logo}
          alt="MesaTech Cloud"
        />
      </div>

      <div className="page-common-actions">

        <button
          type="button"
          className="page-common-icon-button"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          className="page-common-theme-switch"
          onClick={toggleTheme}
          aria-label={
            theme === "light"
              ? "Cambiar a modo oscuro"
              : "Cambiar a modo claro"
          }
        >

          <span
            className={
              theme === "light"
                ? "page-common-theme-option active"
                : "page-common-theme-option"
            }
          >
            <Sun size={15} />
          </span>

          <span
            className={
              theme === "dark"
                ? "page-common-theme-option active"
                : "page-common-theme-option"
            }
          >
            <Moon size={15} />
          </span>

        </button>

        <div className="page-common-profile">

          <button
            type="button"
            className="page-common-user-area"
            onClick={() =>
              setShowProfileMenu(
                (prev) => !prev
              )
            }
          >

            <div className="page-common-user-info">

              <strong>
                {nombre}
              </strong>

              <span>
                {correo}
              </span>

            </div>

            <div className="page-common-avatar">
              {nombre
                .charAt(0)
                .toUpperCase()}
            </div>

            <ChevronDown
              size={15}
              className="page-common-chevron"
            />

          </button>

          {showProfileMenu && (

            <div className="page-common-profile-menu">

              <div className="page-common-profile-info">

                <strong>
                  {nombre}
                </strong>

                <span>
                  {correo}
                </span>

                <small>
                  {rol}
                </small>

              </div>

              <div className="page-common-divider" />

              <button
                type="button"
                className="page-common-switch-account"
                onClick={
                  handleSwitchAccount
                }
              >
                <UserRoundCog size={18} />

                <span>
                  Cambiar de usuario
                </span>
              </button>

              <div className="page-common-divider" />

              <button
                type="button"
                className="page-common-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />

                <span>
                  Cerrar sesión
                </span>
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default PageHeader;