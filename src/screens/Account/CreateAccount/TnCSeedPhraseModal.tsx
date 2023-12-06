import React, { useCallback, useState } from 'react';

import { Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CheckCircle } from 'phosphor-react-native';
import { TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import InputCheckBox from 'components/Input/InputCheckBox';

// todo: refactor code, style, i18n later

interface TnCSeedPhraseModalProps {
  setVisible: (isVisible: boolean) => void;
  isVisible: boolean;
  onPressSubmit: (hideNextTime: boolean) => void;
}

interface InstructionInfo {
  content: string;
  value: string;
}

interface InstructionItemProps extends InstructionInfo {
  onPress: (value: string) => void;
  valueMap: Record<string, boolean>;
}

const instructionInfoList: InstructionInfo[] = [
  {
    content:
      "SubWallet doesn't keep any copy of your seed phrase and other backup methods such as JSON file or private key.",
    value: 'state_1',
  },
  {
    content: "SubWallet can't help you recover your account once your seed phrase, JSON file or private key is lost.",
    value: 'state_2',
  },
  {
    content:
      'You must write down your seed phrase in the correct order. It is recommended that you store it in a secure offline location.',
    value: 'state_3',
  },
  {
    content: 'You are NOT recommended to download and store your seed phrase in a digital device.',
    value: 'state_4',
  },
];

export function TnCSeedPhraseModal({ setVisible, isVisible, onPressSubmit }: TnCSeedPhraseModalProps) {
  const theme = useSubWalletTheme().swThemes;
  const [hideNextTime, setHideNextTime] = useState<boolean>(false);
  const [agreementMap, setAgreementMap] = useState<Record<string, boolean>>({});

  const _onPressSubmit = useCallback(() => {
    onPressSubmit(hideNextTime);
  }, [hideNextTime, onPressSubmit]);

  const footer = () => {
    const isDisableSubmit = instructionInfoList.some(item => !agreementMap[item.value]);

    return (
      <View style={{ marginTop: theme.margin }}>
        <Button disabled={isDisableSubmit} style={{ width: '100%' }} type={'primary'} onPress={_onPressSubmit}>
          Continue
        </Button>
      </View>
    );
  };

  const onPressInstructionItem = useCallback((value: string) => {
    setAgreementMap(prev => ({
      ...prev,
      [value]: !prev[value],
    }));
  }, []);

  const onPressHideNextTime = useCallback(() => {
    setHideNextTime(prev => !prev);
  }, []);

  return (
    <SwModal
      isUseModalV2
      setVisible={setVisible}
      level={3}
      disabledOnPressBackDrop={true}
      modalVisible={isVisible}
      modalTitle={'Keep your seed phrase safe'}
      titleTextAlign="center"
      titleStyle={{ textAlign: 'center' }}
      isAllowSwipeDown={false}
      footer={footer()}
      modalStyle={{ maxHeight: '90%' }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '100%' }}>
        <View
          style={{
            paddingTop: 6,
            marginBottom: 16,
            paddingLeft: 16,
            paddingRight: 16,
          }}>
          <Typography.Text size={'sm'} style={{ color: 'rgba(255, 255, 255, 0.45)', textAlign: 'center' }}>
            Tap on all checkboxes to confirm you understand the importance of your seed phrase
          </Typography.Text>
        </View>

        <View style={{ gap: 12 }}>
          {instructionInfoList.map(item => (
            <InstructionItem {...item} key={item.value} onPress={onPressInstructionItem} valueMap={agreementMap} />
          ))}
        </View>

        <InputCheckBox
          wrapperStyle={{
            paddingBottom: 0,
            paddingTop: 16,
          }}
          labelStyle={{
            color: 'rgba(255, 255, 255, 0.45)',
          }}
          checked={hideNextTime}
          label={'Don’t show again'}
          onPress={onPressHideNextTime}
        />
      </ScrollView>
    </SwModal>
  );
}

function InstructionItem({ value, content, onPress, valueMap }: InstructionItemProps) {
  const theme = useSubWalletTheme().swThemes;

  const _onPress = useCallback(() => {
    onPress(value);
  }, [value, onPress]);

  return (
    <TouchableOpacity
      onPress={_onPress}
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: theme.borderRadius,
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        gap: 8,
      }}>
      <View style={{ justifyContent: 'center', height: 40, width: 40, alignItems: 'center' }}>
        <Icon
          phosphorIcon={CheckCircle}
          iconColor={valueMap[value] ? '#4CEAAC' : '#737373'}
          weight="fill"
          size={'sm'}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Typography.Text style={{ color: '#fff' }}>{content}</Typography.Text>
      </View>
    </TouchableOpacity>
  );
}
