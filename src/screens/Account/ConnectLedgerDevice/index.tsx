import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { CaretRight, CheckCircle, CircleNotch, Info, QrCode, Swatches, X } from 'phosphor-react-native';
import useGoHome from 'hooks/screen/useGoHome';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { FlatList, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import DualLogo from 'components/Logo/DualLogo';
import { BackgroundIcon, Button, Icon, Image, Typography } from 'components/design-system-ui';
import { ImageLogosMap } from 'assets/logo';
import i18n from 'utils/i18n/i18n';
import createStyle from 'screens/Account/ConnectQrSigner/styles';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SWImageProps } from 'components/design-system-ui/image';
import useGetSupportedLedger from 'hooks/ledger/useGetSupportedLedger';
import { ChainItemType } from 'types/index';
import { ChainSelector } from 'components/Modal/common/ChainSelector';
import { ModalRef } from 'types/modalRef';
import { NetworkField } from 'components/Field/Network';
import useBluetoothPermissions from 'hooks/useBluetoothPermissions';
import useBluetooth from 'hooks/ledger/useBluetooth';
import useBluetoothDevices from 'hooks/ledger/useBluetoothDevices';
import { DeviceSelectorModal } from 'components/Ledger/DeviceSelectorModal';
import 'react-native-get-random-values';
import { FontMedium } from 'styles/sharedStyles';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import { useLedger } from 'hooks/ledger/useLedger';
import { LedgerNetwork } from '@subwallet/extension-base/background/KoniTypes';
import { ActivityLoading } from 'components/ActivityLoading';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import reformatAddress from 'utils/index';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { createAccountHardwareMultiple } from 'messaging/index';

const imageProps: Omit<SWImageProps, 'src'> = {
  squircleSize: 56,
  style: { width: 56, height: 56 },
  resizeMode: 'contain',
};

interface ImportLedgerItem {
  accountIndex: number;
  address: string;
  name: string;
}

const INSTRUCTION = [
  {
    id: '1',
    label: 'Make sure Network app is installed to your Ledger device using Ledger Live app',
  },
  {
    id: '2',
    label: 'Open the network app on your Ledger device',
  },
  {
    id: '3',
    label: 'Allow SubWallet to access Bluetooth',
  },
  {
    id: '4',
    label: 'Select account to add to wallet',
  },
];

enum STEP {
  INTRODUCTION = 'introduction',
  SELECT_NETWORK_AND_DEVICE = 'selectNetworkAndDevice',
  SELECT_ACCOUNT = 'selectAccount',
}

const LIMIT_PER_PAGE = 5;

