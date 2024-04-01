import React, { useMemo, useRef } from 'react';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ScrollView, View } from 'react-native';
import { Button, SwFullSizeModal, Typography } from 'components/design-system-ui';
import { noop } from 'utils/function';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSemiBold } from 'styles/sharedStyles';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { BoxProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { AppContentButtonInstruction } from 'types/staticContent';
import FastImage from 'react-native-fast-image';

interface Props {
  visible: boolean;
  title: string;
  media?: string;
  data: BoxProps[];
  instruction: AppContentButtonInstruction;
  onPressCancelBtn: () => void;
  onPressConfirmBtn: () => void;
}

export const GlobalInstructionModal = ({
  visible,
  instruction,
  title,
  data,
  media,
  onPressCancelBtn,
  onPressConfirmBtn,
}: Props) => {
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);
  const theme = useSubWalletTheme().swThemes;

  const footer = useMemo(
    () => (
      <View style={{ flexDirection: 'row', gap: theme.sizeSM }}>
        <Button block type={'secondary'} onPress={onPressCancelBtn}>
          {instruction.cancel_label}
        </Button>
        <Button block type={'primary'} onPress={onPressConfirmBtn}>
          {instruction.confirm_label}
        </Button>
      </View>
    ),
    [instruction.cancel_label, instruction.confirm_label, onPressCancelBtn, onPressConfirmBtn, theme.sizeSM],
  );

  return (
    <SwFullSizeModal
      setVisible={noop}
      isUseForceHidden={false}
      modalVisible={visible}
      isUseModalV2
      modalBaseV2Ref={modalBaseV2Ref}>
      <SafeAreaView
        style={{
          flex: 1,
          width: '100%',
          marginBottom: theme.padding,
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.size,
            paddingHorizontal: theme.padding,
            flex: 1,
          }}>
          <Typography.Text
            style={{
              ...FontSemiBold,
              textAlign: 'center',
              marginHorizontal: theme.paddingLG + theme.paddingXXS,
              color: theme.colorTextBase,
              fontSize: theme.fontSizeHeading4,
              lineHeight: theme.fontSizeHeading4 * theme.lineHeightHeading4,
            }}>
            {title}
          </Typography.Text>
          {media && (
            <FastImage
              style={{ height: 120, borderRadius: theme.borderRadiusLG }}
              resizeMode="cover"
              source={{ uri: media }}
            />
          )}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.sizeSM }}>
            {data.map((_props, index) => {
              return (
                <AlertBoxBase
                  key={index}
                  title={_props.title}
                  description={_props.description}
                  iconColor={_props.icon_color}
                  icon={getBannerButtonIcon(_props.icon) as PhosphorIcon}
                />
              );
            })}
          </ScrollView>
          {footer}
        </View>
      </SafeAreaView>
    </SwFullSizeModal>
  );
};
