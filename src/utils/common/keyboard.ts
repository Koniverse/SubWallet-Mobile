export const delayActionAfterDismissKeyboard = (func: () => void) => {
  setTimeout(func, 100);
};
