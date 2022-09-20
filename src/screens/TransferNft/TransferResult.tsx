import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import React, { useCallback } from 'react';
import { Image, ImageStyle, Linking, ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { SubmitButton } from 'components/SubmitButton';
import i18n from 'utils/i18n/i18n';
import {
  centerStyle,
  FontMedium,
  FontSemiBold,
  FontSize2,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';

interface Props {
  isTxSuccess: boolean;
  txError: string;
  networkKey: string;
  extrinsicHash: string;
  backToHome: () => void;
  handleResend: () => void;
}

const ContainerStyle: StyleProp<ViewStyle> = {
  ...sharedStyles.layoutContainer,
  ...centerStyle,
  paddingLeft: 45,
  paddingRight: 45,
};

const ResultContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
};

const ResultTitleStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 8,
};

const ResultSubTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSize2,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
  marginBottom: 16,
  paddingHorizontal: 16,
};

const ErrorTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  color: ColorMap.danger,
  textAlign: 'center',
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  marginTop: 8,
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginBottom: 18,
};

const ImageContentStyle: StyleProp<ImageStyle> = {
  width: 200,
  marginBottom: 24,
};

const ScrollContentStyle: StyleProp<ViewStyle> = {
  ...ScrollViewStyle,
  flex: 1,
};

const ScrollContainerStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  minHeight: '100%',
  justifyContent: 'center',
};

const TransferResult = ({ backToHome, handleResend, isTxSuccess, txError, networkKey, extrinsicHash }: Props) => {
  const scanExplorerTxUrl = useScanExplorerTxUrl(networkKey, extrinsicHash);
  const isSupportScanExplorer = useSupportScanExplorer(networkKey);

  const openUrl = useCallback(() => {
    Linking.openURL(scanExplorerTxUrl);
  }, [scanExplorerTxUrl]);

  return (
    <View style={ContainerStyle}>
      <View style={ResultContainerStyle}>
        {isTxSuccess ? (
          <>
            <Image source={require('assets/success-status.png')} style={ImageContentStyle} />
            <Text style={ResultTitleStyle}>{i18n.title.transferNFTSuccessfully}</Text>
            <Text style={ResultSubTextStyle}>{i18n.common.transferNFTSuccessfullyMessage}</Text>
          </>
        ) : (
          <ScrollView style={ScrollContentStyle} contentContainerStyle={ScrollContainerStyle}>
            <Image source={require('assets/fail-status.png')} style={ImageContentStyle} />
            <Text style={ResultTitleStyle}>{i18n.title.transferNFTFailed}</Text>
            <Text style={ResultSubTextStyle}>{i18n.common.transferNFTFailedMessage}</Text>
            <Text style={ErrorTextStyle}>{txError}</Text>
          </ScrollView>
        )}
      </View>
      <View style={ActionContainerStyle}>
        {isTxSuccess ? (
          <>
            <SubmitButton
              backgroundColor={ColorMap.dark2}
              title={i18n.common.backToHome}
              onPress={backToHome}
              style={ButtonStyle}
            />
            <SubmitButton
              disabled={!isSupportScanExplorer || !scanExplorerTxUrl}
              title={i18n.common.viewTransaction}
              onPress={openUrl}
              style={MarginBottomForSubmitButton}
            />
          </>
        ) : (
          <>
            <SubmitButton
              backgroundColor={ColorMap.dark2}
              title={i18n.common.backToHome}
              onPress={backToHome}
              style={ButtonStyle}
            />
            <SubmitButton title={i18n.common.resend} onPress={handleResend} style={MarginBottomForSubmitButton} />
          </>
        )}
      </View>
    </View>
  );
};

export default React.memo(TransferResult);
