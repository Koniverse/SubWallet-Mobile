import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import React, { useCallback } from 'react';
import { Image, Linking, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import i18n from 'utils/i18n/i18n';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  isTxSuccess: boolean;
  txError: string;
  networkKey: string;
  extrinsicHash: string;
  backToHome: () => void;
  handleResend: () => void;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  paddingLeft: 45,
  paddingRight: 45,
};

const ResultContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const ResultTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  fontWeight: '500',
  textAlign: 'center',
};

const ResultSubTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
  marginBottom: 10,
};

const ErrorTextStyle: StyleProp<TextStyle> = {
  fontSize: 14,
  color: ColorMap.errorColor,
  textAlign: 'center',
  marginBottom: 30,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center',
};

const TransferResult = ({ backToHome, handleResend, isTxSuccess, txError, networkKey, extrinsicHash }: Props) => {
  const scanExplorerTxUrl = useScanExplorerTxUrl(networkKey, extrinsicHash);
  const isSupportScanExplorer = useSupportScanExplorer(networkKey);

  const openUrl = useCallback(() => {
    Linking.openURL(scanExplorerTxUrl);
  }, [scanExplorerTxUrl]);

  return (
    <View style={ContainerStyle}>
      {isTxSuccess ? (
        <View style={ResultContainerStyle}>
          <Image source={require('assets/success-status.png')} />

          <Text style={ResultTitleStyle}>{i18n.title.transferNFTSuccessfully}</Text>

          <Text style={ResultSubTextStyle}>{i18n.common.transferNFTSuccessfullyMessage}</Text>

          <View style={ActionContainerStyle}>
            <SubmitButton title={i18n.common.backToHome} onPress={backToHome} />
            <SubmitButton
              disabled={!isSupportScanExplorer || !scanExplorerTxUrl}
              title={i18n.common.viewTransaction}
              onPress={openUrl}
            />
          </View>
        </View>
      ) : (
        <View style={ResultContainerStyle}>
          <Image source={require('assets/fail-status.png')} />

          <Text style={ResultTitleStyle}>{i18n.title.transferNFTFailed}</Text>

          <Text style={ResultSubTextStyle}>{i18n.common.transferNFTFailedMessage}</Text>

          <Text style={ErrorTextStyle}>{txError}</Text>

          <View style={ActionContainerStyle}>
            <SubmitButton title={i18n.common.backToHome} onPress={backToHome} />
            <SubmitButton title={i18n.common.resend} onPress={handleResend} />
          </View>
        </View>
      )}
    </View>
  );
};

export default React.memo(TransferResult);
