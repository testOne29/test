import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <Auth0Provider
      domain="dev-jbpef8uzheywwxzd.us.auth0.com"
      clientId="v0waSxLxN87gRigaiLnduPBCBlIijg7b"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <StrictMode>
        <App />
      </StrictMode>
    </Auth0Provider>
  </Provider>
);
