import React, { useContext, useRef } from 'react';
import { Divider, Image, SwFullSizeModal, Tag, Typography } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { MissionInfo } from 'types/missionPool';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyles from './style';
import { ImageBackground, Linking, ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MetaInfo from 'components/MetaInfo';
import { MissionCategoryType } from 'screens/Home/Browser/MissionPool/predefined';
import { FontSemiBold } from 'styles/sharedStyles';
import { useMissionPools } from 'hooks/useMissionPools';
import { MissionPoolFooter } from 'components/MissionPoolHorizontalItem/MissionPoolFooter';
import i18n from 'utils/i18n/i18n';
import LogoGroup from 'components/common/LogoGroup';
import { AppConfirmationData } from 'types/staticContent';
import { GlobalModalContext } from 'providers/GlobalModalContext';

interface Props {
  modalVisible: boolean;
  setVisible: (arg: boolean) => void;
  data: MissionInfo;
  currentConfirmations?: AppConfirmationData[];
  renderConfirmationButtons: (onPressCancel: () => void, onPressOk: () => void) => React.JSX.Element;
}

export const MissionPoolDetailModal = ({
  modalVisible,
  setVisible,
  data,
  currentConfirmations,
  renderConfirmationButtons,
}: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyles();
  const { timeline, getTagData, getMissionPoolCategory } = useMissionPools(data);
  const tagData = getTagData(data, true);
  const missionPoolCategory = getMissionPoolCategory(data);
  const globalAppModalContext = useContext(GlobalModalContext);

  const onPressJoinNow = async (url: string) => {
    const transformUrl = `subwallet://browser?url=${encodeURIComponent(url)}`;
    if (currentConfirmations && currentConfirmations.length) {
      globalAppModalContext.setGlobalModal({
        visible: true,
        title: currentConfirmations[0].name,
        message: currentConfirmations[0].content,
        type: 'confirmation',
        externalButtons: renderConfirmationButtons(globalAppModalContext.hideGlobalModal, () => {
          globalAppModalContext.hideGlobalModal();
          setVisible(false);
          Linking.openURL(transformUrl);
        }),
      });
    } else {
      setVisible(false);
      Linking.openURL(transformUrl);
    }
  };

  return (
    <SwFullSizeModal isUseModalV2 modalVisible={modalVisible} setVisible={setVisible} modalBaseV2Ref={modalBaseV2Ref}>
      <ContainerWithSubHeader title={data.name as string} style={{ flex: 1 }} onPressBack={() => setVisible(false)}>
        <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
          <ImageBackground style={styles.backdropImgBlurView} source={{ uri: data.backdrop_image }} blurRadius={30} />
          <LinearGradient
            locations={[0, 0.02, 0.09]}
            colors={['#0C0C0C', 'transparent', '#0C0C0C']}
            style={styles.linerGradientStyle}
          />
          <View style={styles.contentContainer}>
            <View style={styles.logoWrapper}>
              <Image src={{ uri: data.logo }} style={{ width: 64, height: 64 }} />
            </View>
            <MetaInfo spaceSize={'ms'} labelFontWeight={'semibold'} valueColorScheme={'light'}>
              <MetaInfo.Text
                label={i18n.inputLabel.name}
                labelAlign={'top'}
                valueFontWeight={'semibold'}
                value={data.name as string}
              />

              {data.chains && data.chains.length > 1 && (
                <MetaInfo.Default label={i18n.inputLabel.network}>
                  <LogoGroup chains={data.chains} logoSize={20} />
                </MetaInfo.Default>
              )}

              {data.chains && data.chains.length === 1 && (
                <MetaInfo.Chain label={i18n.inputLabel.network} chain={data.chains[0]} />
              )}
              {tagData && (
                <MetaInfo.Text
                  label={i18n.inputLabel.status}
                  valueColorSchema={'success'}
                  valueFontWeight={'semibold'}
                  value={tagData?.name || ''}
                />
              )}
              {missionPoolCategory && missionPoolCategory.length && (
                <MetaInfo.Default label={'Categories'}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
                    {missionPoolCategory.map(item => (
                      <Tag key={item.slug} color={item.color} shape={'round'} bgType={'default'}>
                        {item.name}
                      </Tag>
                    ))}
                  </View>
                </MetaInfo.Default>
              )}
              {data.description && (
                <MetaInfo.Data label={i18n.inputLabel.description}>
                  <Typography.Text style={{ color: theme.colorTextTertiary, ...FontSemiBold }}>
                    {data.description}
                  </Typography.Text>
                </MetaInfo.Data>
              )}
              {data.total_supply && (
                <MetaInfo.Text
                  label={i18n.inputLabel.totalSupply}
                  valueColorSchema={'gray'}
                  valueFontWeight={'semibold'}
                  value={data.total_supply}
                />
              )}
              {data.reward && (
                <MetaInfo.Text
                  label={i18n.inputLabel.totalRewards}
                  valueColorSchema={'gray'}
                  valueFontWeight={'semibold'}
                  value={data.reward}
                />
              )}
              <MetaInfo.Text
                label={i18n.inputLabel.timeline}
                valueColorSchema={'success'}
                valueFontWeight={'semibold'}
                value={timeline}
              />
              {data.total_winner && (
                <MetaInfo.Text
                  label={i18n.inputLabel.totalWinners}
                  valueColorSchema={'gray'}
                  valueFontWeight={'semibold'}
                  value={data.total_winner}
                />
              )}
            </MetaInfo>
            <Divider type={'horizontal'} color={theme.colorBgBorder} style={{ marginTop: theme.marginLG }} />
            <MissionPoolFooter
              style={{ flexDirection: 'row', paddingTop: theme.paddingLG, gap: theme.padding }}
              data={data}
              closeDetailModal={() => setVisible(false)}
              disabledJoinNowBtn={data.status === MissionCategoryType.ARCHIVED}
              onPressJoinNow={onPressJoinNow}
            />
          </View>
        </ScrollView>
      </ContainerWithSubHeader>
    </SwFullSizeModal>
  );
};
