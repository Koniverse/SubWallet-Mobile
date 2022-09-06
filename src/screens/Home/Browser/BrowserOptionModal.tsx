import { SubWalletModal } from 'components/SubWalletModal';
import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Linking, StyleProp, Text, View } from 'react-native';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { ArrowsOutSimple, Star } from 'phosphor-react-native';
import { SelectItem } from 'components/SelectItem';
import { getLeftIcon } from 'utils/index';
import { SiteInfo } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { addBookmark, removeBookmark } from 'stores/updater';

interface Props {
  visibleModal: boolean;
  onClose: () => void;
}

interface OptionType {
  key: string;
  icon: JSX.Element;
  label: string;
  onPress: () => void;
}

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  textAlign: 'center',
  paddingBottom: 16,
};

const Component = ({ visibleModal, onClose }: Props, ref: ForwardedRef<any>) => {
  const bookmarks = useSelector((state: RootState) => state.browser.bookmarks);

  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    url: '',
    name: '',
  });
  const isBookmarked = bookmarks.some(b => b.url === siteInfo.url);

  useImperativeHandle(ref, () => ({
    onUpdateSiteInfo: (_siteInfo: SiteInfo) => {
      console.log('ON UPDATE SITE INFO !!!!');
      setSiteInfo(_siteInfo);
    },
  }));

  const OPTIONS: OptionType[] = [
    {
      key: 'openInBrowser',
      icon: getLeftIcon(ArrowsOutSimple),
      label: 'Open in browser', // todo: i18n
      onPress: () => {
        Linking.openURL(siteInfo.url);
        onClose();
      },
    },
    {
      key: 'addToFavourites',
      icon: getLeftIcon(Star),
      // todo: i18n
      label: isBookmarked ? 'Remove from favourites' : 'Add to favourites',
      onPress: () => {
        if (isBookmarked) {
          removeBookmark(siteInfo);
        } else {
          addBookmark(siteInfo);
        }
        onClose();
      },
    },
  ];

  return (
    <SubWalletModal modalVisible={visibleModal} onChangeModalVisible={onClose} modalStyle={{ height: 204 }}>
      <View style={{ width: '100%' }}>
        <Text style={titleStyle}>More options</Text>
        {OPTIONS.map(opt => (
          <SelectItem key={opt.key} isSelected={false} label={opt.label} leftIcon={opt.icon} onPress={opt.onPress} />
        ))}
      </View>
    </SubWalletModal>
  );
};

export const BrowserOptionModal = forwardRef(Component);
