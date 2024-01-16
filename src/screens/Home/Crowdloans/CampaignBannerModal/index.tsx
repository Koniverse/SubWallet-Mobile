import React, { useCallback } from 'react';
import { Button, Icon, SwModal } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalStyle from './style';
import { Linking, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { CampaignBanner, CampaignButton } from '@subwallet/extension-base/background/KoniTypes';
import { completeBannerCampaign } from 'messaging/index';
import { getBannerButtonIcon } from 'utils/campaign';
import { setBannerSlugs } from 'utils/storage';
import { deeplinks } from 'utils/browser';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
  banner: CampaignBanner;
}

export type ButtonSchema = 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';

const CampaignBannerModal = ({ visible, banner, setVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = ModalStyle(theme);

  const onPressJoinNow = async (url: string) => {
    const isDeeplink = deeplinks.some(deeplink => url.startsWith(deeplink));
    if (isDeeplink) {
      Linking.openURL(url);
      return;
    }

    const transformUrl = `subwallet://browser?url=${encodeURIComponent(url)}`;
    Linking.openURL(transformUrl);
  };

  const onCloseBanner = useCallback(() => {
    setVisible(false);
    completeBannerCampaign({
      slug: banner.slug,
    })
      .catch(console.error)
      .finally(() => setBannerSlugs(banner.slug));
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
          {banner.buttons.map((item, index) => {
            const icon = getBannerButtonIcon(item.icon);

            return (
              <Button
                key={index}
                type={item.color as ButtonSchema}
                style={{ flex: 1 }}
                onPress={onPressBtn(item)}
                icon={<Icon phosphorIcon={icon} size={'lg'} weight={'fill'} />}>
                {item.name}
              </Button>
            );
          })}
        </View>
      </View>
    </SwModal>
  );
};

export default CampaignBannerModal;
