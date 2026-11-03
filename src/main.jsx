import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { PlayerProvider } from "./context/PlayerContext.jsx";
import { CollectionProvider } from "./context/CollectionContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CollectionProvider>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </CollectionProvider>
  </StrictMode>,
);
