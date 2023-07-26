import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import React, { useMemo } from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import ImagePreview from 'components/ImagePreview';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  nftItem: _NftItem;
  collectionImage?: string;
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

const LogoStyle: StyleProp<any> = {
  width: '100%',
  aspectRatio: 1,
};

const InfoStyle: StyleProp<any> = {
  justifyContent: 'space-between',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  marginTop: 5,
  paddingBottom: 16,
  paddingHorizontal: 12,
};

const NameStyle: StyleProp<any> = {
  ...FontSemiBold,
  fontSize: 14,
  lineHeight: 22,
  width: '100%',
  color: ColorMap.light,
};

const NftItem = ({ nftItem, onPress, collectionImage }: Props) => {
  const { name: _name, image, id } = nftItem;

  const name = useMemo((): string => {
    return _name ? _name : `#${id}`;
  }, [_name, id]);

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress} activeOpacity={0.8}>
      <View style={ContainerStyle}>
        <ImagePreview
          mainUrl={image}
          backupUrl={collectionImage}
          style={LogoStyle}
          borderPlace={'top'}
          borderRadius={5}
        />
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
