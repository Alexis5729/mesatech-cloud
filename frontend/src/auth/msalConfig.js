import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "2b9a9a1b-80c3-4518-a1d6-7617b14268c3",
    authority: "https://login.microsoftonline.com/36e4a89a-590a-43c7-b9f3-3af8fffde2a0",
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
  },

  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: [
    "api://d09ac090-b77b-48fb-aa08-6eb796171c8b/access_as_user"
  ],
};