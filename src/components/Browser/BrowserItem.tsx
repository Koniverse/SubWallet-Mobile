import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Icon, Image, Tag, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import createStylesheet from './styles/BrowserItem';
import { getHostName, searchDomain } from 'utils/browser';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';
import { BookmarkItem } from './BookmarkItem';
import { Desktop } from 'phosphor-react-native';
import { useGetDesktopMode } from 'hooks/screen/Home/Browser/DesktopMode/useGetDesktopMode';

interface Props {
  logo?: string;
  title: string;
  url: string;
  tags?: string[];
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

export const BrowserItem = ({ logo, title, url, style, onPress, tags, isLoading }: Props) => {
  const {
    browserDApps: { dAppCategories },
  } = useGetDAppList();
  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  const [image, setImage] = useState<string | null>(null);
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (logo) {
      setImage(logo);
    } else {
      setImage(`https://${getHostName(url)}/favicon.ico`);
    }
  }, [logo, url, isLoading]);

  const renderTag = (tagId: string) => {
    const tagInfo = dAppCategories?.find(category => category.slug === tagId);

    return (
      <Tag key={tagId} bgType={tagInfo ? 'default' : 'gray'} color={tagInfo?.color || 'default'}>
        {tagInfo?.name || tagId}
      </Tag>
    );
  };

  const onLoadImageError = useCallback(() => {
    if (!image) {
      return;
    }
    if (image.includes('avicon.ico')) {
      setImage(`https://${getHostName(url)}/favicon.png`);
      return;
    }
    setImage(assetLogoMap.default);
  }, [assetLogoMap.default, image, url]);

  return (
    <View style={[stylesheet.container, style]}>
      <TouchableOpacity onPress={onPress} style={stylesheet.contentWrapper}>
        <View style={stylesheet.logoWrapper}>
          {image && (
            <>
              <Image
                src={image}
                onError={onLoadImageError}
                style={stylesheet.logo}
                shape={'squircle'}
                squircleSize={44}
              />
              <DesktopMode url={url} />
            </>
          )}
        </View>
        <View style={stylesheet.textContentWrapper}>
          <View style={stylesheet.textContentLine1}>
            <Typography.Text ellipsis style={stylesheet.title}>
              {title}
            </Typography.Text>
          </View>
          <View style={{ paddingTop: 7 }}>
            {!!tags && !!tags.length && <View style={stylesheet.tagContainer}>{tags.map(renderTag)}</View>}
            {/* <Typography.Text style={stylesheet.subtitle} ellipsis>
              {subtitle}
            </Typography.Text> */}
          </View>
        </View>
      </TouchableOpacity>

      {!url.startsWith(`https://${searchDomain}`) && <BookmarkItem url={url} title={title} />}
    </View>
  );
};

interface DesktopModeProps {
  url: string;
}
const DesktopMode: React.FC<DesktopModeProps> = ({ url }) => {
  const { desktopMode } = useGetDesktopMode(url);
  const theme = useSubWalletTheme().swThemes;
  if (!desktopMode) {
    return null;
  }

  const subIconStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colorPrimary,
    borderRadius: 10,
    padding: 2,
  };
  return (
    <View style={subIconStyle}>
      <Icon phosphorIcon={Desktop} size="xxs" />
    </View>
  );
};
