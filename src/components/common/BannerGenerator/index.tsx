import { TouchableOpacity } from 'react-native';
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

interface Props {
  banners: AppBannerData[];
  dismissBanner: (id: string) => void;
  onPressBanner: (id: string) => (url?: string) => void;
}

interface BannerProps {
  data: AppBannerData;
  dismissBanner: (id: string) => void;
  onPressBanner: (id: string) => (url?: string) => void;
  instructionDataList: StaticDataProps[];
}

const Banner = ({ data, dismissBanner, onPressBanner, instructionDataList }: BannerProps) => {
  const theme = useSubWalletTheme().swThemes;
  const bannerId = useMemo(() => `${data.position}-${data.id}`, [data.id, data.position]);
  const [instructionModalVisible, setInstructionModalVisible] = useState(false);

  const currentInstructionData = useMemo(() => {
    if (data.instruction) {
      return instructionDataList.find(
        item => item.group === data.instruction?.group && item.slug === data.instruction?.slug,
      )?.instructions;
    } else {
      return undefined;
    }
  }, [data.instruction, instructionDataList]);

  const _onPressBanner = useCallback(() => {
    const url = data.action.url;
    const instruction = data.instruction;
    if (instruction) {
      setInstructionModalVisible(true);
      return;
    }

    onPressBanner(bannerId)(url);
  }, [bannerId, data.action.url, data.instruction, onPressBanner]);

  return (
    <>
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

      {data.instruction && currentInstructionData && (
        <GlobalInstructionModal
          title={'Instruction'}
          visible={instructionModalVisible}
          instruction={data.instruction}
          data={currentInstructionData}
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

  if (!banners || banners.length === 0) {
    return <></>;
  }
  return (
    <>
      {banners.map(item => {
        return (
          <Banner
            key={item.id}
            dismissBanner={dismissBanner}
            onPressBanner={onPressBanner}
            data={item}
            instructionDataList={instructionDataList}
          />
        );
      })}
    </>
  );
};
