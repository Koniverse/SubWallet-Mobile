export const simpleDeepClone = <T>(s: T) => {
  return JSON.parse(JSON.stringify(s)) as T;
};
