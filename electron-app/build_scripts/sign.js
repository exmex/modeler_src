require("dotenv").config();
exports.default = async function (configuration) {
  const CERTIFICATE_NAME = process.env.CSC_LINK;
  const TOKEN_PASSWORD = process.env.CSC_KEY_PASSWORD;
  const SIGNTOOL_PATH = process.env.SIGNTOOL_PATH;

  require("child_process").execSync(
    `"${SIGNTOOL_PATH}" sign /f ${CERTIFICATE_NAME} /p ${TOKEN_PASSWORD} /fd SHA256 "${configuration.path}"`,
    {
      stdio: "inherit"
    }
  );
};
