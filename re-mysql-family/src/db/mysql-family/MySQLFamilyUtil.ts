import { Platform } from "re";

export const getMySQLFamilyPlatform = (version: string): Platform => {
  const regexp = /[^-]+-([^-]+)/g;
  const matches = regexp.exec(version);

  return matches?.[1] === "MariaDB" ? Platform.MARIADB : Platform.MYSQL;
};
