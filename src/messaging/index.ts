import { getId } from '@subwallet/extension-base/utils/getId';
import { metadataExpand } from '@subwallet/extension-chains';
import { Chain } from '@subwallet/extension-chains/types';
import { RefObject } from 'react';
import WebView from 'react-native-webview';
import { WebRunnerStatus } from 'providers/contexts';
import { getSavedMeta, setSavedMeta } from 'utils/MetadataCache';
import { WebviewError, WebviewNotReadyError, WebviewResponseError } from '../errors/WebViewErrors';
import EventEmitter from 'eventemitter3';
import type {
  AccountJson,
  AllowedPath,
  AuthorizeRequest,
  MessageTypes,
  MessageTypesWithNoSubscriptions,
  MessageTypesWithNullRequest,
  MessageTypesWithSubscriptions,
  MetadataRequest,
  RequestCurrentAccountAddress,
  RequestSignatures,
  RequestTypes,
  ResponseAuthorizeList,
  ResponseDeriveValidate,
  ResponseJsonGetAccountInfo,
  ResponseSigningIsLocked,
  ResponseTypes,
  SeedLengths,
  SigningRequest,
  SubscriptionMessageTypes,
} from '@subwallet/extension-base/background/types';
import {
  AccountExternalError,
  AccountsWithCurrentAddress,
  ActiveCronAndSubscriptionMap,
  AmountData,
  AssetSettingUpdateReq,
  BalanceJson,
  BrowserConfirmationType,
  ChainStakingMetadata,
  ConfirmationDefinitions,
  ConfirmationsQueue,
  ConfirmationType,
  CronServiceType,
  CrowdloanJson,
  CurrentAccountInfo,
  KeyringState,
  NftCollection,
  NftJson,
  NftTransactionRequest,
  NftTransferExtra,
  NominationPoolInfo,
  NominatorMetadata,
  OptionInputAddress,
  PriceJson,
  RequestAccountCreateExternalV2,
  RequestAccountCreateHardwareMultiple,
  RequestAccountCreateHardwareV2,
  RequestAccountCreateSuriV2,
  RequestAccountCreateWithSecretKey,
  RequestAccountMeta,
  RequestAuthorizationBlock,
  RequestAuthorizationPerSite,
  RequestBondingSubmit,
  RequestChangeMasterPassword,
  RequestCronAndSubscriptionAction,
  RequestCrossChainTransfer,
  RequestDeriveCreateMultiple,
  RequestDeriveCreateV3,
  RequestDeriveValidateV2,
  RequestFreeBalance,
  RequestGetDeriveAccounts,
  RequestGetTransaction,
  RequestInitCronAndSubscription,
  RequestJsonRestoreV2,
  RequestKeyringExportMnemonic,
  RequestMaxTransferable,
  RequestMigratePassword,
  RequestNftForceUpdate,
  RequestParseEvmContractInput,
  RequestParseTransactionSubstrate,
  RequestQrSignEvm,
  RequestQrSignSubstrate,
  RequestSettingsType,
  RequestSigningApprovePasswordV2,
  RequestStakeCancelWithdrawal,
  RequestStakeClaimReward,
  RequestStakePoolingBonding,
  RequestStakePoolingUnbonding,
  RequestStakeWithdrawal,
  RequestSubscribeBalance,
  RequestSubscribeBalancesVisibility,
  RequestSubscribeCrowdloan,
  RequestSubscribeNft,
  RequestSubscribePrice,
  RequestSubscribeStaking,
  RequestSubscribeStakingReward,
  RequestTransfer,
  RequestTransferCheckReferenceCount,
  RequestTransferCheckSupporting,
  RequestTransferExistentialDeposit,
  RequestTuringCancelStakeCompound,
  RequestTuringStakeCompound,
  RequestUnbondingSubmit,
  RequestUnlockKeyring,
  ResponseAccountCreateSuriV2,
  ResponseAccountCreateWithSecretKey,
  ResponseAccountExportPrivateKey,
  ResponseAccountIsLocked,
  ResponseAccountMeta,
  ResponseChangeMasterPassword,
  ResponseCheckPublicAndSecretKey,
  ResponseDeriveValidateV2,
  ResponseGetDeriveAccounts,
  ResponseKeyringExportMnemonic,
  ResponseMigratePassword,
  ResponseParseEvmContractInput,
  ResponseParseTransactionSubstrate,
  ResponsePrivateKeyValidateV2,
  ResponseQrParseRLP,
  ResponseQrSignEvm,
  ResponseQrSignSubstrate,
  ResponseSeedCreateV2,
  ResponseSeedValidateV2,
  ResponseUnlockKeyring,
  StakingJson,
  StakingRewardJson,
  StakingType,
  SubscriptionServiceType,
  SupportTransferResponse,
  ThemeNames,
  TransactionHistoryItem,
  UiSettings,
  ValidateNetworkResponse,
  ValidatorInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import { Message } from '@subwallet/extension-base/types';
import type { KeyringPair$Json } from '@subwallet/keyring/types';
import type { KeyringPairs$Json } from '@subwallet/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import { MetadataDef } from '@subwallet/extension-inject/types';
import { SingleAddress } from '@polkadot/ui-keyring/observable/types';
import {
  SWTransactionResponse,
  SWTransactionResult,
} from '@subwallet/extension-base/services/transaction-service/types';
import {
  _ChainState,
  _NetworkUpsertParams,
  _ValidateCustomAssetRequest,
  _ValidateCustomAssetResponse,
} from '@subwallet/extension-base/services/chain-service/types';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { _getKnownHashes } from 'utils/defaultChains';

interface Handler {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  subscriber?: (data: any) => void;
}

type Handlers = Record<string, Handler>;
type MessageType = 'PRI' | 'PUB' | 'EVM' | 'UNKNOWN';
const handlers: Handlers = {};
const handlerTypeMap: Record<string, MessageType> = {};
const handlerMessageMap: Record<string, keyof RequestSignatures> = {};

let webviewRef: RefObject<WebView | undefined>;
let webviewEvents: EventEmitter;
let status: WebRunnerStatus = 'init';

// Support restart web-runner
// @ts-ignore
const restartHandlers: Record<string, { id; message; request; origin }> = {};

export async function clearWebRunnerHandler(id: string): Promise<boolean> {
  const handlerTypeMapValue = handlerTypeMap[id];

  if (!handlerTypeMapValue) {
    return true;
  }

  delete handlers[id];
  delete handlerTypeMap[id];
  delete handlerMessageMap[id];

  if (handlerTypeMapValue) {
    if (['PRI', 'PUB', 'EVM'].includes(handlerTypeMapValue)) {
      return cancelSubscription(id);
    }
  }

  return true;
}

export function getMessageType(message: string): MessageType {
  if (message.startsWith('pri(')) {
    return 'PRI';
  } else if (message.startsWith('pub(')) {
    return 'PUB';
  } else if (message.startsWith('evm(')) {
    return 'EVM';
  }

  return 'UNKNOWN';
}

export function getHandlerId(message: string, id?: string): string {
  return `${getMessageType(message)}|${id ? id : getId()}`;
}

function isDappHandle(id: string): boolean {
  if (!handlerTypeMap[id]) {
    return false;
  }

  return handlerTypeMap[id] === 'PUB' || handlerTypeMap[id] === 'EVM';
}

export const setupWebview = (viewRef: RefObject<WebView | undefined>, eventEmitter: EventEmitter) => {
  webviewRef = viewRef;
  // Subscribe in the first time only
  if (!webviewEvents) {
    eventEmitter.on('update-status', stt => {
      status = stt;
    });
    eventEmitter.on('reloading', () => {
      console.debug(`### Clean ${Object.keys(handlers).length} handlers`);
      Object.entries(handlers).forEach(([id, handler]) => {
        handler.reject(new WebviewNotReadyError('Webview is not ready'));
        delete handlers[id];
        delete handlerTypeMap[id];
        delete handlerMessageMap[id];
      });
    });
  }
  webviewEvents = eventEmitter;
};

export const listenMessage = (
  data: Message['data'],
  eventEmitter?: EventEmitter,
  handleUnknown?: (data: Message['data']) => boolean,
): void => {
  const handlerId = data.id;

  if (isDappHandle(handlerId)) {
    if (data.response !== undefined || data.subscription !== undefined || data.error !== undefined) {
      eventEmitter?.emit(handlerId, JSON.stringify(data));
    }
    return;
  }

  const handler = handlers[handlerId];

  if (!handler) {
    let unknownHandled = false;
    if (handleUnknown) {
      unknownHandled = handleUnknown(data);
    }

    if (!unknownHandled) {
      console.warn(`Unknown response: ${JSON.stringify(handlerId)}`);
    }

    return;
  }

  if (!handler.subscriber) {
    delete handlers[handlerId];
    delete handlerTypeMap[handlerId];
    delete handlerMessageMap[handlerId];
  }

  if (data.subscription) {
    (handler.subscriber as Function)(data.subscription);
  } else if (data.error) {
    handler.reject(new WebviewResponseError(data.error));
  } else {
    handler.resolve(data.response);
  }
};

// @ts-ignore
export const postMessage = ({ id, message, request, origin }, supportRestart = false) => {
  handlerTypeMap[id] = getMessageType(message);
  handlerMessageMap[id] = message;

  if (supportRestart) {
    restartHandlers[id] = { id, message, request, origin };
  }

  const _post = () => {
    const injection = 'window.postMessage(' + JSON.stringify({ id, message, request, origin }) + ')';
    webviewRef.current?.injectJavaScript(injection);
  };

  if (!webviewRef || !webviewEvents) {
    throw new WebviewError('Webview is not init');
  }

  if (status === 'crypto_ready') {
    _post();
  } else {
    const eventHandle = (stt: string) => {
      if (stt === 'crypto_ready') {
        _post();
        webviewEvents.off('update-status', eventHandle);
      }
    };

    webviewEvents.on('update-status', eventHandle);
  }
};

export function resetHandlerMaps(): void {
  Object.keys(handlerTypeMap).forEach(id => {
    delete handlers[id];
    delete handlerTypeMap[id];
    delete handlerMessageMap[id];
  });
}

export function restartAllHandlers(): void {
  const canRestartList = Object.values(restartHandlers).filter(h => !!handlerTypeMap[h.id]);

  const numberHandlers = Object.keys(handlerTypeMap).length;
  console.log(`Restart ${canRestartList.length}/${numberHandlers} handlers`);

  canRestartList.forEach(({ id, message, request, origin }) => {
    postMessage({ id, message, request, origin });
  });
}

export function getMessageByHandleId(id: string): string | undefined {
  return handlerMessageMap[id];
}

export function sendMessage<TMessageType extends MessageTypesWithNullRequest>(
  message: TMessageType,
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypesWithNoSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
  handlerId?: string,
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypes>(
  message: TMessageType,
  request?: RequestTypes[TMessageType],
  subscriber?: (data: unknown) => void,
  handlerId?: string,
): Promise<ResponseTypes[TMessageType]> {
  return new Promise((resolve, reject): void => {
    const id = handlerId ? handlerId : getId();

    handlers[id] = { reject, resolve, subscriber };

    postMessage({ id, message, request: request || {}, origin: undefined }, !!subscriber);
  });
}

export function lazySendMessage<TMessageType extends MessageTypesWithNoSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; start: () => void } {
  const id = getId();
  const handlePromise = new Promise((resolve, reject): void => {
    handlers[id] = { reject, resolve };
  });

  const rs = {
    promise: handlePromise as Promise<ResponseTypes[TMessageType]>,
    start: () => {
      postMessage({ id, message, request: request || {}, origin: undefined });
    },
  };

  rs.promise
    .then(data => {
      callback(data);
    })
    .catch(console.error);

  return rs;
}

export function lazySubscribeMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; start: () => void; unsub: () => void } {
  const id = getId();
  let cancel = false;
  const handlePromise = new Promise((resolve, reject): void => {
    handlers[id] = { reject, resolve, subscriber };
  });

  const rs = {
    promise: handlePromise as Promise<ResponseTypes[TMessageType]>,
    start: () => {
      postMessage({ id, message, request: request || {}, origin: undefined }, true);
    },
    unsub: () => {
      const handler = handlers[id];

      cancel = true;

      if (handler) {
        delete handler.subscriber;
        handler.resolve(null);
      }
    },
  };

  rs.promise
    .then(data => {
      !cancel && callback(data);
    })
    .catch(console.error);

  return rs;
}

