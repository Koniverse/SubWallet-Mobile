import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAccountAll } from 'utils/accountAll';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AddressBook, CheckCircle, DownloadSimple, Export, MagnifyingGlass } from 'phosphor-react-native';
import PasswordModal from 'components/Modal/PasswordModal';
import { exportAccountsV2 } from 'messaging/index';
import { AccountSignMode } from 'types/signer';
import { getSignMode } from 'utils/account';
import { Button, Icon, SelectItem, SwFullSizeModal, Typography } from 'components/design-system-ui';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { KeyringPairs$Json } from '@subwallet/ui-keyring/types';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { InteractionManager, Share, View } from 'react-native';
import { toShort } from 'utils/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import { FontSemiBold } from 'styles/sharedStyles';
import { ListRenderItemInfo } from '@shopify/flash-list';

const filterOptions = [
  {
    label: 'Normal account',
    value: AccountSignMode.PASSWORD,
  },
  {
    label: 'QR signer account',
    value: AccountSignMode.QR,
  },
  {
    label: 'Ledger account',
    value: 'ledger',
  },
  {
    label: 'Watch-only account',
    value: AccountSignMode.READ_ONLY,
  },
];

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

const filterFunction = (items: AccountJson[], filters: string[]) => {
  if (!filters.length) {
    return items;
  }

  return items.filter(item => {
    const signMode = getSignMode(item);
    for (const filter of filters) {
      switch (filter) {
        case AccountSignMode.PASSWORD:
          return signMode === AccountSignMode.PASSWORD;
        case AccountSignMode.QR:
          return signMode === AccountSignMode.QR;
        case 'ledger':
          return signMode === AccountSignMode.LEGACY_LEDGER || signMode === AccountSignMode.GENERIC_LEDGER;
        case AccountSignMode.READ_ONLY:
          return signMode === AccountSignMode.READ_ONLY;
      }
    }
    return false;
  });
};

const searchFunc = (items: AccountJson[], searchText: string) => {
  return items.filter(
    acc =>
      (acc.name && acc.name.toLowerCase().includes(searchText.toLowerCase())) ||
      acc.address.toLowerCase().includes(searchText.toLowerCase()),
  );
};

