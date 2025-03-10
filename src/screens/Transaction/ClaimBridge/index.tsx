import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClaimBridgeProps } from 'routes/transaction/transactionAction';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { AmountData, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useWatch } from 'react-hook-form';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { ScrollView, View } from 'react-native';
import { AccountSelectField } from 'components/Field/AccountSelect';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import {
  _NotificationInfo,
  ClaimAvailBridgeNotificationMetadata,
  ClaimPolygonBridgeNotificationMetadata,
} from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { getInappNotification } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Button, Icon } from 'components/design-system-ui';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { ArrowCircleRight, XCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { submitClaimAvailBridge, submitClaimPolygonBridge } from 'messaging/transaction/bridge';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import { LoadingScreen } from 'screens/LoadingScreen';

interface ClaimBridgeFormValues extends TransactionFormValues {
  notificationId: string;
}

interface Props {
  notification: _NotificationInfo;
  chain: string;
  asset: string;
  from: string;
}

const Component = ({
  notification,
  chain: defaultChainValue,
  from: defaultFromValue,
  asset: defaultAssetValue,
}: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const {
    title,
    onTransactionDone: onDone,
    form: {
      control,
      formState: { errors },
    },
    transactionDoneInfo,
  } = useTransaction<ClaimBridgeFormValues>('claim-bridge', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      notificationId: '',
      from: defaultFromValue,
      chain: defaultChainValue,
      asset: defaultAssetValue,
    },
  });

  const chainValue = useWatch<ClaimBridgeFormValues>({ name: 'chain', control });
  const fromValue = useWatch<ClaimBridgeFormValues>({ name: 'from', control });
  const accountInfo = useGetAccountByAddress(fromValue);
  const [isDisabled, setIsDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);

  const isPolygonBridge = useMemo(() => {
    return notification?.actionType === 'CLAIM_POLYGON_BRIDGE';
  }, [notification?.actionType]);

  const metadata = useMemo(() => {
    if (isPolygonBridge) {
      return notification?.metadata as ClaimPolygonBridgeNotificationMetadata;
    }

    return notification?.metadata as ClaimAvailBridgeNotificationMetadata;
  }, [isPolygonBridge, notification]);

  const amountValue = useMemo(() => {
    if (!isPolygonBridge && 'amount' in metadata) {
      return metadata.amount;
    } else if ('amounts' in metadata) {
      return metadata.amounts[0];
    }

    return 0;
  }, [isPolygonBridge, metadata]);

  const { decimals: _decimals, symbol } = useGetChainAssetInfo(metadata.tokenSlug) as _ChainAsset;
  const decimals = _decimals || 0;

  const handleDataForInsufficientAlert = useCallback(
    (estimateFee: AmountData) => {
      return {
        chainName: chainInfoMap[chainValue]?.name || '',
        symbol: estimateFee.symbol,
      };
    },
    [chainInfoMap, chainValue],
  );

  const onPreCheck = usePreCheckAction(fromValue);

  const { onError, onSuccess } = useHandleSubmitTransaction(
    onDone,
    setTransactionDone,
    undefined,
    undefined,
    handleDataForInsufficientAlert,
  );

  const onSubmit = useCallback(() => {
    setLoading(true);

    const submitClaim = isPolygonBridge ? submitClaimPolygonBridge : submitClaimAvailBridge;

    setTimeout(() => {
      submitClaim({
        address: fromValue,
        chain: chainValue,
        notification,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => {
          setLoading(false);
        });
    }, 300);
  }, [chainValue, fromValue, isPolygonBridge, notification, onError, onSuccess]);

  useEffect(() => {
    // Trick to trigger validate when case single account
    setTimeout(() => {
      if (fromValue || !errors.from) {
        setIsDisabled(false);
      }
    }, 500);
  }, [errors.from, fromValue]);
  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
              <AccountSelectField
                outerStyle={{ opacity: 0.4 }}
                accountName={accountInfo?.name || ''}
                value={fromValue}
                showIcon
              />

              <GeneralFreeBalance address={fromValue} chain={chainValue} onBalanceReady={setIsBalanceReady} />

              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Chain chain={chainValue} label={i18n.inputLabel.network} />

                {metadata && (
                  <MetaInfo.Number
                    decimals={decimals}
                    label={i18n.inputLabel.amount}
                    suffix={symbol}
                    value={amountValue}
                  />
                )}
              </MetaInfo>
            </ScrollView>

            <View style={{ padding: 16, flexDirection: 'row' }}>
              <Button
                disabled={loading}
                style={{ flex: 1, marginRight: 4 }}
                type={'secondary'}
                onPress={() => navigation.goBack()}
                icon={
                  <Icon
                    phosphorIcon={XCircle}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }>
                {i18n.buttonTitles.cancel}
              </Button>
              <Button
                style={{ flex: 1, marginLeft: 4 }}
                disabled={!fromValue || isDisabled || loading || !isBalanceReady}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={ArrowCircleRight}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={
                      !fromValue || isDisabled || loading || !isBalanceReady ? theme.colorTextLight5 : theme.colorWhite
                    }
                  />
                }
                onPress={onPreCheck(onSubmit, ExtrinsicType.CLAIM_BRIDGE)}>
                {i18n.buttonTitles.continue}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone transactionDoneInfo={transactionDoneInfo} extrinsicType={ExtrinsicType.CLAIM_BRIDGE} />
      )}
    </>
  );
};

export const ClaimBridge = ({
  route: {
    params: { chain, from, notificationId, asset },
  },
}: ClaimBridgeProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [notification, setNotification] = useState<_NotificationInfo>();
  const [loadingData, setLoadingData] = useState<boolean>();

  useEffect(() => {
    setLoadingData(true);
    getInappNotification(notificationId)
      .then(rs => {
        setNotification(rs);
      })
      .catch(() => {
        setNotification(undefined);
        navigation.navigate('Home');
      })
      .finally(() => setLoadingData(false));
  }, [navigation, notificationId]);

  return (
    <>
      {loadingData || !notification ? (
        <LoadingScreen />
      ) : (
        <Component notification={notification} from={from} chain={chain} asset={asset} />
      )}
    </>
  );
};
