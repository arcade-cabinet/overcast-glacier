import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error('Root element with id "root" not found in document.');
  if (import.meta.env.DEV) {
    throw new Error(
      'Root element with id "root" not found in document. Cannot mount application.',
    );
  }
}