export function subscribeMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; unsub: () => void } {
  const lazyItem = lazySubscribeMessage(message, request, callback, subscriber);

  lazyItem.start();

  return {
    promise: lazyItem.promise,
    unsub: lazyItem.unsub,
  };
}

// Controller messages

export async function checkWebRunnerLives(): Promise<boolean> {
  // @ts-ignore
  return sendMessage('mobile(ping)', null);
}

export async function initCronAndSubscription(
  request: RequestInitCronAndSubscription,
): Promise<ActiveCronAndSubscriptionMap> {
  return sendMessage('mobile(cronAndSubscription.init)', request);
}

export async function subscribeActiveCronAndSubscriptionServiceMap(
  callback: (data: ActiveCronAndSubscriptionMap) => void,
  handlerId?: string,
): Promise<ActiveCronAndSubscriptionMap> {
  return sendMessage('mobile(cronAndSubscription.activeService.subscribe)', null, callback, handlerId);
}

export async function startCronAndSubscriptionServices(request: RequestCronAndSubscriptionAction): Promise<void> {
  return sendMessage('mobile(cronAndSubscription.start)', request);
}

export async function stopCronAndSubscriptionServices(request: RequestCronAndSubscriptionAction): Promise<void> {
  return sendMessage('mobile(cronAndSubscription.stop)', request);
}

