import { SVGImages } from 'assets/index';
import Text from 'components/Text';
import { StyleProp, View } from 'react-native';
import React, { Suspense } from 'react';
import NftCollectionImportText from 'screens/Home/NFT/Shared/NftCollectionImportText';
import i18n from 'utils/i18n/i18n';

const imageSize = 80;

const EmptyListStyle: StyleProp<any> = {
  alignItems: 'center',
  height: '100%',
  justifyContent: 'center',
};

const ImageContainerStyle: StyleProp<any> = {
  marginBottom: 16,
};

const FallBackStyle: StyleProp<any> = {
  width: imageSize,
  height: imageSize,
};

export const EmptyList = () => {
  return (
    <View style={EmptyListStyle}>
      <View style={ImageContainerStyle}>
        <Suspense fallback={<View style={FallBackStyle} />}>
          <SVGImages.NftIcon width={imageSize} height={imageSize} />
        </Suspense>
      </View>
      <View>
        <Text>{i18n.nftScreen.nftAppearHere}</Text>
      </View>
      <NftCollectionImportText />
    </View>
  );
};
