import { Features, isFeatureAvailable } from "../../helpers/features/features";

import { ChooseFilePathField } from "../common/choose_file_path_field";
import React from "react";
import { SwitchField } from "../common/switch_field";
import { TextField } from "../common/text_field";
import { privateKeyFilters } from "./filters";

const ipcRenderer = window?.ipcRenderer;

export const SSHPanel = ({
  availableFeatures,
  connection,
  updateProperty,
  pwdDisplayed,
  profile,
}) => {
  const hiddenSsh = connection.sshEnabled !== true;
  const pwdDisplayedType = pwdDisplayed ? "text" : "password";

  function openLink() {
    ipcRenderer &&
      ipcRenderer.send(
        "link:openExternal",
        "https://www.datensen.com/upgrade.html"
      );
  }

  return isFeatureAvailable(availableFeatures, Features.SSH, profile) ? (
    <div className="im-connections-grid">
      <SwitchField
        caption={"Enable SSH"}
        source={connection}
        propertyName="sshEnabled"
        updateProperty={updateProperty}
      />
      <TextField
        caption="Host:"
        hidden={hiddenSsh}
        propertyName="sshhost"
        source={connection}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Port:"
        hidden={hiddenSsh}
        propertyName="sshport"
        source={connection}
        updateProperty={updateProperty}
      />
      <TextField
        caption="User name:"
        hidden={hiddenSsh}
        propertyName="sshusername"
        source={connection}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Password:"
        type={pwdDisplayedType}
        hidden={hiddenSsh}
        propertyName="sshpassword"
        source={connection}
        updateProperty={updateProperty}
      />
      <ChooseFilePathField
        caption="Private key"
        name="sshprivatekey"
        filters={privateKeyFilters}
        connection={connection}
        hidden={hiddenSsh}
        updateProperty={updateProperty}
      />
      <TextField
        caption="Pass phrase:"
        type={pwdDisplayedType}
        hidden={hiddenSsh}
        propertyName="sshpassphrase"
        source={connection}
        updateProperty={updateProperty}
      />
    </div>
  ) : (
    <div className="im-connections-grid">
      <div></div>
      <div>
        <p>
          Secure SSH connections can be created in Moon Modeler Professional.
        </p>
        <button className="im-btn-default im-btn-sm" onClick={openLink}>
          Upgrade now!
        </button>
      </div>
    </div>
  );
};
