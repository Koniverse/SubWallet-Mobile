import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CaretDownIcon, InfoIcon } from 'phosphor-react-native';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResponse, SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { ExcludedSubstrateProxyAccounts, RequestRemoveSubstrateProxyAccount } from '@subwallet/extension-base/types';
import { InitMultisigTxResponse } from '@subwallet/extension-base/types/multisig';
import { ActivityIndicator, Icon, SwModal, Typography } from 'components/design-system-ui';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import MetaInfo from 'components/MetaInfo';
import { WrappedTransactionSignerSelectorModal } from 'components/Modal/Selector/WrappedTransactionSignerSelectorModal';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { useGetWrappedTransactionSigners } from 'hooks/transaction/useGetWrappedTransactionSigners';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { initMultisigTx } from 'messaging/transaction/multisig';
import { handleSubstrateProxyWrappedTxRequest } from 'messaging/transaction/substrateProxy';
import { ThemeTypes } from 'styles/themes';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { WrappedTransactionSigner } from 'types/wrappedTransaction';
import i18n from 'utils/i18n/i18n';
import { toShort } from 'utils/index';

interface Props {
  transaction: SWTransactionResult;
  setDisable: (disabled: boolean) => void;
}

/**
 * Rendered above the sign buttons whenever the backend flags a transaction as
 * *wrapped* — i.e. the sender is a proxied account or a multisig account and some
 * other account has to sign. Picking a signer here rebuilds the extrinsic on the
 * backend (`substrateProxyAccount.handleProxyWrappedTx` or `multisig.initMultisigTx`)
 * and only then is the Approve button enabled.
 */
