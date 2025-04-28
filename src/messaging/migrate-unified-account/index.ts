import {
  RequestMigrateSoloAccount,
  RequestMigrateUnifiedAndFetchEligibleSoloAccounts,
  RequestPingSession,
  ResponseMigrateSoloAccount,
  ResponseMigrateUnifiedAndFetchEligibleSoloAccounts,
} from '@subwallet/extension-base/background/KoniTypes';
import { sendMessage } from 'messaging/base';

export function migrateUnifiedAndFetchEligibleSoloAccounts(
  request: RequestMigrateUnifiedAndFetchEligibleSoloAccounts,
): Promise<ResponseMigrateUnifiedAndFetchEligibleSoloAccounts> {
  return sendMessage('pri(migrate.migrateUnifiedAndFetchEligibleSoloAccounts)', request);
}

export function migrateSoloAccount(request: RequestMigrateSoloAccount): Promise<ResponseMigrateSoloAccount> {
  return sendMessage('pri(migrate.migrateSoloAccount)', request);
}

export function pingSession(request: RequestPingSession) {
  return sendMessage('pri(migrate.pingSession)', request);
}
