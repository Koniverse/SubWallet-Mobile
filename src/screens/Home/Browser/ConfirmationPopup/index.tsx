import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import { ArrowLeft, ArrowRight } from 'phosphor-react-native';
import useConfirmations from 'hooks/useConfirmations';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { AuthorizeConfirmation } from 'screens/Home/Browser/ConfirmationPopup/AuthorizeConfirmation';
import { AuthorizeRequest, MetadataRequest, SigningRequest } from '@subwallet/extension-base/background/types';
import { MetadataConfirmation } from 'screens/Home/Browser/ConfirmationPopup/MetadataConfirmation';
import { EvmSignConfirmation } from 'screens/Home/Browser/ConfirmationPopup/EvmSignConfirmation';
import { ConfirmationsQueue } from '@subwallet/extension-base/background/KoniTypes';
import { SubstrateSignConfirmation } from 'screens/Home/Browser/ConfirmationPopup/SubstrateSignConfirmation';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { EvmSendTransactionConfirmation } from 'screens/Home/Browser/ConfirmationPopup/EvmSendTransactionConfirmation';

const subWalletModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

const confirmationPopupWrapper: StyleProp<any> = {
  maxHeight: '90%',
  width: '100%',
  backgroundColor: ColorMap.dark2,
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  alignItems: 'center',
  paddingTop: 8,
};

const confirmationHeader: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  alignItems: 'center',
  marginTop: 8,
  marginBottom: 16,
  paddingHorizontal: 16,
};

const authorizeIndexTextStyle: StyleProp<any> = { ...sharedStyles.mainText, ...FontMedium, color: ColorMap.light };

export const ConfirmationPopup = () => {
  const {
    confirmationItemsLength,
    isEmptyRequests,
    approveRequest,
    cancelRequest,
    rejectRequest,
    confirmationItems,
    isDisplayConfirmation,
  } = useConfirmations();
  const navigation = useNavigation<RootNavigationProps>();
  const [confirmationIndex, setConfirmationIndex] = useState<number>(0);
  const filteredConfirmationItems = confirmationItems.filter(
    item => item.type !== 'addTokenRequest' && item.type !== 'addNetworkRequest',
  );
  const currentConfirmationItem = filteredConfirmationItems[confirmationIndex];
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const isLocked = useSelector((state: RootState) => state.appState.isLocked);
  const isArrowLeftDisabled = !(confirmationIndex > 0);
  const isArrowRightDisabled = !(confirmationIndex < confirmationItemsLength - 1);
  const onPressPrevButton = () => {
    if (!isArrowLeftDisabled) {
      setConfirmationIndex(confirmationIndex - 1);
    }
  };

  const onPressNextButton = () => {
    if (!isArrowRightDisabled) {
      setConfirmationIndex(confirmationIndex + 1);
    }
  };

  const renderConfirmation = () => {
    if (!currentConfirmationItem) {
      return null;
    }

    if (currentConfirmationItem.type === 'authorizeRequest') {
      return (
        <AuthorizeConfirmation
          payload={currentConfirmationItem.payload as AuthorizeRequest}
          approveRequest={approveRequest}
          cancelRequest={cancelRequest}
          rejectRequest={rejectRequest}
        />
      );
    } else if (currentConfirmationItem.type === 'signingRequest') {
      return (
        <SubstrateSignConfirmation
          payload={currentConfirmationItem.payload as SigningRequest}
          approveRequest={approveRequest}
          cancelRequest={cancelRequest}
        />
      );
    } else if (currentConfirmationItem.type === 'metadataRequest') {
      return (
        <MetadataConfirmation
          payload={currentConfirmationItem.payload as MetadataRequest}
          approveRequest={approveRequest}
          cancelRequest={cancelRequest}
        />
      );
    } else if (
      currentConfirmationItem.type === 'evmSignatureRequest' ||
      currentConfirmationItem.type === 'evmSignatureRequestExternal'
    ) {
      return (
        <EvmSignConfirmation
          payload={currentConfirmationItem.payload as ConfirmationsQueue['evmSignatureRequest'][0]}
          approveRequest={approveRequest}
          cancelRequest={cancelRequest}
          requestType={currentConfirmationItem.type}
        />
      );
    } else if (
      currentConfirmationItem.type === 'evmSendTransactionRequest' ||
      currentConfirmationItem.type === 'evmSendTransactionRequestExternal'
    ) {
      const evmSendTransactionRequest =
        currentConfirmationItem.payload as ConfirmationsQueue['evmSendTransactionRequest'][0];
      return (
        <EvmSendTransactionConfirmation
          payload={evmSendTransactionRequest}
          network={networkMap[evmSendTransactionRequest.networkKey || '']}
          approveRequest={approveRequest}
          cancelRequest={cancelRequest}
          requestType={currentConfirmationItem.type}
        />
      );
    }

    return null;
  };

  useEffect(() => {
    if (isLocked || !isDisplayConfirmation || isEmptyRequests) {
      navigation.canGoBack() && navigation.goBack();
    }
  }, [isEmptyRequests, isDisplayConfirmation, navigation, isLocked]);

  useEffect(() => {
    if (confirmationIndex && (confirmationIndex < 0 || confirmationIndex > confirmationItemsLength - 1)) {
      setConfirmationIndex(0);
    }
  }, [confirmationIndex, confirmationItemsLength]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
        <View style={confirmationPopupWrapper}>
          <View style={subWalletModalSeparator} />
          <View style={confirmationHeader}>
            <IconButton
              icon={ArrowLeft}
              color={isArrowLeftDisabled ? ColorMap.disabled : ColorMap.light}
              onPress={onPressPrevButton}
              disabled={isArrowLeftDisabled}
            />
            <Text style={authorizeIndexTextStyle}>
              <Text>{confirmationIndex + 1}</Text>/<Text>{confirmationItemsLength}</Text>
            </Text>
            <IconButton
              icon={ArrowRight}
              color={isArrowRightDisabled ? ColorMap.disabled : ColorMap.light}
              onPress={onPressNextButton}
              disabled={isArrowRightDisabled}
            />
          </View>
          {renderConfirmation()}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
