import { Platform } from 'react-native';

export const simpleDeepClone = <T>(s: T) => {
  return JSON.parse(JSON.stringify(s)) as T;
};

export function shuffle<T = any>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const getIosVersion = (): string => {
  if (Platform.OS !== 'ios') {
    return '0';
  }

  return Platform.Version;
};
