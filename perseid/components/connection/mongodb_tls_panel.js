import { Features, isFeatureAvailable } from "../../helpers/features/features";

import { ChooseFilePathField } from "../common/choose_file_path_field";
import React from "react";
import { SwitchField } from "../common/switch_field";
import { TextField } from "../common/text_field";
import { certificateFilters } from "./filters";
import { getAppTitle } from "common";

const ipcRenderer = window?.ipcRenderer;

export const MongoDBTLSPanel = ({
  availableFeatures,
  connection,
  updateProperty,
  pwdDisplayed,
  profile
}) => {
  const hiddenTls = connection.tlsEnabled !== true;
  const pwdDisplayedType = pwdDisplayed ? "text" : "password";

  function openLink() {
    ipcRenderer &&
      ipcRenderer.send(
        "link:openExternal",
        "https://www.datensen.com/upgrade.html"
      );
  }

  return isFeatureAvailable(availableFeatures, Features.TLS, profile) ? (
    <div className="im-connections-grid">
      <SwitchField
        caption={"Enable TLS"}
        source={connection}
        propertyName="tlsEnabled"
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="CA Certificate"
        name="tlsCAFile"
        filters={certificateFilters}
        connection={connection}
        hidden={hiddenTls}
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="Client Key"
        name="tlsCertificateKeyFile"
        filters={certificateFilters}
        connection={connection}
        hidden={hiddenTls}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Client Key Password:"
        type={pwdDisplayedType}
        hidden={hiddenTls}
        propertyName="tlsCertificateKeyFilePassword"
        source={connection}
        updateProperty={updateProperty}
      />
      <SwitchField
        caption={"Allow invalid hostnames"}
        hidden={hiddenTls}
        source={connection}
        propertyName="tlsAllowInvalidHostnames"
        updateProperty={updateProperty}
      />
    </div>
  ) : (
    <div class="im-connections-grid">
      <div></div>
      <div>
        <p>
          Secure TLS connections can be created in{" "}
          {getAppTitle(process.env.REACT_APP_PRODUCT)} Professional.
        </p>
        <button className="im-btn-default im-btn-sm" onClick={openLink}>
          Upgrade now!
        </button>
      </div>
    </div>
  );
};
