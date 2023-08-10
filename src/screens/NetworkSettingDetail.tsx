import useConfirmModal from 'hooks/modal/useConfirmModal';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { CaretDown, FloppyDiskBack, Plus, Trash } from 'phosphor-react-native';
import { ScrollView, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { RpcSelectField } from 'components/Field/RpcSelect';
import { ProviderItemType, RpcSelectorModal } from 'components/common/RpcSelectorModal';
import useFetchChainInfo from 'hooks/screen/useFetchChainInfo';
import { NetworkSettingDetailProps, RootNavigationProps } from 'routes/index';
import useFetchChainState from 'hooks/screen/useFetchChainState';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { NetworkNameField } from 'components/Field/NetworkName';
import { TextField } from 'components/Field/Text';
import {
  _getBlockExplorerFromChain,
  _getChainNativeTokenBasicInfo,
  _getChainSubstrateAddressPrefix,
  _getCrowdloanUrlFromChain,
  _getEvmChainId,
  _getSubstrateParaId,
  _isChainEvmCompatible,
  _isCustomChain,
  _isPureEvmChain,
  _isSubstrateChain,
} from '@subwallet/extension-base/services/chain-service/utils';
import InputText from 'components/Input/InputText';
import { Button, Icon } from 'components/design-system-ui';
import { _NetworkUpsertParams } from '@subwallet/extension-base/services/chain-service/types';
import { removeChain, upsertChain } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { isUrl } from 'utils/index';
import { useNavigation } from '@react-navigation/native';
import DeleteModal from 'components/common/Modal/DeleteModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import i18n from 'utils/i18n/i18n';
import { ModalRef } from 'types/modalRef';

const ContainerStyle: StyleProp<ViewStyle> = {
  ...sharedStyles.layoutContainer,
};

const validateCrowdloanUrl = (value: string): string[] => {
  if (value.length !== 0 && !isUrl(value)) {
    return [i18n.errorMessage.crowdloanUrlMustBeAValidUrl];
  } else {
    return [];
  }
};

const validateBlockExplorer = (value: string): string[] => {
  if (value.length !== 0 && !isUrl(value)) {
    return [i18n.errorMessage.blockExplorerMustBeAValidUrl];
  } else {
    return [];
  }
};

export const NetworkSettingDetail = ({
  route: {
    params: { chainSlug },
  },
}: NetworkSettingDetailProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();
  const theme = useSubWalletTheme().swThemes;
  const rpcSelectorRef = useRef<ModalRef>();

  const _chainInfo = useFetchChainInfo(chainSlug);
  const [chainInfo, setChainInfo] = useState(_chainInfo);
  const _chainState = useFetchChainState(chainSlug);
  const [chainState, setChainState] = useState(_chainState);
  const [isDeleting, setIsDeleting] = useState(false);

  const { decimals, symbol } = useMemo(() => {
    return _getChainNativeTokenBasicInfo(chainInfo);
  }, [chainInfo]);

  const addressPrefix = useMemo(() => {
    return _getChainSubstrateAddressPrefix(chainInfo);
  }, [chainInfo]);

  const paraId = useMemo(() => {
    return _getSubstrateParaId(chainInfo);
  }, [chainInfo]);

  const chainId = useMemo(() => {
    return _getEvmChainId(chainInfo);
  }, [chainInfo]);

  const isPureEvmChain = useMemo(() => {
    return chainInfo && _isPureEvmChain(chainInfo);
  }, [chainInfo]);

  const chainTypeString = useCallback(() => {
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

  const _blockExplorer = useMemo(() => _getBlockExplorerFromChain(chainInfo), [chainInfo]);

  const _crowdloanUrl = useMemo(() => _getCrowdloanUrlFromChain(chainInfo), [chainInfo]);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      currentProvider: {
        name: i18n.common.provider.toLowerCase(),
        value: chainState.currentProvider,
        require: true,
      },
      blockExplorer: {
        name: i18n.placeholder.blockExplorer,
        value: _blockExplorer || '',
        validateFunc: (value: string) => {
          return validateBlockExplorer(value);
        },
      },
      crowdloanUrl: {
        name: i18n.placeholder.crowdloanUrl,
        value: _crowdloanUrl,
        validateFunc: (value: string) => {
          return validateCrowdloanUrl(value);
        },
      },
    };
  }, [_blockExplorer, _crowdloanUrl, chainState.currentProvider]);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = () => {
    if (
      !!formState.errors.blockExplorer.length ||
      !!formState.errors.crowdloanUrl.length ||
      !!formState.errors.currentProvider.length ||
      isDeleting ||
      (formState.data.currentProvider === chainState.currentProvider &&
        formState.data.blockExplorer === _blockExplorer &&
        formState.data.crowdloanUrl === _crowdloanUrl)
    ) {
      return;
    }

    setLoading(true);
    const currentProvider = formState.data.currentProvider;
    const blockExplorer = formState.data.blockExplorer;
    const crowdloanUrl = formState.data.crowdloanUrl;

    const params: _NetworkUpsertParams = {
      mode: 'update',
      chainEditInfo: {
        slug: chainInfo.slug,
        currentProvider: currentProvider,
        providers: chainInfo.providers,
        blockExplorer,
        crowdloanUrl,
      },
    };

    upsertChain(params)
      .then(result => {
        setLoading(false);
        if (result) {
          toast.hideAll();
          toast.show(i18n.notificationMessage.updatedChainSuccessfully, { type: 'success' });
          navigation.goBack();
        } else {
          toast.hideAll();
          toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
        }
      })
      .catch(() => {
        setLoading(false);
        toast.hideAll();
        toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const handeDeleteCustomToken = () => {
    setIsDeleting(true);
    removeChain(chainInfo.slug)
      .then(result => {
        if (result) {
          toast.show(i18n.notificationMessage.deleteChainSuccessfully, { type: 'success' });
          navigation.goBack();
        } else {
          toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
        }
        setIsDeleting(false);
      })
      .catch(() => {
        toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' });
        setIsDeleting(false);
      });
  };

  const onChangeBlockExplorer = (value: string) => {
    if (!value) {
      onUpdateErrors('blockExplorer')([]);
    }

    onChangeValue('blockExplorer')(value);
  };

  const onChangeCrowdloanUrl = (value: string) => {
    if (!value) {
      onUpdateErrors('crowdloanUrl')([]);
    }

    onChangeValue('crowdloanUrl')(value);
  };

  const isDisabledSubmitButton = useMemo(() => {
    return (
      !!formState.errors.blockExplorer.length ||
      !!formState.errors.crowdloanUrl.length ||
      !!formState.errors.currentProvider.length ||
      isDeleting ||
      (formState.data.currentProvider === chainState.currentProvider &&
        formState.data.blockExplorer === _blockExplorer &&
        formState.data.crowdloanUrl === _crowdloanUrl)
    );
  }, [
    _blockExplorer,
    _crowdloanUrl,
    chainState.currentProvider,
    formState.data.blockExplorer,
    formState.data.crowdloanUrl,
    formState.data.currentProvider,
    formState.errors.blockExplorer.length,
    formState.errors.crowdloanUrl.length,
    formState.errors.currentProvider.length,
    isDeleting,
  ]);

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
    setVisible,
  } = useConfirmModal(handeDeleteCustomToken);

  useEffect(() => {
    if (_chainState) {
      setChainState(_chainState);
    }
  }, [_chainState]);

  useEffect(() => {
    if (_chainInfo) {
      setChainInfo(_chainInfo);
    }
  }, [_chainInfo]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      rightIcon={Trash}
      disableRightButton={!(_isCustomChain(chainInfo.slug) && !chainState.active)}
      onPressBack={() => navigation.goBack()}
      onPressRightIcon={onPressDelete}
      title={i18n.header.networkDetails}>
      <View style={ContainerStyle}>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'handled'}>
          <RpcSelectorModal
            rpcSelectorRef={rpcSelectorRef}
            chainSlug={chainSlug}
            selectedValueMap={{ [formState.data.currentProvider]: true }}
            onPressBack={() => rpcSelectorRef?.current?.onCloseModal()}
            onSelectItem={(item: ProviderItemType) => {
              onChangeValue('currentProvider')(item.value);
            }}
            renderSelectModalBtn={onOpenModal => (
              <TouchableOpacity
                activeOpacity={BUTTON_ACTIVE_OPACITY}
                onPress={() => {
                  if (Object.keys(chainInfo.providers).length === 1) {
                    navigation.navigate('AddProvider', { slug: chainInfo.slug });
                  } else {
                    onOpenModal(true);
                  }
                }}>
                <RpcSelectField
                  showRightIcon
                  value={chainInfo.providers[formState.data.currentProvider]}
                  rightIcon={Object.keys(chainInfo.providers).length === 1 ? Plus : CaretDown}
                />
              </TouchableOpacity>
            )}
          />

          <View style={{ flexDirection: 'row', width: '100%' }}>
            <NetworkNameField outerStyle={{ flex: 2, marginRight: 12 }} chain={chainInfo.slug} />

            <TextField outerStyle={{ flex: 1 }} text={symbol} />
          </View>

          <View style={{ flexDirection: 'row', width: '100%' }}>
            <TextField outerStyle={{ flex: 1, marginRight: 12 }} text={decimals.toString()} />
            {!isPureEvmChain ? (
              <TextField outerStyle={{ flex: 1 }} text={paraId > -1 ? paraId.toString() : 'ParaId'} />
            ) : (
              <TextField outerStyle={{ flex: 1 }} text={chainId > -1 ? chainId.toString() : 'None'} />
            )}
          </View>

          <View style={[{ width: '100%' }, !isPureEvmChain && { flexDirection: 'row' }]}>
            {!isPureEvmChain && (
              <TextField
                outerStyle={[{ flex: 1 }, !isPureEvmChain && { marginRight: 12 }]}
                text={addressPrefix.toString()}
              />
            )}

            <TextField outerStyle={{ flex: 1 }} text={chainTypeString()} />
          </View>

          <InputText
            ref={formState.refs.blockExplorer}
            value={formState.data.blockExplorer}
            onChangeText={onChangeBlockExplorer}
            onSubmitField={onSubmitField('blockExplorer')}
            errorMessages={formState.errors.blockExplorer}
            placeholder={formState.labels.blockExplorer}
          />

          <InputText
            ref={formState.refs.crowdloanUrl}
            value={formState.data.crowdloanUrl}
            onChangeText={onChangeCrowdloanUrl}
            onSubmitField={onSubmitField('crowdloanUrl')}
            errorMessages={formState.errors.crowdloanUrl}
            placeholder={formState.labels.crowdloanUrl}
          />
        </ScrollView>

        <View style={{ ...MarginBottomForSubmitButton }}>
          <Button
            disabled={isDisabledSubmitButton}
            loading={loading}
            icon={
              <Icon
                phosphorIcon={FloppyDiskBack}
                size={'lg'}
                weight={'fill'}
                iconColor={isDisabledSubmitButton ? theme.colorTextLight5 : theme.colorWhite}
              />
            }
            onPress={onSubmit}>
            {i18n.buttonTitles.save}
          </Button>
        </View>

        <DeleteModal
          title={i18n.header.deleteNetwork}
          visible={deleteVisible}
          message={i18n.message.deleteNetworkMessage}
          onCompleteModal={onCompleteDeleteModal}
          onCancelModal={onCancelDelete}
          setVisible={setVisible}
        />
      </View>
    </ContainerWithSubHeader>
  );
};