const WrappedTransactionInfoArea = ({ setDisable, transaction }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const account = useGetAccountByAddress(transaction.address);
  const getWrappedTransactionSigners = useGetWrappedTransactionSigners();

  const [signerSelected, setSignerSelected] = useState<WrappedTransactionSigner | null>(null);
  const [signerItems, setSignerItems] = useState<WrappedTransactionSigner[] | null>(null);
  const [wrapTransactionInfo, setWrapTransactionInfo] = useState<SWTransactionResponse | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [isWrapTransactionLoading, setIsWrapTransactionLoading] = useState(false);
  const [isGetSignableLoading, setIsGetSignableLoading] = useState(false);
  const [selectorModalVisible, setSelectorModalVisible] = useState(false);
  const [callDataModalVisible, setCallDataModalVisible] = useState(false);
  const onCloseCallDataModal = useCallback(() => setCallDataModalVisible(false), []);

  const signerAccount = useGetAccountByAddress(signerSelected?.address || '');

  // When removing proxies, the proxies being removed must not be offered as signers.
  const excludedSubstrateProxyAccounts = useMemo<ExcludedSubstrateProxyAccounts[] | undefined>(() => {
    if (transaction.extrinsicType === ExtrinsicType.REMOVE_SUBSTRATE_PROXY_ACCOUNT) {
      const removeSubstrateProxyTransaction = transaction.data as RequestRemoveSubstrateProxyAccount;

      return removeSubstrateProxyTransaction?.selectedSubstrateProxyAccounts;
    }

    return undefined;
  }, [transaction.data, transaction.extrinsicType]);

  const descriptionContent = useMemo(() => {
    if (!!transaction.wrappingStatus && account?.isMultisig && signerSelected?.kind === 'signatory' && signerAccount) {
      return i18n.formatString(i18n.multisig.initiationDescription, signerAccount.name || '') as string;
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_EXECUTE_TX) {
      return i18n.multisig.executionDescription;
    }

    if (transaction.extrinsicType === ExtrinsicType.MULTISIG_CANCEL_TX) {
      return i18n.multisig.cancelDescription;
    }

    return null;
  }, [account?.isMultisig, signerAccount, signerSelected?.kind, transaction.extrinsicType, transaction.wrappingStatus]);

  const wrapTransactionData = useMemo(() => {
    if (!wrapTransactionInfo) {
      return null;
    }

    return wrapTransactionInfo.data as InitMultisigTxResponse;
  }, [wrapTransactionInfo]);

  useEffect(() => {
    let sync = true;

    if (!transaction || !account || !transaction.wrappingStatus) {
      return;
    }

    setIsGetSignableLoading(true);

    getWrappedTransactionSigners({
      extrinsicType: transaction.extrinsicType,
      chainSlug: transaction.chain,
      targetAddress: transaction.address,
      excludedSubstrateProxyAccounts,
    })
      .then(result => {
        if (sync) {
          setSignerItems(result);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (sync) {
          setIsGetSignableLoading(false);
        }
      });

    return () => {
      sync = false;
    };
    // `transaction.id` identifies the request; the rest of the object is stable for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction.id, account, excludedSubstrateProxyAccounts, getWrappedTransactionSigners]);

  const prepareTransaction = useCallback(
    async (signer: WrappedTransactionSigner) => {
      try {
        setIsWrapTransactionLoading(true);
        setTransactionError(null);
        setDisable(true);

        let transactionResponse: SWTransactionResponse;

        if (signer.kind === 'substrate_proxy') {
          transactionResponse = await handleSubstrateProxyWrappedTxRequest({
            transactionId: transaction.id,
            signer: signer.address,
            chain: transaction.chain,
            proxyMetadata: {
              proxiedAddress: transaction.address,
            },
          });
        } else {
          transactionResponse = await initMultisigTx({
            transactionId: transaction.id,
            signer: signer.address,
            chain: transaction.chain,
            multisigMetadata: {
              multisigAddress: transaction.address,
              threshold: account?.threshold || 0,
              signers: account?.signers || [],
            },
          });
        }

        setWrapTransactionInfo(transactionResponse);

        if (transactionResponse.errors?.length) {
          setTransactionError(transactionResponse.errors[0].message);
        } else {
          setDisable(false);
        }
      } catch (e) {
        // Building the wrapped extrinsic can fail on the node side (fee estimation,
        // runtime errors). Surface it — otherwise Approve just stays dead with no reason.
        console.error(e);
        setTransactionError(e instanceof Error ? e.message : String(e));
      }
    },
    [account, setDisable, transaction.address, transaction.chain, transaction.id],
  );

  const onSelectSigner = useCallback(
    (selected: WrappedTransactionSigner) => {
      setSignerSelected(prevState => {
        if (prevState?.address !== selected.address) {
          prepareTransaction(selected).finally(() => setIsWrapTransactionLoading(false));
        }

        return selected;
      });
      setSelectorModalVisible(false);
    },
    [prepareTransaction],
  );

  const isSelectorDisable = isGetSignableLoading || isWrapTransactionLoading;

  const onOpenSelectSignerModal = useCallback(() => setSelectorModalVisible(true), []);

  if (!transaction.wrappingStatus) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {!signerAccount ? (
        <TouchableOpacity
          activeOpacity={1}
          disabled={isSelectorDisable}
          style={styles.placeholderContainer}
          onPress={onOpenSelectSignerModal}>
          <View style={styles.placeholderLeft}>
            <AccountProxyAvatar size={24} value={''} />
            <Typography.Text style={styles.placeholderText}>{i18n.multisig.selectAccountToSign}</Typography.Text>
          </View>
          {isSelectorDisable ? (
            <ActivityIndicator size={20} />
          ) : (
            <Icon phosphorIcon={CaretDownIcon} size={'sm'} iconColor={theme.colorTextLight4} />
          )}
        </TouchableOpacity>
      ) : (
        <>
          <MetaInfo hasBackgroundWrapper spaceSize={'xs'}>
            <MetaInfo.Default label={i18n.multisig.signWith}>
              <TouchableOpacity
                activeOpacity={1}
                disabled={isSelectorDisable}
                style={styles.signerValue}
                onPress={onOpenSelectSignerModal}>
                <AccountProxyAvatar size={24} value={signerAccount.proxyId} />
                <Typography.Text ellipsis style={styles.signerName}>
                  {signerAccount.name}
                </Typography.Text>
                <Icon phosphorIcon={CaretDownIcon} customSize={18} iconColor={theme.colorTextLight4} />
              </TouchableOpacity>
            </MetaInfo.Default>

            {isWrapTransactionLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size={32} />
              </View>
            )}

            {!!wrapTransactionData && !isWrapTransactionLoading && (
              <>
                {wrapTransactionData.depositAmount != null && (
                  <MetaInfo.Number
                    label={i18n.multisig.depositLabel}
                    value={wrapTransactionData.depositAmount}
                    decimals={decimals}
                    suffix={symbol}
                  />
                )}

                <MetaInfo.Number
                  label={i18n.multisig.networkFee}
                  value={wrapTransactionData.networkFee || transaction.estimateFee?.value || 0}
                  decimals={decimals}
                  suffix={symbol}
                />

                {wrapTransactionData.callData != null && (
                  <MetaInfo.Default label={i18n.multisig.callData}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={styles.callDataValue}
                      onPress={() => setCallDataModalVisible(true)}>
                      <Typography.Text style={styles.callDataText}>
                        {toShort(wrapTransactionData.callData, 5, 5)}
                      </Typography.Text>
                      <Icon phosphorIcon={InfoIcon} customSize={18} iconColor={theme.colorTextLight4} />
                    </TouchableOpacity>
                  </MetaInfo.Default>
                )}
              </>
            )}
          </MetaInfo>

          {!!descriptionContent && <Typography.Text style={styles.description}>{descriptionContent}</Typography.Text>}

          {!!transactionError && (
            <View style={styles.errorContainer}>
              <AlertBox type={'warning'} title={i18n.warningTitle.warning} description={transactionError} />
            </View>
          )}
        </>
      )}

      <SwModal
        modalVisible={callDataModalVisible}
        setVisible={setCallDataModalVisible}
        onChangeModalVisible={onCloseCallDataModal}
        onBackButtonPress={onCloseCallDataModal}
        modalTitle={i18n.multisig.transactionDetails}
        titleTextAlign={'center'}
        isUseForceHidden={false}>
        <ScrollView style={styles.callDataDetail} showsVerticalScrollIndicator={false}>
          <Typography.Text style={styles.callDataDetailText}>
            {JSON.stringify(wrapTransactionData?.decodedCallData || '', null, 2)}
          </Typography.Text>
        </ScrollView>
      </SwModal>

      {!!signerItems && (
        <WrappedTransactionSignerSelectorModal
          chainSlug={transaction.chain}
          targetAddress={transaction.address}
          selectedSigner={signerSelected}
          signerItems={signerItems}
          onSelectSigner={onSelectSigner}
          modalVisible={selectorModalVisible}
          setModalVisible={setSelectorModalVisible}
        />
      )}
    </View>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    placeholderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      paddingHorizontal: theme.paddingSM,
      height: 48,
    },
    placeholderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    placeholderText: {
      ...FontMedium,
      color: theme.colorTextLight4,
    },
    signerValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXS,
    },
    signerName: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      maxWidth: 110,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: theme.padding,
    },
    callDataValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.sizeXXS,
    },
    callDataText: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    description: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      marginTop: theme.marginSM,
      color: theme.colorTextLight4,
    },
    errorContainer: {
      marginTop: theme.marginSM,
    },
    callDataDetail: {
      width: '100%',
      maxHeight: 264,
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      padding: theme.paddingSM,
      marginVertical: theme.margin,
    },
    callDataDetailText: {
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeLG - 1,
    },
  });
}

export default WrappedTransactionInfoArea;
