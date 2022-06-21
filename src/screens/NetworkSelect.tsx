import React, { useCallback, useEffect, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Search } from 'components/Search';
import { sharedStyles } from 'styles/sharedStyles';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { isAccountAll } from '@subwallet/extension-koni-base/utils/utils';
import { tieAccount } from '../messaging';
import { updateCurrentNetwork } from 'stores/updater';
import { getGenesisOptionsByAddressType } from 'utils/index';
import useGenesisHashOptions, { NetworkSelectOption } from 'hooks/useGenesisHashOptions';

export const NetworkSelect = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    accounts: { currentAccount, currentAccountAddress, accounts },
    currentNetwork,
  } = useSelector((state: RootState) => state);
  const [searchString, setSearchString] = useState('');
  const genesisOptions = getGenesisOptionsByAddressType(currentAccountAddress, accounts, useGenesisHashOptions());
  const [filteredGenesisOptions, setFilteredGenesisOption] = useState<NetworkSelectOption[]>(genesisOptions);

  const dep = genesisOptions.toString();

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredGenesisOption(
        genesisOptions.filter(network => network.text.toLowerCase().includes(lowerCaseSearchString)),
      );
    } else {
      setFilteredGenesisOption(genesisOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  const _onChangeNetwork = useCallback(
    async (
      genesisHash: string,
      networkPrefix: number,
      icon: string,
      networkKey: string,
      isEthereum: boolean,
    ): Promise<void> => {
      if (currentAccount) {
        if (!isAccountAll(currentAccount.address)) {
          await tieAccount(currentAccount.address, genesisHash || null);
        } else {
          // window.localStorage.setItem('accountAllNetworkGenesisHash', genesisHash);
        }

        updateCurrentNetwork({
          networkPrefix,
          icon,
          genesisHash,
          networkKey,
          isEthereum,
        });

        navigation.navigate('Home');
      }
    },
    [currentAccount, navigation],
  );

  // @ts-ignore
  const renderItem = ({ item }) => {
    return (
      <NetworkSelectItem
        key={item.value}
        itemName={item.text}
        itemKey={item.networkKey}
        isSelected={item.networkKey === currentNetwork.networkKey}
        onSelectNetwork={() =>
          _onChangeNetwork(item.genesisHash, item.networkPrefix, item.icon, item.networkKey, item.isEthereum)
        }
      />
    );
  };

  const renderListEmptyComponent = () => {
    return <Warning title={'Warning'} message={i18n.noAccountText} isDanger={false} />;
  };

  return (
    <SubScreenContainer navigation={navigation} title={'Select Network'}>
      <View style={{ ...sharedStyles.layoutContainer }}>
        <Search onSearch={setSearchString} searchText={searchString} />
        <FlatList
          style={{ flex: 1, paddingTop: 9 }}
          keyboardShouldPersistTaps={'handled'}
          data={filteredGenesisOptions}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyExtractor={item => item.networkKey}
        />
      </View>
    </SubScreenContainer>
  );
};
