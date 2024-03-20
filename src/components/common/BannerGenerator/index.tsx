import { TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { Button, Icon } from 'components/design-system-ui';
import { X } from 'phosphor-react-native';
import React, { useCallback, useMemo } from 'react';
import FastImage from 'react-native-fast-image';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AppBannerData } from 'types/staticContent';

interface Props {
  banners: AppBannerData[];
  dismissBanner: (id: string) => void;
  onPressBanner: (id: string) => (url?: string) => void;
}

interface BannerProps {
  data: AppBannerData;
  dismissBanner: (id: string) => void;
  onPressBanner: (id: string) => (url?: string) => void;
}

const Banner = ({ data, dismissBanner, onPressBanner }: BannerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const bannerId = useMemo(() => `${data.position}-${data.id}`, [data.id, data.position]);

  const _onPressBanner = useCallback(() => {
    const url = data.action.url;
    onPressBanner(bannerId)(url);
  }, [bannerId, data.action.url, onPressBanner]);

  return (
    <TouchableOpacity onPress={_onPressBanner} activeOpacity={BUTTON_ACTIVE_OPACITY}>
      <FastImage
        style={{
          height: 88,
          borderRadius: theme.borderRadiusLG,
          marginVertical: theme.marginXS,
        }}
        resizeMode="cover"
        source={{ uri: data.media }}
      />
      <Button
        icon={<Icon phosphorIcon={X} weight="bold" size="sm" />}
        onPress={() => dismissBanner(bannerId)}
        shape="round"
        style={{ position: 'absolute', right: -3, top: 5 }}
        size="xs"
        type="ghost"
      />
    </TouchableOpacity>
  );
};

export const BannerGenerator = ({ banners, dismissBanner, onPressBanner }: Props) => {
  if (!banners || banners.length === 0) {
    return <></>;
  }
  return (
    <>
      {banners.map(item => {
        return <Banner key={item.id} dismissBanner={dismissBanner} onPressBanner={onPressBanner} data={item} />;
      })}
    </>
  );
};
