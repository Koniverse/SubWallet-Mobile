import React from 'react';
import { Button, Icon } from 'components/design-system-ui';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { StoredSiteInfo } from 'stores/types';
import { addBookmark, removeBookmark } from 'stores/updater';
import { Star } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

function isSiteBookmark(url: string, bookmarks: StoredSiteInfo[]) {
  return bookmarks.some(i => i.url === url);
}
interface BookmarkItemProps {
  url: string;
  title: string;
}
export const BookmarkItem: React.FC<BookmarkItemProps> = ({ url, title }) => {
  const theme = useSubWalletTheme().swThemes;
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

  return (
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
  );
};
