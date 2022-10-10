import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { HomeStackParamList } from 'routes/home';

export default function useGoHome(tab: keyof HomeStackParamList = 'Crypto') {
  const navigation = useNavigation<RootNavigationProps>();

  return () => {
    navigation.replace('Home', { tab });
  };
}
