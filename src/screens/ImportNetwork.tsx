import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useFormControl from 'hooks/screen/useFormControl';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Keyboard, View } from 'react-native';
import InputText from 'components/Input/InputText';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import {
  FloppyDiskBack,
  Globe,
  GlobeHemisphereEast,
  Rocket,
  ShareNetwork,
  WifiHigh,
  WifiSlash,
} from 'phosphor-react-native';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { ValidateStatus } from '@subwallet/react-ui/es/form/FormItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { isUrl } from 'utils/index';
import { upsertChain, validateCustomChain } from '../messaging';
import { _CHAIN_VALIDATION_ERROR } from '@subwallet/extension-base/services/chain-service/handler/types';
import { _generateCustomProviderKey } from '@subwallet/extension-base/services/chain-service/utils';
import { _NetworkUpsertParams } from '@subwallet/extension-base/services/chain-service/types';
import { useToast } from 'react-native-toast-notifications';
import { HIDE_MODAL_DURATION } from 'constants/index';
import i18n from 'utils/i18n/i18n';

interface ValidationInfo {
  status: ValidateStatus;
  message?: string[];
}

export const ImportNetwork = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const [loading, setLoading] = useState(false);
  const [isPureEvmChain, setIsPureEvmChain] = useState(false);
  const [isShowConnectionStatus, setIsShowConnectionStatus] = useState(false);
  const [providerValidation, setProviderValidation] = useState<ValidationInfo>({ status: '' });
  const [isValidating, setIsValidating] = useState(false);
  const [genesisHash, setGenesisHash] = useState('');
  const [existentialDeposit, setExistentialDeposit] = useState('0');
  const toast = useToast();

  const handleErrorMessage = useCallback((errorCode: _CHAIN_VALIDATION_ERROR) => {
    switch (errorCode) {
      case _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE:
        return [i18n.errorMessage.cannotConnectToThisProvider];
      case _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER:
        return [i18n.errorMessage.thisChainHasAlreadyBeenAdded];
      case _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN:
        return [i18n.errorMessage.thisChainHasAlreadyBeenAdded];
      default:
        return [i18n.errorMessage.validateProviderError];
    }
  }, []);

  const blockExplorerValidator = useCallback((value: string) => {
    if (value.length === 0 || isUrl(value)) {
      return [];
    } else {
      return [i18n.errorMessage.blockExplorerMustBeAValidUrl];
    }
  }, []);

  const crowdloanValidator = useCallback((value: string) => {
    if (value.length === 0 || isUrl(value)) {
      return [];
    } else {
      return [i18n.errorMessage.crowdloanUrlMustBeAValidUrl];
    }
  }, []);

  const formConfig = useMemo(
    () => ({
      provider: {
        name: i18n.importNetwork.providerUrl,
        value: '',
        require: true,
      },
      name: {
        name: i18n.importNetwork.chainName,
        value: '',
        require: true,
      },
      addressPrefix: {
        name: i18n.importNetwork.addressPrefix,
        value: '',
      },
      paraId: {
        name: i18n.importNetwork.paraId,
        value: '',
      },
      evmChainId: {
        name: i18n.importNetwork.evmChainId,
        value: '',
      },
      decimals: {
        name: i18n.importNetwork.decimal,
        value: '',
      },
      symbol: {
        name: i18n.importNetwork.symbol,
        value: '',
        require: true,
      },
      priceId: {
        name: i18n.importNetwork.priceId,
        value: '',
      },
      type: {
        name: i18n.importNetwork.chainType,
        value: '',
        require: true,
      },
      blockExplorer: {
        name: i18n.importNetwork.blockExplorer,
        value: '',
        validateFunc: blockExplorerValidator,
      },
      crowdloanUrl: {
        name: i18n.importNetwork.crowdloanUrl,
        value: '',
        validateFunc: crowdloanValidator,
      },
    }),
    [blockExplorerValidator, crowdloanValidator],
  );

  const onSubmit = () => {
    setLoading(true);
    const {
      blockExplorer,
      crowdloanUrl,
      provider,
      decimals,
      symbol,
      addressPrefix,
      paraId,
      evmChainId,
      name,
      priceId,
    } = formState.data;
    const newProviderKey = _generateCustomProviderKey(0);
    const params: _NetworkUpsertParams = {
      mode: 'insert',
      chainEditInfo: {
        slug: '',
        currentProvider: newProviderKey,
        providers: { [newProviderKey]: provider },
        blockExplorer,
        crowdloanUrl,
        symbol,
        chainType: isPureEvmChain ? 'EVM' : 'Substrate',
        name,
        priceId,
      },
      chainSpec: {
        genesisHash,
        decimals: Number(decimals),
        addressPrefix: Number(addressPrefix),
        paraId: Number(paraId),
        evmChainId: Number(evmChainId),
        existentialDeposit,
      },
    };

    upsertChain(params)
      .then(result => {
        setLoading(false);
        if (result) {
          toast.show(i18n.notificationMessage.importedChainSuccessfully, { type: 'success' });
          navigation.goBack();
        } else {
          toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
        }
      })
      .catch(() => {
        setLoading(false);
        toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  useEffect(() => {
    setTimeout(() => {
      focus('provider')();
    }, HIDE_MODAL_DURATION);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isSubmitDisabled = useCallback(() => {
    return providerValidation.status !== 'success';
  }, [providerValidation.status]);

  const providerValidateFunc = useCallback(
    (provider: string) => {
      if (isUrl(provider)) {
        setIsShowConnectionStatus(true);
        setIsValidating(true);
        const parsedProvider = provider.split(' ').join('');

        validateCustomChain(parsedProvider)
          .then(result => {
            setIsValidating(false);

            if (result.success) {
              setProviderValidation({ status: 'success' });

              if (result.evmChainId) {
                setIsPureEvmChain(true);
                onChangeValue('evmChainId')(result.evmChainId.toString());
                onChangeValue('type')('EVM');
              } else {
                setIsPureEvmChain(false);
                onChangeValue('addressPrefix')(result.addressPrefix);
                onChangeValue('paraId')(result.paraId?.toString() || '');
                onChangeValue('type')('Substrate');
                setGenesisHash(result.genesisHash);
                setExistentialDeposit(result.existentialDeposit);
              }

              onChangeValue('decimals')(result.decimals.toString());
              onChangeValue('name')(result.name);
              onChangeValue('symbol')(result.symbol);

              onUpdateErrors('provider')([]);
            }

            if (result.error) {
              if (result.evmChainId) {
                setIsPureEvmChain(true);
                onChangeValue('evmChainId')(result.evmChainId.toString());
                onChangeValue('type')('EVM');
              } else {
                setIsPureEvmChain(false);
                onChangeValue('addressPrefix')(result.addressPrefix);
                onChangeValue('paraId')(result.paraId?.toString() || '');
                onChangeValue('type')('Substrate');
                setGenesisHash(result.genesisHash);
                setExistentialDeposit(result.existentialDeposit);
              }

              onChangeValue('decimals')(result.decimals.toString());
              onChangeValue('name')(result.name);
              onChangeValue('symbol')(result.symbol);

              setProviderValidation({ status: 'error', message: handleErrorMessage(result.error) });
              onUpdateErrors('provider')(handleErrorMessage(result.error));
            }
          })
          .catch(() => {
            setIsValidating(false);
            setProviderValidation({ status: 'error', message: [i18n.errorMessage.validateProviderError] });
            onUpdateErrors('provider')([i18n.errorMessage.validateProviderError]);
          });
      } else {
        setProviderValidation({ status: '' });
        setIsShowConnectionStatus(false);
        onUpdateErrors('provider')([i18n.errorMessage.invalidProviderUrl]);
      }
    },
    [handleErrorMessage, onChangeValue, onUpdateErrors],
  );

  const providerSuffix = useCallback(() => {
    if (!isShowConnectionStatus) {
      return <></>;
    }

    if (providerValidation.status === 'success') {
      return (
        <Icon size={'sm'} iconColor={theme.colorSuccess} phosphorIcon={WifiHigh} type={'phosphor'} weight={'bold'} />
      );
    }

    if (isValidating) {
      return <ActivityIndicator size={20} indicatorColor={theme.colorTextLight5} />;
    }

    if (providerValidation.status === 'error') {
      return <Icon size="sm" iconColor={theme['gray-4']} phosphorIcon={WifiSlash} type={'phosphor'} weight={'bold'} />;
    }

    return <></>;
  }, [isShowConnectionStatus, isValidating, providerValidation.status, theme]);

  return (
    <ContainerWithSubHeader onPressBack={() => navigation.goBack()} title={i18n.header.importNetwork}>
      <View style={{ ...ContainerHorizontalPadding, paddingTop: 16, flex: 1 }}>
        <InputText
          leftIcon={ShareNetwork}
          placeholder={formState.labels.provider}
          ref={formState.refs.provider}
          value={formState.data.provider}
          onSubmitField={Keyboard.dismiss}
          onChangeText={onChangeValue('provider')}
          rightIcon={<View style={{ position: 'absolute', right: 12, top: 14 }}>{providerSuffix()}</View>}
          errorMessages={formState.errors.provider}
          onBlur={() => providerValidateFunc(formState.data.provider)}
          isBusy={loading}
        />

        <View style={{ flexDirection: 'row' }}>
          <InputText
            containerStyle={{ flex: 2, marginRight: 6 }}
            leftIcon={Globe}
            placeholder={formState.labels.name}
            ref={formState.refs.name}
            value={formState.data.name}
            onSubmitField={onSubmitField('name')}
            onChangeText={onChangeValue('name')}
            isBusy={true}
          />

          <InputText
            containerStyle={{ flex: 1, marginLeft: 6 }}
            placeholder={formState.labels.symbol}
            ref={formState.refs.symbol}
            value={formState.data.symbol}
            onSubmitField={onSubmitField('symbol')}
            onChangeText={onChangeValue('symbol')}
            isBusy={true}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <InputText
            containerStyle={{ flex: 1, marginRight: 6 }}
            placeholder={formState.labels.priceId}
            ref={formState.refs.priceId}
            value={formState.data.priceId}
            onSubmitField={onSubmitField('priceId')}
            onChangeText={onChangeValue('priceId')}
          />

          <InputText
            containerStyle={{ flex: 1, marginLeft: 6 }}
            placeholder={formState.labels.type}
            ref={formState.refs.type}
            value={formState.data.type}
            onSubmitField={onSubmitField('type')}
            onChangeText={onChangeValue('type')}
            isBusy={true}
          />
        </View>

        <InputText
          leftIcon={GlobeHemisphereEast}
          placeholder={formState.labels.blockExplorer}
          ref={formState.refs.blockExplorer}
          value={formState.data.blockExplorer}
          onSubmitField={onSubmitField('blockExplorer')}
          onChangeText={onChangeValue('blockExplorer')}
        />

        <InputText
          leftIcon={Rocket}
          placeholder={formState.labels.crowdloanUrl}
          ref={formState.refs.crowdloanUrl}
          value={formState.data.crowdloanUrl}
          onSubmitField={onSubmitField('crowdloanUrl')}
          onChangeText={onChangeValue('crowdloanUrl')}
        />
      </View>

      <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton }}>
        <Button
          loading={loading}
          disabled={isSubmitDisabled()}
          onPress={onSubmit}
          icon={
            <Icon
              phosphorIcon={FloppyDiskBack}
              size={'lg'}
              weight={'fill'}
              iconColor={isSubmitDisabled() ? theme.colorTextLight5 : theme.colorWhite}
            />
          }>
          {i18n.buttonTitles.save}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};