export const ExportAllAccount = () => {
  const fullAccounts = useSelector((state: RootState) => state.accountState.accounts);
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const successModalRef = useRef<SWModalRefProps>(null);
  const [selectedValueMap, setSelectedValueMap] = useState<Record<string, boolean>>({});
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [jsonData, setJsonData] = useState<KeyringPairs$Json | undefined>(undefined);
  const [jsonFileName, setJsonFileName] = useState('');
  const currentAccountAddress = useSelector((state: RootState) => state.accountState.currentAccount?.address);
  const [isReady, setIsReady] = useState<boolean>(false);
  const items = useMemo(() => {
    if (fullAccounts.length > 2) {
      const foundAccountAll = fullAccounts.find(a => isAccountAll(a.address));
      const foundCurrentAccount = fullAccounts.find(a => a.address === currentAccountAddress);

      const result = fullAccounts.filter(a => !(isAccountAll(a.address) || a.address === currentAccountAddress));

      if (foundCurrentAccount && !isAccountAll(currentAccountAddress || '')) {
        result.unshift(foundCurrentAccount);
      }

      if (foundAccountAll) {
        result.unshift(foundAccountAll);
      }

      return result;
    }

    return fullAccounts.filter(a => !isAccountAll(a.address));
  }, [fullAccounts, currentAccountAddress]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  const allAddress = useMemo(() => {
    const addresses: string[] = [];

    items.forEach(obj => {
      addresses.push(obj.address);
    });

    return addresses;
  }, [items]);

  const selectedAccounts = useMemo(() => {
    if (Object.keys(selectedValueMap).includes(ALL_ACCOUNT_KEY)) {
      return Object.keys(selectedValueMap)
        .filter(item => item !== ALL_ACCOUNT_KEY)
        .filter(i => selectedValueMap[i]);
    } else {
      return Object.keys(selectedValueMap).filter(i => selectedValueMap[i]);
    }
  }, [selectedValueMap]);

  const onSelectAccount = useCallback(
    (value: string, isCheck?: boolean) => {
      setSelectedValueMap(prev => {
        const newMap = { ...prev };

        if (isAccountAll(value)) {
          allAddress.forEach(key => {
            newMap[key] = !!isCheck;
          });
          newMap[ALL_ACCOUNT_KEY] = !!isCheck;
        } else {
          newMap[value] = !!isCheck;
          newMap[ALL_ACCOUNT_KEY] = allAddress.filter(i => !isAccountAll(i)).every(item => newMap[item]);
        }

        return newMap;
      });
    },
    [allAddress],
  );

  const onPressSubmit = useCallback(
    (password: string) => {
      setIsBusy(true);
      const time = Date.now();
      if (selectedAccounts.length > 1) {
        setJsonFileName(`batch_export${time}.json`);
      } else {
        setJsonFileName(`${toShort(selectedAccounts[0])}.json`);
      }

      exportAccountsV2({
        password: password,
        addresses: selectedAccounts,
      })
        .then(data => {
          setJsonData(data.exportedJson);
          setSuccessModalVisible(true);
          setIsBusy(false);
          setPasswordModalVisible(false);
        })
        .catch(e => {
          setIsBusy(false);
          setErrorArr([e.message]);
        });
    },
    [selectedAccounts],
  );

  const onExportJson = useCallback(() => {
    Share.share({ title: 'Account Json', message: JSON.stringify(jsonData) });
  }, [jsonData]);

  const onCloseSuccessModal = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountJson>) => {
      const isAllAccount = isAccountAll(item.address);

      return (
        <SelectAccountItem
          key={item.address}
          address={item.address}
          accountName={item.name}
          isSelected={selectedValueMap[item.address]}
          isShowMultiCheck={true}
          isShowEditBtn={false}
          isAllAccount={isAllAccount}
          onSelectAccount={_item => {
            onSelectAccount(_item, !selectedValueMap[_item]);
          }}
          onPressDetailBtn={() => {
            navigation.navigate('EditAccount', { address: item.address, name: item.name || '' });
          }}
          avatarGroupStyle={{ width: 40 }}
        />
      );
    },
    [navigation, onSelectAccount, selectedValueMap],
  );

  const renderFooter = useCallback(() => {
    return (
      <View style={{ padding: theme.padding }}>
        <Button
          onPress={() => setPasswordModalVisible(true)}
          disabled={selectedAccounts.length === 0}
          icon={
            <Icon
              phosphorIcon={Export}
              weight={'fill'}
              iconColor={selectedAccounts.length === 0 ? theme.colorTextLight4 : theme.colorWhite}
            />
          }>
          {`Export ${selectedAccounts.length} account${selectedAccounts.length > 1 ? 's' : ''}`}
        </Button>
      </View>
    );
  }, [selectedAccounts.length, theme.colorTextLight4, theme.colorWhite, theme.padding]);

  return (
    <>
      <FlatListScreen
        items={items}
        renderListEmptyComponent={renderListEmptyComponent}
        title={i18n.header.exportAccount}
        onPressBack={() => navigation.goBack()}
        renderItem={renderItem}
        loading={!isReady}
        filterOptions={filterOptions}
        filterFunction={filterFunction}
        isShowFilterBtn={true}
        afterListItem={renderFooter()}
        searchFunction={searchFunc}
        autoFocus={false}
        extraData={JSON.stringify(selectedValueMap)}
        keyExtractor={item => item.address}
        estimatedItemSize={80}
      />

      <SwFullSizeModal
        modalVisible={successModalVisible}
        setVisible={setSuccessModalVisible}
        modalBaseV2Ref={successModalRef}
        isUseModalV2>
        <ContainerWithSubHeader title={i18n.header.successful} onPressBack={onCloseSuccessModal}>
          <View style={{ paddingHorizontal: theme.padding, paddingVertical: theme.padding, flex: 1 }}>
            <View style={{ gap: theme.padding, paddingBottom: theme.padding, flex: 1 }}>
              <AlertBox
                title={i18n.warning.warningAccTitle}
                description={i18n.warning.warningAccMessage}
                type="warning"
              />
              <Typography.Text
                style={{
                  ...FontSemiBold,
                  color: theme.colorTextSecondary,
                  textTransform: 'uppercase',
                }}
                size={'sm'}>
                {i18n.exportAccount.yourJsonFile}
              </Typography.Text>

              <SelectItem
                onPress={onExportJson}
                icon={AddressBook}
                backgroundColor={theme.colorPrimary}
                label={jsonFileName}
                rightIcon={
                  <Icon phosphorIcon={DownloadSimple} size={'sm'} iconColor={theme.colorTextTertiary} weight={'bold'} />
                }
              />

              <Typography.Text style={{ color: theme.colorTextTertiary }}>
                {
                  'Click on the file to download and select where you want to keep your backup file. We recommend you keep it in a password-protected folder to secure your assets'
                }
              </Typography.Text>
            </View>

            <Button
              icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}
              onPress={() => navigation.navigate('Home')}>
              Finish
            </Button>
          </View>
        </ContainerWithSubHeader>
      </SwFullSizeModal>

      <PasswordModal
        visible={passwordModalVisible}
        setModalVisible={setPasswordModalVisible}
        isBusy={isBusy}
        onConfirm={onPressSubmit}
        errorArr={errorArr}
        setErrorArr={setErrorArr}
      />
    </>
  );
};
