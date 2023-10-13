import React, { useCallback, useRef } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { Linking, View } from 'react-native';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import FastImage from 'react-native-fast-image';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { BrowserOptions } from 'utils/buy';
import { CampaignBanner, CampaignButton } from '@subwallet/extension-base/background/KoniTypes';
import { completeBannerCampaign } from 'messaging/index';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  banner: CampaignBanner;
}

export type ButtonSchema = 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';

enum ButtonIcon {
  // @ts-ignore
  xCircle = XCircle,
  // @ts-ignore
  arrowCircleRight = ArrowCircleRight,
}

const CampaignBannerModal = ({ visible, banner, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);
  const isOpenInAppBrowser = useRef(false);

  const onPressJoinNow = async (url?: string) => {
    if (url) {
      if (await InAppBrowser.isAvailable()) {
        isOpenInAppBrowser.current = true;
        await InAppBrowser.open(url, BrowserOptions);

        isOpenInAppBrowser.current = false;
      } else {
        Linking.openURL(url);
      }
    }
  };

  const onCloseBanner = useCallback(() => {
    setVisible(false);
    completeBannerCampaign({
      slug: banner.slug,
    }).catch(console.error);
  }, [banner.slug, setVisible]);

  const onPressBtn = (item: CampaignButton) => {
    return () => {
      if (item.type === 'open_url') {
        const url = item.metadata?.url as string | undefined;

        if (url) {
          onPressJoinNow(url);
        }
      }

      if (item.metadata?.doneOnClick) {
        onCloseBanner();
      }
    };
  };

  return (
    <SwModal
      isUseModalV2={true}
      setVisible={setVisible}
      modalVisible={visible}
      disabledOnPressBackDrop
      isAllowSwipeDown={false}>
      <View style={{ width: '100%' }}>
        <FastImage
          style={{
            height: 144,
            borderRadius: theme.borderRadiusLG,
            marginBottom: theme.margin,
          }}
          resizeMode="cover"
          source={{ uri: banner.data.media }}
        />

        <View style={_style.footerAreaStyle}>
          {banner.buttons.map(item => (
            <Button
              type={item.color as ButtonSchema}
              style={{ flex: 1 }}
              onPress={onPressBtn(item)}
              icon={<Icon phosphorIcon={item.icon ? ButtonIcon[item.icon] : undefined} size={'lg'} weight={'fill'} />}>
              {item.name}
            </Button>
          ))}
        </View>
      </View>
    </SwModal>
  );
};

export default CampaignBannerModal;
