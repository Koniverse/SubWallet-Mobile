import { TransactionError } from '@subwallet/extension-base/background/errors/TransactionError';
import { getId } from '@subwallet/extension-base/utils/getId';
import { metadataExpand } from '@subwallet/extension-chains';
import { Chain } from '@subwallet/extension-chains/types';
import { RefObject } from 'react';
import WebView from 'react-native-webview';
import { WebRunnerStatus } from 'providers/contexts';
import { WebviewError, WebviewNotReadyError, WebviewResponseError } from '../errors/WebViewErrors';
import EventEmitter from 'eventemitter3';
import type {
  MessageTypes,
  MessageTypesWithNoSubscriptions,
  MessageTypesWithNullRequest,
  MessageTypesWithSubscriptions,
  RequestCurrentAccountAddress,
  RequestSignatures,
  RequestTypes,
  ResponseAuthorizeList,
  ResponseTypes,
  SubscriptionMessageTypes,
} from '@subwallet/extension-base/background/types';
import {
  AmountData,
  AmountDataWithId,
  AssetSettingUpdateReq,
  ConfirmationDefinitions,
  ConfirmationType,
  CurrencyType,
  CurrentAccountInfo,
  LanguageType,
  MobileData,
  NftTransactionRequest,
  RequestApproveConnectWalletSession,
  RequestAuthorizationBlock,
  RequestAuthorizationPerSite,
  RequestCampaignBannerComplete,
  RequestChangeMasterPassword,
  RequestConnectWalletConnect,
  RequestCrossChainTransfer,
  RequestFreeBalance,
  RequestKeyringExportMnemonic,
  RequestMaxTransferable,
  RequestMigratePassword,
  RequestParseTransactionSubstrate,
  RequestQrSignEvm,
  RequestQrSignSubstrate,
  RequestRejectConnectWalletSession,
  RequestResetWallet,
  RequestSigningApprovePasswordV2,
  RequestTransfer,
  RequestUnlockKeyring,
  ResolveAddressToDomainRequest,
  ResolveDomainRequest,
  ResponseChangeMasterPassword,
  ResponseKeyringExportMnemonic,
  ResponseMigratePassword,
  ResponseParseTransactionSubstrate,
  ResponseQrParseRLP,
  ResponseQrSignEvm,
  ResponseQrSignSubstrate,
  ResponseResetWallet,
  ResponseSubscribeHistory,
  ResponseUnlockKeyring,
  StakingType,
  TransactionHistoryItem,
  ValidateNetworkResponse,
  ValidatorInfo,
} from '@subwallet/extension-base/background/KoniTypes';
import {
  Message,
  NominationPoolInfo,
  OptimalYieldPathParams,
  RequestEarlyValidateYield,
  RequestGetYieldPoolTargets,
  RequestStakeCancelWithdrawal,
  RequestStakeClaimReward,
  RequestUnlockDotCheckCanMint,
  RequestYieldLeave,
  RequestYieldStepSubmit,
  RequestYieldWithdrawal,
  TokenSpendingApprovalParams,
  ValidateYieldProcessParams,
} from '@subwallet/extension-base/types';
import type { KeyringAddress } from '@subwallet/ui-keyring/types';
import type { HexString } from '@polkadot/util/types';
import { MetadataDef } from '@subwallet/extension-inject/types';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import {
  _NetworkUpsertParams,
  _ValidateCustomAssetRequest,
  _ValidateCustomAssetResponse,
} from '@subwallet/extension-base/services/chain-service/types';
import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import { _getKnownHashes } from 'utils/defaultChains';
import { needBackup, triggerBackup } from 'utils/storage';
import { RequestOptimalTransferProcess } from '@subwallet/extension-base/services/balance-service/helpers';
import { CommonOptimalPath } from '@subwallet/extension-base/types/service-base';
import { createRegistry } from '@subwallet/extension-base/utils';
import { _getChainNativeTokenBasicInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { base64Encode } from '@polkadot/util-crypto';

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

function isSubscription(key: keyof RequestSignatures): boolean {
  const tuple = ({} as RequestSignatures)[key];

  return Array.isArray(tuple) && tuple.length === 3;
}

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

    if (needBackup(message)) {
      triggerBackup(`*** Backup storage after ${message}`);
    }
  };

  if (!webviewRef || !webviewEvents) {
    throw new WebviewError('Webview is not init');
  }

  if (status === 'crypto_ready' || (message.startsWith('mobile') && status === 'require_restore')) {
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
    delete restartHandlers[id];
  });
}

