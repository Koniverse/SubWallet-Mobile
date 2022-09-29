import React, { useCallback, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { CustomEvmToken, DeleteEvmTokenParams } from '@subwallet/extension-base/background/KoniTypes';
import { EmptyList } from 'components/EmptyList';
import { Coins } from 'phosphor-react-native';
import { Alert, ListRenderItemInfo, SafeAreaView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import i18n from 'utils/i18n/i18n';
import { EvmTokenItem } from 'components/EvmTokenItem';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { deleteEvmTokens } from '../../messaging';
import { useToast } from 'react-native-toast-notifications';

const filterFunction = (items: CustomEvmToken[], searchString: string) => {
  return items.filter(
    item =>
      item.name?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.symbol?.toLowerCase().includes(searchString.toLowerCase()),
  );
};

export const Tokens = () => {
  const toast = useToast();
  const navigation = useNavigation<RootNavigationProps>();
  const evmTokenMap = useSelector((state: RootState) => state.evmToken.details);
  const [selectedTokens, setSelectedTokens] = useState<DeleteEvmTokenParams[]>([]);
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const showToast = useCallback(
    (message: string) => {
      toast.hideAll();
      toast.show(message);
    },
    [toast],
  );

  const handleSelected = useCallback(
    (data: DeleteEvmTokenParams) => {
      setSelectedTokens([...selectedTokens, data]);
    },
    [selectedTokens],
  );

  const handleUnselected = useCallback(
    (data: DeleteEvmTokenParams) => {
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
    deleteEvmTokens(selectedTokens)
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
        console.log('delete token err', e);
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

  const renderItem = ({ item }: ListRenderItemInfo<CustomEvmToken>) => {
    return (
      <EvmTokenItem
        item={item}
        isEditMode={isEditMode}
        onPress={() => navigation.navigate('ConfigureToken', { contractAddress: item.smartContract })}
        handleSelected={handleSelected}
        handleUnselected={handleUnselected}
      />
    );
  };

  return (
    <>
      <FlatListScreen
        rightIconOption={{
          title: isEditMode ? i18n.common.done : i18n.common.edit,
          onPress: () => setEditMode(!isEditMode),
        }}
        title={i18n.settings.tokens}
        items={Object.values(evmTokenMap)}
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
              <SubmitButton
                title={i18n.common.importToken}
                onPress={() => navigation.navigate('ImportEvmToken', { payload: undefined })}
              />
            )}
          </View>
        }
      />

      <SafeAreaView />
    </>
  );
};
