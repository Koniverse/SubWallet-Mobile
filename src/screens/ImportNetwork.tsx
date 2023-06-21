import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Keyboard, ScrollView, View } from 'react-native';
import {
  FloppyDiskBack,
  Globe,
  GlobeHemisphereEast,
  IconProps,
  Rocket,
  ShareNetwork,
  WifiHigh,
  WifiSlash,
} from 'phosphor-react-native';
import { ActivityIndicator, Button, Icon, Input } from 'components/design-system-ui';
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
import { useForm } from 'react-hook-form';
import { UseControllerProps } from 'react-hook-form/dist/types/controller';
import { FormItem } from 'components/common/FormItem';
import createStylesheet from './style/ImportNetwork';

type FormValues = {
  provider: string;
  name: string;
  symbol: string;
  decimals: string;
  type: string;
  addressPrefix: string;
  paraId: string;
  evmChainId: string;
  blockExplorer: string;
  crowdloanUrl: string;
  priceId: string;
};

const defaultFormValues: FormValues = {
  provider: '',
  name: '',
  symbol: '',
  decimals: '',
  type: '',
  addressPrefix: '',
  paraId: '',
  evmChainId: '',
  blockExplorer: '',
  crowdloanUrl: '',
  priceId: '',
};

const handleErrorMessage = (errorCode: _CHAIN_VALIDATION_ERROR) => {
  switch (errorCode) {
    case _CHAIN_VALIDATION_ERROR.CONNECTION_FAILURE:
      return i18n.errorMessage.cannotConnectToThisProvider;
    case _CHAIN_VALIDATION_ERROR.EXISTED_PROVIDER:
      return i18n.errorMessage.thisChainHasAlreadyBeenAdded;
    case _CHAIN_VALIDATION_ERROR.EXISTED_CHAIN:
      return i18n.errorMessage.thisChainHasAlreadyBeenAdded;
    default:
      return i18n.errorMessage.validateProviderError;
  }
};

