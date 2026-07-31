import React, { useEffect, useMemo, useState } from 'react';
import { NetworkAndTokenToggleItem } from 'components/NetworkAndTokenToggleItem';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListChecksIcon, PlusIcon, WifiSlashIcon, XIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, NetworksSettingProps } from 'routes/index';
import { disableAllNetwork, updateChainActiveState } from 'messaging/index';
import {
  _isChainEvmCompatible,
  _isCustomChain,
  _isChainSubstrateCompatible,
} from '@subwallet/extension-base/services/chain-service/utils';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import useChainInfoWithStateAndStatus, {
  ChainInfoWithStateAnhStatus,
} from 'hooks/chain/useChainInfoWithStateAndStatus';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { BackgroundIcon, Button, Icon, SwModal, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useToast } from 'react-native-toast-notifications';
import { Switch, TouchableOpacity, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontSemiBold } from 'styles/sharedStyles';

let chainKeys: Array<string> | undefined;

let cachePendingChainMap: Record<string, boolean> = {};

const disableAllToggleStyle = { marginHorizontal: 16, marginTop: 8 };

enum FilterValue {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  CUSTOM = 'custom',
  SUBSTRATE = 'substrate',
  EVM = 'evm',
}

const searchFunction = (items: ChainInfoWithStateAnhStatus[], searchString: string) => {
  if (!searchString) {
    return items;
  }

  return items.filter(network => network && network.name.toLowerCase().includes(searchString.toLowerCase()));
};

const filterFunction = (items: ChainInfoWithStateAnhStatus[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    for (const filter of filters) {
      switch (filter) {
        case FilterValue.CUSTOM:
          if (_isCustomChain(item.slug)) {
            return true;
          }
          break;
        case FilterValue.ENABLED:
          if (item.active) {
            return true;
          }
          break;
        case FilterValue.DISABLED:
          if (!item.active) {
            return true;
          }
          break;
        case FilterValue.SUBSTRATE:
          if (_isChainSubstrateCompatible(item)) {
            return true;
          }
          break;
        case FilterValue.EVM:
          if (_isChainEvmCompatible(item)) {
            return true;
          }
          break;
      }
    }
    return false;
  });
};

const processChainMap = (
  chainInfoMap: Record<string, ChainInfoWithStateAnhStatus>,
  updateKeys = false,
): ChainInfoWithStateAnhStatus[] => {
  if (!chainKeys || updateKeys) {
    chainKeys = Object.keys(chainInfoMap).filter(key => Object.keys(chainInfoMap[key].providers).length > 0);
  }

  return chainKeys.map(key => chainInfoMap[key]);
};

