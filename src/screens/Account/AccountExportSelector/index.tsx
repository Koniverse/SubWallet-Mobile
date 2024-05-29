import { AccountJson } from '@subwallet/extension-base/background/types';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import i18n from 'utils/i18n/i18n';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ModalRef } from 'types/modalRef';
import { isAccountAll } from 'utils/accountAll';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AddressBook, CheckCircle, DownloadSimple, Export } from 'phosphor-react-native';
import PasswordModal from 'components/Modal/PasswordModal';
import { exportAccountsV2 } from 'messaging/index';
import { AccountSignMode } from 'types/signer';
import { getSignMode } from 'utils/account';
import { Button, Icon, SelectItem, SwFullSizeModal } from 'components/design-system-ui';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { KeyringPairs$Json } from '@subwallet/ui-keyring/types';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Share, View } from 'react-native';
import { toShort } from 'utils/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props {
  items: AccountJson[];
  accountExportRef?: React.MutableRefObject<ModalRef | undefined>;
}

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
    value: AccountSignMode.LEDGER,
  },
  {
    label: 'Watch-only account',
    value: AccountSignMode.READ_ONLY,
  },
];

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
        case AccountSignMode.LEDGER:
          return signMode === AccountSignMode.LEDGER;
        case AccountSignMode.READ_ONLY:
          return signMode === AccountSignMode.READ_ONLY;
      }
    }
    return false;
  });
};

export const AccountExportSelector = ({ items, accountExportRef }: Props) => {
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
      if (isAccountAll(value)) {
        const allSelectedMap = allAddress.reduce((current, item) => {
          // @ts-ignore
          current[item] = !!isCheck;
          return current;
        }, {});
        setSelectedValueMap(allSelectedMap);
      } else {
        setSelectedValueMap(prev => ({
          ...prev,
          [value]: !!isCheck,
        }));
      }
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
          // Share.share({ title: 'Account Json', message: JSON.stringify(data) });
        })
        .catch(e => console.error(e))
        .finally(() => {
          setIsBusy(false);
          setPasswordModalVisible(false);
        });
    },
    [selectedAccounts],
  );

  const onExportJson = useCallback(() => {
    Share.share({ title: 'Account Json', message: JSON.stringify(jsonData) });
  }, [jsonData]);

  const onCloseExportAllModal = useCallback(() => {
    setJsonFileName('');
    setJsonData(undefined);
    setSelectedValueMap({});
  }, []);

  const onCloseSuccessModal = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <>
      <FullSizeSelectModal
        items={items}
        onCloseModal={onCloseExportAllModal}
        selectedValueMap={selectedValueMap}
        onSelectItem={item => {
          onSelectAccount(item.address, !selectedValueMap[item.address]);
        }}
        selectModalType={'multi'}
        selectModalItemType={'account'}
        placeholder={i18n.placeholder.accountName}
        title={i18n.header.exportAccount}
        ref={accountExportRef}
        closeModalAfterSelect={false}
        applyBtn={{
          label: `Export ${selectedAccounts.length} account${selectedAccounts.length > 1 ? 's' : ''}`,
          icon: Export,
          onPressApplyBtn: () => setPasswordModalVisible(true),
          applyBtnDisabled: selectedAccounts.length === 0,
        }}
        filterFunction={filterFunction}
        isShowFilterBtn={true}
        filterOptions={filterOptions}
        showAccountSignModeIcon={true}
        isShowInput={true}>
        <>
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

                  <SelectItem
                    onPress={onExportJson}
                    icon={AddressBook}
                    backgroundColor={theme.colorPrimary}
                    label={jsonFileName}
                    rightIcon={
                      <Icon
                        phosphorIcon={DownloadSimple}
                        size={'sm'}
                        iconColor={theme.colorTextTertiary}
                        weight={'bold'}
                      />
                    }
                  />
                </View>

                <Button
                  icon={<Icon phosphorIcon={CheckCircle} size={'lg'} weight={'fill'} />}
                  onPress={() => navigation.navigate('Home')}>
                  Finish
                </Button>
              </View>
            </ContainerWithSubHeader>
          </SwFullSizeModal>
        </>
      </FullSizeSelectModal>

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
