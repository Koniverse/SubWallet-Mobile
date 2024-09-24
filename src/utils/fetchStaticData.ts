import { getStaticContentByDevMode } from './storage';
import { fetchJson, fetchText } from '@subwallet/extension-base/utils';
import { staticData, StaticKey } from '@subwallet/extension-base/utils/staticData';

export async function fetchStaticData<T>(slug: string, targetFile?: string, isJson = true) {
  const dataByDevModeStatus = getStaticContentByDevMode();
  const fetchFile = targetFile || dataByDevModeStatus;

  try {
    if (isJson) {
      return await fetchJson<T>(`https://static-data.subwallet.app/${slug}/${fetchFile}`);
    } else {
      return await fetchText<T>(`https://static-data.subwallet.app/${slug}/${fetchFile}`);
    }
  } catch (e) {
    console.log('error fetching static data', e);

    return staticData[slug as StaticKey] as T;
  }
}
