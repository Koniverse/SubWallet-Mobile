import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircleIcon, InfoIcon, XCircleIcon } from 'phosphor-react-native';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SubstrateProxyAccountItem } from '@subwallet/extension-base/types';
import { Button, Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { SubstrateProxyAccountListModal } from 'components/Modal/SubstrateProxyAccount';
import {
  SubstrateProxyAccountItemExtended,
  SubstrateProxyAccountSelectorItem,
} from 'components/SubstrateProxyAccount';
import useGetAccountProxyById from 'hooks/account/useGetAccountProxyById';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useGetNativeTokenSlug from 'hooks/useGetNativeTokenSlug';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useGetSubstrateProxyAccountGroupByAddress } from 'hooks/substrateProxyAccount';
import { useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { handleRemoveSubstrateProxyAccount } from 'messaging/transaction/substrateProxy';
import { RemoveSubstrateProxyProps } from 'routes/transaction/transactionAction';
import { FreeBalance } from 'screens/Transaction/parts/FreeBalance';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

export const RemoveSubstrateProxyAccount = ({
  route: {
    params: { chain, from, selectedSubstrateProxyAccounts, accountProxyId },
  },
}: RemoveSubstrateProxyProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);

  const nativeTokenSlug = useGetNativeTokenSlug(chain);
  const accountProxy = useGetAccountProxyById(accountProxyId);
  const substrateProxyAccountGroup = useGetSubstrateProxyAccountGroupByAddress(from, chain);
  const onPreCheck = usePreCheckAction(from, true, undefined, chain);

  const { title, onTransactionDone: onDone, transactionDoneInfo } = useTransaction('remove-substrate-proxy', {
    defaultValues: { chain, from },
  });

  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  // Route params are restored from persisted navigation state and can come back
  // incomplete, so never index into them directly.
  const selectedProxyAccounts = useMemo(
    () => selectedSubstrateProxyAccounts || [],
    [selectedSubstrateProxyAccounts],
  );

  // `removeProxies` is cheaper than removing one by one, so tell the backend when the
  // selection covers every proxy the account currently has.
  const isRemoveAll = useMemo(() => {
    const total = substrateProxyAccountGroup?.substrateProxyAccounts?.length ?? 0;

    return total > 0 && selectedProxyAccounts.length === total;
  }, [selectedProxyAccounts, substrateProxyAccountGroup?.substrateProxyAccounts?.length]);

  // The proxied account itself is shown on top as context, not as a removable entry.
  const substrateProxiedAccount = useMemo<SubstrateProxyAccountItemExtended | null>(() => {
    if (!accountProxy) {
      return null;
    }

    return {
      proxyId: accountProxy.id,
      substrateProxyAddress: from,
      substrateProxyType: 'Any',
      delay: 0,
      isMain: true,
    };
  }, [accountProxy, from]);

  const onClickSubmit = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      handleRemoveSubstrateProxyAccount({
        chain,
        address: from,
        selectedSubstrateProxyAccounts: selectedProxyAccounts as SubstrateProxyAccountItem[],
        isRemoveAll,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => setLoading(false));
    }, 300);
  }, [chain, from, isRemoveAll, onError, onSuccess, selectedProxyAccounts]);

  const proxyCount = selectedProxyAccounts.length;

  if (!proxyCount) {
    return null;
  }

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={styles.scrollView}>
              {!!substrateProxiedAccount && (
                <SubstrateProxyAccountSelectorItem
                  substrateProxyAccount={substrateProxiedAccount}
                  showCheckedIcon={false}
                />
              )}

              <FreeBalance
                address={from}
                chain={chain}
                tokenSlug={nativeTokenSlug}
                label={`${i18n.substrateProxy.availableBalance}:`}
                onBalanceReady={setIsBalanceReady}
              />

              <MetaInfo hasBackgroundWrapper>
                <MetaInfo.Default label={i18n.substrateProxy.proxyList}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.proxyCountValue}
                    onPress={() => setListModalVisible(true)}>
                    <Typography.Text style={styles.proxyCountText}>
                      {`${proxyCount} ${
                        proxyCount === 1 ? i18n.substrateProxy.numberAccount : i18n.substrateProxy.numberAccounts
                      }`}
                    </Typography.Text>
                    <Icon phosphorIcon={InfoIcon} customSize={20} weight={'bold'} iconColor={theme.colorTextLight4} />
                  </TouchableOpacity>
                </MetaInfo.Default>

                <MetaInfo.Chain chain={chain} label={i18n.substrateProxy.network} />
              </MetaInfo>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                disabled={loading}
                style={styles.footerButtonLeft}
                type={'secondary'}
                onPress={() => navigation.goBack()}
                icon={
                  <Icon
                    phosphorIcon={XCircleIcon}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={loading ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }>
                {i18n.substrateProxy.cancel}
              </Button>
              <Button
                style={styles.footerButtonRight}
                disabled={!isBalanceReady || loading}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={CheckCircleIcon}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={!isBalanceReady || loading ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheck(onClickSubmit, ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT)}>
                {i18n.substrateProxy.continue}
              </Button>
            </View>

            <SubstrateProxyAccountListModal
              substrateProxyAccounts={selectedProxyAccounts as SubstrateProxyAccountItem[]}
              modalVisible={listModalVisible}
              setModalVisible={setListModalVisible}
            />
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone
          transactionDoneInfo={transactionDoneInfo}
          extrinsicType={ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT}
        />
      )}
    </>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
    },
    proxyCountValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    proxyCountText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    footer: {
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      flexDirection: 'row',
      ...MarginBottomForSubmitButton,
    },
    footerButtonLeft: {
      flex: 1,
      marginRight: 4,
    },
    footerButtonRight: {
      flex: 1,
      marginLeft: 4,
    },
  });
}

export default RemoveSubstrateProxyAccount;
