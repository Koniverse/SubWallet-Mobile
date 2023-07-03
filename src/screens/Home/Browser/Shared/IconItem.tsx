import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image, Typography } from 'components/design-system-ui';
import { DAppInfo } from 'types/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStylesheet from './styles/IconItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface IconItemProps {
  data: DAppInfo | undefined;
  isWithText?: boolean;
  onPress?: () => void;
}

const IconItem: React.FC<IconItemProps> = ({ data, isWithText, onPress }) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);

  return (
    <View style={stylesheet.container}>
      <TouchableOpacity style={stylesheet.imageWrapper} onPress={onPress} disabled={!onPress}>
        <Image src={data?.icon || assetLogoMap.default} style={stylesheet.image} shape={'squircle'} squircleSize={44} />

        {isWithText && (
          <Typography.Text size={'xs'} style={stylesheet.title} ellipsis>
            {data?.name}
          </Typography.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default IconItem;
