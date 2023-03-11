const getEnv = window.electron?.getEnv;

export const DEV_DEBUG = "dev";
export const TEST_DEBUG = "test";

export let webEnv = undefined;

export async function evalWebEnv() {
  if (webEnv) {
    return webEnv;
  }

  webEnv = getEnv ? getEnv() : DEV_DEBUG;
}

export const isDebug = (types) => types.includes(webEnv);
