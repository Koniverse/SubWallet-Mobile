import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

const usePreventNavigatorGoBack = () => {
  const navigation = useNavigation();

  useEffect(() => {
    return navigation.addListener('beforeRemove', e => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
      }
    });
  }, [navigation]);
};

export default usePreventNavigatorGoBack;
