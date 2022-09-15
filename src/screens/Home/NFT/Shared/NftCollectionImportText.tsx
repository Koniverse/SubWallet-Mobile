import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';

const textContainerStyle: StyleProp<any> = {
  marginTop: 24,
  alignItems: 'center',
  width: '100%',
};

const importTextStyle: StyleProp<any> = {
  marginTop: 8,
  color: ColorMap.primary,
};

const NftCollectionImportText = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);

  const isEthAccount = useMemo(() => isEthereumAddress(currentAccount?.address), [currentAccount?.address]);

  const handleChangeToImport = useCallback(() => {
    navigation.navigate('ImportEvmNft');
  }, [navigation]);

  if (!isEthAccount) {
    return null;
  }

  return (
    <View style={textContainerStyle}>
      <Text>{i18n.nftScreen.dontSeeNft}</Text>
      <Text style={importTextStyle} onPress={handleChangeToImport}>
        {i18n.nftScreen.importNft}
      </Text>
    </View>
  );
};

export default NftCollectionImportText;
