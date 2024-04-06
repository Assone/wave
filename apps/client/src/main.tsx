import "@fontsource/inter";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { WebSocketProvider } from "./hooks/useWebSocket.tsx";
import "./index.css";
import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <WebSocketProvider>
    <RouterProvider router={router} />
  </WebSocketProvider>
  // </React.StrictMode>
);
