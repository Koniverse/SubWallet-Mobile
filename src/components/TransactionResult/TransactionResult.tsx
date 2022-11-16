import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import React, { useCallback, useMemo } from 'react';
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
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';

interface Props {
  isTxSuccess: boolean;
  txError: string;
  networkKey: string;
  extrinsicHash?: string;
  backToHome: () => void;
  handleResend?: () => void;
  resendText?: string;
  moonNetworkEnable?: boolean;
  success: {
    title: string;
    subText: string;
  };
  fail: {
    title: string;
    subText: string;
  };
}

const ContainerStyle: StyleProp<ViewStyle> = {
  ...sharedStyles.layoutContainer,
  ...centerStyle,
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
  width: '100%',
  flexDirection: 'column',
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginBottom: 16,
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

const TransactionResult = ({
  backToHome,
  handleResend,
  isTxSuccess,
  txError,
  networkKey,
  extrinsicHash,
  success,
  fail,
  moonNetworkEnable = false,
  resendText = i18n.common.resend,
}: Props) => {
  const scanExplorerTxUrl = useScanExplorerTxUrl(networkKey, extrinsicHash);
  const isSupportScanExplorer = useSupportScanExplorer(networkKey);
  const isSupportMoonNetwork = useMemo((): boolean => {
    return !moonNetworkEnable ? !['moonbeam', 'moonriver', 'moonbase'].includes(networkKey) : true;
  }, [moonNetworkEnable, networkKey]);

  const openUrl = useCallback(() => {
    Linking.openURL(scanExplorerTxUrl);
  }, [scanExplorerTxUrl]);

  return (
    <ContainerWithSubHeader onPressBack={() => {}} showLeftBtn={false}>
      <View style={ContainerStyle}>
        <View style={ResultContainerStyle}>
          {isTxSuccess ? (
            <>
              <Image source={require('assets/success-status.png')} style={ImageContentStyle} />
              <Text style={ResultTitleStyle}>{success.title}</Text>
              <Text style={ResultSubTextStyle}>{success.subText}</Text>
            </>
          ) : (
            <ScrollView style={ScrollContentStyle} contentContainerStyle={ScrollContainerStyle}>
              <Image source={require('assets/fail-status.png')} style={ImageContentStyle} />
              <Text style={ResultTitleStyle}>{fail.title}</Text>
              <Text style={ResultSubTextStyle}>{fail.subText}</Text>
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
                disabled={!isSupportScanExplorer || !scanExplorerTxUrl || !isSupportMoonNetwork}
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
              <SubmitButton
                title={resendText}
                onPress={handleResend}
                style={MarginBottomForSubmitButton}
                disabled={!handleResend}
              />
            </>
          )}
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(TransactionResult);
