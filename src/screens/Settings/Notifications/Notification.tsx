import {
  ArrowSquareDownLeft,
  ArrowSquareUpRight,
  BellSimpleRinging,
  BellSimpleSlash,
  Checks,
  Coins,
  DownloadSimple,
  Gear,
  Gift,
  IconProps,
  Info,
  ListBullets,
} from 'phosphor-react-native';
import {
  _NotificationInfo,
  BridgeTransactionStatus,
  ClaimAvailBridgeNotificationMetadata,
  ClaimPolygonBridgeNotificationMetadata,
  NotificationActionType,
  NotificationSetup,
  NotificationTab,
  WithdrawClaimNotificationMetadata,
} from '@subwallet/extension-base/services/inapp-notification-service/interfaces';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useGetChainSlugsByAccount } from 'hooks/useGetChainSlugsByAccount';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchInappNotifications,
  getIsClaimNotificationStatus,
  markAllReadNotification,
  switchReadNotificationStatus,
} from 'messaging/transaction';
import { GetNotificationParams, RequestSwitchStatusParams } from '@subwallet/extension-base/types/notification';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { NotificationItem } from 'components/Item/Notification/NotificationItem';
import { getTotalWidrawable, getYieldRewardTotal } from 'utils/notification';
import BigN from 'bignumber.js';
import { BN_ZERO } from 'utils/chainBalances';
import { isClaimedPosBridge } from '@subwallet/extension-base/services/balance-service/transfer/xcm/posBridge';
import { COMMON_CHAIN_SLUGS } from '@subwallet/chain-list';
import { AppModalContext } from 'providers/AppModalContext';
import { Button, Icon, PageIcon } from 'components/design-system-ui';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import useChainChecker from 'hooks/chain/useChainChecker';
import { SwTab, TabItem } from 'components/design-system-ui/tab';
import { saveNotificationSetup } from 'messaging/settings';
import { FontSemiBold } from 'styles/sharedStyles';
import { NotificationDetailModal } from 'components/Modal/NotificationDetailModal';
import { StyleSheet, View } from 'react-native';
import { ThemeTypes } from 'styles/themes';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';

export interface NotificationInfoItem extends _NotificationInfo {
  backgroundColor: string;
  leftIcon?: React.ElementType<IconProps>;
  disabled?: boolean;
}

export enum NotificationIconBackgroundColorMap {
  SEND = 'colorSuccess',
  RECEIVE = 'lime-7',
  WITHDRAW = 'blue-8',
  CLAIM = 'yellow-7',
  CLAIM_AVAIL_BRIDGE_ON_AVAIL = 'yellow-7', // temporary set
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM = 'yellow-7',
  CLAIM_POLYGON_BRIDGE = 'yellow-7',
}

export const NotificationIconMap = {
  SEND: ArrowSquareUpRight,
  RECEIVE: ArrowSquareDownLeft,
  WITHDRAW: DownloadSimple,
  CLAIM: Gift,
  CLAIM_AVAIL_BRIDGE_ON_AVAIL: Coins, // temporary set
  CLAIM_AVAIL_BRIDGE_ON_ETHEREUM: Coins,
  CLAIM_POLYGON_BRIDGE: Coins,
};