export const ConnectLedgerDevice = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const goHome = useGoHome();
  const onBack = navigation.goBack;
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const supportedLedger = useGetSupportedLedger();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'introduction' | 'selectNetworkAndDevice' | 'selectAccount'>('introduction');
  const networks = useMemo(
    (): ChainItemType[] =>
      supportedLedger.map(network => ({
        name: network.networkName,
        slug: network.slug,
      })),
    [supportedLedger],
  );

  const chainSelectorRef = useRef<ModalRef>();
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0].slug);

  const { hasBluetoothPermissions } = useBluetoothPermissions();
  const { bluetoothOn } = useBluetooth(hasBluetoothPermissions);
  const { devices } = useBluetoothDevices(hasBluetoothPermissions, bluetoothOn);
  const [deviceModalVisible, setDeviceModalVisible] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const transportRef = useRef<TransportBLE | undefined>(undefined);
  const { error, getAddress, isLoading, isLocked, ledger, refresh, warning } = useLedger(
    transportRef.current,
    selectedNetwork,
  );
  const [ledgerAccounts, setLedgerAccounts] = useState<Array<ImportLedgerItem | null>>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<ImportLedgerItem[]>([]);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageRef = useRef<number>(0);

  const selectedChain = useMemo((): LedgerNetwork | undefined => {
    return supportedLedger.find(n => n.slug === selectedNetwork);
  }, [selectedNetwork, supportedLedger]);

  const accountName = useMemo(() => selectedChain?.accountName || 'Unknown', [selectedChain]);

  const setUpBluetoothConnection = async (_deviceId: string | undefined) => {
    setDeviceId(_deviceId);
    setLoading(true);
    if (_deviceId) {
      try {
        const _transport = await TransportBLE.open(_deviceId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _transport.on('disconnect', (e: any) => {
          transportRef.current = undefined;
        });
        transportRef.current = _transport;
        refresh();
        setLoading(false);
      } catch (e) {
        // Reset all connection states
        console.log('error when connect ledger', e);
      }
    }
  };

  const onLoadMore = useCallback(() => {
    if (ledgerAccounts.length === 10) {
      return;
    }

    setIsLoadMore(true);
    pageRef.current = pageRef.current + 1;

    const handler = async () => {
      const start = 0;
      const end = 10;

      const rs: Array<ImportLedgerItem | null> = new Array<ImportLedgerItem | null>(LIMIT_PER_PAGE).fill(null);

      setLedgerAccounts(prevState => {
        return [...prevState, ...rs];
      });

      for (let i = start; i < end; i++) {
        try {
          const { address } = await getAddress(i);

          rs[i - start] = {
            accountIndex: i,
            name: `Ledger ${accountName} ${i + 1}`,
            address: address,
          };
        } catch (e) {
          refresh();
          break;
        }
      }

      setLedgerAccounts(prevState => {
        const result = [...prevState];

        for (let i = start; i < end; i++) {
          result[i] = rs[i - start];
        }

        return result;
      });
    };

    handler()
      .then()
      .catch()
      .finally(() => setIsLoadMore(false));
  }, [accountName, getAddress, ledgerAccounts.length, refresh]);

  const onComplete = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const onSubmit = useCallback(() => {
    if (!selectedAccounts.length || !selectedChain) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      createAccountHardwareMultiple({
        accounts: selectedAccounts.map(item => ({
          accountIndex: item.accountIndex,
          address: item.address,
          addressOffset: 0, // don't change
          genesisHash: selectedChain.genesisHash,
          hardwareType: 'ledger',
          name: item.name,
          isEthereum: selectedChain.isEthereum,
        })),
      })
        .then(onComplete)
        .catch((e: Error) => {
          console.log(e);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }, 300);
  }, [onComplete, selectedAccounts, selectedChain]);

  const onPressContinueButton = () => {
    if (step === 'introduction') {
      setStep('selectNetworkAndDevice');
    } else if (step === 'selectNetworkAndDevice') {
      onLoadMore();
      setStep('selectAccount');
    } else {
      onSubmit();
    }
  };

  const onPressItem = useCallback((_selectedAccounts: ImportLedgerItem[], item: ImportLedgerItem): (() => void) => {
    return () => {
      const exists = _selectedAccounts.find(it => it.address === item.address);
      let result: ImportLedgerItem[];

      if (exists) {
        result = _selectedAccounts.filter(it => it.address !== item.address);
      } else {
        result = [..._selectedAccounts];
        result.push(item);
      }

      setSelectedAccounts(result);
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ImportLedgerItem | null>) => {
      if (!item) {
        return <></>;
      }
      const selected = !!selectedAccounts.find(it => it.address === item.address);
      const originAddress = reformatAddress(item.address, 42);
      const disabled = !!accounts.find(acc => acc.address === originAddress);
      return (
        <AccountItemWithName
          key={index}
          accountName={item.name}
          address={item?.address || ''}
          direction={'vertical'}
          isSelected={selected || disabled}
          genesisHash={selectedChain?.genesisHash}
          showUnselectIcon={true}
          onPress={disabled ? undefined : onPressItem(selectedAccounts, item)}
          customStyle={{ container: { marginBottom: theme.marginXS } }}
        />
      );
    },
    [accounts, onPressItem, selectedAccounts, selectedChain?.genesisHash, theme.marginXS],
  );

  const renderLoadingAnimation = () => {
    return isLoadMore ? <ActivityLoading /> : null;
  };

  const isConnected = !isLocked && !isLoading && !!ledger;

  const buttonDisable = useMemo(() => {
    switch (step) {
      case 'introduction':
        return false;
      case 'selectNetworkAndDevice':
        return !isConnected || loading;
      case 'selectAccount':
        return false;
    }
  }, [isConnected, loading, step]);

  return (
    <ContainerWithSubHeader
      title={'Connect Ledger device'}
      onPressBack={onBack}
      rightIcon={X}
      onPressRightIcon={goHome}>
      <View style={styles.body}>
        {step !== STEP.SELECT_ACCOUNT && (
          <>
            <Text style={styles.subTitle}>{'Connect and unlock your Ledger, then open the DApps on your Ledger.'}</Text>
            <View>
              <DualLogo
                leftLogo={<Image {...imageProps} src={ImageLogosMap.subwallet} />}
                rightLogo={<Image {...imageProps} src={ImageLogosMap.ledger} />}
              />
            </View>
          </>
        )}

        {step === STEP.INTRODUCTION && (
          <>
            <Button
              size={'xs'}
              type={'ghost'}
              icon={<Icon phosphorIcon={Info} size={'sm'} iconColor={theme.colorPrimary} weight={'fill'} />}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: theme.paddingXXS }}>
                <Typography.Text style={{ color: theme.colorPrimary }} size={'sm'}>
                  {"Ledger's official Bluetooth Connection Guide"}
                </Typography.Text>
                <Icon phosphorIcon={CaretRight} iconColor={theme.colorPrimary} size={'xxs'} weight={'bold'} />
              </View>
            </Button>

            <View style={{ width: '100%', flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              {INSTRUCTION.map(item => (
                <View key={item.id} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 16,
                      backgroundColor: theme.colorBgDivider,
                    }}>
                    <Typography.Text style={{ color: theme.colorTextLight3 }}>{item.id}</Typography.Text>
                  </View>

                  <Typography.Text style={{ color: theme.colorTextLight4, flex: 1, paddingLeft: theme.paddingXS }}>
                    {item.label}
                  </Typography.Text>
                </View>
              ))}
            </View>
          </>
        )}

        {step === STEP.SELECT_NETWORK_AND_DEVICE && (
          <View style={{ width: '100%', flex: 1, gap: theme.sizeXS }}>
            <ChainSelector
              items={networks}
              selectedValueMap={{ [selectedNetwork]: true }}
              chainSelectorRef={chainSelectorRef}
              onSelectItem={item => setSelectedNetwork(item.slug)}
              renderSelected={() => (
                <NetworkField
                  label={'Select network'}
                  networkKey={selectedNetwork}
                  outerStyle={{ marginBottom: 0 }}
                  placeholder={i18n.placeholder.selectChain}
                  showIcon
                />
              )}
            />

            <TouchableOpacity
              onPress={deviceId ? () => setUpBluetoothConnection(deviceId) : () => setDeviceModalVisible(true)}
              style={{
                backgroundColor: theme.colorBgSecondary,
                borderRadius: theme.borderRadiusLG,
                paddingHorizontal: theme.padding - 2,
                paddingVertical: theme.paddingSM,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View style={{ flexDirection: 'row', gap: theme.sizeXS }}>
                <BackgroundIcon
                  backgroundColor={isConnected ? theme['green-6'] : theme['gray-4']}
                  size={'sm'}
                  phosphorIcon={isConnected ? Swatches : CircleNotch}
                  weight={'fill'}
                />
                <Typography.Text size={'md'} style={{ color: theme.colorWhite, ...FontMedium }}>
                  {isConnected ? 'Device found' : warning || error || (ledger ? 'Loading' : 'Searching Ledger device')}
                </Typography.Text>
              </View>
              {isConnected && <Icon phosphorIcon={CheckCircle} size="md" weight="fill" />}
            </TouchableOpacity>

            <DeviceSelectorModal
              deviceModalVisible={deviceModalVisible}
              devices={devices}
              setDeviceModalVisible={setDeviceModalVisible}
              networkName={''}
              onPressItem={setUpBluetoothConnection}
            />
          </View>
        )}

        {step === STEP.SELECT_ACCOUNT && (
          <FlatList
            style={{ width: '100%', marginTop: theme.margin }}
            data={ledgerAccounts}
            renderItem={renderItem}
            onEndReached={onLoadMore}
            ListFooterComponent={renderLoadingAnimation}
          />
        )}
      </View>
      <View style={styles.footer}>
        <Button
          onPress={onPressContinueButton}
          disabled={buttonDisable}
          icon={<Icon phosphorIcon={QrCode} weight="fill" />}
          loading={loading || isSubmitting}>
          {'Continue'}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};
