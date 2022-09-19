import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import ImagePreview from 'components/ImagePreview';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  nftItem: _NftItem;
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
  borderRadius: 5,
  backgroundColor: ColorMap.dark2,
};

const LogoStyle: StyleProp<any> = {
  width: '100%',
  borderTopLeftRadius: 5,
  borderTopRightRadius: 5,
  aspectRatio: 1,
};

const InfoStyle: StyleProp<any> = {
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

const NameStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  width: '100%',
  color: ColorMap.light,
};

const NftItem = ({ nftItem, onPress }: Props) => {
  const { name, image } = nftItem;

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress} activeOpacity={0.8}>
      <View style={ContainerStyle}>
        <ImagePreview mainUrl={image} style={LogoStyle} borderPlace={'top'} borderRadius={5} />
        <View style={InfoStyle}>
          <Text style={NameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
            {name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NftItem);