export const Notification = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const chainsByAccountType = useGetChainSlugsByAccount();
  const { confirmModal } = useContext(AppModalContext);
  const { turnOnChain, checkChainConnected } = useChainChecker();
  const { notificationSetup } = useSelector((state: RootState) => state.settings);
  const { accounts, currentAccountProxy, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const { earningRewards, poolInfoMap, yieldPositions } = useSelector((state: RootState) => state.earning);
  const { chainInfoMap, chainStateMap } = useSelector((state: RootState) => state.chainStore);

  const filterTabItems = useMemo<TabItem[]>(() => {
    return [
      {
        label: 'All',
        onPress: () => {},
        value: NotificationTab.ALL,
      },
      {
        label: 'Unread',
        onPress: () => {},
        value: NotificationTab.UNREAD,
      },
      {
        label: 'Read',
        onPress: () => {},
        value: NotificationTab.READ,
      },
    ];
  }, []);
  const [selectedFilterTab, setSelectedFilterTab] = useState<NotificationTab>(NotificationTab.ALL);
  const [viewDetailItem, setViewDetailItem] = useState<NotificationInfoItem | undefined>(undefined);
  const [notifications, setNotifications] = useState<_NotificationInfo[]>([]);
  const [currentProxyId] = useState<string | undefined>(currentAccountProxy?.id);
  const [loadingNotification, setLoadingNotification] = useState<boolean>(false);
  const [isTrigger, setTrigger] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // use this to trigger get date when click read/unread
  const [currentTimestampMs, setCurrentTimestampMs] = useState(Date.now());
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const styles = createStyleSheet(theme);

  const enableNotification = notificationSetup.isEnabled;
  const _onSelectType = (value: string) => {
    setSelectedFilterTab(value as NotificationTab);
  };

  const openNotificationSetting = useCallback(() => {
    navigation.navigate('NotificationSetting');
  }, [navigation]);

  const onEnableNotification = useCallback(() => {
    const newNotificationSetup: NotificationSetup = {
      ...notificationSetup,
      isEnabled: true,
    };
    setLoadingNotification(true);
    saveNotificationSetup(newNotificationSetup)
      .catch(console.error)
      .finally(() => {
        setLoadingNotification(false);
      });
    openNotificationSetting();
  }, [notificationSetup, openNotificationSetting]);

  const notificationItems = useMemo((): NotificationInfoItem[] => {
    const filterTabFunction = (item: NotificationInfoItem) => {
      if (selectedFilterTab === NotificationTab.ALL) {
        return true;
      } else if (selectedFilterTab === NotificationTab.UNREAD) {
        return !item.isRead;
      } else {
        return item.isRead;
      }
    };

    const sortByTimeFunc = (itemA: NotificationInfoItem, itemB: NotificationInfoItem) => {
      return itemB.time - itemA.time;
    };

    return notifications
      .map(item => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          address: item.address,
          time: item.time,
          extrinsicType: item.extrinsicType,
          isRead: item.isRead,
          actionType: item.actionType,
          backgroundColor: theme[NotificationIconBackgroundColorMap[item.actionType]],
          leftIcon: NotificationIconMap[item.actionType],
          metadata: item.metadata,
          proxyId: item.proxyId,
        };
      })
      .filter(filterTabFunction)
      .sort(sortByTimeFunc);
  }, [notifications, selectedFilterTab, theme]);

  const onPressMore = useCallback((item: NotificationInfoItem) => {
    return () => {
      setViewDetailItem(item);
      setDetailModalVisible(true);
    };
  }, []);

  const onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showActiveChainModal = useCallback(
    (chainSlug: string, action: NotificationActionType.WITHDRAW | NotificationActionType.CLAIM) => {
      const isConnected = checkChainConnected(chainSlug);
      if (isConnected) {
        const chainInfo = chainInfoMap[chainSlug];
        const networkName = chainInfo?.name || chainSlug;
        const actionText = action === NotificationActionType.WITHDRAW ? 'withdrawing' : 'claiming';
        const content = `${networkName} network is currently disabled. Enable the network and then re-click the notification to start ${actionText} your funds`;
        setTimeout(() => {
          confirmModal.setConfirmModal({
            visible: true,
            completeBtnTitle: i18n.buttonTitles.enable,
            message: content,
            title: i18n.common.enableChain,
            onCancelModal: () => {
              confirmModal.hideConfirmModal();
            },
            onCompleteModal: () => {
              turnOnChain(chainSlug);
              setTimeout(() => confirmModal.hideConfirmModal(), 300);
            },
            messageIcon: chainSlug,
          });
        }, 700);
      }
    },
    [chainInfoMap, checkChainConnected, confirmModal, turnOnChain],
  );

  const showWarningModal = useCallback(
    (action: string) => {
      confirmModal.setConfirmModal({
        title: `You’ve ${action} tokens`,
        message: `You’ve already ${action} your tokens. Check for unread notifications to stay updated on any important`,
        isShowCancelButton: false,
        completeBtnTitle: i18n.buttonTitles.iUnderstand,
        visible: true,
        onCompleteModal: confirmModal.hideConfirmModal,
        customIcon: <PageIcon icon={Info} color={theme.colorInfo} />,
      });
    },
    [confirmModal, theme.colorInfo],
  );

  const onPressItem = useCallback(
    (item: NotificationInfoItem) => {
      return () => {
        const slug = (item.metadata as WithdrawClaimNotificationMetadata).stakingSlug;
        const totalWithdrawable = getTotalWidrawable(
          slug,
          poolInfoMap,
          yieldPositions,
          currentAccountProxy,
          isAllAccount,
          chainsByAccountType,
          currentTimestampMs,
        );
        const switchStatusParams: RequestSwitchStatusParams = {
          id: item.id,
          isRead: false,
        };

        // Check chain active status before navigate
        switch (item.actionType) {
          case NotificationActionType.WITHDRAW: {
            const metadata = item.metadata as WithdrawClaimNotificationMetadata;

            const chainSlug = metadata.stakingSlug.split('___')[2];
            showActiveChainModal(chainSlug, item.actionType);
            break;
          }
        }

        // Check data available before navigate
        switch (item.actionType) {
          case NotificationActionType.WITHDRAW: {
            if (totalWithdrawable && BigN(totalWithdrawable).gt(BN_ZERO)) {
              const metadata = item.metadata as WithdrawClaimNotificationMetadata;

              switchReadNotificationStatus(switchStatusParams)
                .then(() => {
                  navigation.navigate('Drawer', {
                    screen: 'TransactionAction',
                    params: {
                      screen: 'Withdraw',
                      params: {
                        slug: metadata.stakingSlug,
                        chain: metadata.stakingSlug.split('___')[2],
                        from: item.address,
                      },
                    },
                  });
                })
                .catch(console.error);
            } else {
              showWarningModal('withdrawn');
            }

            break;
          }

          case NotificationActionType.CLAIM: {
            const unclaimedReward = getYieldRewardTotal(
              slug,
              earningRewards,
              poolInfoMap,
              accounts,
              isAllAccount,
              currentAccountProxy,
              chainsByAccountType,
            );
            const metadata = item.metadata as WithdrawClaimNotificationMetadata;
            const chainSlug = metadata.stakingSlug.split('___')[2];

            if (unclaimedReward && BigN(unclaimedReward).gt(BN_ZERO)) {
              switchReadNotificationStatus(switchStatusParams)
                .then(() => {
                  navigation.navigate('Drawer', {
                    screen: 'TransactionAction',
                    params: {
                      screen: 'ClaimReward',
                      params: {
                        slug: metadata.stakingSlug,
                        chain: chainSlug,
                        from: item.address,
                      },
                    },
                  });
                })
                .catch(console.error);
            } else {
              if (chainStateMap[chainSlug]?.active) {
                showWarningModal('claimed');
              } else {
                showActiveChainModal(chainSlug, item.actionType);

                return;
              }
            }

            break;
          }

          case NotificationActionType.CLAIM_POLYGON_BRIDGE: {
            const handleClaimPolygonBridge = async () => {
              try {
                const metadata = item.metadata as ClaimPolygonBridgeNotificationMetadata;
                let isClaimed = false;

                if (metadata.bridgeType === 'POS') {
                  const isTestnet = metadata.chainSlug === COMMON_CHAIN_SLUGS.ETHEREUM_SEPOLIA;

                  isClaimed = (await isClaimedPosBridge(metadata._id, metadata.userAddress, isTestnet)) || false;
                } else {
                  isClaimed = await getIsClaimNotificationStatus({
                    chainslug: metadata.chainSlug,
                    counter: metadata.counter ?? 0,
                    sourceNetwork: metadata.sourceNetwork ?? 0,
                  });
                }

                if (!isClaimed) {
                  await switchReadNotificationStatus(switchStatusParams);
                  navigation.navigate('Drawer', {
                    screen: 'TransactionAction',
                    params: {
                      screen: 'ClaimBridge',
                      params: {
                        chain: metadata.chainSlug,
                        asset: metadata.tokenSlug,
                        notificationId: item.id,
                        from: item.address,
                      },
                    },
                  });
                } else {
                  showWarningModal('claimed');
                }
              } catch (error) {
                console.error(error);
              }
            };

            handleClaimPolygonBridge().catch(err => {
              console.error('Error:', err);
            });
            break;
          }

          case NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_ETHEREUM:
          case NotificationActionType.CLAIM_AVAIL_BRIDGE_ON_AVAIL: {
            const metadata = item.metadata as ClaimAvailBridgeNotificationMetadata;

            if (metadata.status === BridgeTransactionStatus.READY_TO_CLAIM) {
              switchReadNotificationStatus(switchStatusParams)
                .then(() => {
                  navigation.navigate('Drawer', {
                    screen: 'TransactionAction',
                    params: {
                      screen: 'ClaimBridge',
                      params: {
                        chain: metadata.chainSlug,
                        asset: metadata.tokenSlug,
                        notificationId: item.id,
                        from: item.address,
                      },
                    },
                  });
                })
                .catch(console.error);
            } else {
              showWarningModal('claimed');
            }

            break;
          }
        }

        if (!item.isRead) {
          switchReadNotificationStatus(item)
            .catch(console.error)
            .finally(() => {
              setTrigger(!isTrigger);
            });
        }
      };
    },
    [
      accounts,
      chainStateMap,
      chainsByAccountType,
      currentAccountProxy,
      currentTimestampMs,
      earningRewards,
      isAllAccount,
      isTrigger,
      navigation,
      poolInfoMap,
      showActiveChainModal,
      showWarningModal,
      yieldPositions,
    ],
  );

  const markAllRead = useCallback(() => {
    markAllReadNotification(currentProxyId || ALL_ACCOUNT_KEY).catch(console.error);

    setLoading(true);
    fetchInappNotifications({
      proxyId: currentProxyId,
      notificationTab: selectedFilterTab,
    } as GetNotificationParams)
      .then(rs => {
        setNotifications(rs);
        setTimeout(() => setLoading(false), 300);
      })
      .catch(console.error);
  }, [currentProxyId, selectedFilterTab]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NotificationInfoItem>) => {
      return (
        <NotificationItem
          actionType={item.actionType}
          address={item.address}
          backgroundColor={item.backgroundColor}
          description={item.description}
          extrinsicType={item.extrinsicType}
          id={item.id}
          isRead={item.isRead}
          key={item.id}
          leftIcon={item.leftIcon}
          metadata={item.metadata}
          onPress={onPressItem(item)}
          onPressMoreBtn={onPressMore(item)}
          proxyId={item.proxyId}
          time={item.time}
          title={item.title}
        />
      );
    },
    [onPressItem, onPressMore],
  );

  const searchFunction = useCallback((items: NotificationInfoItem[], searchString: string) => {
    const searchTextLowerCase = searchString.toLowerCase();

    return items.filter(item => item.title?.toLowerCase().includes(searchTextLowerCase));
  }, []);

  const renderEmptyList = () => {
    return (
      <EmptyList icon={ListBullets} title={'No notifications yet'} message={'Your notifications will appear here'} />
    );
  };

  const renderEnableNotifications = useCallback(() => {
    return (
      <EmptyList
        icon={BellSimpleSlash}
        title={'Notifications are disabled'}
        message={'Enable notifications now to not miss anything!'}
        addBtnLabel={'Enable notifications'}
        iconButton={BellSimpleRinging}
        onPressAddBtn={onEnableNotification}
        addBtnLoading={loadingNotification}
      />
    );
  }, [loadingNotification, onEnableNotification]);

  useEffect(() => {
    setLoading(true);
    fetchInappNotifications({
      proxyId: currentProxyId,
      notificationTab: selectedFilterTab,
    } as GetNotificationParams)
      .then(rs => {
        setNotifications(rs);
        setTimeout(() => setLoading(false), 300);
      })
      .catch(console.error);
  }, [currentProxyId, isAllAccount, isTrigger, selectedFilterTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestampMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const renderBeforeList = useCallback(() => {
    return (
      <View style={styles.beforeListWrapperStyle}>
        <SwTab
          containerStyle={styles.tabContainerStyle}
          tabs={filterTabItems}
          onSelectType={_onSelectType}
          selectedValue={selectedFilterTab}
          itemStyle={styles.tabItemStyle}
          selectedStyle={styles.tabSelectedStyle}
          textStyle={styles.tabTextStyle}
          selectedTextStyle={styles.tabTextSelectedStyle}
          isShowDivider={true}
        />
        <Button
          icon={<Icon phosphorIcon={Checks} size={'sm'} />}
          type={'ghost'}
          size={'xs'}
          onPress={markAllRead}
          externalTextStyle={styles.markAllReadTextStyle}>
          {'Mark all as read'}
        </Button>
      </View>
    );
  }, [
    filterTabItems,
    markAllRead,
    selectedFilterTab,
    styles.beforeListWrapperStyle,
    styles.markAllReadTextStyle,
    styles.tabContainerStyle,
    styles.tabItemStyle,
    styles.tabSelectedStyle,
    styles.tabTextSelectedStyle,
    styles.tabTextStyle,
  ]);

  return (
    <>
      <FlatListScreen
        style={{ flex: 1 }}
        beforeListItem={renderBeforeList()}
        items={notificationItems}
        renderListEmptyComponent={renderEmptyList}
        title={'Notifications'}
        renderItem={renderItem}
        placeholder={'Search notification'}
        loading={loading}
        isShowMainHeader={false}
        onPressBack={onPressBack}
        searchFunction={searchFunction}
        isShowCustomContent={!enableNotification}
        renderCustomContent={renderEnableNotifications}
        estimatedItemSize={88}
        rightIconOption={{ icon: Gear, onPress: openNotificationSetting }}
        flatListStyle={{
          paddingHorizontal: theme.padding,
          paddingBottom: theme.paddingXS,
        }}
      />

      {viewDetailItem && detailModalVisible && (
        <NotificationDetailModal
          isTrigger={isTrigger}
          notificationItem={viewDetailItem}
          onPressAction={onPressItem(viewDetailItem)}
          setTrigger={setTrigger}
          modalVisible={detailModalVisible}
          setModalVisible={setDetailModalVisible}
        />
      )}
    </>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    tabContainerStyle: {
      backgroundColor: 'transparent',
      marginBottom: theme.sizeXXS,
      paddingHorizontal: theme.paddingSM,
      marginTop: theme.size,
    },
    beforeListWrapperStyle: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    tabItemStyle: {
      backgroundColor: 'transparent',
      flex: undefined,
      height: 20,
      paddingHorizontal: theme.paddingXS,
    },
    tabSelectedStyle: { backgroundColor: 'transparent' },
    tabTextStyle: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorTextTertiary,
      ...FontSemiBold,
    },
    tabTextSelectedStyle: { color: theme.colorWhite },
    markAllReadTextStyle: { color: theme.colorWhite },
  });
}