export async function restartCronAndSubscriptionServices(request: RequestCronAndSubscriptionAction): Promise<void> {
  return sendMessage('mobile(cronAndSubscription.restart)', request);
}

export async function startCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.start)', request);
}

export async function stopCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.stop)', request);
}

export async function restartCronServices(request: CronServiceType[]): Promise<void> {
  return sendMessage('mobile(cron.restart)', request);
}

export async function startSubscriptionServices(request: SubscriptionServiceType[]): Promise<void> {
  return sendMessage('mobile(subscription.start)', request);
}

export async function stopSubscriptionServices(request: SubscriptionServiceType[]): Promise<void> {
  return sendMessage('mobile(subscription.stop)', request);
}

export async function restartSubscriptionServices(request: SubscriptionServiceType[]): Promise<void> {
  return sendMessage('mobile(subscription.restart)', request);
}

// Logic messages

export async function editAccount(address: string, name: string): Promise<boolean> {
  return sendMessage('pri(accounts.edit)', { address, name });
}

export async function showAccount(address: string, isShowing: boolean): Promise<boolean> {
  return sendMessage('pri(accounts.show)', { address, isShowing });
}

export async function saveCurrentAccountAddress(
  data: RequestCurrentAccountAddress,
  callback: (data: CurrentAccountInfo) => void,
): Promise<boolean> {
  return sendMessage('pri(currentAccount.saveAddress)', data, callback);
}

export async function toggleBalancesVisibility(callback: (data: RequestSettingsType) => void): Promise<boolean> {
  return sendMessage('pri(settings.changeBalancesVisibility)', null, callback);
}

export async function saveAccountAllLogo(
  accountAllLogo: string,
  callback: (data: RequestSettingsType) => void,
): Promise<boolean> {
  return sendMessage('pri(settings.saveAccountAllLogo)', accountAllLogo, callback);
}

export async function saveBrowserConfirmationType(
  type: BrowserConfirmationType,
  callback: (data: RequestSettingsType) => void,
): Promise<boolean> {
  return sendMessage('pri(settings.saveBrowserConfirmationType)', type, callback);
}

export async function saveTheme(theme: ThemeNames, callback: (data: UiSettings) => void): Promise<boolean> {
  return sendMessage('pri(settings.saveTheme)', theme, callback);
}

export async function subscribeSettings(
  data: RequestSubscribeBalancesVisibility,
  callback: (data: UiSettings) => void,
): Promise<UiSettings> {
  return sendMessage('pri(settings.subscribe)', data, callback);
}

export async function tieAccount(address: string, genesisHash: string | null): Promise<boolean> {
  return sendMessage('pri(accounts.tie)', { address, genesisHash });
}

export async function exportAccount(address: string, password: string): Promise<{ exportedJson: KeyringPair$Json }> {
  return sendMessage('pri(accounts.export)', { address, password });
}

export async function exportAccountPrivateKey(
  address: string,
  password: string,
): Promise<ResponseAccountExportPrivateKey> {
  return sendMessage('pri(accounts.exportPrivateKey)', { address, password });
}