export const ImportNetwork = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const [loading, setLoading] = useState(false);
  const [isPureEvmChain, setIsPureEvmChain] = useState(false);
  const [isShowConnectionStatus, setIsShowConnectionStatus] = useState(false);
  const [providerValidationStatus, setProviderValidationStatus] = useState<ValidateStatus>('');
  const [isValidating, setIsValidating] = useState(false);
  const [genesisHash, setGenesisHash] = useState('');
  const [existentialDeposit, setExistentialDeposit] = useState('0');
  const toast = useToast();
  const stylesheet = createStylesheet(theme);

  const blockExplorerValidator: UseControllerProps<FormValues>['rules'] = {
    validate: (value: string) => {
      if (value.length === 0 || isUrl(value)) {
        return true;
      }

      return i18n.errorMessage.blockExplorerMustBeAValidUrl;
    },
  };

  const crowdloanValidator: UseControllerProps<FormValues>['rules'] = {
    validate: (value: string) => {
      if (value.length === 0 || isUrl(value)) {
        return true;
      }

      return i18n.errorMessage.crowdloanUrlMustBeAValidUrl;
    },
  };

  const { control, handleSubmit, setFocus, trigger, setValue, clearErrors, setError, getValues } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: defaultFormValues,
  });

  const onSubmit = (data: FormValues) => {
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
    } = data;

    setLoading(true);
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

  const isSubmitDisabled = isValidating || loading || providerValidationStatus !== 'success';

  const validateProvider = useCallback(() => {
    const provider = getValues('provider');
    clearErrors('provider');
    if (isUrl(provider)) {
      setIsShowConnectionStatus(true);
      setIsValidating(true);
      const parsedProvider = provider.split(' ').join('');

      validateCustomChain(parsedProvider)
        .then(result => {
          setIsValidating(false);

          if (result.success) {
            setProviderValidationStatus('success');

            if (result.evmChainId) {
              setIsPureEvmChain(true);
              setValue('evmChainId', result.evmChainId.toString());
              setValue('type', 'EVM');
            } else {
              setIsPureEvmChain(false);
              setValue('addressPrefix', result.addressPrefix);
              setValue('paraId', result.paraId?.toString() || '');
              setValue('type', 'Substrate');
              setGenesisHash(result.genesisHash);
              setExistentialDeposit(result.existentialDeposit);
            }

            setValue('decimals', result.decimals.toString());
            setValue('name', result.name);
            setValue('symbol', result.symbol);
          }

          if (result.error) {
            if (result.evmChainId) {
              setIsPureEvmChain(true);
              setValue('evmChainId', result.evmChainId.toString());
              setValue('type', 'EVM');
            } else {
              setIsPureEvmChain(false);
              setValue('addressPrefix', result.addressPrefix);
              setValue('paraId', result.paraId?.toString() || '');
              setValue('type', 'Substrate');
              setGenesisHash(result.genesisHash);
              setExistentialDeposit(result.existentialDeposit);
            }

            setValue('decimals', result.decimals.toString());
            setValue('name', result.name);
            setValue('symbol', result.symbol);

            setProviderValidationStatus('error');

            setError('provider', {
              message: handleErrorMessage(result.error),
            });
          }
        })
        .catch(() => {
          setIsValidating(false);
          setProviderValidationStatus('error');
          setError('provider', {
            message: i18n.errorMessage.validateProviderError,
          });
        });
    } else {
      setProviderValidationStatus('');
      setIsShowConnectionStatus(false);
      setError('provider', {
        message: i18n.errorMessage.invalidProviderUrl,
      });
    }
  }, [clearErrors, getValues, setError, setValue]);

  const providerSuffix = useMemo(() => {
    if (!isShowConnectionStatus) {
      return undefined;
    }

    let icon;
    if (isValidating) {
      icon = <ActivityIndicator size={20} indicatorColor={theme.colorTextLight5} />;
    } else if (providerValidationStatus === 'success') {
      icon = (
        <Icon size={'sm'} iconColor={theme.colorSuccess} phosphorIcon={WifiHigh} type={'phosphor'} weight={'bold'} />
      );
    } else if (providerValidationStatus === 'error') {
      icon = <Icon size="sm" iconColor={theme['gray-4']} phosphorIcon={WifiSlash} type={'phosphor'} weight={'bold'} />;
    }

    if (icon) {
      return <View style={{ position: 'absolute', right: 12, top: 14 }}>{icon}</View>;
    }

    return undefined;
  }, [isShowConnectionStatus, isValidating, providerValidationStatus, theme]);

  const getInputLeftIcon = useCallback(
    (icon: React.ElementType<IconProps>) => {
      return (
        <View style={{ paddingLeft: 12, paddingRight: 8 }}>
          <Icon phosphorIcon={icon} size={'lg'} iconColor={theme['gray-3']} />
        </View>
      );
    },
    [theme],
  );

  useEffect(() => {
    setTimeout(() => {
      setFocus('provider');
    }, HIDE_MODAL_DURATION);
  }, [setFocus]);

  // todo: i18n
  return (
    <ContainerWithSubHeader onPressBack={() => navigation.goBack()} title={i18n.header.importNetwork}>
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        style={stylesheet.scrollView}
        contentContainerStyle={stylesheet.scrollViewContentContainer}>
        <FormItem
          control={control}
          render={({ field: { value, ref } }) => (
            <Input
              leftPart={getInputLeftIcon(ShareNetwork)}
              placeholder={'Provider URL'}
              ref={ref}
              value={value}
              onSubmitEditing={Keyboard.dismiss}
              inputStyle={[stylesheet.inputWithLeftIcon, { paddingRight: providerSuffix ? 44 : undefined }]}
              onChangeText={text => {
                setValue('provider', text, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: false,
                });
              }}
              rightPart={providerSuffix}
              onBlur={validateProvider}
              readonly={loading || isValidating}
            />
          )}
          name="provider"
        />

        <View style={stylesheet.row}>
          <FormItem
            control={control}
            style={stylesheet.flex2}
            render={({ field: { value, ref } }) => (
              <Input
                inputStyle={stylesheet.inputWithLeftIcon}
                leftPart={getInputLeftIcon(Globe)}
                placeholder={'Chain name'}
                ref={ref}
                value={value}
                readonly={true}
              />
            )}
            name="name"
          />

          <FormItem
            control={control}
            style={stylesheet.flex1}
            render={({ field: { value, ref } }) => (
              <Input placeholder={'Symbol'} ref={ref} value={value} readonly={true} />
            )}
            name="symbol"
          />
        </View>

        <View style={stylesheet.row}>
          <FormItem
            control={control}
            style={stylesheet.flex1}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                placeholder={'Price Id'}
                ref={ref}
                value={value}
                onBlur={onBlur}
                onSubmitEditing={async () => {
                  const isValid = await trigger('priceId');

                  if (isValid) {
                    setFocus('blockExplorer');
                  }
                }}
                onChangeText={onChange}
              />
            )}
            name="priceId"
          />

          <FormItem
            control={control}
            style={stylesheet.flex1}
            render={({ field: { value, ref } }) => (
              <Input placeholder={'Chain type'} ref={ref} value={value} readonly={true} />
            )}
            name="type"
          />
        </View>

        <FormItem
          control={control}
          rules={blockExplorerValidator}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputStyle={stylesheet.inputWithLeftIcon}
              leftPart={getInputLeftIcon(GlobeHemisphereEast)}
              placeholder={'Block explorer'}
              ref={ref}
              value={value}
              onBlur={onBlur}
              onSubmitEditing={async () => {
                const isValid = await trigger('blockExplorer');

                if (isValid) {
                  setFocus('crowdloanUrl');
                }
              }}
              onChangeText={onChange}
            />
          )}
          name="blockExplorer"
        />

        <FormItem
          control={control}
          rules={crowdloanValidator}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              inputStyle={stylesheet.inputWithLeftIcon}
              leftPart={getInputLeftIcon(Rocket)}
              placeholder={'Crowdloan URL'}
              ref={ref}
              value={value}
              onBlur={onBlur}
              onSubmitEditing={handleSubmit(onSubmit)}
              onChangeText={onChange}
            />
          )}
          name="crowdloanUrl"
        />
      </ScrollView>

      <View style={stylesheet.footer}>
        <Button
          loading={loading}
          disabled={isSubmitDisabled}
          onPress={handleSubmit(onSubmit)}
          icon={
            <Icon
              phosphorIcon={FloppyDiskBack}
              size={'lg'}
              weight={'fill'}
              iconColor={isSubmitDisabled ? theme.colorTextLight5 : theme.colorWhite}
            />
          }>
          {i18n.buttonTitles.save}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

