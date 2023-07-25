import React, { ForwardedRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Linking, View } from 'react-native';
import { ArrowSquareUpRight, IconProps, Star, StarHalf } from 'phosphor-react-native';
import { SiteInfo } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { addBookmark, removeBookmark } from 'stores/updater';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { searchDomain } from 'utils/browser';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

interface Props {
  visibleModal: boolean;
  setVisibleModal: (arg: boolean) => void;
}

interface OptionType {
  key: string;
  icon: React.ElementType<IconProps>;
  label: string;
  onPress: () => void;
  iconBackgroundColor: string;
}

export interface BrowserOptionModalRef {
  onUpdateSiteInfo: (siteInfo: SiteInfo) => void;
}

const Component = ({ visibleModal, setVisibleModal }: Props, ref: ForwardedRef<BrowserOptionModalRef>) => {
  const theme = useSubWalletTheme().swThemes;
  const bookmarks = useSelector((state: RootState) => state.browser.bookmarks);
  const modalRef = useRef<SWModalRefProps>(null);

  const onClose = () => modalRef?.current?.close();

  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    url: '',
    name: '',
  });
  const isBookmarked = bookmarks.some(b => b.url === siteInfo.url);

  useImperativeHandle(ref, () => ({
    onUpdateSiteInfo: (_siteInfo: SiteInfo) => {
      setSiteInfo(_siteInfo);
    },
  }));

  const OPTIONS: OptionType[] = [
    {
      key: 'toggleFavouriteSite',
      icon: isBookmarked ? StarHalf : Star,
      label: isBookmarked ? i18n.common.removeFromFavourites : i18n.common.addToFavourites,
      iconBackgroundColor: isBookmarked ? theme['gray-3'] : theme['green-6'],
      onPress: () => {
        if (isBookmarked) {
          removeBookmark(siteInfo);
        } else {
          addBookmark(siteInfo);
        }
        onClose();
      },
    },
    {
      key: 'openInBrowser',
      icon: ArrowSquareUpRight,
      label: i18n.common.openInBrowser,
      iconBackgroundColor: theme['geekblue-7'],
      onPress: () => {
        if (siteInfo.url) {
          Linking.canOpenURL(siteInfo.url).then(() => Linking.openURL(siteInfo.url));
        }

        onClose();
      },
    },
  ];

  return (
    <SwModal
      isUseModalV2={true}
      modalBaseV2Ref={modalRef}
      setVisible={setVisibleModal}
      modalVisible={visibleModal}
      modalTitle={i18n.title.moreOptions}
      onBackButtonPress={onClose}>
      <View style={{ width: '100%', gap: 8 }}>
        {OPTIONS.map(opt => (
          <SelectItem
            onPress={opt.onPress}
            icon={opt.icon}
            key={opt.key}
            label={opt.label}
            isSelected={false}
            disabled={opt.key === 'toggleFavouriteSite' && siteInfo.url.startsWith(`https://${searchDomain}`)}
            backgroundColor={opt.iconBackgroundColor}
          />
        ))}
      </View>
    </SwModal>
  );
};

export const BrowserOptionModal = forwardRef(Component);
