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

  const performNextProcess = useCallback(
    (increaseProcessOrdinal = true) => {
      if (currentProcessOrdinal === totalProcessSteps) {
        onCompleteMigrationProcess();

        return;
      }

      setCurrentToBeMigratedGroupIndex(prev => prev + 1);

      if (increaseProcessOrdinal) {
        setCurrentProcessOrdinal(prev => prev + 1);
      }
    },
    [currentProcessOrdinal, onCompleteMigrationProcess, totalProcessSteps],
  );

  const onSkip = useCallback(() => {
    setTotalProcessSteps(prev => {
      if (prev > 0) {
        return prev - 1;
      }

      return prev;
    });

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

      performNextProcess();
    },
    [onApprove, performNextProcess, sessionId],
  );

  const currentSoloAccountToBeMigratedGroup = soloAccountToBeMigratedGroups[currentToBeMigratedGroupIndex];

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