export async function exportAccounts(
  addresses: string[],
  password: string,
): Promise<{ exportedJson: KeyringPairs$Json }> {
  return sendMessage('pri(accounts.batchExport)', { addresses, password });
}

export async function checkPublicAndPrivateKey(
  publicKey: string,
  secretKey: string,
): Promise<ResponseCheckPublicAndSecretKey> {
  return sendMessage('pri(accounts.checkPublicAndSecretKey)', { publicKey, secretKey });
}

export async function validateAccount(address: string, password: string): Promise<boolean> {
  return sendMessage('pri(accounts.validate)', { address, password });
}

export async function forgetAccount(address: string): Promise<boolean> {
  return sendMessage('pri(accounts.forget)', { address });
}

export async function approveAuthRequest(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.approve)', { id });
}

export async function approveAuthRequestV2(id: string, accounts: string[]): Promise<boolean> {
  return sendMessage('pri(authorize.approveV2)', { id, accounts });
}

export async function approveMetaRequest(id: string): Promise<boolean> {
  return sendMessage('pri(metadata.approve)', { id });
}

export async function cancelSignRequest(id: string): Promise<boolean> {
  return sendMessage('pri(signing.cancel)', { id });
}

export async function isSignLocked(id: string): Promise<ResponseSigningIsLocked> {
  return sendMessage('pri(signing.isLocked)', { id });
}

export async function approveSignPassword(id: string, savePass: boolean, password?: string): Promise<boolean> {
  return sendMessage('pri(signing.approve.password)', { id, password, savePass });
}

export async function approveSignPasswordV2(request: RequestSigningApprovePasswordV2): Promise<boolean> {
  return sendMessage('pri(signing.approve.passwordV2)', request);
}

export async function approveSignSignature(id: string, signature: HexString): Promise<boolean> {
  return sendMessage('pri(signing.approve.signature)', { id, signature });
}

export async function createAccountExternal(name: string, address: string, genesisHash: string): Promise<boolean> {
  return sendMessage('pri(accounts.create.external)', { address, genesisHash, name });
}

export async function createAccountExternalV2(
  request: RequestAccountCreateExternalV2,
): Promise<AccountExternalError[]> {
  return sendMessage('pri(accounts.create.externalV2)', request);
}

export async function createAccountHardware(
  address: string,
  hardwareType: string,
  accountIndex: number,
  addressOffset: number,
  name: string,
  genesisHash: string,
): Promise<boolean> {
  return sendMessage('pri(accounts.create.hardware)', {
    accountIndex,
    address,
    addressOffset,
    genesisHash,
    hardwareType,
    name,
  });
}

export async function createAccountHardwareV2(request: RequestAccountCreateHardwareV2): Promise<boolean> {
  return sendMessage('pri(accounts.create.hardwareV2)', request);
}

export async function createAccountHardwareMultiple(request: RequestAccountCreateHardwareMultiple): Promise<boolean> {
  return sendMessage('pri(accounts.create.hardwareMultiple)', request);
}

export async function createAccountSuri(
  name: string,
  password: string,
  suri: string,
  type?: KeypairType,
  genesisHash?: string,
): Promise<boolean> {
  return sendMessage('pri(accounts.create.suri)', { genesisHash, name, password, suri, type });
}

export async function createAccountSuriV2(request: RequestAccountCreateSuriV2): Promise<ResponseAccountCreateSuriV2> {
  return sendMessage('pri(accounts.create.suriV2)', request);
}

export async function createSeed(
  length?: SeedLengths,
  seed?: string,
  type?: KeypairType,
): Promise<{ address: string; seed: string }> {
  return sendMessage('pri(seed.create)', { length, seed, type });
}

export async function createSeedV2(
  length?: SeedLengths,
  seed?: string,
  types?: Array<KeypairType>,
): Promise<ResponseSeedCreateV2> {
  return sendMessage('pri(seed.createV2)', { length, seed, types });
}

export async function createAccountWithSecret(
  request: RequestAccountCreateWithSecretKey,
): Promise<ResponseAccountCreateWithSecretKey> {
  return sendMessage('pri(accounts.create.withSecret)', request);
}

export async function getAllMetadata(): Promise<MetadataDef[]> {
  return sendMessage('pri(metadata.list)');
}

// export async function getMetadata(genesisHash?: string | null, isPartial = false): Promise<Chain | null> {
//   if (!genesisHash) {
//     return null;
//   }
//
//   // const chains = await getNetworkMap();
//   const parsedChains = _getKnownHashes({});
//
//   let request = getSavedMeta(genesisHash);
//
//   if (!request) {
//     request = sendMessage('pri(metadata.get)', genesisHash || null);
//     setSavedMeta(genesisHash, request);
//   }
//
//   const def = await request;
//
//   if (def) {
//     return metadataExpand(def, isPartial);
//   } else if (isPartial) {
//     const chain = parsedChains.find(chain => chain.genesisHash === genesisHash);
//
//     if (chain) {
//       return metadataExpand(
//         {
//           ...chain,
//           specVersion: 0,
//           tokenDecimals: 15,
//           tokenSymbol: 'Unit',
//           types: {},
//         },
//         isPartial,
//       );
//     }
//   }
//
//   return null;
// }
//
// export async function getChainMetadata(genesisHash?: string | null): Promise<Chain | null> {
//   if (!genesisHash) {
//     return null;
//   }
//
//   // const chains = await getNetworkMap();
//   const parsedChains = _getKnownNetworks({});
//
//   let request = getSavedMeta(genesisHash);
//
//   if (!request) {
//     request = sendMessage('pri(metadata.get)', genesisHash || null);
//     setSavedMeta(genesisHash, request);
//   }
//
//   const def = await request;
//
//   if (def) {
//     return metadataExpand(def, false);
//   } else {
//     const chain = parsedChains.find(chain => chain.genesisHash === genesisHash);
//
//     if (chain) {
//       return metadataExpand(
//         {
//           specVersion: 0,
//           tokenDecimals: 15,
//           tokenSymbol: 'Unit',
//           types: {},
//           ...chain,
//         },
//         false,
//       );
//     }
//   }
//
//   return null;
// }

