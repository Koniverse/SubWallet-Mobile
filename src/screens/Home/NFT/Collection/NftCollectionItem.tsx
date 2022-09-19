import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import ImagePreview from 'components/ImagePreview';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  nftCollection: NftCollection;
  onPress: () => void;
}

const ContainerStyle: StyleProp<any> = {
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  paddingVertical: 12,
};

const LogoStyle: StyleProp<any> = {
  width: 60,
  height: 60,
  borderRadius: 10,
};

const InfoStyle: StyleProp<any> = {
  display: 'flex',
  justifyContent: 'space-between',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  flex: 1,
  paddingHorizontal: 10,
  borderBottom: 1,
};

const NameStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  ...FontSemiBold,
  width: '80%',
  color: ColorMap.light,
};

const CountStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  ...FontSemiBold,
  textAlign: 'right',
  width: '20%',
};

const SeparatorStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  height: 2,
  width: '100%',
  position: 'absolute',
  bottom: 0,
  left: 70,
};

const NftCollectionItem = ({ nftCollection, onPress }: Props) => {
  const { itemCount, collectionName, image } = nftCollection;

  return (
    <TouchableOpacity style={ContainerStyle} onPress={onPress} activeOpacity={0.8}>
      <ImagePreview style={LogoStyle} mainUrl={image} />
      <View style={InfoStyle}>
        <Text style={NameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
          {collectionName}
        </Text>
        <Text style={CountStyle}>{itemCount}</Text>
      </View>
      <View style={SeparatorStyle} />
    </TouchableOpacity>
  );
};

export default React.memo(NftCollectionItem);
