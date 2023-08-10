import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import ImagePreview from 'components/ImagePreview';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

interface Props {
  nftCollection: NftCollection;
  onPress: () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '50%',
  height: 220,
  paddingHorizontal: 8,
};

const ContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  justifyContent: 'space-between',
  borderRadius: 8,
  backgroundColor: ColorMap.dark2,
};

const LogoStyle: StyleProp<ViewStyle> = {
  width: '100%',
  aspectRatio: 1,
};

const InfoStyle: StyleProp<ViewStyle> = {
  justifyContent: 'space-between',
  flexDirection: 'row',
  alignItems: 'flex-end',
  width: '100%',
  marginTop: 5,
  paddingBottom: 16,
  paddingHorizontal: 12,
};

const NameStyle: StyleProp<TextStyle> = {
  ...FontSemiBold,
  fontSize: 14,
  lineHeight: 22,
  flex: 1,
  marginRight: 2,
  color: ColorMap.light,
};

const CountStyle: StyleProp<any> = {
  ...FontMedium,
  textAlign: 'right',
  paddingLeft: 2,
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
