import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import React, { useCallback } from 'react';
import { Image, Linking, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';

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
  fontSize: 20,
  lineHeight: 36,
  color: ColorMap.light,
  fontWeight: '500',
  textAlign: 'center',
};

const ResultSubTextStyle: StyleProp<TextStyle> = {
  fontSize: 14,
  color: ColorMap.light,
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
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
};

const PrimaryButtonStyle: StyleProp<ViewStyle> = {
  width: '100%',
  padding: 10,
  backgroundColor: ColorMap.secondary,
  borderRadius: 8,
};

const SecondaryButtonStyle: StyleProp<ViewStyle> = {
  width: '100%',
  padding: 10,
  backgroundColor: ColorMap.primary,
  borderRadius: 8,
  marginTop: 15,
};

const ButtonTextStyle: StyleProp<TextStyle> = {
  color: ColorMap.light,
  fontWeight: '500',
  width: '100%',
  textAlign: 'center',
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

          <Text style={ResultTitleStyle}>Transfer NFT Successfully</Text>

          <Text style={ResultSubTextStyle}>
            Your transfer request has been confirmed. It might take a minute to see changes in your wallet.
          </Text>

          <View style={ActionContainerStyle}>
            <TouchableOpacity style={PrimaryButtonStyle} onPress={backToHome}>
              <Text style={ButtonTextStyle}>Back To Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={SecondaryButtonStyle}
              disabled={!isSupportScanExplorer || !scanExplorerTxUrl}
              onPress={openUrl}>
              <Text style={ButtonTextStyle}>View Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={ResultContainerStyle}>
          <Image source={require('assets/fail-status.png')} />

          <Text style={ResultTitleStyle}>Transfer NFT Failed</Text>

          <Text style={ResultSubTextStyle}>There was a problem with your request. You can try again.</Text>

          <Text style={ErrorTextStyle}>{txError}</Text>

          <View style={ActionContainerStyle}>
            <TouchableOpacity style={PrimaryButtonStyle} onPress={backToHome}>
              <Text style={ButtonTextStyle}>Back To Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={SecondaryButtonStyle} onPress={handleResend}>
              <Text style={ButtonTextStyle}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default React.memo(TransferResult);
