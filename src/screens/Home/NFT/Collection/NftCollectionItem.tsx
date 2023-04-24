import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import ImagePreview from 'components/ImagePreview';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  nftCollection: NftCollection;
  onPress: () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '50%',
  paddingHorizontal: 8,
};

const ContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: ColorMap.dark2,
};

const LogoStyle: StyleProp<ViewStyle> = {
  width: '100%',
  aspectRatio: 1,
};

const InfoStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  justifyContent: 'space-between',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  flex: 1,
  marginTop: 10,
  marginBottom: 16,
  paddingHorizontal: 12,
};

const NameStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  fontSize: 18,
  width: '80%',
  color: ColorMap.light,
};

const CountStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  textAlign: 'right',
  width: '20%',
  color: ColorMap.disabled,
};

const NftCollectionItem = ({ nftCollection, onPress }: Props) => {
  const { itemCount, collectionName, image } = nftCollection;

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress} activeOpacity={0.8}>
      <View style={ContainerStyle}>
        <ImagePreview style={LogoStyle} mainUrl={image} borderRadius={5} borderPlace={'top'} />
        <View style={InfoStyle}>
          <Text style={NameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
            {collectionName}
          </Text>
          <Text style={CountStyle}>{itemCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NftCollectionItem);
