import "./styles/im_main_light.scss";
import "./styles/im_main_dark.scss";
import "./styles/im_main_print.scss";

import App from "./App";
import React from "react";
import ReactDOM from "react-dom";
import Root from "./root";
import { evalWebEnv } from "./web_env";

(async () => {
  await evalWebEnv();

  ReactDOM.render(
    <Root>
      <App />
    </Root>,
    document.getElementById("root")
  );
})();