export async function rejectAuthRequest(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.reject)', { id });
}

export async function rejectAuthRequestV2(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.rejectV2)', { id });
}

export async function cancelAuthRequestV2(id: string): Promise<boolean> {
  return sendMessage('pri(authorize.cancelV2)', { id });
}

export async function rejectMetaRequest(id: string): Promise<boolean> {
  return sendMessage('pri(metadata.reject)', { id });
}

export async function subscribeAccounts(cb: (accounts: AccountJson[]) => void): Promise<AccountJson[]> {
  return sendMessage('pri(accounts.subscribe)', {}, cb);
}

export async function subscribeAccountsWithCurrentAddress(
  cb: (data: AccountsWithCurrentAddress) => void,
): Promise<AccountsWithCurrentAddress> {
  return sendMessage('pri(accounts.subscribeWithCurrentAddress)', {}, cb);
}

export async function subscribeAccountsInputAddress(cb: (data: OptionInputAddress) => void): Promise<string> {
  return sendMessage('pri(accounts.subscribeAccountsInputAddress)', {}, cb);
}

export async function saveRecentAccountId(accountId: string): Promise<SingleAddress> {
  return sendMessage('pri(accounts.saveRecent)', { accountId });
}

export async function triggerAccountsSubscription(): Promise<boolean> {
  return sendMessage('pri(accounts.triggerSubscription)');
}

export async function subscribeAuthorizeRequests(cb: (accounts: AuthorizeRequest[]) => void): Promise<boolean> {
  return sendMessage('pri(authorize.requests)', null, cb);
}

export async function subscribeAuthorizeRequestsV2(cb: (accounts: AuthorizeRequest[]) => void): Promise<boolean> {
  return sendMessage('pri(authorize.requestsV2)', null, cb);
}

export async function getAuthList(): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.list)');
}

export async function getAuthListV2(): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.listV2)');
}

export async function toggleAuthorization(url: string): Promise<ResponseAuthorizeList> {
  return sendMessage('pri(authorize.toggle)', url);
}

export async function changeAuthorizationAll(
  connectValue: boolean,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSiteAll)', { connectValue }, callback);
}

export async function changeAuthorization(
  connectValue: boolean,
  url: string,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSite)', { url, connectValue }, callback);
}

export async function changeAuthorizationPerAccount(
  address: string,
  connectValue: boolean,
  url: string,
  callback: (data: AuthUrls) => void,
): Promise<boolean> {
  return sendMessage('pri(authorize.changeSitePerAccount)', { address, url, connectValue }, callback);
}

export async function changeAuthorizationPerSite(request: RequestAuthorizationPerSite): Promise<boolean> {
  return sendMessage('pri(authorize.changeSitePerSite)', request);
}

export async function changeAuthorizationBlock(request: RequestAuthorizationBlock): Promise<boolean> {
  return sendMessage('pri(authorize.changeSiteBlock)', request);
}

export async function forgetSite(url: string, callback: (data: AuthUrls) => void): Promise<boolean> {
  return sendMessage('pri(authorize.forgetSite)', { url }, callback);
}

export async function forgetAllSite(callback: (data: AuthUrls) => void): Promise<boolean> {
  return sendMessage('pri(authorize.forgetAllSite)', null, callback);
}

export async function subscribeMetadataRequests(cb: (accounts: MetadataRequest[]) => void): Promise<boolean> {
  return sendMessage('pri(metadata.requests)', null, cb);
}

export async function subscribeSigningRequests(cb: (accounts: SigningRequest[]) => void): Promise<boolean> {
  return sendMessage('pri(signing.requests)', null, cb);
}

export async function validateSeed(suri: string, type?: KeypairType): Promise<{ address: string; suri: string }> {
  return sendMessage('pri(seed.validate)', { suri, type });
}

export async function validateSeedV2(suri: string, types: Array<KeypairType>): Promise<ResponseSeedValidateV2> {
  return sendMessage('pri(seed.validateV2)', { suri, types });
}

export async function validateMetamaskPrivateKeyV2(
  suri: string,
  types: Array<KeypairType>,
): Promise<ResponsePrivateKeyValidateV2> {
  return sendMessage('pri(privateKey.validateV2)', { suri, types });
}

export async function validateDerivationPath(
  parentAddress: string,
  suri: string,
  parentPassword: string,
): Promise<ResponseDeriveValidate> {
  return sendMessage('pri(derivation.validate)', { parentAddress, parentPassword, suri });
}

export async function deriveAccount(
  parentAddress: string,
  suri: string,
  parentPassword: string,
  name: string,
  password: string,
  genesisHash: string | null,
): Promise<boolean> {
  return sendMessage('pri(derivation.create)', { genesisHash, name, parentAddress, parentPassword, password, suri });
}

export async function deriveAccountV2(
  parentAddress: string,
  suri: string,
  parentPassword: string,
  name: string,
  password: string,
  genesisHash: string | null,
  isAllowed: boolean,
): Promise<boolean> {
  return sendMessage('pri(derivation.createV2)', { genesisHash, name, parentAddress, suri, isAllowed });
}

export async function windowOpen(path: AllowedPath): Promise<boolean> {
  return sendMessage('pri(window.open)', path);
}