export const NetworksSetting = ({ route: { params } }: NetworksSettingProps) => {
  const defaultSearchString = params?.chainName;
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const toast = useToast();
  const chainInfoMap = useChainInfoWithStateAndStatus();
  const [isToggleItem, setToggleItem] = useState(false);
  const [isDisablingAll, setIsDisablingAll] = useState(false);
  const [isDisableAllModalVisible, setIsDisableAllModalVisible] = useState(false);
  const [pendingChainMap, setPendingChainMap] = useState<Record<string, boolean>>(cachePendingChainMap);
  const [currentChainList, setCurrentChainList] = useState(processChainMap(chainInfoMap));
  const hasActiveChains = useMemo(
    () => !isDisablingAll && Object.values(chainInfoMap).some(chain => chain.active),
    [chainInfoMap, isDisablingAll],
  );
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.evmChains, value: FilterValue.EVM },
    { label: i18n.filterOptions.substrateChains, value: FilterValue.SUBSTRATE },
    { label: i18n.filterOptions.customChains, value: FilterValue.CUSTOM },
    { label: i18n.filterOptions.enabledChains, value: FilterValue.ENABLED },
    { label: i18n.filterOptions.disabledChains, value: FilterValue.DISABLED },
  ];

  useEffect(() => {
    setPendingChainMap(prevPendingChainMap => {
      const _prevPendingChainMap = { ...prevPendingChainMap };
      Object.entries(_prevPendingChainMap).forEach(([key, val]) => {
        if (chainInfoMap[key].active === val) {
          // @ts-ignore
          delete _prevPendingChainMap[key];
        }
      });

      if (Object.keys(_prevPendingChainMap).length === 0) {
        setToggleItem(false);
      }

      return _prevPendingChainMap;
    });
  }, [chainInfoMap]);

  useEffect(() => {
    setCurrentChainList(processChainMap(chainInfoMap, !isToggleItem));
  }, [chainInfoMap, isToggleItem, pendingChainMap]);

  useEffect(() => {
    cachePendingChainMap = pendingChainMap;
  }, [pendingChainMap]);

  const onToggleItem = (item: ChainInfoWithStateAnhStatus) => {
    if (isDisablingAll || pendingChainMap[item.slug] !== undefined) {
      return;
    }

    setToggleItem(true);
    const currentActiveState = pendingChainMap[item.slug] ?? chainInfoMap[item.slug]?.active ?? false;
    const nextActiveState = !currentActiveState;

    setPendingChainMap(prevPendingChainMap => ({ ...prevPendingChainMap, [item.slug]: nextActiveState }));

    const reject = () => {
      console.warn('Toggle network request failed!');
      setPendingChainMap(prevPendingChainMap => {
        const nextPendingChainMap = { ...prevPendingChainMap };
        delete nextPendingChainMap[item.slug];

        return nextPendingChainMap;
      });
    };

    updateChainActiveState(item.slug, nextActiveState)
      .then(result => {
        if (!result) {
          reject();
        }
      })
      .catch(reject);
  };

  const onDisableAll = () => {
    if (isDisablingAll || !hasActiveChains) {
      return;
    }

    setIsDisableAllModalVisible(true);
  };

  const confirmDisableAll = () => {
    setIsDisableAllModalVisible(false);
    setIsDisablingAll(true);
    disableAllNetwork()
      .catch(() => toast.show(i18n.notificationMessage.pleaseTryAgain, { type: 'danger' }))
      .finally(() => setIsDisablingAll(false));
  };

  const renderItem = ({ item }: ListRenderItemInfo<ChainInfoWithStateAnhStatus>) => {
    const isDisableSwitching = isDisablingAll || item.slug === 'polkadot' || item.slug === 'kusama' || Object.keys(pendingChainMap).includes(item.slug);
    const isEnabled =
      isDisablingAll
        ? false
        : Object.keys(pendingChainMap).includes(item.slug)
        ? pendingChainMap[item.slug]
        : chainInfoMap[item.slug]?.active || false;

    return (
      <NetworkAndTokenToggleItem
        isDisableSwitching={isDisableSwitching}
        key={`${item.slug}-${item.name}`}
        itemName={item.name}
        itemKey={item.slug}
        connectionStatus={item.connectionStatus}
        // @ts-ignore
        isEnabled={isEnabled}
        onValueChange={() => onToggleItem(item)}
        showEditButton
        onPressEditBtn={() => {
          navigation.navigate('NetworkSettingDetail', { chainSlug: item.slug });
          setToggleItem(false);
        }}
      />
    );
  };

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        icon={ListChecksIcon}
        title={i18n.emptyScreen.networkSettingsTitle}
        message={i18n.emptyScreen.networkSettingsMessage}
        addBtnLabel={i18n.header.importNetwork}
        onPressAddBtn={() => {
          navigation.navigate('ImportNetwork');
        }}
      />
    );
  };

  const disableAllItemStyle = {
    alignItems: 'center' as const,
    backgroundColor: theme.colorBgSecondary,
    borderRadius: theme.borderRadiusLG,
    flexDirection: 'row' as const,
    gap: theme.paddingSM,
    paddingHorizontal: theme.paddingSM,
    minHeight: 52,
  };
  const disableAllItemContentStyle = { flex: 1 };
  const disableAllItemTitleStyle = {
    color: theme.colorWhite,
    fontSize: theme.fontSizeLG,
    lineHeight: theme.fontSizeLG * theme.lineHeightLG,
    ...FontSemiBold,
  };
  const disableAllSwitchStyle = { marginRight: 8 };
  const disableAllModalContentStyle = {
    alignItems: 'center' as const,
    paddingTop: theme.padding,
  };
  const disableAllModalConfirmationStyle = {
    color: theme.colorError,
    textAlign: 'center' as const,
  };
  const disableAllModalNoteStyle = {
    color: theme.colorTextLight3,
    marginTop: theme.padding,
    textAlign: 'center' as const,
  };
  const disableAllModalFooterStyle = { paddingTop: theme.padding };
  const disableAllActionButtonStyle = {
    flexGrow: 0,
    flexShrink: 0,
    height: 52,
    width: '100%' as const,
  };
  const disableAllModalHeaderStyle = {
    alignItems: 'center' as const,
    borderBottomColor: theme.colorBgSecondary,
    borderBottomWidth: 1,
    marginBottom: theme.paddingLG,
    paddingBottom: theme.padding,
  };
  const disableAllModalCloseButtonStyle = { left: -8, position: 'absolute' as const };
  const disableAllModalTitleStyle = {
    color: theme.colorWhite,
    fontSize: theme.fontSizeXL,
    lineHeight: theme.fontSizeXL * theme.lineHeightHeading4,
    ...FontSemiBold,
  };

  const beforeListItem = (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisablingAll || !hasActiveChains}
      onPress={onDisableAll}
      style={disableAllToggleStyle}>
      <View pointerEvents="none" style={disableAllItemStyle}>
        <BackgroundIcon
          backgroundColor={theme.colorError}
          phosphorIcon={WifiSlashIcon}
          shape="circle"
          size="sm"
          weight="fill"
        />
        <View style={disableAllItemContentStyle}>
          <Text style={disableAllItemTitleStyle}>{i18n.settings.turnOffAllNetworks}</Text>
        </View>
        <Switch ios_backgroundColor={ColorMap.switchInactiveButtonColor} style={disableAllSwitchStyle} value={!hasActiveChains} />
      </View>
    </TouchableOpacity>
  );

  const disableAllFooter = (
    <View style={disableAllModalFooterStyle}>
      <Button
        icon={<Icon phosphorIcon={WifiSlashIcon} weight="fill" />}
        onPress={confirmDisableAll}
        size="md"
        style={disableAllActionButtonStyle}
        type="danger">
        {i18n.buttonTitles.turnOff}
      </Button>
    </View>
  );

  const disableAllModalHeader = (
    <View style={disableAllModalHeaderStyle}>
      <Button
        icon={<Icon phosphorIcon={XIcon} size="lg" />}
        onPress={() => setIsDisableAllModalVisible(false)}
        size="xs"
        style={disableAllModalCloseButtonStyle}
        type="ghost"
      />
      <Text style={disableAllModalTitleStyle}>{i18n.settings.turnOffAllNetworks}</Text>
    </View>
  );

  return (
    <>
      <FlatListScreen
        rightIconOption={{
          icon: PlusIcon,
          onPress: () => {
            navigation.navigate('ImportNetwork');
            setToggleItem(false);
          },
        }}
        defaultSearchString={defaultSearchString}
        beforeListItem={beforeListItem}
        onPressBack={() => navigation.goBack()}
        items={currentChainList}
        title={i18n.header.manageNetworks}
        placeholder={i18n.placeholder.searchNetwork}
        autoFocus={false}
        renderListEmptyComponent={renderListEmptyComponent}
        searchFunction={searchFunction}
        renderItem={renderItem}
        filterOptions={FILTER_OPTIONS}
        isShowFilterBtn
        filterFunction={filterFunction}
        isShowListWrapper={true}
      />
      <SwModal
        footer={disableAllFooter}
        hideHandle
        isUseModalV2
        modalVisible={isDisableAllModalVisible}
        onBackButtonPress={() => setIsDisableAllModalVisible(false)}
        renderHeader={disableAllModalHeader}
        setVisible={setIsDisableAllModalVisible}
        titleTextAlign="center">
        <View style={disableAllModalContentStyle}>
          <Typography.Text style={disableAllModalConfirmationStyle}>
            {i18n.settings.disableAllNetworksConfirmation}
          </Typography.Text>
          <Typography.Text style={disableAllModalNoteStyle}>{i18n.settings.disableAllNetworksNote}</Typography.Text>
        </View>
      </SwModal>
    </>
  );
};
