import React, { useCallback, useEffect, useState } from 'react';
import { RequestMigrateSoloAccount, SoloAccountToBeMigrated } from '@subwallet/extension-base/background/KoniTypes';
import { VoidFunction } from 'types/index';
import { ProcessViewItem } from 'screens/MigrateAccount/SoloAccountMigrationView/ProcessViewItem';
import { SESSION_TIMEOUT } from '@subwallet/extension-base/services/keyring-service/context/handlers/Migration';
import { pingSession } from 'messaging/migrate-unified-account';

interface Props {
  soloAccountToBeMigratedGroups: SoloAccountToBeMigrated[][];
  onApprove: (request: RequestMigrateSoloAccount) => Promise<void>;
  sessionId?: string;
  onCompleteMigrationProcess: VoidFunction;
}

const SoloAccountMigrationView: React.FC<Props> = ({
  soloAccountToBeMigratedGroups,
  onCompleteMigrationProcess,
  sessionId,
  onApprove,
}: Props) => {
  const [currentProcessOrdinal, setCurrentProcessOrdinal] = useState<number>(1);
  const [currentToBeMigratedGroupIndex, setCurrentToBeMigratedGroupIndex] = useState<number>(0);
  const [totalProcessSteps, setTotalProcessSteps] = useState<number>(soloAccountToBeMigratedGroups.length);

  const performNextProcess = useCallback((increaseProcessOrdinal = true) => {
    setCurrentToBeMigratedGroupIndex(prev => prev + 1);

    if (increaseProcessOrdinal) {
      setCurrentProcessOrdinal(prev => prev + 1);
    }
  }, []);

  const onSkip = useCallback(() => {
    setTotalProcessSteps(prev => (prev > 0 ? prev - 1 : prev));
    performNextProcess(false);
  }, [performNextProcess]);

  const _onApprove = useCallback(
    async (soloAccounts: SoloAccountToBeMigrated[], accountName: string) => {
      if (!sessionId) {
        return;
      }

      await onApprove({
        soloAccounts,
        sessionId,
        accountName,
      });

      performNextProcess(true);
    },
    [onApprove, performNextProcess, sessionId],
  );

  const currentSoloAccountToBeMigratedGroup = soloAccountToBeMigratedGroups[currentToBeMigratedGroupIndex];

  useEffect(() => {
    if (currentProcessOrdinal === totalProcessSteps + 1) {
      onCompleteMigrationProcess();
    }
  }, [currentProcessOrdinal, totalProcessSteps, onCompleteMigrationProcess]);

  useEffect(() => {
    // keep the session alive while in this view

    let timer: string | number | NodeJS.Timeout | undefined;

    if (sessionId) {
      const doPing = () => {
        pingSession({ sessionId }).catch(console.error);
      };

      timer = setInterval(() => {
        doPing();
      }, SESSION_TIMEOUT / 2);

      doPing();
    }

    return () => {
      clearInterval(timer);
    };
  }, [sessionId]);

  return (
    <>
      {!!currentSoloAccountToBeMigratedGroup && (
        <ProcessViewItem
          currentProcessOrdinal={currentProcessOrdinal}
          currentSoloAccountToBeMigratedGroup={currentSoloAccountToBeMigratedGroup}
          key={`ProcessViewItem-${currentToBeMigratedGroupIndex}`}
          onApprove={_onApprove}
          onSkip={onSkip}
          totalProcessSteps={totalProcessSteps}
        />
      )}
    </>
  );
};

export default SoloAccountMigrationView;
