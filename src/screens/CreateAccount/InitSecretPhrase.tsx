import React, { useMemo } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from '../../components/Text';
import { SeedWord } from 'components/SeedWord';
import {
  ContainerHorizontalPadding,
  FontMedium,
  FontSemiBold,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { SeedWordDataType } from 'screens/CreateAccount/types';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
interface Props {
  onPressSubmit: () => void;
  seed: string;
}

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 16,
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
  margin: 4,
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
  const theme = useSubWalletTheme().swThemes;

  const seedItems = useMemo<SeedWordDataType[]>(() => {
    return seed.split(' ').map((word, index) => {
      return {
        key: `${index}-${word}`,
        title: word,
        prefixText: `${index + 1}`.padStart(2, '0'),
      };
    });
  }, [seed]);

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>{i18n.warningMessage.initSecretPhrase}</Text>
          </View>
          <View style={phraseBlockStyle}>{seedItems.map(renderSeedWord)}</View>
          <View style={copyButtonWrapperStyle}>
            <Button
              type={'ghost'}
              size={'xs'}
              icon={<Icon phosphorIcon={CopySimple} size={'lg'} iconColor={theme.colorTextLight4} />}
              onPress={() => copyToClipboard(seed)}>
              <Text
                style={{
                  fontSize: theme.fontSize,
                  lineHeight: theme.lineHeight * theme.fontSize,
                  color: theme.colorTextLight4,
                  ...FontSemiBold,
                  paddingLeft: 8,
                }}>
                Copy to clipboard
              </Text>
            </Button>
          </View>
        </ScrollView>
        <Warning
          style={{ marginTop: 16 }}
          title={i18n.warningTitle.doNotShareSecretPhrase}
          message={i18n.warningMessage.secretPhraseWarning}
        />
      </View>
      <View style={footerAreaStyle}>
        <Button onPress={onPressSubmit}>{i18n.common.continue}</Button>
      </View>
    </View>
  );
};
