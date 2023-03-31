import { useIsFocused, useNavigation } from '@react-navigation/native';
import useIsValidNetwork from 'hooks/screen/useIsValidNetwork';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';

interface HandleGoHomeProps {
  goHome: () => void;
  networkKey?: string;
  networkFocusRedirect: boolean;
}

const useHandleGoHome = ({ goHome, networkKey, networkFocusRedirect }: HandleGoHomeProps): void => {
  const navigation = useNavigation<RootNavigationProps>();

  const isFocused = useIsFocused();

  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  const [isValidNetwork, showedNetworks] = useIsValidNetwork(networkKey);

  const [address] = useState(currentAccount?.address);
  const [networks] = useState(showedNetworks);

  useEffect(() => {
    if (
      address !== currentAccount?.address ||
      !isValidNetwork ||
      (networkFocusRedirect && networks !== showedNetworks)
    ) {
      if (isFocused) {
        goHome();
      } else {
        navigation.addListener('focus', goHome);

        return () => {
          navigation.removeListener('focus', goHome);
        };
      }
    }
  }, [
    address,
    currentAccount,
    networkFocusRedirect,
    goHome,
    isFocused,
    isValidNetwork,
    navigation,
    networks,
    showedNetworks,
  ]);
};

export default useHandleGoHome;