// TODO: Need apply these i18n configs before merge into upgrade ui
// const formConfig = useMemo(
//   () => ({
//     provider: {
//       name: i18n.importNetwork.providerUrl,
//       value: '',
//       require: true,
//     },
//     name: {
//       name: i18n.importNetwork.chainName,
//       value: '',
//       require: true,
//     },
//     addressPrefix: {
//       name: i18n.importNetwork.addressPrefix,
//       value: '',
//     },
//     paraId: {
//       name: i18n.importNetwork.paraId,
//       value: '',
//     },
//     evmChainId: {
//       name: i18n.importNetwork.evmChainId,
//       value: '',
//     },
//     decimals: {
//       name: i18n.importNetwork.decimal,
//       value: '',
//     },
//     symbol: {
//       name: i18n.importNetwork.symbol,
//       value: '',
//       require: true,
//     },
//     priceId: {
//       name: i18n.importNetwork.priceId,
//       value: '',
//     },
//     type: {
//       name: i18n.importNetwork.chainType,
//       value: '',
//       require: true,
//     },
//     blockExplorer: {
//       name: i18n.importNetwork.blockExplorer,
//       value: '',
//       validateFunc: blockExplorerValidator,
//     },
//     crowdloanUrl: {
//       name: i18n.importNetwork.crowdloanUrl,
//       value: '',
//       validateFunc: crowdloanValidator,
//     },
//   }),
//   [blockExplorerValidator, crowdloanValidator],
// );
