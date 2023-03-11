const clipboard = window?.clipboard;

export const copyToClipboard = (text) => {
  clipboard && clipboard.writeText(text);
};
