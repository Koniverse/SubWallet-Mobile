import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';

export default function useGetNetworkJson(networkKey: string) {
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return networkMap[networkKey];
}
