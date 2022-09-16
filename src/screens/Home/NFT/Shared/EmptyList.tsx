import Text from 'components/Text';
import { Image, StyleProp, View } from 'react-native';
import React from 'react';
import NftCollectionImportText from 'screens/Home/NFT/Shared/NftCollectionImportText';
import i18n from 'utils/i18n/i18n';

const EmptyListStyle: StyleProp<any> = {
  alignItems: 'center',
  height: '100%',
  justifyContent: 'center',
};

export const EmptyList = () => {
  return (
    <View style={EmptyListStyle}>
      <Image source={require('assets/nft-coming-soon.png')} />
      <View>
        <Text>{i18n.nftScreen.nftAppearHere}</Text>
      </View>
      <NftCollectionImportText />
    </View>
  );
};
