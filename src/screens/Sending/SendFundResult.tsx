import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Linking, ScrollView, StyleProp, Text, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import React from 'react';
import {
  FontMedium,
  FontSemiBold,
  FontSize2,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { getIcon } from 'utils/index';
import { TransferResultType } from 'types/tx';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { TransferError } from '@subwallet/extension-base/background/KoniTypes';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import i18n from 'utils/i18n/i18n';

interface Props {
  txResult: TransferResultType;
  onResend: () => void;
  networkKey: string;
}

const bodyAreaStyle: StyleProp<any> = {
  alignItems: 'center',
  flex: 1,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
};

const imageStyle: StyleProp<any> = {
  marginBottom: 24,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  marginBottom: 8,
};

const subtitleStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSize2,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
  marginBottom: 16,
  paddingHorizontal: 16,
};

const submitButton1Style: StyleProp<any> = {};

export const SendFundResult = ({ networkKey, txResult: { extrinsicHash, isTxSuccess, txError }, onResend }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const isSupportScanExplorer = useSupportScanExplorer(networkKey);
  const isScanExplorerTxUrl = useScanExplorerTxUrl(networkKey, extrinsicHash);
  const renderErrorMessage = (error: Array<TransferError>) => {
    return error.map(err => (
      <Text key={err.code} style={{ ...sharedStyles.mainText, color: ColorMap.danger, textAlign: 'center' }}>
        {err.message}
      </Text>
    ));
  };

  const viewTransactionBtn = (hash?: string) => {
    if (!hash) {
      return null;
    }

    return (
      <SubmitButton
        style={{ ...MarginBottomForSubmitButton, marginTop: 16 }}
        disabled={!(isSupportScanExplorer && isScanExplorerTxUrl)}
        title={'View in Explorer'}
        onPress={() => Linking.openURL(isScanExplorerTxUrl)}
      />
    );
  };

  return (
    <ContainerWithSubHeader onPressBack={() => {}} title={isTxSuccess ? 'Success' : 'Failed'}>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          {isTxSuccess && (
            <>
              {getIcon('SuccessStatus', 200, undefined, imageStyle)}

              <Text style={titleStyle}>Transaction Successful</Text>
              <Text style={subtitleStyle}>{i18n.common.transferSuccessMessage}</Text>
            </>
          )}
          {!isTxSuccess && (
            <ScrollView
              style={{ flex: 1, ...ScrollViewStyle }}
              contentContainerStyle={{ alignItems: 'center', paddingTop: 100 }}>
              {getIcon('FailStatus', 200, undefined, imageStyle)}

              <Text style={titleStyle}>Transaction Fail</Text>
              <Text style={subtitleStyle}>
                {extrinsicHash ? i18n.common.transferFailMessage1 : i18n.common.transferFailMessage2}
              </Text>
              {!!(txError && txError.length) && renderErrorMessage(txError)}
            </ScrollView>
          )}
        </View>

        <View style={footerAreaStyle}>
          {isTxSuccess && (
            <>
              <SubmitButton
                title={'Back to Home'}
                backgroundColor={ColorMap.dark2}
                style={submitButton1Style}
                onPress={() => navigation.navigate('Home')}
              />
              {/*{viewTransactionBtn(extrinsicHash)}*/}
            </>
          )}
          {!isTxSuccess && (
            <>
              <SubmitButton
                title={'Resend'}
                backgroundColor={ColorMap.dark2}
                style={submitButton1Style}
                onPress={onResend}
              />
            </>
          )}

          {viewTransactionBtn(extrinsicHash)}
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
