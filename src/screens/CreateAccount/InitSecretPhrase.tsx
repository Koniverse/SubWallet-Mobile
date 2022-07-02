import React, { useCallback } from 'react';
import { GestureResponderEvent, ScrollView, StyleProp, Text, View } from 'react-native';
import { SeedWord } from 'components/SeedWord';
import { ContainerHorizontalPadding, FontMedium, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';
import { LeftIconButton } from 'components/LeftIconButton';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
interface Props {
  onPressSubmit: (event: GestureResponderEvent) => void;
  seed: string;
}

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
};

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
  marginBottom: 24,
};

const renderSeedWord = (word: string, index: number) => {
  return (
    <SeedWord style={seedWordStyle} key={word} prefixText={`${index + 1}`.padStart(2, '0')} title={word} disabled />
  );
};

export const InitSecretPhrase = ({ seed, onPressSubmit }: Props) => {
  const toast = useToast();

  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.show('Copied to Clipboard');
    },
    [toast],
  );

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>
              Write down your wallet’s secret phrase and keep it in a safe place. Keep it carefully to not lose your
              assets.
            </Text>
          </View>
          <View style={phraseBlockStyle}>{seed.split(' ').map(renderSeedWord)}</View>
          <View style={copyButtonWrapperStyle}>
            <LeftIconButton icon={CopySimple} title={'Copy to Clipboard'} onPress={() => copyToClipboard(seed)} />
          </View>
          <Warning title={i18n.warningTitle.doNotSharePrivateKey} message={i18n.warningMessage.privateKeyWarning} />
        </ScrollView>
      </View>
      <View style={footerAreaStyle}>
        <SubmitButton title={'Continue'} onPress={onPressSubmit} />
      </View>
    </View>
  );
};
