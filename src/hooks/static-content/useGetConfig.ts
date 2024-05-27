import axios from 'axios';
import { useCallback } from 'react';
import { mmkvStore } from 'utils/storage';
import { STATIC_DATA_DOMAIN } from 'constants/index';

export function useGetConfig() {
  const getConfig = useCallback(async () => {
    axios
      .get(`${STATIC_DATA_DOMAIN}/config/remind-backup/list.json`)
      .then(res => {
        mmkvStore.set('storedRemindBackupTimeout', res.data.backupTimeout);
      })
      .catch(() => {
        const remindBackupTimeout = mmkvStore.getNumber('storedRemindBackupTimeout');
        if (!remindBackupTimeout) {
          mmkvStore.set('storedRemindBackupTimeout', 1296000000);
        }
      });
  }, []);

  return { getConfig };
}
