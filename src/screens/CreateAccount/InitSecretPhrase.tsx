import React, { useCallback } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';
import { LeftIconButton } from 'components/LeftIconButton';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {};

const infoBlockStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  marginBottom: 24,
};

const infoTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

const phraseBlockStyle: StyleProp<any> = {
  paddingLeft: 14,
  paddingRight: 14,
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginBottom: 24,
};

const seedWordStyle = {
  margin: 2,
};

const copyButtonWrapperStyle: StyleProp<any> = {
  alignItems: 'center',
};

const renderSeedWord = (word: string, index: number) => {
  return (
    <SeedWord style={seedWordStyle} key={word} prefixText={`${index + 1}`.padStart(2, '0')} title={word} disabled />
  );
};

export const InitSecretPhrase = () => {
  const toast = useToast();
  const phrase = 'gadget copy assist junior exhibit lazy educate brain used dust stay wink';

  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.show('Copied to Clipboard');
    },
    [toast],
  );

  return (
    <ContainerWithSubHeader onPressBack={() => {}} title={'Your Secret Phrase'}>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>
              Write down your wallet’s secret phrase and keep it in a safe place. Keep it carefully to not lose your
              assets.
            </Text>
          </View>
          <View style={phraseBlockStyle}>{phrase.split(' ').map(renderSeedWord)}</View>
          <View style={copyButtonWrapperStyle}>
            <LeftIconButton icon={CopySimple} title={'Copy to Clipboard'} onPress={() => copyToClipboard(phrase)} />
          </View>
        </View>
        <View style={footerAreaStyle}>
          <Warning
            title={'Do not share your private key!'}
            message={'If someone has your private key they will have full control of your account'}
            style={{ marginBottom: 16 }}
          />

          <SubmitButton title={'Continue'} onPress={() => {}} />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
