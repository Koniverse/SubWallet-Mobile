import React, { useCallback, useMemo } from 'react';
import { GestureResponderEvent, ScrollView, StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { SeedWord } from 'components/SeedWord';
import {
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { Warning } from 'components/Warning';
import { LeftIconButton } from 'components/LeftIconButton';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { SeedWordDataType } from 'screens/CreateAccount/types';
interface Props {
  onPressSubmit: (event: GestureResponderEvent) => void;
  seed: string;
}

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  ...MarginBottomForSubmitButton,
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
  justifyContent: 'center',
};

const seedWordStyle = {
  margin: 2,
};

const copyButtonWrapperStyle: StyleProp<any> = {
  alignItems: 'center',
  marginBottom: 24,
};

const renderSeedWord = (item: SeedWordDataType) => {
  return <SeedWord style={seedWordStyle} key={item.key} prefixText={item.prefixText} title={item.title} disabled />;
};

export const InitSecretPhrase = ({ seed, onPressSubmit }: Props) => {
  const toast = useToast();

  const seedItems = useMemo<SeedWordDataType[]>(() => {
    return seed.split(' ').map((word, index) => {
      return {
        key: `${index}-${word}`,
        title: word,
        prefixText: `${index + 1}`.padStart(2, '0'),
      };
    });
  }, [seed]);

  const copyToClipboard = useCallback(
    (text: string) => {
      Clipboard.setString(text);
      toast.hideAll();
      toast.show('Copied to Clipboard');
    },
    [toast],
  );

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>{i18n.warningMessage.initSecretPhrase}</Text>
          </View>
          <View style={phraseBlockStyle}>{seedItems.map(renderSeedWord)}</View>
          <View style={copyButtonWrapperStyle}>
            <LeftIconButton icon={CopySimple} title={'Copy to Clipboard'} onPress={() => copyToClipboard(seed)} />
          </View>
          <Warning title={i18n.warningTitle.doNotShareSecretPhrase} message={i18n.warningMessage.secretPhraseWarning} />
        </ScrollView>
      </View>
      <View style={footerAreaStyle}>
        <SubmitButton title={'Continue'} onPress={onPressSubmit} />
      </View>
    </View>
  );
};
