import React, { useEffect, useMemo, useState } from 'react';
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

//todo: i18n
const FILTER_OPTIONS = [
  { label: 'Enabled tokens', value: FilterValue.ENABLED },
  { label: 'Disabled tokens', value: FilterValue.DISABLED },
  { label: 'Custom tokens', value: FilterValue.CUSTOM },
];

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

  const filterFunction = (items: _ChainAsset[], filters: string[]) => {
    const filteredChainList: _ChainAsset[] = [];

    items.forEach(item => {
      let isValidationPassed = true;

      for (const filter of filters) {
        switch (filter) {
          case FilterValue.CUSTOM:
            isValidationPassed = _isCustomAsset(item.slug);
            break;
          case FilterValue.ENABLED:
            isValidationPassed = assetSettingMap[item.slug] && assetSettingMap[item.slug].visible;
            break;
          case FilterValue.DISABLED:
            isValidationPassed = !assetSettingMap[item.slug] || !assetSettingMap[item.slug].visible;
            break;
          default:
            isValidationPassed = false;
            break;
        }
      }

      if (isValidationPassed) {
        filteredChainList.push(item);
      }
    });

    return filteredChainList;
  };

  useEffect(() => {
    setPendingAssetMap(prePendingAssetMap => {
      Object.entries(prePendingAssetMap).forEach(([key, val]) => {
        if (assetSettingMap[key].visible === val) {
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
        isShowFilterBtn
        title={i18n.settings.tokens}
        items={assetItems}
        autoFocus={false}
        filterOptions={FILTER_OPTIONS}
        filterFunction={filterFunction}
        searchFunction={searchFunction}
        renderItem={renderItem}
        renderListEmptyComponent={() => (
          <EmptyList icon={Coins} title={'No token'} message={'Your token will appear here.'} />
        )}
        isShowListWrapper
      />

      <SafeAreaView />
    </>
  );
};
