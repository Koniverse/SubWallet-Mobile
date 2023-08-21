import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useNavigation } from '@react-navigation/native';
import { ConfigureTokenProps, RootNavigationProps } from 'routes/index';
import { AddressField } from 'components/Field/Address';
import { NetworkField } from 'components/Field/Network';
import InputText from 'components/Input/InputText';
import { TextField } from 'components/Field/Text';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  _getContractAddressOfToken,
  _isCustomAsset,
  _isSmartContractToken,
} from '@subwallet/extension-base/services/chain-service/utils';
import { ContainerHorizontalPadding, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { CopySimple, Pencil, Sun, Trash } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import i18n from 'utils/i18n/i18n';
import { useToast } from 'react-native-toast-notifications';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { deleteCustomAssets, upsertCustomToken } from '../../messaging';
import { Warning } from 'components/Warning';
import { WebRunnerContext } from 'providers/contexts';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { TokenSelectField } from 'components/Field/TokenSelect';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { getTokenLogo } from 'utils/index';
import Tag from '../../components/design-system-ui/tag';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import DeleteModal from 'components/common/Modal/DeleteModal';
import useGetChainAssetInfo from 'hooks/common/userGetChainAssetInfo';

export const ConfigureToken = ({
  route: {
    params: { tokenDetail },
  },
}: ConfigureTokenProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const toast = useToast();
  const customTokenInfo = JSON.parse(tokenDetail) as _ChainAsset;
  const navigation = useNavigation<RootNavigationProps>();
  const [isBusy, setBusy] = useState<boolean>(false);
  const tokenInfo = useGetChainAssetInfo(customTokenInfo.slug) as _ChainAsset | undefined;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const formConfig = {
    tokenName: {
      name: i18n.importToken.tokenName,
      value: tokenInfo?.symbol || '',
    },
  };

  const showToast = useCallback(
    (message: string, type?: 'normal' | 'success' | 'danger' | 'warning' | '') => {
      toast.hideAll();
      toast.show(message, { type: type });
    },
    [toast],
  );

  const handleDeleteToken = useCallback(() => {
    deleteCustomAssets(tokenInfo?.slug || '')
      .then(result => {
        if (result) {
          navigation.goBack();
          showToast(i18n.common.importTokenSuccessMessage, 'success');
        } else {
          showToast(i18n.errorMessage.occurredError, 'danger');
        }
      })
      .catch(() => {
        showToast(i18n.errorMessage.occurredError, 'danger');
      });
  }, [navigation, showToast, tokenInfo?.slug]);

  const onSubmit = (formState: FormState) => {
    if (tokenInfo) {
      const newTokenInfo = {
        ...tokenInfo,
        name: formState.data.tokenName,
      };
      setBusy(true);
      if (!isNetConnected) {
        setBusy(false);
        return;
      }
      upsertCustomToken(newTokenInfo)
        .then(resp => {
          if (resp) {
            navigation.goBack();
          } else {
            onUpdateErrors('tokenName')([i18n.errorMessage.occurredError]);
          }
          setBusy(false);
        })
        .catch(() => {
          setBusy(false);
          console.error();
        });
    }
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  const tagNode = useMemo(() => {
    if (!tokenInfo) {
      return null;
    }

    if (!tokenInfo.hasValue || _isCustomAsset(tokenInfo.slug || '')) {
      let label;
      let icon;
      let color;

      if (!tokenInfo.hasValue) {
        label = 'Testnet';
        icon = Sun;
        color = 'lime';
      } else {
        label = 'Custom';
        icon = Pencil;
        color = 'cyan';
      }

      return (
        <View style={{ paddingTop: theme.paddingXS, alignItems: 'center' }}>
          <Tag
            bgType={'default'}
            closable={false}
            color={color}
            icon={<Icon phosphorIcon={icon} size={'xxs'} iconColor={theme[`${color}-7`]} />}>
            {label}
          </Tag>
        </View>
      );
    }

    return null;
  }, [theme, tokenInfo]);

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
    setVisible,
  } = useConfirmModal(handleDeleteToken);

  return (
    <ContainerWithSubHeader
      onPressBack={() => navigation.goBack()}
      title={i18n.header.tokenDetails}
      disabled={isBusy}
      rightIcon={Trash}
      onPressRightIcon={onPressDelete}
      disableRightButton={!tokenInfo || !(_isCustomAsset(tokenInfo?.slug || '') && _isSmartContractToken(tokenInfo))}>
      <View style={{ flex: 1, ...ContainerHorizontalPadding }}>
        <ScrollView style={{ width: '100%', flex: 1 }}>
          <View style={styles.logoWrapper}>{getTokenLogo(tokenInfo?.symbol || '', undefined, 112)}</View>
          {!!tokenInfo?.symbol && <Typography.Text style={styles.symbol}>{tokenInfo.symbol}</Typography.Text>}
          {tagNode}
          <View style={{ height: theme.sizeLG }} />

          {tokenInfo && _isSmartContractToken(tokenInfo) && (
            <AddressField
              label={i18n.importToken.contractAddress}
              address={_getContractAddressOfToken(tokenInfo)}
              rightIcon={CopySimple}
              disableText
              onPressRightIcon={() => copyToClipboard(_getContractAddressOfToken(tokenInfo))}
              outerStyle={{ marginBottom: theme.marginSM }}
            />
          )}
          <NetworkField
            disabled
            label={i18n.inputLabel.network}
            networkKey={tokenInfo?.originChain || ''}
            outerStyle={{ marginBottom: theme.marginSM }}
          />
          {!!tokenInfo && !tokenInfo.assetType && (
            <InputText
              ref={formState.refs.tokenName}
              label={formState.labels.tokenName}
              value={formState.data.tokenName}
              onSubmitField={onSubmitField('tokenName')}
              onChangeText={onChangeValue('tokenName')}
            />
          )}

          <View style={styles.row}>
            {tokenInfo && tokenInfo.symbol && (
              <TokenSelectField
                disabled
                value={tokenInfo.symbol}
                logoKey={tokenInfo.symbol}
                outerStyle={{ flex: 1, marginBottom: 0 }}
              />
            )}

            {tokenInfo && tokenInfo.decimals && (
              <TextField disabled text={tokenInfo.decimals.toString()} outerStyle={{ flex: 1, marginBottom: 0 }} />
            )}
          </View>

          {!!tokenInfo?.priceId && <TextField disabled text={tokenInfo.priceId} />}

          {!isNetConnected && (
            <Warning style={{ marginBottom: 8 }} isDanger message={i18n.warningMessage.noInternetMessage} />
          )}
        </ScrollView>
        {tokenInfo && _isCustomAsset(tokenInfo.slug) && (
          <View style={{ flexDirection: 'row', paddingTop: 27, ...MarginBottomForSubmitButton }}>
            <Button
              type={'secondary'}
              disabled={isBusy}
              style={{ flex: 1, marginRight: 6 }}
              onPress={() => navigation.goBack()}>
              {i18n.common.cancel}
            </Button>
            <Button
              disabled={!isNetConnected}
              loading={isBusy}
              style={{ flex: 1, marginLeft: 6 }}
              onPress={() => onSubmit(formState)}>
              {i18n.common.save}
            </Button>
          </View>
        )}
      </View>

      <DeleteModal
        title={i18n.header.deleteToken}
        visible={deleteVisible}
        message={i18n.message.deleteTokenMessage}
        onCompleteModal={onCompleteDeleteModal}
        onCancelModal={onCancelDelete}
        setVisible={setVisible}
      />
    </ContainerWithSubHeader>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    logoWrapper: {
      paddingTop: 28,
      paddingBottom: 20,
      alignItems: 'center',
    },
    symbol: {
      ...FontSemiBold,
      fontSize: theme.fontSizeHeading3,
      lineHeight: theme.fontSizeHeading3 * theme.lineHeightHeading3,
      color: theme.colorTextLight1,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      gap: theme.sizeSM,
      marginBottom: theme.marginSM,
    },
  });
}
