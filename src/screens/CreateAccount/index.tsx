import React, { useEffect, useState } from 'react';
import { InitSecretPhrase } from 'screens/CreateAccount/InitSecretPhrase';
import { VerifySecretPhrase } from 'screens/CreateAccount/VerifySecretPhrase';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AccountNamePasswordCreation } from 'screens/Shared/AccountNamePasswordCreation';
import { KeypairType } from '@polkadot/util-crypto/types';
import { createAccountSuriV2, createSeedV2 } from '../../messaging';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';

export const SUBSTRATE_ACCOUNT_TYPE: KeypairType = 'sr25519';

const ViewStep = {
  INIT_SP: 1,
  VERIFY_SP: 2,
  CREATE_ACCOUNT: 3,
};

function getHeaderTitle(viewStep: number) {
  if (viewStep === ViewStep.INIT_SP) {
    return 'Your Secret Phrase';
  } else if (viewStep === ViewStep.VERIFY_SP) {
    return 'Verify Secret Phrase';
  }

  return 'Create Wallet Name';
}

export const CreateAccount = () => {
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.INIT_SP);
  const [address, setAddress] = useState<null | string>(null);
  const [seed, setSeed] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();

  useEffect((): void => {
    createSeedV2(undefined, undefined, [SUBSTRATE_ACCOUNT_TYPE])
      .then((response): void => {
        // @ts-ignore
        setAddress(response.addressMap[SUBSTRATE_ACCOUNT_TYPE]);
        setSeed(response.seed);
      })
      .catch(console.error);
  }, []);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.INIT_SP) {
      navigation.goBack();
    } else if (currentViewStep === ViewStep.VERIFY_SP) {
      setCurrentViewStep(ViewStep.INIT_SP);
    } else if (currentViewStep === ViewStep.CREATE_ACCOUNT) {
      setCurrentViewStep(ViewStep.VERIFY_SP);
    }
  };

  const onPressSubmitInitSecretPhrase = () => {
    setCurrentViewStep(ViewStep.VERIFY_SP);
  };

  const onPressSubmitVerifySecretPhrase = () => {
    setCurrentViewStep(ViewStep.CREATE_ACCOUNT);
  };

  const onCreateAccount = (curName: string, password: string) => {
    if (curName && password && seed) {
      setIsBusy(true);
      createAccountSuriV2(curName, password, seed, true, [SUBSTRATE_ACCOUNT_TYPE], '')
        .then((response) => {
          navigation.navigate('Home');
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={getHeaderTitle(currentViewStep)}>
      <>
        {!!seed && (
          <>
            {currentViewStep === ViewStep.INIT_SP && (
              <InitSecretPhrase seed={seed} onPressSubmit={onPressSubmitInitSecretPhrase} />
            )}
            {currentViewStep === ViewStep.VERIFY_SP && (
              <VerifySecretPhrase seed={seed} onPressSubmit={onPressSubmitVerifySecretPhrase} />
            )}
            {currentViewStep === ViewStep.CREATE_ACCOUNT && (
              <AccountNamePasswordCreation isBusy={isBusy} onCreateAccount={onCreateAccount} />
            )}
          </>
        )}
      </>
    </ContainerWithSubHeader>
  );
};
