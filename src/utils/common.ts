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

export const getOsVersion = (): string | number => {
  if (Platform.OS === 'ios') {
    return Platform.Version;
  } else {
    // @ts-ignore
    return Platform.constants['Release'];
  }
};
