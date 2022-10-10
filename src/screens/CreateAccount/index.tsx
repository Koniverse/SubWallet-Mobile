import React, { useEffect, useState } from 'react';
import { InitSecretPhrase } from 'screens/CreateAccount/InitSecretPhrase';
import { VerifySecretPhrase } from 'screens/CreateAccount/VerifySecretPhrase';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AccountNamePasswordCreation } from 'screens/Shared/AccountNamePasswordCreation';
import { createAccountSuriV2, createSeedV2 } from '../../messaging';
import { useNavigation } from '@react-navigation/native';
import { CreateAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import useGoHome from 'hooks/screen/useGoHome';

const ViewStep = {
  INIT_SP: 1,
  VERIFY_SP: 2,
  CREATE_ACCOUNT: 3,
};

function getHeaderTitle(viewStep: number) {
  if (viewStep === ViewStep.INIT_SP) {
    return i18n.title.yourSecretPhrase;
  } else if (viewStep === ViewStep.VERIFY_SP) {
    return i18n.title.verifySecretPhrase;
  }
  return i18n.title.nameYourWallet;
}

export const CreateAccount = ({
  route: {
    params: { keyTypes },
  },
}: CreateAccountProps) => {
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.INIT_SP);
  const [seed, setSeed] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome('Crypto');

  useEffect((): void => {
    createSeedV2(undefined, undefined, [keyTypes])
      .then((response): void => {
        // @ts-ignore
        setSeed(response.seed);
      })
      .catch(console.error);
  }, [keyTypes]);

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
      createAccountSuriV2(curName, password, seed, true, [keyTypes], '')
        .then(() => {
          backToHome(goHome, true);
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
