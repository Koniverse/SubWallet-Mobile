import React, { useCallback, useState } from 'react';
import { BriefView } from './BriefView';
import SoloAccountMigrationView from 'screens/MigrateAccount/SoloAccountMigrationView';
import SummaryView from 'screens/MigrateAccount/SummaryView';
import PasswordModal from 'components/Modal/PasswordModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { RequestMigrateSoloAccount, SoloAccountToBeMigrated } from '@subwallet/extension-base/background/KoniTypes';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { MigrateAccountProps, RootNavigationProps } from 'routes/index';
import { hasAnyAccountForMigration } from '@subwallet/extension-base/services/keyring-service/utils';
import { migrateSoloAccount, migrateUnifiedAndFetchEligibleSoloAccounts } from 'messaging/migrate-unified-account';
import { saveMigrationAcknowledgedStatus } from 'messaging/index';

export enum ScreenView {
  BRIEF = 'brief',
  SOLO_ACCOUNT_MIGRATION = 'solo-account-migration',
  SUMMARY = 'summary',
}

const MigrateAccount = ({
  route: {
    params: { isForceAccMigration, isNotice },
  },
}: MigrateAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const isMigrationNotice = isNotice;
  const isForcedMigration = isForceAccMigration;
  const [currentScreenView, setCurrentScreenView] = useState<ScreenView>(ScreenView.BRIEF);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [resultProxyIds, setResultProxyIds] = useState<string[]>([]);
  const [soloAccountToBeMigratedGroups, setSoloAccountToBeMigratedGroups] = useState<SoloAccountToBeMigrated[][]>([]);
  const [errorArr, setErrorArr] = useState<string[] | undefined>(undefined);
  const isAcknowledgedUnifiedAccountMigration = useSelector(
    (state: RootState) => state.settings.isAcknowledgedUnifiedAccountMigration,
  );
  const [isBusy, setIsBusy] = useState(false);
  const accountProxies = useSelector((root: RootState) => root.accountState.accountProxies);

  const onClosePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
  }, []);

  const onOpenPasswordModal = useCallback(() => {
    setIsPasswordModalOpen(true);
  }, []);

  const onInteractAction = useCallback(() => {
    if (isMigrationNotice && !isAcknowledgedUnifiedAccountMigration) {
      // flag that user acknowledge the migration
      saveMigrationAcknowledgedStatus({ isAcknowledgedUnifiedAccountMigration: true }).catch(console.error);
    }

    // for now, do nothing
  }, [isAcknowledgedUnifiedAccountMigration, isMigrationNotice]);

  const backToAccountSettings = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
    navigation.navigate('AccountSettings');
  }, [navigation]);

  const onPressDismiss = useCallback(() => {
    onInteractAction();

    // close this screen
    isMigrationNotice
      ? navigation.navigate('Home', {
          screen: 'Main',
          params: { screen: 'Tokens', params: { screen: 'TokenGroups' } },
        })
      : backToAccountSettings();
  }, [backToAccountSettings, isMigrationNotice, navigation, onInteractAction]);

  const onPressMigrateNow = useCallback(() => {
    onInteractAction();

    if (!hasAnyAccountForMigration(accountProxies)) {
      setCurrentScreenView(ScreenView.SUMMARY);
    } else {
      onOpenPasswordModal();
    }
  }, [accountProxies, onInteractAction, onOpenPasswordModal]);

  const onSubmitPassword = useCallback(
    async (password: string) => {
      // migrate all account
      // open migrate solo chain accounts
      setIsBusy(true);
      migrateUnifiedAndFetchEligibleSoloAccounts({ password })
        .then(res => {
          const { sessionId: _sessionId, soloAccounts } = res;

          const soloAccountGroups = Object.values(soloAccounts);

          if (soloAccountGroups.length) {
            setSessionId(_sessionId);
            setSoloAccountToBeMigratedGroups(soloAccountGroups);

            setCurrentScreenView(ScreenView.SOLO_ACCOUNT_MIGRATION);
          } else {
            setCurrentScreenView(ScreenView.SUMMARY);
          }
          setIsBusy(false);
          onClosePasswordModal();
        })
        .catch(err => {
          setErrorArr([err.message]);
        })
        .finally(() => {
          setIsBusy(false);
        });
    },
    [onClosePasswordModal],
  );

  const onApproveSoloAccountMigration = useCallback(async (request: RequestMigrateSoloAccount) => {
    try {
      const { migratedUnifiedAccountId } = await migrateSoloAccount(request);

      setResultProxyIds(prev => {
        return [...prev, migratedUnifiedAccountId];
      });
    } catch (e) {
      console.log('onApproveSoloAccountMigration error:', e);
    }
  }, []);

  const onCompleteSoloAccountsMigrationProcess = useCallback(() => {
    setCurrentScreenView(ScreenView.SUMMARY);
    setSessionId(undefined);
  }, []);

  const onPressFinish = useCallback(() => {
    navigation.navigate('Home', {
      screen: 'Main',
      params: { screen: 'Tokens', params: { screen: 'TokenGroups' } },
    });
  }, [navigation]);

  return (
    <>
      {currentScreenView === ScreenView.BRIEF && (
        <BriefView
          isForcedMigration={isForcedMigration}
          onDismiss={onPressDismiss}
          onMigrateNow={onPressMigrateNow}
          isBusy={isBusy}
        />
      )}

      {currentScreenView === ScreenView.SOLO_ACCOUNT_MIGRATION && (
        <SoloAccountMigrationView
          onApprove={onApproveSoloAccountMigration}
          onCompleteMigrationProcess={onCompleteSoloAccountsMigrationProcess}
          sessionId={sessionId}
          soloAccountToBeMigratedGroups={soloAccountToBeMigratedGroups}
        />
      )}

      {currentScreenView === ScreenView.SUMMARY && (
        <SummaryView onPressFinish={onPressFinish} resultProxyIds={resultProxyIds} />
      )}

      {isPasswordModalOpen && (
        <PasswordModal
          visible={isPasswordModalOpen}
          setModalVisible={setIsPasswordModalOpen}
          onConfirm={onSubmitPassword}
          errorArr={errorArr}
          setErrorArr={setErrorArr}
          isBusy={isBusy}
        />
      )}
    </>
  );
};

export default MigrateAccount;
