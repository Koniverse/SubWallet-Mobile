import React, { useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ListRenderItemInfo, View } from 'react-native';
import { NetworkConfigDetailProps, RootNavigationProps } from 'routes/index';
import { SelectItem } from 'components/SelectItem';
import i18n from 'utils/i18n/i18n';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { NETWORK_ERROR, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import { completeConfirmation, upsertNetworkMap, validateNetwork } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import { useNavigation } from '@react-navigation/native';
import { Plus, PushPinSlash } from 'phosphor-react-native';
import { AddProviderModal } from 'screens/Settings/AddProviderModal';
import { isValidProvider } from 'utils/index';
import { EmptyList } from 'components/EmptyList';
import { Button } from 'components/design-system-ui';

function filterFunction(items: Record<string, string>[], searchString: string) {
  return items.filter(item => item.text.toLowerCase().includes(searchString.toLowerCase()));
}

function getAllProviders(data: NetworkJson): Record<string, string>[] {
  const allProviders: Record<string, string>[] = [];

  for (const [key, provider] of Object.entries(data.providers)) {
    allProviders.push({
      text: provider,
      value: key,
    });
  }

  if (data.customProviders) {
    for (const [key, provider] of Object.entries(data.customProviders)) {
      allProviders.push({
        text: provider,
        value: key,
      });
    }
  }

  return allProviders;
}

function getValidateErrorMessage(input?: string) {
  if (input === NETWORK_ERROR.EXISTED_NETWORK) {
    return i18n.errorMessage.networkHasBeenAlreadyAdded;
  } else if (input === NETWORK_ERROR.EXISTED_PROVIDER) {
    return i18n.errorMessage.providerHasExisted;
  } else if (input === NETWORK_ERROR.PROVIDER_NOT_SAME_NETWORK) {
    return i18n.errorMessage.providerIsNotTheSameNetwork;
  } else {
    return i18n.errorMessage.unableToConnectToTheProvider;
  }
}

export const NetworkConfigDetail = ({
  route: {
    params: { key },
  },
}: NetworkConfigDetailProps) => {
  const toast = useToast();
  const navigation = useNavigation<RootNavigationProps>();
  const networkMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const [networkInfo, setNetworkInfo] = useState(networkMap[key]);
  const networkConfigTitle = networkInfo.chain;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const renderItem = ({ item }: ListRenderItemInfo<Record<string, string>>) => {
    return (
      <SelectItem
        style={{ paddingHorizontal: 16 }}
        label={item.text}
        isSelected={item.value === networkInfo.currentProvider}
        onPress={() =>
          setNetworkInfo(prevState => {
            return { ...prevState, currentProvider: item.value };
          })
        }
      />
    );
  };

  const renderEmptyList = () => {
    return <EmptyList icon={PushPinSlash} title={i18n.errorMessage.noProviderAvailable} />;
  };

  const handleCreateProvider = async (
    newProvider: string,
    updateError: (fieldName: string) => (errors?: string[] | undefined) => void,
  ) => {
    if (!isValidProvider(newProvider)) {
      updateError('provider')([i18n.errorMessage.providerRequirePrefix]);
      return '';
    }

    if (networkInfo.customProviders && Object.values(networkInfo.customProviders).find(item => item === newProvider)) {
      updateError('provider')([i18n.errorMessage.providerHasExisted]);

      return '';
    }

    setLoading(true);
    const resp = await validateNetwork(newProvider, !!networkInfo.isEthereum, networkInfo);
    setLoading(false);
    if (resp.error) {
      updateError('provider')([getValidateErrorMessage(resp.error)]);

      return '';
    }

    if (resp.success) {
      toast.show(i18n.errorMessage.successfullyAddANewCustomProvider, { type: 'success' });
      setModalVisible(false);
      if (networkInfo.customProviders) {
        const providerLength = Object.values(networkInfo.customProviders).length;

        const newCustomProvider = { [`custom_${providerLength}`]: newProvider };
        setNetworkInfo({
          ...networkInfo,
          currentProvider: `custom_${providerLength}`,
          customProviders: {
            ...networkInfo.customProviders,
            ...newCustomProvider,
          },
        });

        return `custom_${providerLength}`;
      } else {
        setNetworkInfo({
          ...networkInfo,
          currentProvider: 'custom',
          customProviders: { custom: newProvider },
        });

        return 'custom';
      }
    }

    return '';
  };

  const onPressDoneButton = () => {
    setLoading(true);
    upsertNetworkMap(networkInfo)
      .then(resp => {
        if (resp) {
          setLoading(false);
          if (networkInfo.requestId) {
            completeConfirmation('addNetworkRequest', { id: networkInfo.requestId, isApproved: true }).catch(
              console.error,
            );
          }
          toast.show(i18n.common.importTokenSuccessMessage, { type: 'success' });
          navigation.goBack();
        } else {
          toast.show(i18n.errorMessage.errorConfigureNetwork, { type: 'danger' });
        }
      })
      .catch(e => {
        setLoading(false);
        console.log(e);
      });
  };

  return (
    <>
      <FlatListScreen<Record<string, string>>
        onPressBack={() => navigation.goBack()}
        leftButtonDisabled={loading}
        rightIconOption={{
          icon: Plus,
          disabled: loading,
          onPress: () => setModalVisible(true),
        }}
        items={getAllProviders(networkInfo)}
        title={networkConfigTitle}
        renderItem={renderItem}
        autoFocus={false}
        renderListEmptyComponent={renderEmptyList}
        searchFunction={filterFunction}
        afterListItem={
          <View style={{ ...ContainerHorizontalPadding, ...MarginBottomForSubmitButton, paddingTop: 16 }}>
            <Button loading={loading} onPress={onPressDoneButton}>
              {i18n.common.done}
            </Button>
          </View>
        }
      />

      <AddProviderModal
        loading={loading}
        modalVisible={modalVisible}
        onCloseModal={() => {
          if (!loading) {
            setModalVisible(false);
          }
        }}
        createProvider={handleCreateProvider}
      />
    </>
  );
};