export async function jsonGetAccountInfo(json: KeyringPair$Json): Promise<ResponseJsonGetAccountInfo> {
  return sendMessage('pri(json.account.info)', json);
}

export async function jsonRestore(file: KeyringPair$Json, password: string, address: string): Promise<void> {
  return sendMessage('pri(json.restore)', { file, password, address });
}

export async function batchRestore(file: KeyringPairs$Json, password: string, address: string): Promise<void> {
  return sendMessage('pri(json.batchRestore)', { file, password, address });
}

export async function jsonRestoreV2(request: RequestJsonRestoreV2): Promise<void> {
  return sendMessage('pri(json.restoreV2)', request);
}

export async function batchRestoreV2(
  file: KeyringPairs$Json,
  password: string,
  accountsInfo: ResponseJsonGetAccountInfo[],
  isAllowed: boolean,
): Promise<void> {
  return sendMessage('pri(json.batchRestoreV2)', { file, password, accountsInfo, isAllowed });
}

export async function setNotification(notification: string): Promise<boolean> {
  return sendMessage('pri(settings.notification)', notification);
}

export async function getPrice(): Promise<PriceJson> {
  return sendMessage('pri(price.getPrice)', null);
}

export async function subscribePrice(
  request: RequestSubscribePrice,
  callback: (priceData: PriceJson) => void,
): Promise<PriceJson> {
  return sendMessage('pri(price.getSubscription)', request, callback);
}

export async function getBalance(): Promise<BalanceJson> {
  return sendMessage('pri(balance.getBalance)', null);
}

export async function subscribeBalance(
  request: RequestSubscribeBalance,
  callback: (balanceData: BalanceJson) => void,
): Promise<BalanceJson> {
  return sendMessage('pri(balance.getSubscription)', request, callback);
}

export async function getCrowdloan(): Promise<CrowdloanJson> {
  return sendMessage('pri(crowdloan.getCrowdloan)', null);
}

export async function subscribeCrowdloan(
  request: RequestSubscribeCrowdloan,
  callback: (crowdloanData: CrowdloanJson) => void,
): Promise<CrowdloanJson> {
  return sendMessage('pri(crowdloan.getSubscription)', request, callback);
}

// TODO: remove, deprecated
export async function subscribeAssetRegistry(
  callback: (map: Record<string, _ChainAsset>) => void,
): Promise<Record<string, _ChainAsset>> {
  return sendMessage('pri(chainService.subscribeAssetRegistry)', null, callback);
}

export async function subscribeHistory(
  callback: (historyMap: TransactionHistoryItem[]) => void,
): Promise<TransactionHistoryItem[]> {
  return sendMessage('pri(transaction.history.getSubscription)', null, callback);
}

export async function getNft(account: string): Promise<NftJson> {
  // @ts-ignore
  return sendMessage('pri(nft.getNft)', account);
}

export async function subscribeNft(
  request: RequestSubscribeNft,
  callback: (nftData: NftJson) => void,
): Promise<NftJson> {
  return sendMessage('pri(nft.getSubscription)', request, callback);
}

export async function subscribeNftCollection(callback: (data: NftCollection[]) => void): Promise<NftCollection[]> {
  return sendMessage('pri(nftCollection.getSubscription)', null, callback);
}

export async function getStaking(account: string): Promise<StakingJson> {
  // @ts-ignore
  return sendMessage('pri(staking.getStaking)', account);
}

export async function subscribeStaking(
  request: RequestSubscribeStaking,
  callback: (stakingData: StakingJson) => void,
): Promise<StakingJson> {
  return sendMessage('pri(staking.getSubscription)', request, callback);
}

export async function getStakingReward(): Promise<StakingRewardJson> {
  return sendMessage('pri(stakingReward.getStakingReward)');
}

export async function subscribeStakingReward(
  request: RequestSubscribeStakingReward,
  callback: (stakingRewardData: StakingRewardJson) => void,
): Promise<StakingRewardJson> {
  return sendMessage('pri(stakingReward.getSubscription)', request, callback);
}

export async function nftForceUpdate(request: RequestNftForceUpdate): Promise<boolean> {
  return sendMessage('pri(nft.forceUpdate)', request);
}

export async function getNftTransfer(): Promise<NftTransferExtra> {
  return sendMessage('pri(nftTransfer.getNftTransfer)', null);
}

export async function subscribeNftTransfer(callback: (data: NftTransferExtra) => void): Promise<NftTransferExtra> {
  return sendMessage('pri(nftTransfer.getSubscription)', null, callback);
}

export async function setNftTransfer(request: NftTransferExtra): Promise<boolean> {
  return sendMessage('pri(nftTransfer.setNftTransfer)', request);
}

export async function makeTransfer(request: RequestTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.transfer)', request);
}

export async function makeCrossChainTransfer(request: RequestCrossChainTransfer): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.crossChainTransfer)', request);
}

export async function evmNftSubmitTransaction(request: NftTransactionRequest): Promise<SWTransactionResponse> {
  return sendMessage('pri(evmNft.submitTransaction)', request);
}

// ChainService -------------------------------------------------------------------------------------

export async function subscribeChainInfoMap(
  callback: (data: Record<string, _ChainInfo>) => void,
): Promise<Record<string, _ChainInfo>> {
  return sendMessage('pri(chainService.subscribeChainInfoMap)', null, callback);
}

export async function subscribeChainStateMap(
  callback: (data: Record<string, _ChainState>) => void,
): Promise<Record<string, _ChainState>> {
  return sendMessage('pri(chainService.subscribeChainStateMap)', null, callback);
}

export async function removeChain(networkKey: string): Promise<boolean> {
  return sendMessage('pri(chainService.removeChain)', networkKey);
}

