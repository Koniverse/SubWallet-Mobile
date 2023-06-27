import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import React from 'react';
import { Button, Icon, Image, Typography } from 'components/design-system-ui';
import { Star } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getHostName } from 'utils/browser';
import { StoredSiteInfo } from 'stores/types';
import { addBookmark, removeBookmark } from 'stores/updater';
import createStylesheet from './style/BrowserItem';

interface Props {
  logo?: string;
  name: string;
  url: string;
  tag?: string[];
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

function isSiteBookmark(url: string, bookmarks: StoredSiteInfo[]) {
  return bookmarks.some(i => i.url === url);
}

export const BrowserItem = ({ logo, name, url, style, onPress }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const assetLogoMap = useSelector((state: RootState) => state.logoMaps.assetLogoMap);
  const bookmarks = useSelector((state: RootState) => state.browser.bookmarks);

  const _isSiteBookmark = isSiteBookmark(url, bookmarks);

  const onPressStar = () => {
    if (_isSiteBookmark) {
      removeBookmark({
        name,
        url,
      });
    } else {
      addBookmark({ name, url });
    }
  };

  return (
    <View style={[stylesheet.container, style]}>
      <TouchableOpacity onPress={onPress} style={stylesheet.contentWrapper}>
        <View style={stylesheet.logoWrapper}>
          <Image src={{ uri: logo || assetLogoMap.default }} style={stylesheet.logo} squircleSize={44} />
        </View>
        <View style={stylesheet.siteContentWrapper}>
          <View>
            <Typography.Text ellipsis style={stylesheet.siteName}>
              {name}
            </Typography.Text>
          </View>
          <View>
            <Typography.Text style={stylesheet.siteHost} ellipsis>
              {getHostName(url)}
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
