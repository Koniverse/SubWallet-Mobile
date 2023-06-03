import WordPhrase from 'components/common/WordPhrase';
import AlertBox from 'components/design-system-ui/alert-box';
import React from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import {
  ContainerHorizontalPadding,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { Button, Icon } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
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

export const InitSecretPhrase = ({ seed, onPressSubmit }: Props) => {
  return (
    <View style={sharedStyles.layoutContainer}>
      <View style={bodyAreaStyle}>
        <ScrollView style={{ ...ScrollViewStyle }}>
          <View style={infoBlockStyle}>
            <Text style={infoTextStyle}>{i18n.warningMessage.initSecretPhrase}</Text>
          </View>
          <View style={{ gap: 24 }}>
            <WordPhrase seedPhrase={seed} />
          </View>
        </ScrollView>
        <AlertBox
          title={i18n.warningTitle.whatIfLoseRecoveryPhrase}
          description={i18n.warningMessage.secretPhraseWarning}
          type="warning"
        />
      </View>
      <View style={footerAreaStyle}>
        <Button icon={<Icon size={'lg'} phosphorIcon={CheckCircle} weight={'fill'} />} onPress={onPressSubmit}>
          {i18n.buttonTitles.saveItSomeWhereSafe}
        </Button>
      </View>
    </View>
  );
};
