import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { Coins, Plus } from 'phosphor-react-native';
import { ListRenderItemInfo, SafeAreaView } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { _ChainAsset } from '@subwallet/chain-list/types';
import { TokenToggleItem } from 'components/common/TokenToggleItem';
import { updateAssetSetting } from '../../messaging';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _isAssetFungibleToken, _isCustomAsset } from '@subwallet/extension-base/services/chain-service/utils';

const searchFunction = (items: _ChainAsset[], searchString: string) => {
  return items.filter(item => item?.symbol.toLowerCase().includes(searchString.toLowerCase()));
};

enum FilterValue {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  CUSTOM = 'custom',
  NATIVE = 'native',
}

let cachePendingAssetMap: Record<string, boolean> = {};

export const CustomTokenSetting = () => {
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const assetSettingMap = useSelector((state: RootState) => state.assetRegistry.assetSettingMap);
  const assetItems = useMemo(() => {
    const allFungibleTokens: _ChainAsset[] = [];

    Object.values(assetRegistry).forEach(asset => {
      if (_isAssetFungibleToken(asset)) {
        allFungibleTokens.push(asset);
      }
    });

    return allFungibleTokens;
  }, [assetRegistry]);
  const navigation = useNavigation<RootNavigationProps>();
  const [pendingAssetMap, setPendingAssetMap] = useState<Record<string, boolean>>(cachePendingAssetMap);
  const FILTER_OPTIONS = [
    { label: i18n.filterOptions.enabledTokens, value: FilterValue.ENABLED },
    { label: i18n.filterOptions.disabledTokens, value: FilterValue.DISABLED },
    { label: i18n.filterOptions.customTokens, value: FilterValue.CUSTOM },
  ];

  const filterFunction = useCallback(
    (items: _ChainAsset[], filters: string[]) => {
      if (!filters.length) {
        return items;
      }

      return items.filter(item => {
        for (const filter of filters) {
          switch (filter) {
            case FilterValue.CUSTOM:
              if (_isCustomAsset(item.slug)) {
                return true;
              }
              break;
            case FilterValue.ENABLED:
              if (assetSettingMap[item.slug] && assetSettingMap[item.slug].visible) {
                return true;
              }
              break;
            case FilterValue.DISABLED:
              if (!assetSettingMap[item.slug] || !assetSettingMap[item.slug]?.visible) {
                return true;
              }
          }
        }
        return false;
      });
    },
    [assetSettingMap],
  );

  useEffect(() => {
    setPendingAssetMap(prePendingAssetMap => {
      Object.entries(prePendingAssetMap).forEach(([key, val]) => {
        if (assetSettingMap[key]?.visible === val) {
          delete prePendingAssetMap[key];
        }
      });

      return { ...prePendingAssetMap };
    });
  }, [assetSettingMap]);

  useEffect(() => {
    cachePendingAssetMap = pendingAssetMap;
  }, [pendingAssetMap]);

  const onToggleItem = (item: _ChainAsset) => {
    setPendingAssetMap({ ...pendingAssetMap, [item.slug]: !assetSettingMap[item.slug]?.visible });
    const reject = () => {
      console.warn('Toggle token request failed!');
      // @ts-ignore
      delete pendingassetMap[item.key];
      setPendingAssetMap({ ...pendingAssetMap });
    };

    updateAssetSetting({
      tokenSlug: item.slug,
      assetSetting: {
        visible: !assetSettingMap[item.slug]?.visible,
      },
    })
      .then(result => {
        if (!result) {
          reject();
        }
      })
      .catch(reject);
  };

  const renderItem = ({ item }: ListRenderItemInfo<_ChainAsset>) => {
    return (
      <TokenToggleItem
        item={item}
        onPress={() => {
          navigation.navigate('ConfigureToken', {
            tokenDetail: JSON.stringify(item),
          });
        }}
        isEnabled={
          Object.keys(pendingAssetMap).includes(item.slug)
            ? pendingAssetMap[item.slug]
            : assetSettingMap[item.slug]?.visible || false
        }
        onValueChange={() => onToggleItem(item)}
        isDisableSwitching={Object.keys(pendingAssetMap).includes(item.slug)}
      />
    );
  };

  return (
    <>
      <FlatListScreen
        rightIconOption={{
          icon: Plus,
          onPress: () => navigation.navigate('ImportToken'),
        }}
        onPressBack={() => navigation.goBack()}
        isShowFilterBtn
        title={i18n.header.manageTokens}
        items={assetItems}
        autoFocus={false}
        placeholder={i18n.placeholder.searchToken}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderListEmptyComponent={() => (
          <EmptyList
            icon={Coins}
            title={i18n.emptyScreen.tokenEmptyTitle}
            message={i18n.emptyScreen.tokenEmptyMessage}
          />
        )}
        isShowListWrapper
      />

      <SafeAreaView />
    </>
  );
};
