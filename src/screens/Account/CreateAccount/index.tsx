import React, { useCallback, useEffect, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { createAccountSuriV2, createSeedV2 } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { CreateAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { mmkvStore } from 'utils/storage';
import { TnCSeedPhraseModal } from 'screens/Account/CreateAccount/TnCSeedPhraseModal';
import { Linking } from 'react-native';
import { SELECTED_MNEMONIC_TYPE } from 'constants/localStorage';
import { AccountProxyType, MnemonicType } from '@subwallet/extension-base/types';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { SecretPhraseArea } from 'screens/Account/CreateAccount/SecretPhraseArea';

const ViewStep = {
  INIT_SP: 1,
  VERIFY_SP: 2,
};

function getHeaderTitle(viewStep: number) {
  if (viewStep === ViewStep.INIT_SP) {
    return i18n.header.yourSeedPhrase;
  } else if (viewStep === ViewStep.VERIFY_SP) {
    return i18n.header.verifySeedPhrase;
  }
}

export const CreateAccount = ({ route: { params } }: CreateAccountProps) => {
  const isInstructionHidden = mmkvStore.getBoolean('hide-seed-phrase-instruction');
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.INIT_SP);
  const [showSeedPhraseInstruction, setShowSeedPhraseInstruction] = useState<boolean>(!isInstructionHidden);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();
  const storedDeeplink = mmkvStore.getString('storedDeeplink');
  const selectedMnemonicType = mmkvStore.getString(SELECTED_MNEMONIC_TYPE) as MnemonicType;
  const [accountNameModalVisible, setAccountNameModalVisible] = useState<boolean>(false);

  useHandlerHardwareBackPress(isLoading);

  useEffect((): void => {
    createSeedV2(undefined, undefined, selectedMnemonicType)
      .then((response): void => {
        const phrase = response.mnemonic;
        setSeedPhrase(phrase);
      })
      .catch(console.error);
  }, [params, selectedMnemonicType]);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.INIT_SP) {
      navigation.goBack();
    } else if (currentViewStep === ViewStep.VERIFY_SP) {
      setCurrentViewStep(ViewStep.INIT_SP);
    }
  };

  const { onPress: onSubmit } = useUnlockModal(navigation);

  const onPressSubmitInitSecretPhrase = () => {
    if (!seedPhrase) {
      return;
    }

    setAccountNameModalVisible(true);
  };

  const _onSubmit = useCallback(
    (accountName: string) => {
      setIsLoading(true);
      createAccountSuriV2({
        name: accountName,
        suri: seedPhrase,
        type: selectedMnemonicType === 'ton' ? 'ton-native' : undefined,
        isAllowed: true,
      })
        .then(() => {
          if (!params.isBack) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } else {
            if (storedDeeplink) {
              navigation.goBack();
              Linking.openURL(storedDeeplink).then(() => mmkvStore.set('storedDeeplink', ''));
              return;
            }
            navigation.goBack();
          }
        })
        .catch((error: Error): void => {
          setIsLoading(false);
          console.error(error);
        });
    },
    [navigation, params.isBack, seedPhrase, selectedMnemonicType, storedDeeplink],
  );

  const onPressSubmitTnCSeedPhraseModal = useCallback((hideNextTime: boolean) => {
    setShowSeedPhraseInstruction(false);
    mmkvStore.set('hide-seed-phrase-instruction', hideNextTime);
  }, []);

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} disabled={isLoading} title={getHeaderTitle(currentViewStep)}>
      <>
        {!!seedPhrase && <SecretPhraseArea seed={seedPhrase} onPressSubmit={onSubmit(onPressSubmitInitSecretPhrase)} />}

        {accountNameModalVisible && (
          <AccountNameModal
            isUseForceHidden={!params.isBack}
            modalVisible={accountNameModalVisible}
            setModalVisible={setAccountNameModalVisible}
            accountType={selectedMnemonicType === 'general' ? AccountProxyType.UNIFIED : AccountProxyType.SOLO}
            isLoading={isLoading}
            onSubmit={_onSubmit}
          />
        )}

        <TnCSeedPhraseModal
          isUseForceHidden={!params.isBack}
          onBackButtonPress={() => navigation.goBack()}
          onPressSubmit={onPressSubmitTnCSeedPhraseModal}
          setVisible={setShowSeedPhraseInstruction}
          isVisible={showSeedPhraseInstruction}
        />
      </>
    </ContainerWithSubHeader>
  );
};
