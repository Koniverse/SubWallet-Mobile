import { StyleProp, TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { Button, Icon } from 'components/design-system-ui';
import { X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AppBannerData } from 'types/staticContent';
import { GlobalInstructionModal } from 'components/common/Modal/GlobalModal/GlobalInstructionModal';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { mmkvStore } from 'utils/storage';
import BannerSlider, { BannerSliderItem } from 'components/common/BannerSlider';

interface Props {
  banners: AppBannerData[];
  dismissBanner: (ids: string[]) => void;
  onPressBanner: (id: string) => (url?: string) => void;
}

interface BannerProps {
  data: AppBannerData;
  dismissBanner?: (ids: string[]) => void;
  onPressBanner: (id: string) => (url?: string) => void;
  instructionDataList: StaticDataProps[];
  extraStyle?: StyleProp<any>;
}

const Banner = ({ data, dismissBanner, onPressBanner, instructionDataList, extraStyle }: BannerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const bannerId = useMemo(() => `${data.position}-${data.id}`, [data.id, data.position]);
  const [instructionModalVisible, setInstructionModalVisible] = useState(false);

  const currentInstructionData = useMemo(() => {
    if (data.instruction) {
      return instructionDataList.find(
        item => item.group === data.instruction?.group && item.slug === data.instruction?.slug,
      );
    } else {
      return undefined;
    }
  }, [data.instruction, instructionDataList]);

  const _onPressBanner = useCallback(() => {
    const url = data.action?.url;
    const instruction = data.instruction;
    if (instruction) {
      setInstructionModalVisible(true);
      return;
    }

    if (url) {
      onPressBanner(bannerId)(url);
    }
  }, [bannerId, data.action?.url, data.instruction, onPressBanner]);

  return (
    <>
      <TouchableOpacity onPress={_onPressBanner} activeOpacity={BUTTON_ACTIVE_OPACITY}>
        <FastImage
          style={[{ height: 120, borderRadius: theme.borderRadiusLG, marginVertical: theme.marginXS }, extraStyle]}
          resizeMode="cover"
          source={{ uri: data.media }}
        />
        {!!dismissBanner && (
          <Button
            icon={<Icon phosphorIcon={X} weight="bold" size="sm" />}
            onPress={() => dismissBanner([bannerId])}
            shape="round"
            style={{ position: 'absolute', right: -3, top: 5 }}
            size="xs"
            type="ghost"
          />
        )}
      </TouchableOpacity>

      {data.instruction && currentInstructionData && (
        <GlobalInstructionModal
          title={currentInstructionData.title || 'Instruction'}
          visible={instructionModalVisible}
          instruction={data.instruction}
          data={currentInstructionData.instructions}
          onPressCancelBtn={() => setInstructionModalVisible(false)}
          onPressConfirmBtn={() => {
            setInstructionModalVisible(false);
            onPressBanner(bannerId)(data.action.url);
          }}
        />
      )}
    </>
  );
};

export const BannerGenerator = ({ banners, dismissBanner, onPressBanner }: Props) => {
  const instructionDataList: StaticDataProps[] = useMemo(() => {
    try {
      const result = JSON.parse(mmkvStore.getString('app-instruction-data') || '[]');
      return result;
    } catch (e) {
      console.error(e);
    }
  }, []);

  const bannerUrlList = useMemo(() => banners.map(b => b.media), [banners]);

  const renderItem = useCallback(
    ({ index }: BannerSliderItem) => {
      const bannerItem = banners[index];
      return (
        <Banner
          extraStyle={{ width: '92%' }}
          key={bannerItem.id}
          onPressBanner={onPressBanner}
          data={bannerItem}
          instructionDataList={instructionDataList}
        />
      );
    },
    [banners, instructionDataList, onPressBanner],
  );

  const onCloseBanner = useCallback(() => {
    const bannerIdList = banners.map(banner => `${banner.position}-${banner.id}`);
    dismissBanner(bannerIdList);
  }, [banners, dismissBanner]);

  if (!banners || banners.length === 0) {
    return <></>;
  }

  return (
    <>
      {banners.length === 1 ? (
        <Banner
          data={banners[0]}
          onPressBanner={onPressBanner}
          dismissBanner={dismissBanner}
          instructionDataList={instructionDataList}
        />
      ) : (
        <BannerSlider data={bannerUrlList} renderItem={renderItem} onCloseBanner={onCloseBanner} />
      )}
    </>
  );
};
