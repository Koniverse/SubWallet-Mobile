import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Globe, Info, WifiHigh, WifiSlash } from 'phosphor-react-native';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import InputText from 'components/Input/InputText';
import { AddProviderProps, RootNavigationProps } from 'routes/index';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import {
  _generateCustomProviderKey,
  _isChainEvmCompatible,
  _isCustomProvider,
  _isSubstrateChain,
} from '@subwallet/extension-base/services/chain-service/utils';
import { ValidateStatus } from '@subwallet/react-ui/es/form/FormItem';
import { _NetworkUpsertParams } from '@subwallet/extension-base/services/chain-service/types';
import { upsertChain, validateCustomChain } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import { useNavigation } from '@react-navigation/native';
import { _CHAIN_VALIDATION_ERROR } from '@subwallet/extension-base/services/chain-service/handler/types';
import { ActivityIndicator, Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { isUrl } from 'utils/index';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { HIDE_MODAL_DURATION } from 'constants/index';

interface ValidationInfo {
  status: ValidateStatus;
  message?: string[];
}

function parseProviders(newProvider: string, existingProviders: Record<string, string>) {
  let count = 0;

  Object.keys(existingProviders).forEach(providerKey => {
    if (_isCustomProvider(providerKey)) {
      count += 1;
    }
  });

  const newProviderKey = _generateCustomProviderKey(count);

  return {
    newProviderKey,
    newProviders: {
      ...existingProviders,
      [newProviderKey]: newProvider,
    },
  };
}

export const AddProvider = ({
  route: {
    params: { slug: chainSlug },
  },
}: AddProviderProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const chainInfo = useFetchChainInfo(chainSlug);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isShowConnectionStatus, setIsShowConnectionStatus] = useState(false);
  const [providerValidation, setProviderValidation] = useState<ValidationInfo>({ status: '' });

  const { symbol } = useGetNativeTokenBasicInfo(chainSlug);

  const chainType = useCallback(() => {
    let result = '';
    const types: string[] = [];

    if (_isSubstrateChain(chainInfo)) {
      types.push('Substrate');
    }

    if (_isChainEvmCompatible(chainInfo)) {
      types.push('EVM');
    }

    for (let i = 0; i < types.length; i++) {
      result = result.concat(types[i]);

      if (i !== types.length - 1) {
        result = result.concat(', ');
      }
    }

    return result;
  }, [chainInfo]);

  const formConfig: FormControlConfig = useMemo(() => {
    return {
      provider: {
        name: 'Provider',
        value: '',
        require: true,
      },
      name: {
        name: 'Chain',
        value: chainInfo.name,
      },
      symbol: {
        name: 'Symbol',
        value: symbol,
      },
      chainType: {
        name: 'Chain type',
        value: chainType(),
      },
    };
  }, [chainInfo.name, chainType, symbol]);

  const onSubmit = () => {
    setLoading(true);
    const newProvider = formState.data.provider;

    const { newProviderKey, newProviders } = parseProviders(newProvider.split(' ').join(''), chainInfo.providers);
    const params: _NetworkUpsertParams = {
      mode: 'update',
      chainEditInfo: {
        slug: chainInfo.slug,
        currentProvider: newProviderKey,
        providers: newProviders,
      },
    };

    upsertChain(params)
      .then(result => {
        setLoading(false);

        if (result) {
          toast.show('Added a provider successfully');
          navigation.goBack();
        } else {
          toast.show('An error occurred, please try again');
        }
      })
      .catch(() => {
        setLoading(false);
        toast.show('An error occurred, please try again');
      });
  };

  const { formState, onChangeValue, onUpdateErrors, focus } = useFormControl(formConfig, {
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

  const handleErrorMessage = useCallback((errorCode: _CHAIN_VALIDATION_ERROR) => {
    switch (errorCode) {
      case _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE:
        return ['Cannot connect to this provider'];
      case _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER:
        return ['This provider has already been added'];
      case _CHAIN_VALIDATION_ERROR.PROVIDER_NOT_SAME_CHAIN:
        return ['This provider is not for this chain'];
      default:
        return ['Error validating this provider'];
    }
  }, []);

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
      return <ActivityIndicator size={20} indicatorColor={theme.colorTextLight4} />;
    }

    if (providerValidation.status === 'error') {
      return (
        <Icon
          size={'sm'}
          iconColor={theme.colorTextLight4}
          phosphorIcon={WifiSlash}
          type={'phosphor'}
          weight={'bold'}
        />
      );
    }

    return <></>;
  }, [isShowConnectionStatus, isValidating, providerValidation.status, theme.colorSuccess, theme.colorTextLight4]);

  const providerValidator = useCallback(
    (provider: string) => {
      if (isUrl(provider)) {
        setIsShowConnectionStatus(true);
        setIsValidating(true);
        const parseProvider = provider.split(' ').join('');
        validateCustomChain(parseProvider, chainInfo.slug)
          .then(result => {
            setIsValidating(false);
            if (result.success) {
              setProviderValidation({ status: 'success' });
            }

            if (result.error) {
              onUpdateErrors('provider')(handleErrorMessage(result.error));
              setProviderValidation({ status: 'error', message: handleErrorMessage(result.error) });
            }
          })
          .catch(() => {
            setIsValidating(false);
            onUpdateErrors('provider')(['Error validating this provider']);
            setProviderValidation({ status: 'error', message: ['Error validating this provider'] });
          });
      }
    },
    [chainInfo.slug, handleErrorMessage, onUpdateErrors],
  );

  const onChangeProvider = (text: string) => {
    setProviderValidation({ status: 'validating' });
    onChangeValue('provider')(text);
  };

  return (
    <ContainerWithSubHeader
      showLeftBtn
      onPressBack={() => navigation.goBack()}
      rightIcon={Info}
      title={'Add new provider'}>
      <>
        <TouchableWithoutFeedback style={{ backgroundColor: 'red' }} onPress={() => Keyboard.dismiss()}>
          <View style={{ ...ContainerHorizontalPadding, paddingTop: 16, flex: 1 }}>
            <InputText
              ref={formState.refs.provider}
              value={formState.data.provider}
              onChangeText={onChangeProvider}
              errorMessages={formState.errors.provider}
              rightIcon={<View style={{ position: 'absolute', right: 12, top: 14 }}>{providerSuffix()}</View>}
              placeholder={formState.labels.provider}
              onSubmitField={Keyboard.dismiss}
              onBlur={() => providerValidator(formState.data.provider)}
            />

            <View style={{ flexDirection: 'row' }}>
              <InputText
                containerStyle={{ flex: 2, marginRight: 6 }}
                leftIcon={Globe}
                placeholder={formState.labels.name}
                ref={formState.refs.name}
                value={formState.data.name}
                onChangeText={onChangeValue('name')}
                isBusy={true}
              />

              <InputText
                containerStyle={{ flex: 1, marginLeft: 6 }}
                placeholder={formState.labels.symbol}
                ref={formState.refs.symbol}
                value={formState.data.symbol}
                onChangeText={onChangeValue('symbol')}
                isBusy={true}
              />
            </View>

            <InputText
              placeholder={formState.labels.chainType}
              ref={formState.refs.chainType}
              value={formState.data.chainType}
              onChangeText={onChangeValue('chainType')}
              isBusy={true}
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, flexDirection: 'row' }}>
          <Button type={'secondary'} style={{ flex: 1, marginRight: 6 }} onPress={() => navigation.goBack()}>
            {i18n.common.cancel}
          </Button>
          <Button style={{ flex: 1, marginLeft: 6 }} loading={loading} disabled={isSubmitDisabled()} onPress={onSubmit}>
            {i18n.common.save}
          </Button>
        </View>
      </>
    </ContainerWithSubHeader>
  );
};
