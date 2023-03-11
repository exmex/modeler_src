const {app} = require('electron');
const crypto = require('crypto');

const moment = require('moment');

const fs = require('fs');
const algorithm = "aes-256-ctr";
const password = "mmM0t3k";

const encryption_key = "BUA9VFNtbRQM85BODcCbXlrUtXXH3D3x";
const initialization_vector = "665UHDQ5qdBnI777";

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

function saveLicense(content, path) {
    const fileName = `${path}dts.asar.sys`;
    const encryptedContent = encrypt(JSON.stringify(content));
    fs.writeFileSync(fileName, encryptedContent);
}

// Get product name from argument
const productName = process.argv[2];
let pathName = "LunaModeler";
if (productName !== "luna" && productName !== "meteor" && productName !== "perseid" && productName !== "galaxy") {
}

switch (productName) {
    default:
        console.log("Invalid product name:");
        console.log("Usage: node index.js <product_name>");
        console.log("Where <product_name> is one of: luna, meteor, perseid, galaxy");
        process.exit(1);
        break;

    case "luna":
        pathName = "LunaModeler";
        break;
    case "meteor":
        pathName = "MeteorModeler";
        break;
    case "perseid":
        pathName = "PerseidModeler";
        break;
    case "galaxy":
        pathName = "GalaxyModeler";
        break;
}

let licPath = "";
if (process.platform === "win32") {
    // Path of app userData
    username = process.env.USERNAME;
    licPath = "C:\\Users\\" + username + "\\AppData\\Roaming\\Datensen\\";
} else if (process.platform === "darwin") {
    // Path of app userData
    username = process.env.USER;
    licPath = "/Users/" + username + "/Library/Application Support/Datensen/";
} else if (process.platform === "linux") {
    // Path of app userData
    username = process.env.USER;
    licPath = "/home/" + username + "/.config/";
} else {
    console.log("Unsupported platform");
    process.exit(1);
}

licPath += pathName + "/";

const fileName = `${licPath}dt.asar.sys`;
let expires = moment().add(60, 'years').unix();
fs.writeFileSync(fileName, expires.toString() + "963");

let stamp = new Date();

let randomKey = crypto.randomBytes(33).toString('hex');
let randomMail = crypto.randomBytes(10).toString('hex') + '@' + crypto.randomBytes(10).toString('hex') + '.com';
let randomId = crypto.randomBytes(10).toString('hex');

const licData = {
    licType: 'commercial',
    key: randomKey,
    purchase: {
        seller_id: randomId,
        short_product_id: "gjpdud",
        product_name: productName,
        email: randomMail,
    },
    created: moment(stamp).subtract(1, 'days').unix(),
    uses: 999999,
};
saveLicense(licData, licPath);
console.log('ok');
process.exit(0);