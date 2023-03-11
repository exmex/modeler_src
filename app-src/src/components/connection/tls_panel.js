import { Features, isFeatureAvailable } from "../../helpers/features/features";
import { certificateFilters, keyFilters } from "./filters";

import { ChooseFilePathField } from "../common/choose_file_path_field";
import React from "react";
import { SwitchField } from "../common/switch_field";
import { TextField } from "../common/text_field";
import { getAppTitle } from "common";

const ipcRenderer = window?.ipcRenderer;

export function TLSPanel({
  availableFeatures,
  connection,
  updateProperty,
  pwdDisplayed
}) {
  const hiddenSsl = connection.sslEnabled !== true;
  const pwdDisplayedType = pwdDisplayed ? "text" : "password";

  function openLink() {
    ipcRenderer &&
      ipcRenderer.send(
        "link:openExternal",
        "https://www.datensen.com/upgrade.html"
      );
  }

  return isFeatureAvailable(availableFeatures, Features.TLS) ? (
    <div className="im-connections-grid">
      <SwitchField
        caption={"Enable SSL/TLS"}
        source={connection}
        propertyName="sslEnabled"
        updateProperty={updateProperty}
      />
      <SwitchField
        hidden={hiddenSsl}
        caption={"Reject Unauthorized"}
        source={connection}
        propertyName="sslRejectUnauthorized"
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="CA Certificate"
        name="sslCA"
        filters={certificateFilters}
        connection={connection}
        hidden={hiddenSsl}
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="Client Certificate"
        name="sslCert"
        filters={certificateFilters}
        connection={connection}
        hidden={hiddenSsl}
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="Client Key"
        name="sslKey"
        filters={keyFilters}
        connection={connection}
        hidden={hiddenSsl}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Pass Phrase:"
        type={pwdDisplayedType}
        hidden={hiddenSsl}
        propertyName="sslPassPhrase"
        source={connection}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Server Name:"
        hidden={hiddenSsl}
        propertyName="sslServerName"
        source={connection}
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
}
