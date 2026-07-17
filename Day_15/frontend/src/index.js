import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import appTheme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <ConfigProvider theme={appTheme}>
        <App />
      </ConfigProvider>
    </AuthProvider>
  </BrowserRouter>
);