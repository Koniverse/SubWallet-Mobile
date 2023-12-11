import axios from 'axios';

export async function fetchStaticData<T>(slug: string, targetFile?: string) {
  const fetchFile = targetFile || 'list.json';
  const rs = await axios.get(`https://static-data.subwallet.app/${slug}/${fetchFile}`);

  return rs.data as T;
}
