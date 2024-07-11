import { StyleProp, TouchableOpacity } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { Button, Icon } from 'components/design-system-ui';
import { X } from 'phosphor-react-native';
import React, { useCallback, useContext, useMemo } from 'react';
import FastImage from 'react-native-fast-image';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { AppBannerData } from 'types/staticContent';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { mmkvStore } from 'utils/storage';
import BannerSlider, { BannerSliderItem } from 'components/common/BannerSlider';
import { GlobalInstructionModalContext } from 'providers/GlobalInstructionModalContext';

interface Props {
  banners: AppBannerData[];
  dismissBanner?: (ids: string[]) => void;
  onPressBanner?: (id: string) => (url?: string) => void;
  extraStyle?: StyleProp<any>;
}

interface BannerProps {
  data: AppBannerData;
  dismissBanner?: (ids: string[]) => void;
  onPressBanner?: (id: string) => (url?: string) => void;
  instructionDataList: StaticDataProps[];
  extraStyle?: StyleProp<any>;
  isMultipleBanner?: boolean;
}

const Banner = ({
  data,
  dismissBanner,
  onPressBanner,
  instructionDataList,
  extraStyle,
  isMultipleBanner,
}: BannerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const { setGlobalModal, hideGlobalModal } = useContext(GlobalInstructionModalContext);
  const bannerId = useMemo(() => `${data.position}-${data.id}`, [data.id, data.position]);

  const currentInstructionData = useMemo(() => {
    if (data.instruction) {
      return instructionDataList.find(item => item.slug === data.instruction?.slug);
    } else {
      return undefined;
    }
  }, [data.instruction, instructionDataList]);

  const _onPressBanner = useCallback(() => {
    const url = data.action?.url;
    const instruction = data.instruction;
    if (instruction) {
      setGlobalModal({
        visible: true,
        title: currentInstructionData?.title || 'Instruction',
        media: currentInstructionData?.media || '',
        instruction: instruction,
        data: currentInstructionData?.instructions,
        onPressCancelBtn: () => hideGlobalModal(),
        onPressConfirmBtn: () => {
          hideGlobalModal();
          onPressBanner && onPressBanner(bannerId)(data.action.url);
        },
      });
      return;
    }

    if (url) {
      onPressBanner && onPressBanner(bannerId)(url);
    }
  }, [
    bannerId,
    currentInstructionData?.instructions,
    currentInstructionData?.media,
    currentInstructionData?.title,
    data.action.url,
    data.instruction,
    hideGlobalModal,
    onPressBanner,
    setGlobalModal,
  ]);

  return (
    <>
      <TouchableOpacity
        style={{ marginTop: isMultipleBanner ? theme.marginSM : 0 }}
        onPress={_onPressBanner}
        activeOpacity={BUTTON_ACTIVE_OPACITY}>
        <FastImage
          style={[{ height: 68, borderRadius: theme.borderRadiusLG }, extraStyle]}
          resizeMode="cover"
          source={{ uri: data.media }}
        />
        {!!dismissBanner && (
          <Button
            icon={<Icon phosphorIcon={X} weight="bold" size="xs" />}
            onPress={() => dismissBanner([bannerId])}
            style={{ position: 'absolute', right: 0, top: 0 }}
            size="xs"
            type="ghost"
          />
        )}
      </TouchableOpacity>
    </>
  );
};

export const BannerGenerator = ({ banners, dismissBanner, onPressBanner, extraStyle }: Props) => {
  const instructionDataList: StaticDataProps[] = useMemo(() => {
    try {
      const result = JSON.parse(mmkvStore.getString('appInstructionData') || '[]');
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
          key={bannerItem.id}
          onPressBanner={onPressBanner}
          data={bannerItem}
          instructionDataList={instructionDataList}
          extraStyle={extraStyle}
          isMultipleBanner={true}
        />
      );
    },
    [banners, extraStyle, instructionDataList, onPressBanner],
  );

  const onCloseBanner = useCallback(() => {
    const bannerIdList = banners.map(banner => `${banner.position}-${banner.id}`);
    dismissBanner && dismissBanner(bannerIdList);
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
          extraStyle={extraStyle}
          isMultipleBanner={false}
        />
      ) : (
        <BannerSlider data={bannerUrlList} renderItem={renderItem} onCloseBanner={onCloseBanner} height={80} />
      )}
    </>
  );
};
