import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { Button, Icon, Image, Tag, Typography } from 'components/design-system-ui';
import { Star } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoredSiteInfo } from 'stores/types';
import { addBookmark, removeBookmark } from 'stores/updater';
import createStylesheet from './styles/BrowserItem';
import { predefinedDApps } from '../../predefined/dAppSites';

interface Props {
  logo?: string;
  title: string;
  url: string;
  tags?: string[];
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  onPress?: () => void;
}

function isSiteBookmark(url: string, bookmarks: StoredSiteInfo[]) {
  return bookmarks.some(i => i.url === url);
}

export const BrowserItem = ({ logo, title, url, style, onPress, subtitle, tags }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  const bookmarks = useSelector((state: RootState) => state.browser.bookmarks);

  const _isSiteBookmark = isSiteBookmark(url, bookmarks);

  const onPressStar = () => {
    if (_isSiteBookmark) {
      removeBookmark({
        name: title,
        url,
      });
    } else {
      addBookmark({ name: title, url });
    }
  };

  const renderTag = (tagId: string) => {
    const tagInfo = predefinedDApps.categories.find(c => c.id === tagId);

    return (
      <Tag key={tagId} bgType={tagInfo ? 'default' : 'gray'} color={tagInfo?.theme || 'default'}>
        {tagInfo?.name || tagId}
      </Tag>
    );
  };

  return (
    <View style={[stylesheet.container, style]}>
      <TouchableOpacity onPress={onPress} style={stylesheet.contentWrapper}>
        <View style={stylesheet.logoWrapper}>
          {/* todo: use share component to handle case svg image */}
          <Image src={{ uri: logo || assetLogoMap.default }} style={stylesheet.logo} squircleSize={44} />
        </View>
        <View style={stylesheet.textContentWrapper}>
          <View style={stylesheet.textContentLine1}>
            <Typography.Text ellipsis style={stylesheet.title}>
              {title}
            </Typography.Text>
            {!!tags && !!tags.length && <View style={stylesheet.tagContainer}>{tags.map(renderTag)}</View>}
          </View>
          <View>
            <Typography.Text style={stylesheet.subtitle} ellipsis>
              {subtitle}
            </Typography.Text>
          </View>
        </View>
      </TouchableOpacity>

      <Button
        size={'xs'}
        type={'ghost'}
        icon={
          <Icon
            size={'sm'}
            weight={_isSiteBookmark ? 'fill' : undefined}
            iconColor={_isSiteBookmark ? theme.colorTextLight1 : theme.colorTextLight4}
            phosphorIcon={Star}
          />
        }
        onPress={onPressStar}
      />
    </View>
  );
};
