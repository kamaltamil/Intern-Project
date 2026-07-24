import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import appTheme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={appTheme}>
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
);