export function restartAllHandlers(): void {
  const canRestartList = Object.values(restartHandlers).filter(h => !!handlerTypeMap[h.id]);
  const removeList = Object.values(restartHandlers).filter(h => !handlerTypeMap[h.id]);

  removeList.forEach(({ id }) => {
    delete handlers[id];
    delete handlerTypeMap[id];
    delete handlerMessageMap[id];
    delete restartHandlers[id];
  });

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

    postMessage({ id, message, request: request || {}, origin: undefined }, isSubscription(message));
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

export * from './accounts';

export async function mobileBackup(): Promise<MobileData> {
  return sendMessage('mobile(storage.backup)');
}
export async function mobileRestore(request: Partial<MobileData>): Promise<null> {
  return sendMessage('mobile(storage.restore)', request);
}

// Logic messages

export async function saveCurrentAccountAddress(data: RequestCurrentAccountAddress): Promise<CurrentAccountInfo> {
  return sendMessage('pri(accounts.saveCurrentProxy)', data);
}

export async function toggleBalancesVisibility(): Promise<boolean> {
  return sendMessage('pri(settings.changeBalancesVisibility)', null);
}

export async function saveLanguage(lang: LanguageType): Promise<boolean> {
  return sendMessage('pri(settings.saveLanguage)', { language: lang });
}

export async function savePriceCurrency(currency: CurrencyType): Promise<boolean> {
  return sendMessage('pri(settings.savePriceCurrency)', { currency });
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

export async function approveSignPassword(id: string, savePass: boolean, password?: string): Promise<boolean> {
  return sendMessage('pri(signing.approve.password)', { id, password, savePass });
}

export async function approveSignPasswordV2(request: RequestSigningApprovePasswordV2): Promise<boolean> {
  return sendMessage('pri(signing.approve.passwordV2)', request);
}

export async function saveAutoLockTime(value: number): Promise<boolean> {
  return sendMessage('pri(settings.saveAutoLockTime)', { autoLockTime: value });
}

export async function approveSignSignature(id: string, signature: HexString): Promise<boolean> {
  return sendMessage('pri(signing.approve.signature)', { id, signature });
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

export async function saveRecentAccountId(accountId: string, chain?: string): Promise<KeyringAddress> {
  return sendMessage('pri(accounts.saveRecent)', { accountId, chain });
}

export async function editContactAddress(address: string, name: string): Promise<boolean> {
  return sendMessage('pri(accounts.editContact)', { address: address, meta: { name: name } });
}

export async function removeContactAddress(address: string): Promise<boolean> {
  return sendMessage('pri(accounts.deleteContact)', { address: address });
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

// TODO: remove, deprecated

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

export async function enableChain(chainSlug: string, enableTokens = true): Promise<boolean> {
  return sendMessage('pri(chainService.enableChain)', { chainSlug, enableTokens });
}

export async function upsertChain(data: _NetworkUpsertParams): Promise<boolean> {
  return sendMessage('pri(chainService.upsertChain)', data);
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

export async function cancelSubscription(request: string): Promise<boolean> {
  return sendMessage('pri(subscription.cancel)', request);
}

export async function getFreeBalance(request: RequestFreeBalance): Promise<AmountData> {
  return sendMessage('pri(freeBalance.get)', request);
}

export async function subscribeFreeBalance(
  request: RequestFreeBalance,
  callback: (balance: AmountDataWithId) => void,
): Promise<AmountDataWithId> {
  return sendMessage('pri(freeBalance.subscribe)', request, callback);
}

export async function approveSpending(request: TokenSpendingApprovalParams): Promise<SWTransactionResponse> {
  return sendMessage('pri(accounts.approveSpending)', request);
}

export async function getMaxTransfer(request: RequestMaxTransferable): Promise<AmountData> {
  return sendMessage('pri(transfer.getMaxTransferable)', request);
}

export async function getOptimalTransferProcess(request: RequestOptimalTransferProcess): Promise<CommonOptimalPath> {
  return sendMessage('pri(accounts.getOptimalTransferProcess)', request);
}

export async function substrateNftSubmitTransaction(request: NftTransactionRequest): Promise<SWTransactionResponse> {
  return sendMessage('pri(substrateNft.submitTransaction)', request);
}

// Sign Qr
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

export async function completeConfirmation<CT extends ConfirmationType>(
  type: CT,
  payload: ConfirmationDefinitions[CT][1],
): Promise<boolean> {
  return sendMessage('pri(confirmations.complete)', { [type]: payload });
}

export async function getNominationPoolOptions(chain: string): Promise<NominationPoolInfo[]> {
  return sendMessage('pri(bonding.getNominationPoolOptions)', chain);
}

export async function getBondingOptions(networkKey: string, type: StakingType): Promise<ValidatorInfo[]> {
  return sendMessage('pri(bonding.getBondingOptions)', { chain: networkKey, type });
}

// Keyring state
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

export async function resetWallet(request: RequestResetWallet): Promise<ResponseResetWallet> {
  return sendMessage('pri(keyring.reset)', request);
}

// Wallet Connect

export async function addConnection(request: RequestConnectWalletConnect): Promise<boolean> {
  return sendMessage('pri(walletConnect.connect)', request);
}

export async function approveWalletConnectSession(request: RequestApproveConnectWalletSession): Promise<boolean> {
  return sendMessage('pri(walletConnect.session.approve)', request);
}

export async function rejectWalletConnectSession(request: RequestRejectConnectWalletSession): Promise<boolean> {
  return sendMessage('pri(walletConnect.session.reject)', request);
}

export async function disconnectWalletConnectConnection(topic: string): Promise<boolean> {
  return sendMessage('pri(walletConnect.session.disconnect)', { topic });
}

export async function resolveDomainToAddress(request: ResolveDomainRequest) {
  return sendMessage('pri(accounts.resolveDomainToAddress)', request);
}

export async function resolveAddressToDomain(request: ResolveAddressToDomainRequest) {
  return sendMessage('pri(accounts.resolveAddressToDomain)', request);
}

export async function getMetadata(genesisHash?: string | null, isPartial = false): Promise<Chain | null> {
  if (!genesisHash) {
    return null;
  }

  // const chains = await getNetworkMap();
  const parsedChains = _getKnownHashes({});

  const def = await sendMessage('pri(metadata.get)', genesisHash || null);

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

export async function getMetadataRaw(chainInfo: _ChainInfo | null, genesisHash?: string | null): Promise<Chain | null> {
  if (!genesisHash) {
    return null;
  }

  const data = await sendMessage('pri(metadata.find)', { genesisHash });
  const { rawMetadata, specVersion } = data;

  if (!rawMetadata) {
    return null;
  }

  if (!chainInfo) {
    return null;
  }

  const registry = createRegistry(chainInfo, data);

  const tokenInfo = _getChainNativeTokenBasicInfo(chainInfo);

  return {
    specVersion,
    genesisHash,
    name: chainInfo.name,
    hasMetadata: true,
    definition: {
      types: data.types,
      userExtensions: data.userExtensions,
      metaCalls: base64Encode(data.rawMetadata),
    } as MetadataDef,
    icon: chainInfo.icon,
    isUnknown: false,
    ss58Format: chainInfo.substrateInfo?.addressPrefix || 42,
    tokenDecimals: tokenInfo.decimals,
    tokenSymbol: tokenInfo.symbol,
    registry: registry,
  };
}

export const getMetadataHash = async (chain: string) => {
  return sendMessage('pri(metadata.hash)', { chain });
};

export async function completeBannerCampaign(request: RequestCampaignBannerComplete): Promise<boolean> {
  return sendMessage('pri(campaign.banner.complete)', request);
}

export async function subscribeTransactionHistory(
  chain: string,
  address: string,
  callback: (items: TransactionHistoryItem[]) => void,
): Promise<ResponseSubscribeHistory> {
  return sendMessage('pri(transaction.history.subscribe)', { address, chain }, callback);
}

/* Earning */

export async function fetchPoolTarget(request: RequestGetYieldPoolTargets) {
  return sendMessage('pri(yield.getTargets)', request);
}

export async function earlyValidateJoin(request: RequestEarlyValidateYield) {
  return sendMessage('pri(yield.join.earlyValidate)', request);
}

export async function getOptimalYieldPath(data: OptimalYieldPathParams) {
  return sendMessage('pri(yield.join.getOptimalPath)', data);
}

export async function submitJoinYieldPool(data: RequestYieldStepSubmit): Promise<SWTransactionResponse> {
  return sendMessage('pri(yield.join.handleStep)', data);
}

export async function validateYieldProcess(data: ValidateYieldProcessParams): Promise<TransactionError[]> {
  return sendMessage('pri(yield.join.validateProcess)', data);
}

export async function yieldSubmitLeavePool(data: RequestYieldLeave) {
  return sendMessage('pri(yield.leave.submit)', data);
}

export async function yieldSubmitStakingWithdrawal(data: RequestYieldWithdrawal) {
  return sendMessage('pri(yield.withdraw.submit)', data);
}

export async function yieldSubmitStakingCancelWithdrawal(data: RequestStakeCancelWithdrawal) {
  return sendMessage('pri(yield.cancelWithdrawal.submit)', data);
}

export async function yieldSubmitStakingClaimReward(data: RequestStakeClaimReward) {
  return sendMessage('pri(yield.claimReward.submit)', data);
}

/* Earning */

/* Mint campaign */

export async function unlockDotCheckCanMint(request: RequestUnlockDotCheckCanMint): Promise<boolean> {
  return sendMessage('pri(campaign.unlockDot.canMint)', request);
}

/* Mint campaign */
