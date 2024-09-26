import axios from 'axios';
import { getStaticContentByDevMode } from './storage';
import { STATIC_DATA_DOMAIN } from 'constants/index';

export async function fetchStaticData<T>(slug: string, targetFile?: string) {
  const dataByDevModeStatus = getStaticContentByDevMode();
  const fetchFile = targetFile || dataByDevModeStatus;
  const rs = await axios.get(`${STATIC_DATA_DOMAIN}/${slug}/${fetchFile}.json`);

  return rs.data as T;
}
