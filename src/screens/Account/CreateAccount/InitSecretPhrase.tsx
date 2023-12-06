import WordPhrase from 'components/common/WordPhrase';
import AlertBox from 'components/design-system-ui/alert-box';
import React, { useCallback, useState } from 'react';
import { ScrollView, Share, StyleProp, View } from 'react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
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
import { CheckCircle, Download } from 'phosphor-react-native';
import { DownloadSeedPhraseModal } from 'components/common/DownloadSeedPhraseModal';

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
  const [showDownloadConfirm, setDhowDownloadConfirm] = useState<boolean>(false);

  const onPressDownloadText = useCallback(() => {
    setDhowDownloadConfirm(true);
  }, []);

  const onPressDownloadButton = useCallback(() => {
    setDhowDownloadConfirm(false);
    Share.share({ title: 'Secret phrase', message: seed }).catch(e => {
      console.log('Share secret phrase error', e);
    });
  }, [seed]);

  const onCloseDownloadConfirmation = useCallback(() => {
    setDhowDownloadConfirm(false);
  }, []);

  return (
    <>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          <ScrollView style={{ ...ScrollViewStyle }}>
            <View style={infoBlockStyle}>
              <Text style={infoTextStyle}>
                {
                  'Keep your seed phrase in a safe place and never disclose it. Anyone with the seed phrase can take control of your assets'
                }
              </Text>
            </View>
            <View style={{ gap: 24 }}>
              <WordPhrase seedPhrase={seed} />
            </View>
          </ScrollView>
          <AlertBox
            title={i18n.warningTitle.whatIfLoseRecoveryPhrase}
            description={
              <>
                There is no way to get back your recovery phrase if you lose it. Make sure you store them at someplace
                safe which is accessible only to you.{' '}
                <Typography.Text style={{ textDecorationLine: 'underline' }} onPress={onPressDownloadText}>
                  Download seed phrase
                  <View>
                    <View style={{ marginLeft: 4, marginBottom: -4 }}>
                      <Icon phosphorIcon={Download} weight="fill" size={'sm'} iconColor={'#737373'} />
                    </View>
                  </View>
                </Typography.Text>
              </>
            }
            type="warning"
          />
        </View>
        <View style={footerAreaStyle}>
          <Button icon={<Icon size={'lg'} phosphorIcon={CheckCircle} weight={'fill'} />} onPress={onPressSubmit}>
            {i18n.buttonTitles.saveItSomeWhereSafe}
          </Button>
        </View>
      </View>

      <DownloadSeedPhraseModal
        modalVisible={showDownloadConfirm}
        onCloseModalVisible={onCloseDownloadConfirmation}
        setVisible={setDhowDownloadConfirm}
        onPressDownloadBtn={onPressDownloadButton}
      />
    </>
  );
};
