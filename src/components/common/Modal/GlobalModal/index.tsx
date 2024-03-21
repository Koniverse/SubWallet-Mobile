import { Button, SwFullSizeModal, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { noop } from 'utils/function';
import { OnlineButtonGroups } from 'components/StaticContent/OnlineButtonGroups';
import { AppContentButton, AppContentButtonInstruction } from 'types/staticContent';
import { mmkvStore } from 'utils/storage';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { BoxProps, StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import AlertBoxBase from 'components/design-system-ui/alert-box/base';
import { getBannerButtonIcon, PhosphorIcon } from 'utils/campaign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSemiBold } from 'styles/sharedStyles';
import { ContentGenerator } from 'components/StaticContent/ContentGenerator';

interface GlobalInstructionModalProps {
  visible: boolean;
  title: string;
  data: BoxProps[];
  instruction: AppContentButtonInstruction;
  onPressCancelBtn: () => void;
  onPressConfirmBtn: () => void;
}

interface Props {
  message: string;
  title: string;
  visible: boolean;
  buttons: AppContentButton[];
  onPressButton?: (url?: string) => void;
  onCloseModal?: () => void;
}

const GlobalInstructionModal = ({
  visible,
  instruction,
  title,
  data,
  onPressCancelBtn,
  onPressConfirmBtn,
}: GlobalInstructionModalProps) => {
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

const GlobalModal: React.FC<Props> = ({ visible, title, message, buttons, onCloseModal, onPressButton }: Props) => {
  const [instructionModalVisible, setInstructionModalVisible] = useState(false);
  const instructionDataList: StaticDataProps[] = useMemo(() => {
    try {
      return JSON.parse(mmkvStore.getString('app-instruction-data') || '');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const instructionButton = useMemo(() => {
    const buttonHasInstruction = buttons.find(btn => !!btn.instruction);
    if (buttonHasInstruction) {
      return buttonHasInstruction;
    } else {
      return undefined;
    }
  }, [buttons]);

  const currentInstructionData = useMemo(() => {
    if (instructionButton && instructionButton.instruction) {
      return instructionDataList.find(
        item => item.group === instructionButton.instruction.group && item.slug === instructionButton.instruction.slug,
      )?.instructions;
    } else {
      return undefined;
    }
  }, [instructionButton, instructionDataList]);

  const onAccept = useCallback(
    (url?: string) => {
      onPressButton && onPressButton(url);
      onCloseModal && onCloseModal();
    },
    [onCloseModal, onPressButton],
  );

  const _onPressButton = useCallback(
    (url?: string) => {
      if (instructionButton && instructionButton.instruction) {
        setInstructionModalVisible(true);
      } else {
        onAccept(url);
      }
    },
    [instructionButton, onAccept],
  );

  return (
    <>
      <SwModal
        setVisible={noop}
        isUseForceHidden={false}
        modalVisible={visible}
        modalTitle={title}
        titleTextAlign="center"
        isUseModalV2
        footer={<OnlineButtonGroups buttons={buttons} onPressButton={_onPressButton} />}
        onBackButtonPress={onCloseModal}
        onChangeModalVisible={onCloseModal}>
        <View style={{ width: '100%', paddingTop: 10 }}>
          <ContentGenerator content={message} />
        </View>
      </SwModal>
      {!!instructionButton && instructionButton.instruction && currentInstructionData && (
        <GlobalInstructionModal
          title={'Instruction'}
          visible={instructionModalVisible}
          instruction={instructionButton.instruction}
          data={currentInstructionData}
          onPressCancelBtn={() => setInstructionModalVisible(false)}
          onPressConfirmBtn={() => onAccept(instructionButton.action.url)}
        />
      )}
    </>
  );
};

export default GlobalModal;
