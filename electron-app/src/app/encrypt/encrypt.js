const crypto = require("crypto");
const algorithm = "aes-256-ctr";
const password = "mmM0t3k";

const encryption_key = "BUA9VFNtbRQM85BODcCbXlrUtXXH3D3x";
const initialization_vector = "665UHDQ5qdBnI777";

function oldEncrypt(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function oldDecrypt(text) {
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

function encrypt(text) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryption_key),
    Buffer.from(initialization_vector)
  );
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryption_key),
    Buffer.from(initialization_vector)
  );
  let dec = decipher.update(encryptedText, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = {
  encrypt,
  decrypt,
  oldEncrypt,
  oldDecrypt
};
