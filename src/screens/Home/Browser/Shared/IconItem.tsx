import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image, Typography } from 'components/design-system-ui';
import { DAppInfo } from 'types/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStylesheet from './styles/IconItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StoredSiteInfo } from 'stores/types';
import { getHostName } from 'utils/browser';

interface IconItemProps {
  data: DAppInfo | undefined;
  url: string;
  defaultData?: StoredSiteInfo;
  isWithText?: boolean;
  onPress?: () => void;
}

const IconItem: React.FC<IconItemProps> = ({ data, url, defaultData, isWithText, onPress }) => {
  const [image, setImage] = useState(data?.icon || `https://${getHostName(url)}/favicon.ico`);
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  const onLoadImageError = useCallback(() => {
    if (image.includes('avicon.ico')) {
      setImage(`https://${getHostName(url)}/favicon.png`);
      return;
    }
    setImage(assetLogoMap.default);
  }, [assetLogoMap.default, image, url]);

  return (
    <View style={[stylesheet.container]}>
      <TouchableOpacity style={stylesheet.imageWrapper} onPress={onPress} disabled={!onPress}>
        <Image src={image} onError={onLoadImageError} style={stylesheet.image} shape={'squircle'} squircleSize={44} />
        {isWithText && (
          <Typography.Text size={'xs'} style={stylesheet.title} ellipsis>
            {data?.name || defaultData?.name}
          </Typography.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default IconItem;
