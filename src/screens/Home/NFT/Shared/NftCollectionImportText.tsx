import { isEthereumAddress } from '@polkadot/util-crypto';
import { useNavigation } from '@react-navigation/native';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import React, { useCallback, useMemo } from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';

const TextContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 24,
  height: 80,
  alignItems: 'center',
  width: '100%',
};

const DontSeeTextStyle: StyleProp<TextStyle> = {
  color: ColorMap.iconNeutralColor,
};

const ImportTextStyle: StyleProp<TextStyle> = {
  marginTop: 8,
  color: ColorMap.secondary,
};

const NftCollectionImportText = () => {
  const navigation = useNavigation<RootNavigationProps>();

  const currentAccount = useSelector((state: RootState) => state.accounts.currentAccount);

  const isEthAccount = useMemo(
    () => isEthereumAddress(currentAccount?.address) || isAccountAll(currentAccount?.address as string),
    [currentAccount?.address],
  );

  const handleChangeToImport = useCallback(() => {
    navigation.navigate('ImportEvmNft');
  }, [navigation]);

  if (!isEthAccount) {
    return null;
  }

  return (
    <View style={TextContainerStyle}>
      <Text style={DontSeeTextStyle}>{i18n.nftScreen.dontSeeNft}</Text>
      <Text style={ImportTextStyle} onPress={handleChangeToImport}>
        {i18n.nftScreen.importNft}
      </Text>
    </View>
  );
};

export default NftCollectionImportText;
