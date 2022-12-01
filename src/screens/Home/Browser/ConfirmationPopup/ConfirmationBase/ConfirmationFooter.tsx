import SignatureScanner from 'components/Scanner/SignatureScanner';
import React, { useCallback, useState } from 'react';
import { SafeAreaView, StyleProp, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { IconButton } from 'components/IconButton';
import { ShieldSlash } from 'phosphor-react-native';
import { SigData } from 'types/signer';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';

export interface ConfirmationFooterType {
  cancelButtonTitle: string;
  submitButtonTitle: string;
  onPressCancelButton?: () => void;
  onPressSubmitButton?: () => void;
  onScanSignature?: (signature: `0x${string}`) => void;
  isShowBlockButton?: boolean;
  onPressBlockButton?: () => void;
  isBlockButtonDisabled?: boolean;
  isCancelButtonDisabled?: boolean;
  isSubmitButtonDisabled?: boolean;
  isBlockButtonBusy?: boolean;
  isCancelButtonBusy?: boolean;
  isSubmitButtonBusy?: boolean;
  isScanQrButton?: boolean;
  blockApprove?: boolean;
  isShowBackButton?: boolean;
}

const cancelButtonStyle: StyleProp<any> = {
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: ColorMap.borderButtonColor,
  flex: 1,
  marginRight: 8,
  marginLeft: 8,
};

const blockButtonStyle: StyleProp<any> = {
  backgroundColor: ColorMap.danger,
  borderRadius: 5,
  marginRight: 8,
  marginLeft: 8,
};

const WarningStyle: StyleProp<any> = {
  marginVertical: 8,
};

export const ConfirmationFooter = ({
  cancelButtonTitle,
  submitButtonTitle,
  onPressCancelButton,
  onPressSubmitButton,
  onScanSignature,
  isShowBlockButton = false,
  onPressBlockButton,
  isSubmitButtonDisabled,
  isBlockButtonDisabled,
  isCancelButtonDisabled,
  isBlockButtonBusy,
  isCancelButtonBusy,
  isSubmitButtonBusy,
  isScanQrButton,
  blockApprove,
  isShowBackButton,
}: ConfirmationFooterType) => {
  const [isScanning, setIsScanning] = useState(false);

  const openScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  const hideScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const onSuccess = useCallback(
    (sig: SigData) => {
      onScanSignature && onScanSignature(sig.signature);
      setIsScanning(false);
    },
    [onScanSignature],
  );

  return (
    <>
      {blockApprove && <Warning isDanger style={WarningStyle} message={i18n.warningMessage.unSupportSigning} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 16, marginHorizontal: 8 }}>
        {/* todo: add busy prop + style to IconButton */}
        {!isShowBackButton ? (
          <>
            {isShowBlockButton && (
              <IconButton
                icon={ShieldSlash}
                style={blockButtonStyle}
                onPress={onPressBlockButton}
                disabled={isBlockButtonDisabled || isBlockButtonBusy}
              />
            )}
            <SubmitButton
              title={!blockApprove ? cancelButtonTitle : i18n.common.back}
              backgroundColor={blockApprove ? ColorMap.secondary : ColorMap.dark2}
              style={cancelButtonStyle}
              onPress={onPressCancelButton}
              disabled={isCancelButtonDisabled}
              disabledColor={ColorMap.buttonOverlayButtonColor}
              isBusy={isCancelButtonBusy}
            />
            {!blockApprove && (
              <SubmitButton
                style={{ flex: 1, marginRight: 8, marginLeft: 8 }}
                title={!isScanQrButton ? submitButtonTitle : i18n.common.scanQr}
                onPress={!isScanQrButton ? onPressSubmitButton : openScanning}
                disabled={!isScanQrButton ? isSubmitButtonDisabled : false}
                isBusy={isSubmitButtonBusy}
              />
            )}
          </>
        ) : (
          <SubmitButton
            title={i18n.common.back}
            style={{ flex: 1, marginRight: 8, marginLeft: 8 }}
            onPress={onPressCancelButton}
            disabled={isCancelButtonDisabled}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            isBusy={isCancelButtonBusy}
          />
        )}
        <SignatureScanner visible={isScanning} onHideModal={hideScanning} onSuccess={onSuccess} />
      </View>
      <SafeAreaView />
    </>
  );
};
