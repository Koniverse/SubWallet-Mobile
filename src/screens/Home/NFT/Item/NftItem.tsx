import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import React, { useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import ImagePreview from 'components/ImagePreview';
import { ColorMap } from 'styles/color';
import { FontBold, FontSemiBold } from 'styles/sharedStyles';
import { deviceWidth } from 'constants/index';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  nftItem: _NftItem;
  collectionImage?: string;
  onPress: () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
  height: (deviceWidth - 32) / 2 + 32,
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
  paddingHorizontal: 12,
  flex: 1,
};

const NameStyle: StyleProp<any> = {
  ...FontSemiBold,
  fontSize: 14,
  lineHeight: 22,
  width: '100%',
  color: ColorMap.light,
};

const BundleLabelStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 10,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
};

const BundleLabelTextStyle: StyleProp<TextStyle> = {
  ...FontBold,
  fontSize: 10,
  lineHeight: 16,
};

const NftItem = ({ nftItem, onPress, collectionImage }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { name: _name, image, id, isBundle } = nftItem;

  const name = useMemo((): string => {
    return _name ? _name : `#${id}`;
  }, [_name, id]);

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress} activeOpacity={0.8}>
      <View style={ContainerStyle}>
        {!!isBundle && (
          <View style={[BundleLabelStyle, { backgroundColor: theme.colorSecondary }]}>
            <Text style={[BundleLabelTextStyle, { color: theme.colorBgDefault }]}>
              {i18n.nftScreen.nestedNft.bundle}
            </Text>
          </View>
        )}
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
