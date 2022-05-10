// import {ApiPromise, WsProvider} from '@polkadot/api';
// import {Vec} from '@polkadot/types';
// import {KeyValueOption, MetadataLatest} from '@polkadot/types/interfaces';
import {WebViewMessageRequest} from '../types';
import {
  RequestSignatures,
  TransportRequestMessage,
} from '@polkadot/extension-base/background/types';

// export class LightConnector {
//   provider: WsProvider;
//   networkKey: string;
//   chainInfoIsReady: Promise<void>;
//   endpoint?: string;
//   chainName?: string;
//   genesisHash?: string;
//   ss58Format?: number;
//   tokenDecimals?: Array<number>;
//   tokenSymbol?: Array<string>;
//   isReady: Promise<WsProvider>;
//   private _api?: ApiPromise;
//
//   constructor(networkKey: string, endpoint: string) {
//     this.networkKey = networkKey;
//     this.endpoint = endpoint;
//
//     // Init provider from endpoit
//     let provider: WsProvider;
//
//     provider = new WsProvider(endpoint, 9000);
//     this.isReady = provider.isReady;
//     this.provider = provider;
//
//     this.chainInfoIsReady = this.getChainInfo();
//   }
//
//   get api() {
//     if (!this._api) {
//       this._api = new ApiPromise({provider: this.provider});
//     }
//
//     return this._api;
//   }
//
//   public async getConstant<T>(key: string) {
//     await this.isReady;
//     return (await this.provider.send(key, [], true)) as T;
//   }
//
//   public async getChainInfo() {
//     await this.isReady;
//     await Promise.all([
//       this.getConstant<string>('chain_getBlockHash'),
//       this.getConstant<{
//         ss58Format: number;
//         tokenDecimals: number | number[];
//         tokenSymbol: string | string[];
//       }>('system_properties'),
//       this.getConstant<string>('system_chain'),
//     ]).then(
//       ([genesisHash, {ss58Format, tokenDecimals, tokenSymbol}, chainName]) => {
//         this.genesisHash = genesisHash;
//         this.ss58Format = ss58Format;
//         this.tokenDecimals =
//           typeof tokenDecimals === 'number' ? [tokenDecimals] : tokenDecimals;
//         this.tokenSymbol =
//           typeof tokenSymbol === 'string' ? [tokenSymbol] : tokenSymbol;
//         this.chainName = chainName;
//       },
//     );
//   }
//
//   public async subscribeStorage(
//     storageKeys: string[],
//     formatter: ([reference, change]: Vec<KeyValueOption>) => any,
//     callback: (rs: any) => void,
//   ) {
//     await this.isReady;
//     // Force stop while request is not ready
//     let forceStop = false;
//     const subProm = this.provider.subscribe(
//       'state_storage',
//       'state_subscribeStorage',
//       [storageKeys],
//       (_, value) => {
//         const rs = value?.changes.map(formatter);
//         if (!forceStop) {
//           callback(rs);
//         }
//       },
//     );
//
//     return () => {
//       forceStop = true;
//       subProm
//         .then(unsubKey => {
//           // @ts-ignore
//           this.provider
//             .unsubscribe('state_storage', 'state_subscribeStorage', unsubKey)
//             .catch(console.log);
//         })
//         .catch(console.log);
//     };
//   }
//
//   public async queryStorageAt(storageKeys: string[]) {
//     await this.isReady;
//     return this.provider.send('state_queryStorageAt', [storageKeys]);
//   }
//
//   // public getBalance(
//   //   addresses: string[],
//   //   callback: (rs: FrameSystemAccountInfo[]) => void,
//   // ) {
//   //   const storageKeys = addresses.map(address =>
//   //     concatHash(...methodHash('System', 'Account'), hashAddress(address)),
//   //   );
//   //   return this.subscribeStorage(storageKeys, balanceFormatter, callback).catch(
//   //     console.error,
//   //   );
//   // }
//
//   public getMetadata(callback: (metadata: MetadataLatest) => void) {
//     this.api.isReady
//       .then(() => {
//         callback(this.api.registry.metadata);
//       })
//       .catch(console.error);
//   }
//
//   public getTypeDef(typeName: string, callback: (typedef: string) => void) {
//     this.api.isReady
//       .then(() => {
//         // callback(this.api.registry.metadata.lookup.getTypeDef(lookupId).type)
//         const t = this.api.registry.createType(typeName);
//         callback(t.toRawType());
//       })
//       .catch(e => {
//         callback(e.messsage);
//       });
//   }
// }
//
// const connector = new LightConnector(
//   'moonbaseAlpha',
//   'wss://wss.api.moonbase.moonbeam.network',
// );
// connector.isReady
//   .then(() => {
//     //;
//   })
//   .catch(console.error);
//
// function createResponse<I, O>(
//   {id, method}: WebViewMessageRequest<I>,
//   responsePayload: O,
// ) {
//   const response: WebViewMessageResponse<O> = {
//     id,
//     method,
//     payload: responsePayload as O,
//   };
//
//   // @ts-ignore
//   window.ReactNativeWebView.postMessage(JSON.stringify(response));
// }

// function handle(request: TransportRequestMessage<keyof RequestSignatures>) {
//   const {message} = request;
//   if (message === 'get_chain_info') {
//     createResponse<any, any>(request, response);
//   }
// }
//
// window.addEventListener('message', ev => {
//   const request = ev.data as TransportRequestMessage<keyof RequestSignatures>;
//   if (request.id && request.message) {
//     handle(request as WebViewMessageRequest<any>);
//   }
// });