export async function updateChainActiveState(chain: string, active: boolean): Promise<boolean> {
  if (active) {
    return await enableChain(chain);
  } else {
    return await disableChain(chain);
  }
}

export async function disableChain(networkKey: string): Promise<boolean> {
  return sendMessage('pri(chainService.disableChain)', networkKey);
}

export async function enableChain(networkKey: string): Promise<boolean> {
  return sendMessage('pri(chainService.enableChain)', networkKey);
}

export async function enableChains(targetKeys: string[]): Promise<boolean> {
  return sendMessage('pri(chainService.enableChains)', targetKeys);
}

export async function disableChains(targetKeys: string[]): Promise<boolean> {
  return sendMessage('pri(chainService.disableChains)', targetKeys);
}

export async function upsertChain(data: _NetworkUpsertParams): Promise<boolean> {
  return sendMessage('pri(chainService.upsertChain)', data);
}

export async function getSupportedContractTypes(): Promise<string[]> {
  return sendMessage('pri(chainService.getSupportedContractTypes)', null);
}

export async function upsertCustomToken(data: _ChainAsset): Promise<boolean> {
  return sendMessage('pri(chainService.upsertCustomAsset)', data);
}

export async function deleteCustomAssets(assetSlug: string): Promise<boolean> {
  return sendMessage('pri(chainService.deleteCustomAsset)', assetSlug);
}

export async function validateCustomToken(data: _ValidateCustomAssetRequest): Promise<_ValidateCustomAssetResponse> {
  return sendMessage('pri(chainService.validateCustomAsset)', data);
}

export async function resetDefaultNetwork(): Promise<boolean> {
  return sendMessage('pri(chainService.resetDefaultChains)', null);
}

export async function updateAssetSetting(data: AssetSettingUpdateReq): Promise<boolean> {
  return sendMessage('pri(assetSetting.update)', data);
}

// -------------------------------------------------------------------------------------

export async function validateCustomChain(
  provider: string,
  existedChainSlug?: string,
): Promise<ValidateNetworkResponse> {
  return sendMessage('pri(chainService.validateCustomChain)', { provider, existedChainSlug });
}

export async function disableAllNetwork(): Promise<boolean> {
  return sendMessage('pri(chainService.disableAllChains)', null);
}

export async function transferCheckReferenceCount(request: RequestTransferCheckReferenceCount): Promise<boolean> {
  return sendMessage('pri(transfer.checkReferenceCount)', request);
}

export async function transferCheckSupporting(
  request: RequestTransferCheckSupporting,
): Promise<SupportTransferResponse> {
  return sendMessage('pri(transfer.checkSupporting)', request);
}

export async function transferGetExistentialDeposit(request: RequestTransferExistentialDeposit): Promise<string> {
  return sendMessage('pri(transfer.getExistentialDeposit)', request);
}

export async function cancelSubscription(request: string): Promise<boolean> {
  return sendMessage('pri(subscription.cancel)', request);
}

export async function getFreeBalance(request: RequestFreeBalance): Promise<AmountData> {
  return sendMessage('pri(freeBalance.get)', request);
}

export async function getMaxTransfer(request: RequestMaxTransferable): Promise<AmountData> {
  return sendMessage('pri(transfer.getMaxTransferable)', request);
}

export async function subscribeFreeBalance(
  request: RequestFreeBalance,
  callback: (balance: AmountData) => void,
): Promise<AmountData> {
  return sendMessage('pri(freeBalance.subscribe)', request, callback);
}

export async function substrateNftSubmitTransaction(request: NftTransactionRequest): Promise<SWTransactionResponse> {
  return sendMessage('pri(substrateNft.submitTransaction)', request);
}

export async function recoverDotSamaApi(request: string): Promise<boolean> {
  return sendMessage('pri(chainService.recoverSubstrateApi)', request);
}

// Sign Qr

export async function accountIsLocked(address: string): Promise<ResponseAccountIsLocked> {
  return sendMessage('pri(account.isLocked)', { address });
}

export async function qrSignSubstrate(request: RequestQrSignSubstrate): Promise<ResponseQrSignSubstrate> {
  return sendMessage('pri(qr.sign.substrate)', request);
}

export async function qrSignEvm(request: RequestQrSignEvm): Promise<ResponseQrSignEvm> {
  return sendMessage('pri(qr.sign.evm)', request);
}

export async function parseSubstrateTransaction(
  request: RequestParseTransactionSubstrate,
): Promise<ResponseParseTransactionSubstrate> {
  return sendMessage('pri(qr.transaction.parse.substrate)', request);
}

export async function parseEVMTransaction(data: string): Promise<ResponseQrParseRLP> {
  return sendMessage('pri(qr.transaction.parse.evm)', { data });
}

export async function getAccountMeta(request: RequestAccountMeta): Promise<ResponseAccountMeta> {
  return sendMessage('pri(accounts.get.meta)', request);
}

export async function subscribeConfirmations(
  callback: (data: ConfirmationsQueue) => void,
): Promise<ConfirmationsQueue> {
  return sendMessage('pri(confirmations.subscribe)', null, callback);
}

export async function completeConfirmation<CT extends ConfirmationType>(
  type: CT,
  payload: ConfirmationDefinitions[CT][1],
): Promise<boolean> {
  return sendMessage('pri(confirmations.complete)', { [type]: payload });
}

export async function getBondingOptions(networkKey: string, type: StakingType): Promise<ValidatorInfo[]> {
  return sendMessage('pri(bonding.getBondingOptions)', { chain: networkKey, type });
}

export async function getNominationPoolOptions(chain: string): Promise<NominationPoolInfo[]> {
  return sendMessage('pri(bonding.getNominationPoolOptions)', chain);
}

