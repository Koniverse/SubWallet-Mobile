import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';

export default function useGetNetworkJson(networkKey: string) {
  const { networkMap } = useSelector((state: RootState) => state);

  return networkMap.details[networkKey];
}
