import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image, Typography } from 'components/design-system-ui';
import { DAppInfo } from 'types/browser';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStylesheet from './styles/IconItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { StoredSiteInfo } from 'stores/types';
import { findDAppByUrl, getHostName } from 'utils/browser';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface IconItemProps {
  data: DAppInfo[] | undefined;
  itemData: StoredSiteInfo;
  isWithText?: boolean;
  onPressItem?: () => void;
  isLoading?: boolean;
}

const IconItem: React.FC<IconItemProps> = ({ data, itemData, isWithText, onPressItem, isLoading }) => {
  const navigation = useNavigation<RootNavigationProps>();
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  // Matched on host: the same dApp used to show up in the row with two differently sized logos
  // because a URL-substring match missed `pinterest.com/x` vs `https://www.pinterest.com` and fell
  // back to that site's favicon (a padded 16px icon) instead of the curated one.
  const dApp = useMemo(() => findDAppByUrl(data, itemData.url), [data, itemData.url]);
  const [image, setImage] = useState<string | null>(null);
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const icon = dApp?.icon;
    if (icon) {
      setImage(icon);
    } else {
      setImage(`https://${getHostName(itemData.url)}/favicon.ico`);
    }
  }, [dApp, itemData.url, isLoading]);

  const onLoadImageError = useCallback(() => {
    if (!image) {
      return;
    }
    if (image.includes('avicon.ico')) {
      setImage(`https://${getHostName(itemData.url)}/favicon.png`);
      return;
    }
    setImage(assetLogoMap.default);
  }, [assetLogoMap.default, image, itemData.url]);

  const onPress = () => {
    navigation.navigate('BrowserTabsManager', { url: itemData.url, name: dApp?.title || itemData.name });
    !!onPressItem && onPressItem();
  };

  return (
    <View style={[stylesheet.container]}>
      <TouchableOpacity style={stylesheet.imageWrapper} onPress={onPress}>
        {image && (
          <Image
            src={image}
            onError={onLoadImageError}
            style={stylesheet.image}
            shape={'squircle'}
            // Fit the whole logo in the tile instead of cropping it to fill (FastImage defaults to
            // cover), so a non-square favicon does not render larger than the rest of the row.
            resizeMode={'contain'}
            squircleSize={44}
          />
        )}
        {isWithText && (
          <Typography.Text size={'xs'} style={stylesheet.title} ellipsis>
            {dApp?.title || itemData.name}
          </Typography.Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default IconItem;