export async function subscribeChainStakingMetadata(
  callback: (data: ChainStakingMetadata[]) => void,
): Promise<ChainStakingMetadata[]> {
  return sendMessage('pri(bonding.subscribeChainStakingMetadata)', null, callback);
}

export async function subscribeStakingNominatorMetadata(
  callback: (data: NominatorMetadata[]) => void,
): Promise<NominatorMetadata[]> {
  return sendMessage('pri(bonding.subscribeNominatorMetadata)', null, callback);
}

export async function submitPoolUnbonding(request: RequestStakePoolingUnbonding): Promise<SWTransactionResponse> {
  return sendMessage('pri(bonding.nominationPool.submitUnbonding)', request);
}

export async function submitBonding(request: RequestBondingSubmit): Promise<SWTransactionResponse> {
  return sendMessage('pri(bonding.submitBondingTransaction)', request);
}

export async function submitPoolBonding(request: RequestStakePoolingBonding): Promise<SWTransactionResponse> {
  return sendMessage('pri(bonding.nominationPool.submitBonding)', request);
}

export async function submitUnbonding(request: RequestUnbondingSubmit): Promise<SWTransactionResponse> {
  return sendMessage('pri(unbonding.submitTransaction)', request);
}

export async function submitStakeWithdrawal(params: RequestStakeWithdrawal): Promise<SWTransactionResponse> {
  return sendMessage('pri(unbonding.submitWithdrawal)', params);
}

export async function submitStakeClaimReward(request: RequestStakeClaimReward): Promise<SWTransactionResponse> {
  return sendMessage('pri(staking.submitClaimReward)', request);
}

export async function submitStakeCancelWithdrawal(
  request: RequestStakeCancelWithdrawal,
): Promise<SWTransactionResponse> {
  return sendMessage('pri(staking.submitCancelWithdrawal)', request);
}

export async function parseEVMTransactionInput(
  request: RequestParseEvmContractInput,
): Promise<ResponseParseEvmContractInput> {
  return sendMessage('pri(evm.transaction.parse.input)', request);
}

export async function subscribeAuthUrl(callback: (data: AuthUrls) => void): Promise<AuthUrls> {
  return sendMessage('pri(authorize.subscribe)', null, callback);
}

export async function submitTuringStakeCompounding(
  request: RequestTuringStakeCompound,
): Promise<SWTransactionResponse> {
  return sendMessage('pri(staking.submitTuringCompound)', request);
}

export async function submitTuringCancelStakeCompounding(
  request: RequestTuringCancelStakeCompound,
): Promise<SWTransactionResponse> {
  return sendMessage('pri(staking.submitTuringCancelCompound)', request);
}

// Keyring state
export async function keyringStateSubscribe(cb: (value: KeyringState) => void): Promise<KeyringState> {
  return sendMessage('pri(keyring.subscribe)', null, cb);
}

export async function keyringChangeMasterPassword(
  request: RequestChangeMasterPassword,
): Promise<ResponseChangeMasterPassword> {
  return sendMessage('pri(keyring.change)', request);
}

export async function keyringMigrateMasterPassword(request: RequestMigratePassword): Promise<ResponseMigratePassword> {
  return sendMessage('pri(keyring.migrate)', request);
}

export async function keyringUnlock(request: RequestUnlockKeyring): Promise<ResponseUnlockKeyring> {
  return sendMessage('pri(keyring.unlock)', request);
}

export async function keyringLock(): Promise<void> {
  return sendMessage('pri(keyring.lock)', null);
}

export async function keyringExportMnemonic(
  request: RequestKeyringExportMnemonic,
): Promise<ResponseKeyringExportMnemonic> {
  return sendMessage('pri(keyring.export.mnemonic)', request);
}

/// Derive
export async function validateDerivePathV2(request: RequestDeriveValidateV2): Promise<ResponseDeriveValidateV2> {
  return sendMessage('pri(derivation.validateV2)', request);
}

export async function getListDeriveAccounts(request: RequestGetDeriveAccounts): Promise<ResponseGetDeriveAccounts> {
  return sendMessage('pri(derivation.getList)', request);
}

export async function deriveMultiple(request: RequestDeriveCreateMultiple): Promise<boolean> {
  return sendMessage('pri(derivation.create.multiple)', request);
}

export async function deriveAccountV3(request: RequestDeriveCreateV3): Promise<boolean> {
  return sendMessage('pri(derivation.createV3)', request);
}

export async function getTransaction(request: RequestGetTransaction): Promise<SWTransactionResult> {
  return sendMessage('pri(transactions.getOne)', request);
}

export async function subscribeTransactions(
  callback: (rs: Record<string, SWTransactionResult>) => void,
): Promise<Record<string, SWTransactionResult>> {
  return sendMessage('pri(transactions.subscribe)', null, callback);
}

export async function getMetadata(genesisHash?: string | null, isPartial = false): Promise<Chain | null> {
  if (!genesisHash) {
    return null;
  }

  // const chains = await getNetworkMap();
  const parsedChains = _getKnownHashes({});

  let request = getSavedMeta(genesisHash);

  if (!request) {
    request = sendMessage('pri(metadata.get)', genesisHash || null);
    setSavedMeta(genesisHash, request);
  }

  const def = await request;

  if (def) {
    return metadataExpand(def, isPartial);
  } else if (isPartial) {
    const chain = parsedChains.find(_chain => _chain.genesisHash === genesisHash);

    if (chain) {
      return metadataExpand(
        {
          ...chain,
          specVersion: 0,
          tokenDecimals: 15,
          tokenSymbol: 'Unit',
          types: {},
        },
        isPartial,
      );
    }
  }

  return null;
}
