import React, { useEffect } from 'react';
import { BrowserTabProps, RootNavigationProps } from 'types/routes';
import { BrowserTab } from 'screens/Home/Browser/BrowserTab';
import { useNavigation } from '@react-navigation/native';
import useCheckEmptyConfirmationRequests from 'hooks/useCheckEmptyConfirmationRequests';

function ConfirmationTrigger() {
  const navigation = useNavigation<RootNavigationProps>();
  const isEmptyRequests = useCheckEmptyConfirmationRequests();

  useEffect(() => {
    if (!isEmptyRequests) {
      navigation.navigate('ConfirmationPopup');
    }
  }, [isEmptyRequests, navigation]);

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
