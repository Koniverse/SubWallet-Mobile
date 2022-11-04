import React, { useCallback, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { CustomToken, DeleteCustomTokenParams } from '@subwallet/extension-base/background/KoniTypes';
import { EmptyList } from 'components/EmptyList';
import { Coins, Trash } from 'phosphor-react-native';
import { Alert, ListRenderItemInfo, SafeAreaView, View } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { CustomTokenItem } from 'components/CustomTokenItem';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { deleteCustomTokens } from '../../messaging';
import { useToast } from 'react-native-toast-notifications';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import useFetchCustomToken from 'hooks/screen/Setting/useFetchCustomToken';

const filterFunction = (items: CustomToken[], searchString: string) => {
  return items.filter(
    item =>
      item.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.symbol?.toLowerCase().includes(searchString.toLowerCase()),
  );
};

export const CustomTokenSetting = () => {
  const toast = useToast();
  const customTokens = useFetchCustomToken();
  const navigation = useNavigation<RootNavigationProps>();
  const [selectedTokens, setSelectedTokens] = useState<DeleteCustomTokenParams[]>([]);
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);
  useHandlerHardwareBackPress(isBusy);
  const showToast = useCallback(
    (message: string) => {
      toast.hideAll();
      toast.show(message);
    },
    [toast],
  );

  const handleSelected = useCallback(
    (data: DeleteCustomTokenParams) => {
      setSelectedTokens([...selectedTokens, data]);
    },
    [selectedTokens],
  );

  const handleUnselected = useCallback(
    (data: DeleteCustomTokenParams) => {
      const _selectedTokens = [];

      for (const token of selectedTokens) {
        if (token.chain === data.chain) {
          if (token.smartContract !== data.smartContract) {
            _selectedTokens.push(token);
          }
        } else {
          _selectedTokens.push(token);
        }
      }

      setSelectedTokens(_selectedTokens);
    },
    [selectedTokens],
  );

  const handleDeleteTokens = useCallback(() => {
    setBusy(true);
    deleteCustomTokens(selectedTokens)
      .then(resp => {
        if (resp) {
          setBusy(false);
          showToast(i18n.common.importTokenSuccessMessage);
          setSelectedTokens([]);
          setEditMode(false);
        } else {
          setBusy(false);
          showToast(i18n.errorMessage.occurredError);
        }
        setSelectedTokens([]);
      })
      .catch(e => {
        console.warn(`delete token err: ${e}`);
        setBusy(false);
      });
  }, [selectedTokens, showToast]);

  const onDeleteTokens = () => {
    Alert.alert('Delete tokens', 'Make sure you want to delete selected tokens', [
      {
        text: i18n.common.cancel,
      },
      {
        text: i18n.common.ok,
        onPress: () => handleDeleteTokens(),
      },
    ]);
  };

  const renderItem = ({ item }: ListRenderItemInfo<CustomToken>) => {
    return (
      <CustomTokenItem
        item={item}
        isEditMode={isEditMode}
        onPress={() =>
          navigation.navigate('ConfigureToken', {
            tokenDetail: JSON.stringify(item),
          })
        }
        handleSelected={handleSelected}
        handleUnselected={handleUnselected}
      />
    );
  };

  return (
    <>
      <FlatListScreen
        rightIconOption={{
          title: isEditMode ? i18n.common.done : '',
          icon: isEditMode ? undefined : Trash,
          disabled: isBusy,
          onPress: () => setEditMode(!isEditMode),
        }}
        title={isEditMode ? i18n.common.deleteToken : i18n.settings.tokens}
        items={customTokens}
        autoFocus={false}
        filterFunction={filterFunction}
        renderItem={renderItem}
        leftButtonDisabled={isBusy}
        renderListEmptyComponent={() => <EmptyList icon={Coins} title={i18n.errorMessage.noTokenAvailable} />}
        afterListItem={
          <View style={{ ...MarginBottomForSubmitButton, ...ContainerHorizontalPadding, paddingTop: 16 }}>
            {isEditMode ? (
              <SubmitButton
                isBusy={isBusy}
                disabled={!selectedTokens.length}
                title={i18n.common.deleteToken}
                backgroundColor={ColorMap.danger}
                disabledColor={ColorMap.dangerOverlay2}
                onPress={onDeleteTokens}
              />
            ) : (
              <SubmitButton title={i18n.common.importToken} onPress={() => navigation.navigate('ImportToken')} />
            )}
          </View>
        }
      />

      <SafeAreaView />
    </>
  );
};
