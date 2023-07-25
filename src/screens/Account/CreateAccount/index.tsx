import React, { useEffect, useState } from 'react';
import { InitSecretPhrase } from 'screens/Account/CreateAccount/InitSecretPhrase';
import { VerifySecretPhrase } from 'screens/Account/CreateAccount/VerifySecretPhrase';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { createAccountSuriV2, createSeedV2 } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { CreateAccountProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';

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

const defaultKeyTypes = [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE];

export const CreateAccount = ({ route: { params } }: CreateAccountProps) => {
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.INIT_SP);
  const [seed, setSeed] = useState<null | string>(null);
  const [isBusy, setIsBusy] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const accountName = useGetDefaultAccountName();

  useHandlerHardwareBackPress(isBusy);
  useEffect((): void => {
    createSeedV2(undefined, undefined, defaultKeyTypes)
      .then((response): void => {
        // @ts-ignore
        setSeed(response.seed);
      })
      .catch(console.error);
  }, [params]);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.INIT_SP) {
      navigation.goBack();
    } else if (currentViewStep === ViewStep.VERIFY_SP) {
      setCurrentViewStep(ViewStep.INIT_SP);
    }
  };

  const onPressSubmitInitSecretPhrase = () => {
    setCurrentViewStep(ViewStep.VERIFY_SP);
  };

  const onCreateAccount = () => {
    if (seed) {
      setIsBusy(true);
      createAccountSuriV2({
        name: accountName,
        suri: seed,
        types: params?.keyTypes || defaultKeyTypes,
        isAllowed: true,
      })
        .then(() => {
          if (!params.isBack) {
            backToHome(goHome);
          } else {
            navigation.goBack();
          }
        })
        .catch((error: Error): void => {
          setIsBusy(false);
          console.error(error);
        });
    }
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} disabled={isBusy} title={getHeaderTitle(currentViewStep)}>
      <>
        {!!seed && (
          <>
            {currentViewStep === ViewStep.INIT_SP && (
              <InitSecretPhrase seed={seed} onPressSubmit={onPressSubmitInitSecretPhrase} />
            )}
            {currentViewStep === ViewStep.VERIFY_SP && (
              <VerifySecretPhrase seed={seed} onPressSubmit={onCreateAccount} isBusy={isBusy} navigation={navigation} />
            )}
          </>
        )}
      </>
    </ContainerWithSubHeader>
  );
};
