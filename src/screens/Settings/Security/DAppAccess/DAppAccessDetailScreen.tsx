import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, StyleProp, Switch, View } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyListScreen } from 'screens/Settings/Security/DAppAccess/EmptyListScreen';
import { DotsThree, PushPinSlash } from 'phosphor-react-native';
import { MoreOptionModal } from 'screens/Settings/Security/DAppAccess/MoreOptionModal';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { DAppAccessDetailProps, RootNavigationProps } from 'routes/index';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { Account } from 'components/Account';
import { Divider } from 'components/Divider';
import { ColorMap } from 'styles/color';
import {
  changeAuthorization,
  changeAuthorizationPerAccount,
  forgetSite,
  toggleAuthorization,
} from '../../../../messaging';
import { AuthUrlInfo } from '@subwallet/extension-base/background/handlers/State';
import { updateAuthUrls } from 'stores/updater';
import { useNavigation } from '@react-navigation/native';
import i18n from 'utils/i18n/i18n';
import { ContainerHorizontalPadding } from 'styles/sharedStyles';

type Props = {
  origin: string;
  accountAuthType: string;
  authInfo: AuthUrlInfo;
};

const itemContainerStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  position: 'relative',
};

const blockLayerStyle: StyleProp<any> = {
  position: 'absolute',
  backgroundColor: ColorMap.dark1,
  opacity: 0.7,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

const filterFunction = (items: AccountJson[], searchString: string) => {
  return items.filter(item => item.name?.toLowerCase().includes(searchString.toLowerCase()));
};

const Content = ({ origin, accountAuthType, authInfo }: Props) => {
  const navigation = useNavigation<RootNavigationProps>();
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const accountItems = useMemo(() => {
    const accountListWithoutAll = accounts.filter(opt => opt.address !== 'ALL');

    if (accountAuthType === 'substrate') {
      return accountListWithoutAll.filter(acc => !isEthereumAddress(acc.address));
    } else if (accountAuthType === 'evm') {
      return accountListWithoutAll.filter(acc => isEthereumAddress(acc.address));
    } else {
      return accountListWithoutAll;
    }
  }, [accountAuthType, accounts]);

  const dAppAccessDetailMoreOptions = useMemo(() => {
    const isAllowed = authInfo.isAllowed;

    const options = [
      {
        name: isAllowed ? i18n.common.block : i18n.common.unblock,
        onPress: () => {
          toggleAuthorization(origin)
            .then(({ list }) => {
              updateAuthUrls(list);
            })
            .catch(console.error);
          setModalVisible(false);
        },
      },
      {
        name: i18n.common.forgetSite,
        onPress: () => {
          forgetSite(origin, updateAuthUrls).catch(console.error);
          navigation.canGoBack() && navigation.goBack();
        },
      },
    ];

    if (isAllowed) {
      options.push(
        {
          name: i18n.common.disconnectAll,
          onPress: () => {
            changeAuthorization(false, origin, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
        {
          name: i18n.common.connectAll,
          onPress: () => {
            changeAuthorization(true, origin, updateAuthUrls).catch(console.error);
            setModalVisible(false);
          },
        },
      );
    }

    return options;
  }, [origin, authInfo, navigation]);

  useEffect(() => {
    setPendingMap(prevMap => {
      if (!Object.keys(prevMap).length) {
        return prevMap;
      }

      return {};
    });
  }, [authInfo]);

  const rightIconOption = useMemo(() => {
    return {
      icon: DotsThree,
      onPress: () => setModalVisible(true),
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AccountJson>) => {
      const isEnabled: boolean = authInfo.isAllowedMap[item.address];

      const onChangeToggle = () => {
        setPendingMap(prevMap => {
          return {
            ...prevMap,
            [item.address]: !isEnabled,
          };
        });
        changeAuthorizationPerAccount(item.address, !isEnabled, origin, updateAuthUrls).catch(() => {
          setPendingMap(prevMap => {
            const newMap = { ...prevMap };

            delete newMap[item.address];

            return newMap;
          });
        });
      };

      return (
        <View style={itemContainerStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Account
              name={item.name || ''}
              address={item.address}
              showCopyBtn={false}
              showSelectedIcon={false}
              isDisabled={true}
            />
            <Switch
              disabled={pendingMap[item.address] !== undefined}
              ios_backgroundColor={ColorMap.switchInactiveButtonColor}
              value={pendingMap[item.address] === undefined ? isEnabled : pendingMap[item.address]}
              onValueChange={onChangeToggle}
            />
          </View>
          <Divider style={{ paddingLeft: 56 }} color={ColorMap.dark2} />
          {!authInfo.isAllowed && <View style={blockLayerStyle} />}
        </View>
      );
    },
    [authInfo, pendingMap, origin],
  );

  return (
    <FlatListScreen
      title={origin}
      autoFocus={false}
      items={accountItems}
      filterFunction={filterFunction}
      renderListEmptyComponent={() => (
        <EmptyListScreen icon={PushPinSlash} title={i18n.common.noAccountAvailableForThisDApp} />
      )}
      rightIconOption={rightIconOption}
      renderItem={renderItem}
      afterListItem={
        <MoreOptionModal
          modalVisible={modalVisible}
          moreOptionList={dAppAccessDetailMoreOptions}
          onChangeModalVisible={() => setModalVisible(false)}
        />
      }
    />
  );
};

export const DAppAccessDetailScreen = ({
  route: {
    params: { origin, accountAuthType },
  },
}: DAppAccessDetailProps) => {
  const authInfo: undefined | AuthUrlInfo = useSelector((state: RootState) => state.authUrls.details[origin]);

  return <>{!!authInfo && <Content accountAuthType={accountAuthType} origin={origin} authInfo={authInfo} />}</>;
};
