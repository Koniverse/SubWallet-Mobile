import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Linking, ScrollView, StyleProp, View, Image } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import Text from '../../components/Text';
import React from 'react';
import {
  FontMedium,
  FontSemiBold,
  FontSize2,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { TransferResultType } from 'types/tx';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { TransferError } from '@subwallet/extension-base/background/KoniTypes';
import useSupportScanExplorer from 'hooks/screen/useSupportScanExplorerUrl';
import useScanExplorerTxUrl from 'hooks/screen/useScanExplorerTxUrl';
import i18n from 'utils/i18n/i18n';
import { Images } from 'assets/index';

interface Props {
  txResult: TransferResultType;
  onResend: () => void;
  networkKey: string;
}

const bodyAreaStyle: StyleProp<any> = {
  alignItems: 'center',
  flex: 1,
  // paddingTop: 100,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
};

const imageStyle: StyleProp<any> = {
  width: 200,
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
        style={{ ...MarginBottomForSubmitButton }}
        disabled={!isSupportScanExplorer || !isScanExplorerTxUrl}
        title={i18n.common.viewInExplorer}
        onPress={() => Linking.openURL(isScanExplorerTxUrl)}
      />
    );
  };

  return (
    <ContainerWithSubHeader onPressBack={() => navigation.navigate('Home')} title={isTxSuccess ? 'Success' : 'Failed'}>
      <View style={sharedStyles.layoutContainer}>
        <View style={bodyAreaStyle}>
          {isTxSuccess && (
            <View style={{ alignItems: 'center', paddingTop: 100 }}>
              <Image source={Images.successStatusImg} style={imageStyle} />

              <Text style={titleStyle}>{i18n.sendAssetScreen.transactionSuccessful}</Text>
              <Text style={subtitleStyle}>{i18n.common.transferSuccessMessage}</Text>
            </View>
          )}
          {!isTxSuccess && (
            <ScrollView
              style={{ flex: 1, ...ScrollViewStyle }}
              contentContainerStyle={{ alignItems: 'center', paddingTop: 100 }}>
              <Image source={Images.failStatusImg} style={imageStyle} />

              <Text style={titleStyle}>{i18n.sendAssetScreen.transactionFail}</Text>
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
                title={i18n.common.backToHome}
                backgroundColor={ColorMap.dark2}
                style={{ marginBottom: 18 }}
                onPress={() => navigation.navigate('Home')}
              />
              {/*{viewTransactionBtn(extrinsicHash)}*/}
            </>
          )}
          {!isTxSuccess && (
            <>
              <SubmitButton
                title={i18n.common.resend}
                backgroundColor={ColorMap.dark2}
                style={{ marginBottom: 18 }}
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
