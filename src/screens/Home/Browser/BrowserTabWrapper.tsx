import React, { useEffect } from 'react';
import { BrowserTabProps, RootNavigationProps } from 'types/routes';
import { BrowserTab } from 'screens/Home/Browser/BrowserTab';
import { useNavigation } from '@react-navigation/native';
import useConfirmations from 'hooks/useConfirmations';

function ConfirmationTrigger() {
  const navigation = useNavigation<RootNavigationProps>();
  const { isEmptyRequests, isDisplayConfirmation } = useConfirmations();

  useEffect(() => {
    if (isDisplayConfirmation && !isEmptyRequests) {
      navigation.navigate('ConfirmationPopup');
    }
  }, [isDisplayConfirmation, isEmptyRequests, navigation]);

  return <></>;
}

export const BrowserTabWrapper = (navigationProps: BrowserTabProps) => {
  return (
    <>
      <BrowserTab {...navigationProps} />
      <ConfirmationTrigger />
    </>
  );
};
