import { SwModal } from 'components/design-system-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { noop } from 'utils/function';
import { OnlineButtonGroups } from 'components/StaticContent/OnlineButtonGroups';
import { AppContentButton } from 'types/staticContent';
import { mmkvStore } from 'utils/storage';
import { StaticDataProps } from 'components/Modal/Earning/EarningPoolDetailModal';
import { ContentGenerator } from 'components/StaticContent/ContentGenerator';
import { deviceHeight } from 'constants/index';
import { GlobalInstructionModal } from 'components/common/Modal/GlobalModal/GlobalInstructionModal';

interface Props {
  message: string;
  title: string;
  visible: boolean;
  buttons: AppContentButton[];
  externalButtons?: React.ReactNode;
  onPressButton?: (url?: string) => void;
  onCloseModal?: () => void;
}

const GlobalModal: React.FC<Props> = ({
  visible,
  title,
  message,
  buttons,
  onCloseModal,
  onPressButton,
  externalButtons,
}: Props) => {
  const [instructionModalVisible, setInstructionModalVisible] = useState(false);
  const instructionDataList: StaticDataProps[] = useMemo(() => {
    try {
      const result = JSON.parse(mmkvStore.getString('app-instruction-data') || '[]');
      return result;
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
        item =>
          item.group === instructionButton.instruction?.group && item.slug === instructionButton.instruction?.slug,
      );
    } else {
      return undefined;
    }
  }, [instructionButton, instructionDataList]);

  const onAccept = useCallback(
    (url?: string) => {
      setInstructionModalVisible(false);
      onPressButton && onPressButton(url);
      onCloseModal && onCloseModal();
    },
    [onCloseModal, onPressButton],
  );

  const _onPressButton = useCallback(
    (url?: string, hasInstruction?: boolean) => {
      if (instructionButton && instructionButton.instruction && currentInstructionData && hasInstruction) {
        setInstructionModalVisible(true);
      } else {
        onAccept(url);
      }
    },
    [currentInstructionData, instructionButton, onAccept],
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
        isAllowSwipeDown={false}
        disabledOnPressBackDrop={true}
        onBackButtonPress={noop}
        footer={
          externalButtons ? externalButtons : <OnlineButtonGroups buttons={buttons} onPressButton={_onPressButton} />
        }>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: '100%', paddingTop: 10, maxHeight: deviceHeight * 0.6 }}>
          <ContentGenerator content={message} />
        </ScrollView>
      </SwModal>
      {!!instructionButton && instructionButton.instruction && currentInstructionData && (
        <GlobalInstructionModal
          title={currentInstructionData.title || 'Instruction'}
          media={currentInstructionData.media || ''}
          visible={instructionModalVisible}
          instruction={instructionButton.instruction}
          data={currentInstructionData.instructions}
          onPressCancelBtn={() => onAccept()}
          onPressConfirmBtn={() => onAccept(instructionButton.action?.url)}
        />
      )}
    </>
  );
};

export default GlobalModal;
