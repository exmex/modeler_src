export const certificateFilters = [
  {
    name: "All Certificates",
    extensions: ["pem", "cer", "crt", "der"]
  },
  { name: "Privacy-Enhanced Mail (PEM)", extensions: ["pem"] },
  { name: "Certificates", extensions: ["cer", "crt", "der"] }
];

export const keyFilters = [
  {
    name: "All Keys",
    extensions: ["pem", "key"]
  },
  { name: "Privacy-Enhanced Mail (PEM)", extensions: ["pem"] },
  { name: "Keys", extensions: ["key"] }
];

export const privateKeyFilters = [];

export const sqliteFilters = [
  {
    name: "SQLite files",
    extensions: ["db", "sqlite", "sqlite2", "sqlite3"]
  }
];
