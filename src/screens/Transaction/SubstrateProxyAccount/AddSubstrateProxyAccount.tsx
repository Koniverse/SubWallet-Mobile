import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { TreeStructureIcon } from 'phosphor-react-native';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ActionType } from '@subwallet/extension-base/core/types';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { SubstrateProxyType } from '@subwallet/extension-base/types';
import { Button, Icon, Number, Typography } from 'components/design-system-ui';
import { NetworkField } from 'components/Field/Network';
import { FormItem } from 'components/common/FormItem';
import { InputAddress } from 'components/Input/InputAddress';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import usePreCheckAction from 'hooks/account/usePreCheckAction';
import useHandleSubmitTransaction from 'hooks/transaction/useHandleSubmitTransaction';
import { useGetSubstrateProxyAccountGroupByAddress } from 'hooks/substrateProxyAccount';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransaction';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { handleAddSubstrateProxyAccount } from 'messaging/transaction/substrateProxy';
import { AddSubstrateProxyProps } from 'routes/transaction/transactionAction';
import { GeneralFreeBalance } from 'screens/Transaction/parts/GeneralFreeBalance';
import { SubstrateProxyTypeSelector } from 'screens/Transaction/parts/SubstrateProxyTypeSelector';
import { TransactionLayout } from 'screens/Transaction/parts/TransactionLayout';
import { TransactionDone } from 'screens/Transaction/TransactionDone';
import { RootState } from 'stores/index';
import { FontMedium, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { ChainInfo } from 'types/index';
import { ModalRef } from 'types/modalRef';
import { findAccountByAddress } from 'utils/account/account';
import { validateRecipientAddress } from 'utils/core/logic-validation/recipientAddress';
import i18n from 'utils/i18n/i18n';
import { mmkvStore } from 'utils/storage';
import { CURRENT_CHAIN_SUBSTRATE_PROXY } from 'constants/localStorage';

interface AddSubstrateProxyFormValues extends TransactionFormValues {
  substrateProxyAddress: string;
  substrateProxyType: SubstrateProxyType;
}

export const AddSubstrateProxyAccount = ({
  route: {
    params: { chain, from },
  },
}: AddSubstrateProxyProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { accounts } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state: RootState) => state.chainStore);

  const [loading, setLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(true);
  const [isTransactionDone, setTransactionDone] = useState(false);
  const chainSelectorRef = useRef<ModalRef | null>(null);

  const {
    title,
    onTransactionDone: onDone,
    onChangeChainValue: setChain,
    onChangeFromValue: setFrom,
    form: {
      control,
      setValue,
      handleSubmit,
      formState: { errors, isValid },
      clearErrors,
    },
    transactionDoneInfo,
  } = useTransaction<AddSubstrateProxyFormValues>('add-substrate-proxy', {
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      chain,
      from,
      substrateProxyAddress: '',
      substrateProxyType: 'Any',
    },
  });

  const chainValue = useWatch<AddSubstrateProxyFormValues>({ name: 'chain', control }) as string;
  const fromValue = useWatch<AddSubstrateProxyFormValues>({ name: 'from', control }) as string;
  const substrateProxyAddressValue = useWatch<AddSubstrateProxyFormValues>({
    name: 'substrateProxyAddress',
    control,
  }) as string;
  const substrateProxyTypeValue = useWatch<AddSubstrateProxyFormValues>({
    name: 'substrateProxyType',
    control,
  }) as SubstrateProxyType;

  const nativeToken = useGetNativeTokenBasicInfo(chainValue);
  const substrateProxyAccountGroup = useGetSubstrateProxyAccountGroupByAddress(fromValue, chainValue);
  const onPreCheck = usePreCheckAction(fromValue, true, undefined, chainValue);
  const { onError, onSuccess } = useHandleSubmitTransaction(onDone, setTransactionDone);

  // Only chains whose Substrate runtime exposes the proxy pallet can be selected.
  const chainItems = useMemo<ChainInfo[]>(() => {
    return Object.values(chainInfoMap)
      .filter((c: _ChainInfo) => c.substrateInfo?.supportProxy)
      .map((c: _ChainInfo) => ({ name: c.name, slug: c.slug }));
  }, [chainInfoMap]);

  const validateSubstrateProxyAddress = useCallback(
    (_proxyAddress: string): Promise<string | undefined> => {
      const destChainInfo = chainInfoMap[chainValue];
      const account = findAccountByAddress(accounts, _proxyAddress);

      return validateRecipientAddress({
        srcChain: chainValue,
        destChainInfo,
        fromAddress: fromValue,
        toAddress: _proxyAddress,
        account,
        actionType: ActionType.MANAGE_SUBSTRATE_PROXY_ACCOUNT,
        autoFormatValue: false,
        allowLedgerGenerics: ledgerGenericAllowNetworks,
      }).then(result => {
        if (!result) {
          return undefined;
        }

        return String(result)
          .replace(/recipient/gi, m => (m[0] === m[0].toUpperCase() ? 'Proxy' : 'proxy'))
          .replace(/sender/gi, m => (m[0] === m[0].toUpperCase() ? 'Proxied' : 'proxied'));
      });
    },
    [accounts, chainInfoMap, chainValue, fromValue, ledgerGenericAllowNetworks],
  );

  // The same (address, proxy type) pair cannot be added twice.
  const isDuplicatedProxy = useMemo(() => {
    if (!substrateProxyAddressValue || !substrateProxyAccountGroup.substrateProxyAccounts.length) {
      return false;
    }

    return substrateProxyAccountGroup.substrateProxyAccounts.some(
      p =>
        isSameAddress(substrateProxyAddressValue, p.substrateProxyAddress) &&
        p.substrateProxyType === substrateProxyTypeValue,
    );
  }, [substrateProxyAccountGroup.substrateProxyAccounts, substrateProxyAddressValue, substrateProxyTypeValue]);

  const onSelectProxyType = useCallback(
    (value: SubstrateProxyType) => setValue('substrateProxyType', value, { shouldValidate: true }),
    [setValue],
  );

  const onSubmit = useCallback(() => {
    setLoading(true);

    setTimeout(() => {
      handleAddSubstrateProxyAccount({
        address: fromValue,
        chain: chainValue,
        substrateProxyAddress: substrateProxyAddressValue,
        substrateProxyType: substrateProxyTypeValue,
        substrateProxyDeposit: substrateProxyAccountGroup.substrateProxyDeposit,
      })
        .then(onSuccess)
        .catch(onError)
        .finally(() => setLoading(false));
    }, 300);
  }, [
    chainValue,
    fromValue,
    onError,
    onSuccess,
    substrateProxyAccountGroup.substrateProxyDeposit,
    substrateProxyAddressValue,
    substrateProxyTypeValue,
  ]);

  useEffect(() => {
    setChain(chain);
    setFrom(from);
  }, [chain, from, setChain, setFrom]);

  // Keep the proxy management tab pointing at whichever chain was used here last.
  useEffect(() => {
    if (chainValue) {
      mmkvStore.set(CURRENT_CHAIN_SUBSTRATE_PROXY, chainValue);
    }
  }, [chainValue]);

  const isDisabled =
    loading || !isBalanceReady || !substrateProxyAddressValue || !isValid || isDuplicatedProxy || !!errors.substrateProxyAddress;

  return (
    <>
      {!isTransactionDone ? (
        <TransactionLayout title={title} disableLeftButton={loading} disableMainHeader={loading}>
          <>
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps={'handled'}>
              <ChainSelector
                items={chainItems}
                selectedValueMap={{ [chainValue]: true }}
                chainSelectorRef={chainSelectorRef}
                disabled={loading || !chainItems.length}
                onSelectItem={item => {
                  setChain(item.slug);
                  chainSelectorRef.current?.onCloseModal();
                }}
                renderSelected={() => (
                  <NetworkField
                    networkKey={chainValue}
                    label={i18n.substrateProxy.network}
                    placeholder={i18n.placeholder.selectChain}
                    showIcon
                  />
                )}
              />

              <FormItem
                style={{ marginBottom: theme.sizeXS }}
                control={control}
                name={'substrateProxyAddress'}
                rules={{
                  validate: validateSubstrateProxyAddress,
                }}
                render={({ field: { value, ref, onChange, onBlur } }) => (
                  <InputAddress
                    ref={ref}
                    label={i18n.substrateProxy.proxyAccount}
                    value={value}
                    onChangeText={text => {
                      clearErrors('substrateProxyAddress');
                      onChange(text);
                    }}
                    isValidValue={!errors.substrateProxyAddress}
                    onBlur={onBlur}
                    onSideEffectChange={onBlur}
                    placeholder={i18n.substrateProxy.enterAddress}
                    disabled={loading}
                    chain={chainValue}
                    showAddressBook
                    saveAddress
                  />
                )}
              />

              <SubstrateProxyTypeSelector
                chain={chainValue}
                value={substrateProxyTypeValue}
                label={i18n.substrateProxy.proxyType}
                disabled={loading}
                onSelectItem={onSelectProxyType}
              />

              {isDuplicatedProxy && (
                <Typography.Text style={styles.errorText}>{i18n.substrateProxy.proxyAlreadyExists}</Typography.Text>
              )}

              <GeneralFreeBalance
                address={fromValue}
                chain={chainValue}
                onBalanceReady={setIsBalanceReady}
                style={{ marginBottom: theme.marginXXS }}
              />

              <Number
                value={substrateProxyAccountGroup.substrateProxyDeposit}
                decimal={nativeToken?.decimals || 0}
                prefix={`${i18n.substrateProxy.proxyDeposit}: `}
                suffix={nativeToken?.symbol}
                size={14}
                textStyle={FontMedium}
                intColor={theme['gray-5']}
                decimalColor={theme['gray-5']}
                unitColor={theme['gray-5']}
              />
            </ScrollView>

            <View style={styles.footer}>
              <Button
                style={styles.footerButton}
                disabled={isDisabled}
                loading={loading}
                icon={
                  <Icon
                    phosphorIcon={TreeStructureIcon}
                    weight={'fill'}
                    size={'lg'}
                    iconColor={isDisabled ? theme.colorTextLight5 : theme.colorWhite}
                  />
                }
                onPress={onPreCheck(handleSubmit(onSubmit), ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT)}>
                {i18n.substrateProxy.addProxy}
              </Button>
            </View>
          </>
        </TransactionLayout>
      ) : (
        <TransactionDone
          transactionDoneInfo={transactionDoneInfo}
          extrinsicType={ExtrinsicType.ADD_SUBSTRATE_PROXY_ACCOUNT}
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
    errorText: {
      ...FontMedium,
      color: theme.colorError,
      fontSize: theme.fontSizeSM,
      marginBottom: theme.marginXS,
    },
    footer: {
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      flexDirection: 'row',
      ...MarginBottomForSubmitButton,
    },
    footerButton: {
      flex: 1,
    },
  });
}

export default AddSubstrateProxyAccount;
