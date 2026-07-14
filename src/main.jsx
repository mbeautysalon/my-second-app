import React from "react";
import ReactDOM from "react-dom/client";
import "./firebase.js";   // must be imported BEFORE App so window.storage is wired to Firestore first
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
