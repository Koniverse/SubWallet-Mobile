/******/ (() => { // webpackBootstrap
  /******/ 	var __webpack_modules__ = ({

    /***/ "../../node_modules/@metamask/safe-event-emitter/index.js":
    /*!****************************************************************!*\
  !*** ../../node_modules/@metamask/safe-event-emitter/index.js ***!
  \****************************************************************/
    /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

      "use strict";

      Object.defineProperty(exports, "__esModule", ({ value: true }));
      const events_1 = __webpack_require__(/*! events */ "../../node_modules/events/events.js");
      function safeApply(handler, context, args) {
        try {
          Reflect.apply(handler, context, args);
        }
        catch (err) {
          // Throw error after timeout so as not to interrupt the stack
          setTimeout(() => {
            throw err;
          });
        }
      }
      function arrayClone(arr) {
        const n = arr.length;
        const copy = new Array(n);
        for (let i = 0; i < n; i += 1) {
          copy[i] = arr[i];
        }
        return copy;
      }
      class SafeEventEmitter extends events_1.EventEmitter {
        emit(type, ...args) {
          let doError = type === 'error';
          const events = this._events;
          if (events !== undefined) {
            doError = doError && events.error === undefined;
          }
          else if (!doError) {
            return false;
          }
          // If there is no 'error' event listener then throw.
          if (doError) {
            let er;
            if (args.length > 0) {
              [er] = args;
            }
            if (er instanceof Error) {
              // Note: The comments on the `throw` lines are intentional, they show
              // up in Node's output if this results in an unhandled exception.
              throw er; // Unhandled 'error' event
            }
            // At least give some kind of context to the user
            const err = new Error(`Unhandled error.${er ? ` (${er.message})` : ''}`);
            err.context = er;
            throw err; // Unhandled 'error' event
          }
          const handler = events[type];
          if (handler === undefined) {
            return false;
          }
          if (typeof handler === 'function') {
            safeApply(handler, this, args);
          }
          else {
            const len = handler.length;
            const listeners = arrayClone(handler);
            for (let i = 0; i < len; i += 1) {
              safeApply(listeners[i], this, args);
            }
          }
          return true;
        }
      }
      exports["default"] = SafeEventEmitter;
//# sourceMappingURL=index.js.map

      /***/ }),

    /***/ "../extension-base/src/defaults.ts":
    /*!*****************************************!*\
  !*** ../extension-base/src/defaults.ts ***!
  \*****************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "ALLOWED_PATH": () => (/* binding */ ALLOWED_PATH),
        /* harmony export */   "EXTENSION_PREFIX": () => (/* binding */ EXTENSION_PREFIX),
        /* harmony export */   "MESSAGE_ORIGIN_CONTENT": () => (/* binding */ MESSAGE_ORIGIN_CONTENT),
        /* harmony export */   "MESSAGE_ORIGIN_PAGE": () => (/* binding */ MESSAGE_ORIGIN_PAGE),
        /* harmony export */   "PASSWORD_EXPIRY_MIN": () => (/* binding */ PASSWORD_EXPIRY_MIN),
        /* harmony export */   "PASSWORD_EXPIRY_MS": () => (/* binding */ PASSWORD_EXPIRY_MS),
        /* harmony export */   "PHISHING_PAGE_REDIRECT": () => (/* binding */ PHISHING_PAGE_REDIRECT),
        /* harmony export */   "PORT_CONTENT": () => (/* binding */ PORT_CONTENT),
        /* harmony export */   "PORT_EXTENSION": () => (/* binding */ PORT_EXTENSION)
        /* harmony export */ });
// Copyright 2019-2022 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

      const ALLOWED_PATH = ['/', '/account/import-ledger', '/account/restore-json', '/account/create', '/account/settings'];
      const PHISHING_PAGE_REDIRECT = '/phishing-page-detected';
      const EXTENSION_PREFIX = ({"NODE_ENV":"development","PKG_NAME":"@subwallet/extension-koni","PKG_VERSION":"0.6.7-1"}).EXTENSION_PREFIX || '';
      const PORT_CONTENT = `${EXTENSION_PREFIX}koni-content`;
      const PORT_EXTENSION = `${EXTENSION_PREFIX}koni-extension`;
      const MESSAGE_ORIGIN_PAGE = `${EXTENSION_PREFIX}koni-page`;
      const MESSAGE_ORIGIN_CONTENT = `${EXTENSION_PREFIX}koni-content`;
      const PASSWORD_EXPIRY_MIN = 15;
      const PASSWORD_EXPIRY_MS = PASSWORD_EXPIRY_MIN * 60 * 1000;


      /***/ }),

    /***/ "../extension-base/src/errors/SubWalletProviderError.ts":
    /*!**************************************************************!*\
  !*** ../extension-base/src/errors/SubWalletProviderError.ts ***!
  \**************************************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "SubWalletProviderError": () => (/* binding */ SubWalletProviderError)
        /* harmony export */ });
// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

      class SubWalletProviderError extends Error {
        constructor(message, code, data) {
          super(message);
          this.code = code;
          this.data = data;
        }
      }

      /***/ }),

    /***/ "../extension-base/src/page/Accounts.ts":
    /*!**********************************************!*\
  !*** ../extension-base/src/page/Accounts.ts ***!
  \**********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "default": () => (/* binding */ Accounts)
        /* harmony export */ });
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// External to class, this.# is not private enough (yet)
      let sendRequest;
      class Accounts {
        constructor(_sendRequest) {
          sendRequest = _sendRequest;
        }
        get(anyType) {
          return sendRequest('pub(accounts.listV2)', {
            anyType,
            accountAuthType: 'substrate'
          });
        }
        subscribe(cb) {
          sendRequest('pub(accounts.subscribeV2)', {
            accountAuthType: 'substrate'
          }, cb).catch(error => console.error(error));
          return () => {
            // FIXME we need the ability to unsubscribe
          };
        }
      }

      /***/ }),

    /***/ "../extension-base/src/page/Injected.ts":
    /*!**********************************************!*\
  !*** ../extension-base/src/page/Injected.ts ***!
  \**********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
        /* harmony export */ });
      /* harmony import */ var _Accounts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Accounts */ "../extension-base/src/page/Accounts.ts");
      /* harmony import */ var _Metadata__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Metadata */ "../extension-base/src/page/Metadata.ts");
      /* harmony import */ var _PostMessageProvider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PostMessageProvider */ "../extension-base/src/page/PostMessageProvider.ts");
      /* harmony import */ var _Signer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Signer */ "../extension-base/src/page/Signer.ts");
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0





      /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (class {
        constructor(sendRequest) {
          this.accounts = new _Accounts__WEBPACK_IMPORTED_MODULE_0__["default"](sendRequest);
          this.metadata = new _Metadata__WEBPACK_IMPORTED_MODULE_1__["default"](sendRequest);
          this.provider = new _PostMessageProvider__WEBPACK_IMPORTED_MODULE_2__["default"](sendRequest);
          this.signer = new _Signer__WEBPACK_IMPORTED_MODULE_3__["default"](sendRequest);
        }
      });

      /***/ }),

    /***/ "../extension-base/src/page/Metadata.ts":
    /*!**********************************************!*\
  !*** ../extension-base/src/page/Metadata.ts ***!
  \**********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "default": () => (/* binding */ Metadata)
        /* harmony export */ });
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// External to class, this.# is not private enough (yet)
      let sendRequest;
      class Metadata {
        constructor(_sendRequest) {
          sendRequest = _sendRequest;
        }
        get() {
          return sendRequest('pub(metadata.list)');
        }
        provide(definition) {
          return sendRequest('pub(metadata.provide)', definition);
        }
      }

      /***/ }),

    /***/ "../extension-base/src/page/PostMessageProvider.ts":
    /*!*********************************************************!*\
  !*** ../extension-base/src/page/PostMessageProvider.ts ***!
  \*********************************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "default": () => (/* binding */ PostMessageProvider)
        /* harmony export */ });
      /* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventemitter3 */ "../../node_modules/eventemitter3/index.js");
      /* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_0__);
      /* harmony import */ var _polkadot_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @polkadot/util */ "../../node_modules/@polkadot/util/logger.js");
      /* harmony import */ var _polkadot_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @polkadot/util */ "../../node_modules/@polkadot/util/is/undefined.js");
// Copyright 2019-2022 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0



      const l = (0,_polkadot_util__WEBPACK_IMPORTED_MODULE_1__.logger)('PostMessageProvider');
// External to class, this.# is not private enough (yet)
      let sendRequest;

      /**
       * @name PostMessageProvider
       *
       * @description Extension provider to be used by dapps
       */
      class PostMessageProvider {
        #eventemitter;

        // Whether or not the actual extension background provider is connected
        #isConnected = false;

        // Subscription IDs are (historically) not guaranteed to be globally unique;
        // only unique for a given subscription method; which is why we identify
        // the subscriptions based on subscription id + type
        #subscriptions = {}; // {[(type,subscriptionId)]: callback}

        /**
         * @param {function}  sendRequest  The function to be called to send requests to the node
         * @param {function}  subscriptionNotificationHandler  Channel for receiving subscription messages
         */
        constructor(_sendRequest) {
          this.#eventemitter = new (eventemitter3__WEBPACK_IMPORTED_MODULE_0___default())();
          sendRequest = _sendRequest;
        }

        /**
         * @description Returns a clone of the object
         */
        clone() {
          return new PostMessageProvider(sendRequest);
        }

        /**
         * @description Manually disconnect from the connection, clearing autoconnect logic
         */
        // eslint-disable-next-line @typescript-eslint/require-await
        async connect() {
          // FIXME This should see if the extension's state's provider can disconnect
          console.error('PostMessageProvider.disconnect() is not implemented.');
        }

        /**
         * @description Manually disconnect from the connection, clearing autoconnect logic
         */
        // eslint-disable-next-line @typescript-eslint/require-await
        async disconnect() {
          // FIXME This should see if the extension's state's provider can disconnect
          console.error('PostMessageProvider.disconnect() is not implemented.');
        }

        /**
         * @summary `true` when this provider supports subscriptions
         */
        get hasSubscriptions() {
          // FIXME This should see if the extension's state's provider has subscriptions
          return true;
        }

        /**
         * @summary Whether the node is connected or not.
         * @return {boolean} true if connected
         */
        get isConnected() {
          return this.#isConnected;
        }
        listProviders() {
          return sendRequest('pub(rpc.listProviders)', undefined);
        }

        /**
         * @summary Listens on events after having subscribed using the [[subscribe]] function.
         * @param  {ProviderInterfaceEmitted} type Event
         * @param  {ProviderInterfaceEmitCb}  sub  Callback
         * @return unsubscribe function
         */
        on(type, sub) {
          this.#eventemitter.on(type, sub);
          return () => {
            this.#eventemitter.removeListener(type, sub);
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async send(method, params, _, subscription) {
          if (subscription) {
            const {
              callback,
              type
            } = subscription;
            const id = await sendRequest('pub(rpc.subscribe)', {
              method,
              params,
              type
            }, res => {
              subscription.callback(null, res);
            });
            this.#subscriptions[`${type}::${id}`] = callback;
            return id;
          }
          return sendRequest('pub(rpc.send)', {
            method,
            params
          });
        }

        /**
         * @summary Spawn a provider on the extension background.
         */
        async startProvider(key) {
          // Disconnect from the previous provider
          this.#isConnected = false;
          this.#eventemitter.emit('disconnected');
          const meta = await sendRequest('pub(rpc.startProvider)', key);

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          sendRequest('pub(rpc.subscribeConnected)', null, connected => {
            this.#isConnected = connected;
            if (connected) {
              this.#eventemitter.emit('connected');
            } else {
              this.#eventemitter.emit('disconnected');
            }
            return true;
          });
          return meta;
        }
        subscribe(type, method, params, callback) {
          return this.send(method, params, false, {
            callback,
            type
          });
        }

        /**
         * @summary Allows unsubscribing to subscriptions made with [[subscribe]].
         */
        async unsubscribe(type, method, id) {
          const subscription = `${type}::${id}`;

          // FIXME This now could happen with re-subscriptions. The issue is that with a re-sub
          // the assigned id now does not match what the API user originally received. It has
          // a slight complication in solving - since we cannot rely on the send id, but rather
          // need to find the actual subscription id to map it
          if ((0,_polkadot_util__WEBPACK_IMPORTED_MODULE_2__.isUndefined)(this.#subscriptions[subscription])) {
            l.debug(() => `Unable to find active subscription=${subscription}`);
            return false;
          }
          delete this.#subscriptions[subscription];
          return this.send(method, [id]);
        }
      }

      /***/ }),

    /***/ "../extension-base/src/page/Signer.ts":
    /*!********************************************!*\
  !*** ../extension-base/src/page/Signer.ts ***!
  \********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "default": () => (/* binding */ Signer)
        /* harmony export */ });
// Copyright 2019-2022 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

// External to class, this.# is not private enough (yet)
      let sendRequest;
      let nextId = 0;
      class Signer {
        constructor(_sendRequest) {
          sendRequest = _sendRequest;
        }
        async signPayload(payload) {
          const id = ++nextId;
          const result = await sendRequest('pub(extrinsic.sign)', payload);

          // we add an internal id (number) - should have a mapping from the
          // extension id (string) -> internal id (number) if we wish to provide
          // updated via the update functionality (noop at this point)
          return {
            ...result,
            id
          };
        }
        async signRaw(payload) {
          const id = ++nextId;
          const result = await sendRequest('pub(bytes.sign)', payload);
          return {
            ...result,
            id
          };
        }

        // NOTE We don't listen to updates at all, if we do we can interpret the
        // resuklt as provided by the API here
        // public update (id: number, status: Hash | SubmittableResult): void {
        //   // ignore
        // }
      }

      /***/ }),

    /***/ "../extension-base/src/page/index.ts":
    /*!*******************************************!*\
  !*** ../extension-base/src/page/index.ts ***!
  \*******************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "enable": () => (/* binding */ enable),
        /* harmony export */   "handleResponse": () => (/* binding */ handleResponse),
        /* harmony export */   "sendMessage": () => (/* binding */ sendMessage)
        /* harmony export */ });
      /* harmony import */ var _subwallet_extension_base_errors_SubWalletProviderError__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @subwallet/extension-base/errors/SubWalletProviderError */ "../extension-base/src/errors/SubWalletProviderError.ts");
      /* harmony import */ var _defaults__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../defaults */ "../extension-base/src/defaults.ts");
      /* harmony import */ var _utils_getId__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/getId */ "../extension-base/src/utils/getId.ts");
      /* harmony import */ var _Injected__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Injected */ "../extension-base/src/page/Injected.ts");
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0





// when sending a message from the injector to the extension, we
//  - create an event - this we send to the loader
//  - the loader takes this event and uses port.postMessage to background
//  - on response, the loader creates a reponse event
//  - this injector, listens on the events, maps it to the original
//  - resolves/rejects the promise with the result (or sub data)

      const handlers = {};

// a generic message sender that creates an event, returning a promise that will
// resolve once the event is resolved (by the response listener just below this)

      function sendMessage(message, request, subscriber) {
        return new Promise((resolve, reject) => {
          const id = (0,_utils_getId__WEBPACK_IMPORTED_MODULE_0__.getId)();
          handlers[id] = {
            reject,
            resolve,
            subscriber
          };
          const transportRequestMessage = {
            id,
            message,
            origin: _defaults__WEBPACK_IMPORTED_MODULE_1__.MESSAGE_ORIGIN_PAGE,
            request: request || null
          };
          window.postMessage(transportRequestMessage, '*');
        });
      }

// the enable function, called by the dapp to allow access
      async function enable(origin) {
        await sendMessage('pub(authorize.tabV2)', {
          origin
        });
        return new _Injected__WEBPACK_IMPORTED_MODULE_2__["default"](sendMessage);
      }
      function handleResponse(data) {
        const handler = handlers[data.id];
        if (!handler) {
          console.error(`Unknown response: ${JSON.stringify(data)}`);
          return;
        }
        if (!handler.subscriber) {
          delete handlers[data.id];
        }
        if (data.subscription) {
          // eslint-disable-next-line @typescript-eslint/ban-types
          handler.subscriber(data.subscription);
        } else if (data.error) {
          handler.reject(new _subwallet_extension_base_errors_SubWalletProviderError__WEBPACK_IMPORTED_MODULE_3__.SubWalletProviderError(data.error, data.errorCode, data.errorData));
        } else {
          handler.resolve(data.response);
        }
      }

      /***/ }),

    /***/ "../extension-base/src/utils/getId.ts":
    /*!********************************************!*\
  !*** ../extension-base/src/utils/getId.ts ***!
  \********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "getId": () => (/* binding */ getId)
        /* harmony export */ });
      /* harmony import */ var _defaults__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../defaults */ "../extension-base/src/defaults.ts");
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0


      let counter = 0;
      function getId() {
        return `${_defaults__WEBPACK_IMPORTED_MODULE_0__.EXTENSION_PREFIX}.${Date.now()}.${++counter}`;
      }

      /***/ }),

    /***/ "../extension-inject/src/bundle.ts":
    /*!*****************************************!*\
  !*** ../extension-inject/src/bundle.ts ***!
  \*****************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "injectEvmExtension": () => (/* binding */ injectEvmExtension),
        /* harmony export */   "injectExtension": () => (/* binding */ injectExtension),
        /* harmony export */   "packageInfo": () => (/* reexport safe */ _packageInfo__WEBPACK_IMPORTED_MODULE_0__.packageInfo)
        /* harmony export */ });
      /* harmony import */ var _packageInfo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./packageInfo */ "../extension-inject/src/packageInfo.ts");
// Copyright 2019-2022 @polkadot/extension-inject authors & contributors
// SPDX-License-Identifier: Apache-2.0



// It is recommended to always use the function below to shield the extension and dapp from
// any future changes. The exposed interface will manage access between the 2 environments,
// be it via window (current), postMessage (under consideration) or any other mechanism
      function injectExtension(enable, {
        name,
        version
      }) {
        // small helper with the typescript types, just cast window
        const windowInject = window;

        // don't clobber the existing object, we will add it (or create as needed)
        windowInject.injectedWeb3 = windowInject.injectedWeb3 || {};

        // add our enable function
        windowInject.injectedWeb3[name] = {
          enable: origin => enable(origin),
          version
        };
      }

// Inject EVM Provider
      function injectEvmExtension(evmProvider) {
        // small helper with the typescript types, just cast window
        const windowInject = window;

        // add our enable function
        if (windowInject.SubWallet) {
          // Provider has been initialized in proxy mode
          windowInject.SubWallet.provider = evmProvider;
        } else {
          // Provider has been initialized in direct mode
          windowInject.SubWallet = evmProvider;
        }
        windowInject.dispatchEvent(new Event('subwallet#initialized'));

        // Publish to global if window.ethereum is not available
        windowInject.addEventListener('load', () => {
          if (!windowInject.ethereum) {
            windowInject.ethereum = evmProvider;
            windowInject.dispatchEvent(new Event('ethereum#initialized'));
          }
        });

        // Todo: Need more discuss to make SubWallet as global before window load because it can be conflict with MetaMask
        // windowInject.ethereum = evmProvider;
        // windowInject.dispatchEvent(new Event('ethereum#initialized'));
      }

      /***/ }),

    /***/ "../extension-inject/src/index.ts":
    /*!****************************************!*\
  !*** ../extension-inject/src/index.ts ***!
  \****************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "injectEvmExtension": () => (/* reexport safe */ _bundle__WEBPACK_IMPORTED_MODULE_0__.injectEvmExtension),
        /* harmony export */   "injectExtension": () => (/* reexport safe */ _bundle__WEBPACK_IMPORTED_MODULE_0__.injectExtension),
        /* harmony export */   "packageInfo": () => (/* reexport safe */ _bundle__WEBPACK_IMPORTED_MODULE_0__.packageInfo)
        /* harmony export */ });
      /* harmony import */ var _bundle__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bundle */ "../extension-inject/src/bundle.ts");
// Copyright 2019-2022 @polkadot/extension-inject authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Since we inject into pages, we skip this
// import './detectPackage';



      /***/ }),

    /***/ "../extension-inject/src/packageInfo.ts":
    /*!**********************************************!*\
  !*** ../extension-inject/src/packageInfo.ts ***!
  \**********************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "packageInfo": () => (/* binding */ packageInfo)
        /* harmony export */ });
// Copyright 2017-2022 @subwallet/extension-inject authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Do not edit, auto-generated by @polkadot/dev

      const packageInfo = {
        name: '@subwallet/extension-inject',
        path: 'auto',
        type: 'auto',
        version: '0.6.7-1'
      };

      /***/ }),

    /***/ "../extension-koni-base/src/page/SubWalleEvmProvider.ts":
    /*!**************************************************************!*\
  !*** ../extension-koni-base/src/page/SubWalleEvmProvider.ts ***!
  \**************************************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "SubWalletEvmProvider": () => (/* binding */ SubWalletEvmProvider)
        /* harmony export */ });
      /* harmony import */ var _metamask_safe_event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @metamask/safe-event-emitter */ "../../node_modules/@metamask/safe-event-emitter/index.js");
// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0


      class SubWalletEvmProvider extends _metamask_safe_event_emitter__WEBPACK_IMPORTED_MODULE_0__["default"] {
        isSubWallet = true;
        isMetaMask = false;
        _connected = false;
        _subscribed = false;
        constructor(sendMessage, version) {
          super();
          this.version = version;
          this.sendMessage = sendMessage;
          this._connected = true;
        }
        get connected() {
          return this._connected;
        }
        isConnected() {
          return this._connected;
        }
        subscribeExtensionEvents() {
          if (this._subscribed) {
            return;
          }
          this.sendMessage('evm(events.subscribe)', null, ({
                                                             payload,
                                                             type
                                                           }) => {
            if (['connect', 'disconnect', 'accountsChanged', 'chainChanged', 'message', 'data', 'reconnect', 'error'].includes(type)) {
              if (type === 'connect') {
                this._connected = true;
              } else if (type === 'disconnect') {
                this._connected = false;
              }
              const finalType = type === 'data' ? 'message' : type;

              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              this.emit(finalType, payload);
            } else {
              console.warn('Can not handle event', type, payload);
            }
          }).then(done => {
            this._subscribed = true;
          }).catch(console.error);
        }
        async enable() {
          return this.request({
            method: 'eth_requestAccounts'
          });
        }
        request({
                  method,
                  params
                }) {
          switch (method) {
            case 'eth_requestAccounts':
              return new Promise((resolve, reject) => {
                const origin = document.title !== '' ? document.title : window.location.hostname;
                this.sendMessage('pub(authorize.tabV2)', {
                  origin,
                  accountAuthType: 'evm'
                }).then(() => {
                  // Subscribe event
                  this.subscribeExtensionEvents();

                  // Return account list
                  this.request({
                    method: 'eth_accounts'
                  }).then(accounts => {
                    // @ts-ignore
                    resolve(accounts);
                  }).catch(e => {
                    reject(e);
                  });
                }).catch(e => {
                  reject(e);
                });
              });
            default:
              return new Promise((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.sendMessage('evm(request)', {
                  params,
                  method
                }).then(result => {
                  resolve(result);
                }).catch(e => {
                  reject(e);
                });
              });
          }
        }
        _sendSync(payload) {
          let result;
          switch (payload.method) {
            case 'net_version':
              result = this.version ? `SubWallet v${this.version}` : null;
              break;
            default:
              throw new Error(`Not support ${payload.method}`);
          }
          return {
            id: payload.id,
            jsonrpc: payload.jsonrpc,
            result
          };
        }
        send(methodOrPayload, callbackOrArgs) {
          if (typeof methodOrPayload === 'string' && (!callbackOrArgs || Array.isArray(callbackOrArgs))) {
            return this.request({
              method: methodOrPayload,
              params: callbackOrArgs
            });
          } else if (methodOrPayload && typeof methodOrPayload === 'object' && typeof callbackOrArgs === 'function') {
            return this.request(methodOrPayload).then(rs => {
              callbackOrArgs(rs);
            });
          }
          return this._sendSync(methodOrPayload);
        }
        sendAsync(payload, callback) {
          this.request(payload).then(result => {
            // @ts-ignore
            callback(null, {
              result
            });
          }).catch(e => {
            callback(e);
          });
        }
      }

      /***/ }),

    /***/ "../extension-koni-base/src/page/index.ts":
    /*!************************************************!*\
  !*** ../extension-koni-base/src/page/index.ts ***!
  \************************************************/
    /***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "initEvmProvider": () => (/* binding */ initEvmProvider)
        /* harmony export */ });
      /* harmony import */ var _subwallet_extension_base_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @subwallet/extension-base/page */ "../extension-base/src/page/index.ts");
      /* harmony import */ var _subwallet_extension_koni_base_page_SubWalleEvmProvider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @subwallet/extension-koni-base/page/SubWalleEvmProvider */ "../extension-koni-base/src/page/SubWalleEvmProvider.ts");
// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

// the enable function, called by the dapp to allow access


      function initEvmProvider(version) {
        return new _subwallet_extension_koni_base_page_SubWalleEvmProvider__WEBPACK_IMPORTED_MODULE_0__.SubWalletEvmProvider(_subwallet_extension_base_page__WEBPACK_IMPORTED_MODULE_1__.sendMessage, version);
      }

      /***/ }),

    /***/ "../../node_modules/base64-js/index.js":
    /*!*********************************************!*\
  !*** ../../node_modules/base64-js/index.js ***!
  \*********************************************/
    /***/ ((__unused_webpack_module, exports) => {

      "use strict";


      exports.byteLength = byteLength
      exports.toByteArray = toByteArray
      exports.fromByteArray = fromByteArray

      var lookup = []
      var revLookup = []
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i]
        revLookup[code.charCodeAt(i)] = i
      }

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
      revLookup['-'.charCodeAt(0)] = 62
      revLookup['_'.charCodeAt(0)] = 63

      function getLens (b64) {
        var len = b64.length

        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4')
        }

        // Trim off extra bytes after placeholder bytes are found
        // See: https://github.com/beatgammit/base64-js/issues/42
        var validLen = b64.indexOf('=')
        if (validLen === -1) validLen = len

        var placeHoldersLen = validLen === len
          ? 0
          : 4 - (validLen % 4)

        return [validLen, placeHoldersLen]
      }

// base64 is 4/3 + up to two characters of the original data
      function byteLength (b64) {
        var lens = getLens(b64)
        var validLen = lens[0]
        var placeHoldersLen = lens[1]
        return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
      }

      function _byteLength (b64, validLen, placeHoldersLen) {
        return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
      }

      function toByteArray (b64) {
        var tmp
        var lens = getLens(b64)
        var validLen = lens[0]
        var placeHoldersLen = lens[1]

        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

        var curByte = 0

        // if there are placeholders, only get up to the last complete 4 chars
        var len = placeHoldersLen > 0
          ? validLen - 4
          : validLen

        var i
        for (i = 0; i < len; i += 4) {
          tmp =
            (revLookup[b64.charCodeAt(i)] << 18) |
            (revLookup[b64.charCodeAt(i + 1)] << 12) |
            (revLookup[b64.charCodeAt(i + 2)] << 6) |
            revLookup[b64.charCodeAt(i + 3)]
          arr[curByte++] = (tmp >> 16) & 0xFF
          arr[curByte++] = (tmp >> 8) & 0xFF
          arr[curByte++] = tmp & 0xFF
        }

        if (placeHoldersLen === 2) {
          tmp =
            (revLookup[b64.charCodeAt(i)] << 2) |
            (revLookup[b64.charCodeAt(i + 1)] >> 4)
          arr[curByte++] = tmp & 0xFF
        }

        if (placeHoldersLen === 1) {
          tmp =
            (revLookup[b64.charCodeAt(i)] << 10) |
            (revLookup[b64.charCodeAt(i + 1)] << 4) |
            (revLookup[b64.charCodeAt(i + 2)] >> 2)
          arr[curByte++] = (tmp >> 8) & 0xFF
          arr[curByte++] = tmp & 0xFF
        }

        return arr
      }

      function tripletToBase64 (num) {
        return lookup[num >> 18 & 0x3F] +
          lookup[num >> 12 & 0x3F] +
          lookup[num >> 6 & 0x3F] +
          lookup[num & 0x3F]
      }

      function encodeChunk (uint8, start, end) {
        var tmp
        var output = []
        for (var i = start; i < end; i += 3) {
          tmp =
            ((uint8[i] << 16) & 0xFF0000) +
            ((uint8[i + 1] << 8) & 0xFF00) +
            (uint8[i + 2] & 0xFF)
          output.push(tripletToBase64(tmp))
        }
        return output.join('')
      }

      function fromByteArray (uint8) {
        var tmp
        var len = uint8.length
        var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
        var parts = []
        var maxChunkLength = 16383 // must be multiple of 3

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
        }

        // pad the end with zeros, but make sure to not forget the extra bytes
        if (extraBytes === 1) {
          tmp = uint8[len - 1]
          parts.push(
            lookup[tmp >> 2] +
            lookup[(tmp << 4) & 0x3F] +
            '=='
          )
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1]
          parts.push(
            lookup[tmp >> 10] +
            lookup[(tmp >> 4) & 0x3F] +
            lookup[(tmp << 2) & 0x3F] +
            '='
          )
        }

        return parts.join('')
      }


      /***/ }),

    /***/ "../../node_modules/bn.js/lib/bn.js":
    /*!******************************************!*\
  !*** ../../node_modules/bn.js/lib/bn.js ***!
  \******************************************/
    /***/ (function(module, __unused_webpack_exports, __webpack_require__) {

      /* module decorator */ module = __webpack_require__.nmd(module);
      (function (module, exports) {
        'use strict';

        // Utils
        function assert (val, msg) {
          if (!val) throw new Error(msg || 'Assertion failed');
        }

        // Could use `inherits` module, but don't want to move from single file
        // architecture yet.
        function inherits (ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function () {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }

        // BN

        function BN (number, base, endian) {
          if (BN.isBN(number)) {
            return number;
          }

          this.negative = 0;
          this.words = null;
          this.length = 0;

          // Reduction context
          this.red = null;

          if (number !== null) {
            if (base === 'le' || base === 'be') {
              endian = base;
              base = 10;
            }

            this._init(number || 0, base || 10, endian || 'be');
          }
        }
        if (typeof module === 'object') {
          module.exports = BN;
        } else {
          exports.BN = BN;
        }

        BN.BN = BN;
        BN.wordSize = 26;

        var Buffer;
        try {
          if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
            Buffer = window.Buffer;
          } else {
            Buffer = (__webpack_require__(/*! buffer */ "?2e65").Buffer);
          }
        } catch (e) {
        }

        BN.isBN = function isBN (num) {
          if (num instanceof BN) {
            return true;
          }

          return num !== null && typeof num === 'object' &&
            num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
        };

        BN.max = function max (left, right) {
          if (left.cmp(right) > 0) return left;
          return right;
        };

        BN.min = function min (left, right) {
          if (left.cmp(right) < 0) return left;
          return right;
        };

        BN.prototype._init = function init (number, base, endian) {
          if (typeof number === 'number') {
            return this._initNumber(number, base, endian);
          }

          if (typeof number === 'object') {
            return this._initArray(number, base, endian);
          }

          if (base === 'hex') {
            base = 16;
          }
          assert(base === (base | 0) && base >= 2 && base <= 36);

          number = number.toString().replace(/\s+/g, '');
          var start = 0;
          if (number[0] === '-') {
            start++;
            this.negative = 1;
          }

          if (start < number.length) {
            if (base === 16) {
              this._parseHex(number, start, endian);
            } else {
              this._parseBase(number, base, start);
              if (endian === 'le') {
                this._initArray(this.toArray(), base, endian);
              }
            }
          }
        };

        BN.prototype._initNumber = function _initNumber (number, base, endian) {
          if (number < 0) {
            this.negative = 1;
            number = -number;
          }
          if (number < 0x4000000) {
            this.words = [number & 0x3ffffff];
            this.length = 1;
          } else if (number < 0x10000000000000) {
            this.words = [
              number & 0x3ffffff,
              (number / 0x4000000) & 0x3ffffff
            ];
            this.length = 2;
          } else {
            assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
            this.words = [
              number & 0x3ffffff,
              (number / 0x4000000) & 0x3ffffff,
              1
            ];
            this.length = 3;
          }

          if (endian !== 'le') return;

          // Reverse the bytes
          this._initArray(this.toArray(), base, endian);
        };

        BN.prototype._initArray = function _initArray (number, base, endian) {
          // Perhaps a Uint8Array
          assert(typeof number.length === 'number');
          if (number.length <= 0) {
            this.words = [0];
            this.length = 1;
            return this;
          }

          this.length = Math.ceil(number.length / 3);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          var j, w;
          var off = 0;
          if (endian === 'be') {
            for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
              w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
              this.words[j] |= (w << off) & 0x3ffffff;
              this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          } else if (endian === 'le') {
            for (i = 0, j = 0; i < number.length; i += 3) {
              w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
              this.words[j] |= (w << off) & 0x3ffffff;
              this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
              off += 24;
              if (off >= 26) {
                off -= 26;
                j++;
              }
            }
          }
          return this._strip();
        };

        function parseHex4Bits (string, index) {
          var c = string.charCodeAt(index);
          // '0' - '9'
          if (c >= 48 && c <= 57) {
            return c - 48;
            // 'A' - 'F'
          } else if (c >= 65 && c <= 70) {
            return c - 55;
            // 'a' - 'f'
          } else if (c >= 97 && c <= 102) {
            return c - 87;
          } else {
            assert(false, 'Invalid character in ' + string);
          }
        }

        function parseHexByte (string, lowerBound, index) {
          var r = parseHex4Bits(string, index);
          if (index - 1 >= lowerBound) {
            r |= parseHex4Bits(string, index - 1) << 4;
          }
          return r;
        }

        BN.prototype._parseHex = function _parseHex (number, start, endian) {
          // Create possibly bigger array to ensure that it fits the number
          this.length = Math.ceil((number.length - start) / 6);
          this.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            this.words[i] = 0;
          }

          // 24-bits chunks
          var off = 0;
          var j = 0;

          var w;
          if (endian === 'be') {
            for (i = number.length - 1; i >= start; i -= 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 0x3ffffff;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          } else {
            var parseLength = number.length - start;
            for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
              w = parseHexByte(number, start, i) << off;
              this.words[j] |= w & 0x3ffffff;
              if (off >= 18) {
                off -= 18;
                j += 1;
                this.words[j] |= w >>> 26;
              } else {
                off += 8;
              }
            }
          }

          this._strip();
        };

        function parseBase (str, start, end, mul) {
          var r = 0;
          var b = 0;
          var len = Math.min(str.length, end);
          for (var i = start; i < len; i++) {
            var c = str.charCodeAt(i) - 48;

            r *= mul;

            // 'a'
            if (c >= 49) {
              b = c - 49 + 0xa;

              // 'A'
            } else if (c >= 17) {
              b = c - 17 + 0xa;

              // '0' - '9'
            } else {
              b = c;
            }
            assert(c >= 0 && b < mul, 'Invalid character');
            r += b;
          }
          return r;
        }

        BN.prototype._parseBase = function _parseBase (number, base, start) {
          // Initialize as zero
          this.words = [0];
          this.length = 1;

          // Find length of limb in base
          for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
            limbLen++;
          }
          limbLen--;
          limbPow = (limbPow / base) | 0;

          var total = number.length - start;
          var mod = total % limbLen;
          var end = Math.min(total, total - mod) + start;

          var word = 0;
          for (var i = start; i < end; i += limbLen) {
            word = parseBase(number, i, i + limbLen, base);

            this.imuln(limbPow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }

          if (mod !== 0) {
            var pow = 1;
            word = parseBase(number, i, number.length, base);

            for (i = 0; i < mod; i++) {
              pow *= base;
            }

            this.imuln(pow);
            if (this.words[0] + word < 0x4000000) {
              this.words[0] += word;
            } else {
              this._iaddn(word);
            }
          }

          this._strip();
        };

        BN.prototype.copy = function copy (dest) {
          dest.words = new Array(this.length);
          for (var i = 0; i < this.length; i++) {
            dest.words[i] = this.words[i];
          }
          dest.length = this.length;
          dest.negative = this.negative;
          dest.red = this.red;
        };

        function move (dest, src) {
          dest.words = src.words;
          dest.length = src.length;
          dest.negative = src.negative;
          dest.red = src.red;
        }

        BN.prototype._move = function _move (dest) {
          move(dest, this);
        };

        BN.prototype.clone = function clone () {
          var r = new BN(null);
          this.copy(r);
          return r;
        };

        BN.prototype._expand = function _expand (size) {
          while (this.length < size) {
            this.words[this.length++] = 0;
          }
          return this;
        };

        // Remove leading `0` from `this`
        BN.prototype._strip = function strip () {
          while (this.length > 1 && this.words[this.length - 1] === 0) {
            this.length--;
          }
          return this._normSign();
        };

        BN.prototype._normSign = function _normSign () {
          // -0 = 0
          if (this.length === 1 && this.words[0] === 0) {
            this.negative = 0;
          }
          return this;
        };

        // Check Symbol.for because not everywhere where Symbol defined
        // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
        if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
          try {
            BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
          } catch (e) {
            BN.prototype.inspect = inspect;
          }
        } else {
          BN.prototype.inspect = inspect;
        }

        function inspect () {
          return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
        }

        /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */

        var zeros = [
          '',
          '0',
          '00',
          '000',
          '0000',
          '00000',
          '000000',
          '0000000',
          '00000000',
          '000000000',
          '0000000000',
          '00000000000',
          '000000000000',
          '0000000000000',
          '00000000000000',
          '000000000000000',
          '0000000000000000',
          '00000000000000000',
          '000000000000000000',
          '0000000000000000000',
          '00000000000000000000',
          '000000000000000000000',
          '0000000000000000000000',
          '00000000000000000000000',
          '000000000000000000000000',
          '0000000000000000000000000'
        ];

        var groupSizes = [
          0, 0,
          25, 16, 12, 11, 10, 9, 8,
          8, 7, 7, 7, 7, 6, 6,
          6, 6, 6, 6, 6, 5, 5,
          5, 5, 5, 5, 5, 5, 5,
          5, 5, 5, 5, 5, 5, 5
        ];

        var groupBases = [
          0, 0,
          33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
          43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
          16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
          6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
          24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
        ];

        BN.prototype.toString = function toString (base, padding) {
          base = base || 10;
          padding = padding | 0 || 1;

          var out;
          if (base === 16 || base === 'hex') {
            out = '';
            var off = 0;
            var carry = 0;
            for (var i = 0; i < this.length; i++) {
              var w = this.words[i];
              var word = (((w << off) | carry) & 0xffffff).toString(16);
              carry = (w >>> (24 - off)) & 0xffffff;
              off += 2;
              if (off >= 26) {
                off -= 26;
                i--;
              }
              if (carry !== 0 || i !== this.length - 1) {
                out = zeros[6 - word.length] + word + out;
              } else {
                out = word + out;
              }
            }
            if (carry !== 0) {
              out = carry.toString(16) + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          if (base === (base | 0) && base >= 2 && base <= 36) {
            // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
            var groupSize = groupSizes[base];
            // var groupBase = Math.pow(base, groupSize);
            var groupBase = groupBases[base];
            out = '';
            var c = this.clone();
            c.negative = 0;
            while (!c.isZero()) {
              var r = c.modrn(groupBase).toString(base);
              c = c.idivn(groupBase);

              if (!c.isZero()) {
                out = zeros[groupSize - r.length] + r + out;
              } else {
                out = r + out;
              }
            }
            if (this.isZero()) {
              out = '0' + out;
            }
            while (out.length % padding !== 0) {
              out = '0' + out;
            }
            if (this.negative !== 0) {
              out = '-' + out;
            }
            return out;
          }

          assert(false, 'Base should be between 2 and 36');
        };

        BN.prototype.toNumber = function toNumber () {
          var ret = this.words[0];
          if (this.length === 2) {
            ret += this.words[1] * 0x4000000;
          } else if (this.length === 3 && this.words[2] === 0x01) {
            // NOTE: at this stage it is known that the top bit is set
            ret += 0x10000000000000 + (this.words[1] * 0x4000000);
          } else if (this.length > 2) {
            assert(false, 'Number can only safely store up to 53 bits');
          }
          return (this.negative !== 0) ? -ret : ret;
        };

        BN.prototype.toJSON = function toJSON () {
          return this.toString(16, 2);
        };

        if (Buffer) {
          BN.prototype.toBuffer = function toBuffer (endian, length) {
            return this.toArrayLike(Buffer, endian, length);
          };
        }

        BN.prototype.toArray = function toArray (endian, length) {
          return this.toArrayLike(Array, endian, length);
        };

        var allocate = function allocate (ArrayType, size) {
          if (ArrayType.allocUnsafe) {
            return ArrayType.allocUnsafe(size);
          }
          return new ArrayType(size);
        };

        BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
          this._strip();

          var byteLength = this.byteLength();
          var reqLength = length || Math.max(1, byteLength);
          assert(byteLength <= reqLength, 'byte array longer than desired length');
          assert(reqLength > 0, 'Requested array length <= 0');

          var res = allocate(ArrayType, reqLength);
          var postfix = endian === 'le' ? 'LE' : 'BE';
          this['_toArrayLike' + postfix](res, byteLength);
          return res;
        };

        BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
          var position = 0;
          var carry = 0;

          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = (this.words[i] << shift) | carry;

            res[position++] = word & 0xff;
            if (position < res.length) {
              res[position++] = (word >> 8) & 0xff;
            }
            if (position < res.length) {
              res[position++] = (word >> 16) & 0xff;
            }

            if (shift === 6) {
              if (position < res.length) {
                res[position++] = (word >> 24) & 0xff;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }

          if (position < res.length) {
            res[position++] = carry;

            while (position < res.length) {
              res[position++] = 0;
            }
          }
        };

        BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
          var position = res.length - 1;
          var carry = 0;

          for (var i = 0, shift = 0; i < this.length; i++) {
            var word = (this.words[i] << shift) | carry;

            res[position--] = word & 0xff;
            if (position >= 0) {
              res[position--] = (word >> 8) & 0xff;
            }
            if (position >= 0) {
              res[position--] = (word >> 16) & 0xff;
            }

            if (shift === 6) {
              if (position >= 0) {
                res[position--] = (word >> 24) & 0xff;
              }
              carry = 0;
              shift = 0;
            } else {
              carry = word >>> 24;
              shift += 2;
            }
          }

          if (position >= 0) {
            res[position--] = carry;

            while (position >= 0) {
              res[position--] = 0;
            }
          }
        };

        if (Math.clz32) {
          BN.prototype._countBits = function _countBits (w) {
            return 32 - Math.clz32(w);
          };
        } else {
          BN.prototype._countBits = function _countBits (w) {
            var t = w;
            var r = 0;
            if (t >= 0x1000) {
              r += 13;
              t >>>= 13;
            }
            if (t >= 0x40) {
              r += 7;
              t >>>= 7;
            }
            if (t >= 0x8) {
              r += 4;
              t >>>= 4;
            }
            if (t >= 0x02) {
              r += 2;
              t >>>= 2;
            }
            return r + t;
          };
        }

        BN.prototype._zeroBits = function _zeroBits (w) {
          // Short-cut
          if (w === 0) return 26;

          var t = w;
          var r = 0;
          if ((t & 0x1fff) === 0) {
            r += 13;
            t >>>= 13;
          }
          if ((t & 0x7f) === 0) {
            r += 7;
            t >>>= 7;
          }
          if ((t & 0xf) === 0) {
            r += 4;
            t >>>= 4;
          }
          if ((t & 0x3) === 0) {
            r += 2;
            t >>>= 2;
          }
          if ((t & 0x1) === 0) {
            r++;
          }
          return r;
        };

        // Return number of used bits in a BN
        BN.prototype.bitLength = function bitLength () {
          var w = this.words[this.length - 1];
          var hi = this._countBits(w);
          return (this.length - 1) * 26 + hi;
        };

        function toBitArray (num) {
          var w = new Array(num.bitLength());

          for (var bit = 0; bit < w.length; bit++) {
            var off = (bit / 26) | 0;
            var wbit = bit % 26;

            w[bit] = (num.words[off] >>> wbit) & 0x01;
          }

          return w;
        }

        // Number of trailing zero bits
        BN.prototype.zeroBits = function zeroBits () {
          if (this.isZero()) return 0;

          var r = 0;
          for (var i = 0; i < this.length; i++) {
            var b = this._zeroBits(this.words[i]);
            r += b;
            if (b !== 26) break;
          }
          return r;
        };

        BN.prototype.byteLength = function byteLength () {
          return Math.ceil(this.bitLength() / 8);
        };

        BN.prototype.toTwos = function toTwos (width) {
          if (this.negative !== 0) {
            return this.abs().inotn(width).iaddn(1);
          }
          return this.clone();
        };

        BN.prototype.fromTwos = function fromTwos (width) {
          if (this.testn(width - 1)) {
            return this.notn(width).iaddn(1).ineg();
          }
          return this.clone();
        };

        BN.prototype.isNeg = function isNeg () {
          return this.negative !== 0;
        };

        // Return negative clone of `this`
        BN.prototype.neg = function neg () {
          return this.clone().ineg();
        };

        BN.prototype.ineg = function ineg () {
          if (!this.isZero()) {
            this.negative ^= 1;
          }

          return this;
        };

        // Or `num` with `this` in-place
        BN.prototype.iuor = function iuor (num) {
          while (this.length < num.length) {
            this.words[this.length++] = 0;
          }

          for (var i = 0; i < num.length; i++) {
            this.words[i] = this.words[i] | num.words[i];
          }

          return this._strip();
        };

        BN.prototype.ior = function ior (num) {
          assert((this.negative | num.negative) === 0);
          return this.iuor(num);
        };

        // Or `num` with `this`
        BN.prototype.or = function or (num) {
          if (this.length > num.length) return this.clone().ior(num);
          return num.clone().ior(this);
        };

        BN.prototype.uor = function uor (num) {
          if (this.length > num.length) return this.clone().iuor(num);
          return num.clone().iuor(this);
        };

        // And `num` with `this` in-place
        BN.prototype.iuand = function iuand (num) {
          // b = min-length(num, this)
          var b;
          if (this.length > num.length) {
            b = num;
          } else {
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = this.words[i] & num.words[i];
          }

          this.length = b.length;

          return this._strip();
        };

        BN.prototype.iand = function iand (num) {
          assert((this.negative | num.negative) === 0);
          return this.iuand(num);
        };

        // And `num` with `this`
        BN.prototype.and = function and (num) {
          if (this.length > num.length) return this.clone().iand(num);
          return num.clone().iand(this);
        };

        BN.prototype.uand = function uand (num) {
          if (this.length > num.length) return this.clone().iuand(num);
          return num.clone().iuand(this);
        };

        // Xor `num` with `this` in-place
        BN.prototype.iuxor = function iuxor (num) {
          // a.length > b.length
          var a;
          var b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          for (var i = 0; i < b.length; i++) {
            this.words[i] = a.words[i] ^ b.words[i];
          }

          if (this !== a) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = a.length;

          return this._strip();
        };

        BN.prototype.ixor = function ixor (num) {
          assert((this.negative | num.negative) === 0);
          return this.iuxor(num);
        };

        // Xor `num` with `this`
        BN.prototype.xor = function xor (num) {
          if (this.length > num.length) return this.clone().ixor(num);
          return num.clone().ixor(this);
        };

        BN.prototype.uxor = function uxor (num) {
          if (this.length > num.length) return this.clone().iuxor(num);
          return num.clone().iuxor(this);
        };

        // Not ``this`` with ``width`` bitwidth
        BN.prototype.inotn = function inotn (width) {
          assert(typeof width === 'number' && width >= 0);

          var bytesNeeded = Math.ceil(width / 26) | 0;
          var bitsLeft = width % 26;

          // Extend the buffer with leading zeroes
          this._expand(bytesNeeded);

          if (bitsLeft > 0) {
            bytesNeeded--;
          }

          // Handle complete words
          for (var i = 0; i < bytesNeeded; i++) {
            this.words[i] = ~this.words[i] & 0x3ffffff;
          }

          // Handle the residue
          if (bitsLeft > 0) {
            this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
          }

          // And remove leading zeroes
          return this._strip();
        };

        BN.prototype.notn = function notn (width) {
          return this.clone().inotn(width);
        };

        // Set `bit` of `this`
        BN.prototype.setn = function setn (bit, val) {
          assert(typeof bit === 'number' && bit >= 0);

          var off = (bit / 26) | 0;
          var wbit = bit % 26;

          this._expand(off + 1);

          if (val) {
            this.words[off] = this.words[off] | (1 << wbit);
          } else {
            this.words[off] = this.words[off] & ~(1 << wbit);
          }

          return this._strip();
        };

        // Add `num` to `this` in-place
        BN.prototype.iadd = function iadd (num) {
          var r;

          // negative + positive
          if (this.negative !== 0 && num.negative === 0) {
            this.negative = 0;
            r = this.isub(num);
            this.negative ^= 1;
            return this._normSign();

            // positive + negative
          } else if (this.negative === 0 && num.negative !== 0) {
            num.negative = 0;
            r = this.isub(num);
            num.negative = 1;
            return r._normSign();
          }

          // a.length > b.length
          var a, b;
          if (this.length > num.length) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            this.words[i] = r & 0x3ffffff;
            carry = r >>> 26;
          }

          this.length = a.length;
          if (carry !== 0) {
            this.words[this.length] = carry;
            this.length++;
            // Copy the rest of the words
          } else if (a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          return this;
        };

        // Add `num` to `this`
        BN.prototype.add = function add (num) {
          var res;
          if (num.negative !== 0 && this.negative === 0) {
            num.negative = 0;
            res = this.sub(num);
            num.negative ^= 1;
            return res;
          } else if (num.negative === 0 && this.negative !== 0) {
            this.negative = 0;
            res = num.sub(this);
            this.negative = 1;
            return res;
          }

          if (this.length > num.length) return this.clone().iadd(num);

          return num.clone().iadd(this);
        };

        // Subtract `num` from `this` in-place
        BN.prototype.isub = function isub (num) {
          // this - (-num) = this + num
          if (num.negative !== 0) {
            num.negative = 0;
            var r = this.iadd(num);
            num.negative = 1;
            return r._normSign();

            // -this - num = -(this + num)
          } else if (this.negative !== 0) {
            this.negative = 0;
            this.iadd(num);
            this.negative = 1;
            return this._normSign();
          }

          // At this point both numbers are positive
          var cmp = this.cmp(num);

          // Optimization - zeroify
          if (cmp === 0) {
            this.negative = 0;
            this.length = 1;
            this.words[0] = 0;
            return this;
          }

          // a > b
          var a, b;
          if (cmp > 0) {
            a = this;
            b = num;
          } else {
            a = num;
            b = this;
          }

          var carry = 0;
          for (var i = 0; i < b.length; i++) {
            r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }
          for (; carry !== 0 && i < a.length; i++) {
            r = (a.words[i] | 0) + carry;
            carry = r >> 26;
            this.words[i] = r & 0x3ffffff;
          }

          // Copy rest of the words
          if (carry === 0 && i < a.length && a !== this) {
            for (; i < a.length; i++) {
              this.words[i] = a.words[i];
            }
          }

          this.length = Math.max(this.length, i);

          if (a !== this) {
            this.negative = 1;
          }

          return this._strip();
        };

        // Subtract `num` from `this`
        BN.prototype.sub = function sub (num) {
          return this.clone().isub(num);
        };

        function smallMulTo (self, num, out) {
          out.negative = num.negative ^ self.negative;
          var len = (self.length + num.length) | 0;
          out.length = len;
          len = (len - 1) | 0;

          // Peel one iteration (compiler can't do it, because of code complexity)
          var a = self.words[0] | 0;
          var b = num.words[0] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          var carry = (r / 0x4000000) | 0;
          out.words[0] = lo;

          for (var k = 1; k < len; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = carry >>> 26;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = (k - j) | 0;
              a = self.words[i] | 0;
              b = num.words[j] | 0;
              r = a * b + rword;
              ncarry += (r / 0x4000000) | 0;
              rword = r & 0x3ffffff;
            }
            out.words[k] = rword | 0;
            carry = ncarry | 0;
          }
          if (carry !== 0) {
            out.words[k] = carry | 0;
          } else {
            out.length--;
          }

          return out._strip();
        }

        // TODO(indutny): it may be reasonable to omit it for users who don't need
        // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
        // multiplication (like elliptic secp256k1).
        var comb10MulTo = function comb10MulTo (self, num, out) {
          var a = self.words;
          var b = num.words;
          var o = out.words;
          var c = 0;
          var lo;
          var mid;
          var hi;
          var a0 = a[0] | 0;
          var al0 = a0 & 0x1fff;
          var ah0 = a0 >>> 13;
          var a1 = a[1] | 0;
          var al1 = a1 & 0x1fff;
          var ah1 = a1 >>> 13;
          var a2 = a[2] | 0;
          var al2 = a2 & 0x1fff;
          var ah2 = a2 >>> 13;
          var a3 = a[3] | 0;
          var al3 = a3 & 0x1fff;
          var ah3 = a3 >>> 13;
          var a4 = a[4] | 0;
          var al4 = a4 & 0x1fff;
          var ah4 = a4 >>> 13;
          var a5 = a[5] | 0;
          var al5 = a5 & 0x1fff;
          var ah5 = a5 >>> 13;
          var a6 = a[6] | 0;
          var al6 = a6 & 0x1fff;
          var ah6 = a6 >>> 13;
          var a7 = a[7] | 0;
          var al7 = a7 & 0x1fff;
          var ah7 = a7 >>> 13;
          var a8 = a[8] | 0;
          var al8 = a8 & 0x1fff;
          var ah8 = a8 >>> 13;
          var a9 = a[9] | 0;
          var al9 = a9 & 0x1fff;
          var ah9 = a9 >>> 13;
          var b0 = b[0] | 0;
          var bl0 = b0 & 0x1fff;
          var bh0 = b0 >>> 13;
          var b1 = b[1] | 0;
          var bl1 = b1 & 0x1fff;
          var bh1 = b1 >>> 13;
          var b2 = b[2] | 0;
          var bl2 = b2 & 0x1fff;
          var bh2 = b2 >>> 13;
          var b3 = b[3] | 0;
          var bl3 = b3 & 0x1fff;
          var bh3 = b3 >>> 13;
          var b4 = b[4] | 0;
          var bl4 = b4 & 0x1fff;
          var bh4 = b4 >>> 13;
          var b5 = b[5] | 0;
          var bl5 = b5 & 0x1fff;
          var bh5 = b5 >>> 13;
          var b6 = b[6] | 0;
          var bl6 = b6 & 0x1fff;
          var bh6 = b6 >>> 13;
          var b7 = b[7] | 0;
          var bl7 = b7 & 0x1fff;
          var bh7 = b7 >>> 13;
          var b8 = b[8] | 0;
          var bl8 = b8 & 0x1fff;
          var bh8 = b8 >>> 13;
          var b9 = b[9] | 0;
          var bl9 = b9 & 0x1fff;
          var bh9 = b9 >>> 13;

          out.negative = self.negative ^ num.negative;
          out.length = 19;
          /* k = 0 */
          lo = Math.imul(al0, bl0);
          mid = Math.imul(al0, bh0);
          mid = (mid + Math.imul(ah0, bl0)) | 0;
          hi = Math.imul(ah0, bh0);
          var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
          w0 &= 0x3ffffff;
          /* k = 1 */
          lo = Math.imul(al1, bl0);
          mid = Math.imul(al1, bh0);
          mid = (mid + Math.imul(ah1, bl0)) | 0;
          hi = Math.imul(ah1, bh0);
          lo = (lo + Math.imul(al0, bl1)) | 0;
          mid = (mid + Math.imul(al0, bh1)) | 0;
          mid = (mid + Math.imul(ah0, bl1)) | 0;
          hi = (hi + Math.imul(ah0, bh1)) | 0;
          var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
          w1 &= 0x3ffffff;
          /* k = 2 */
          lo = Math.imul(al2, bl0);
          mid = Math.imul(al2, bh0);
          mid = (mid + Math.imul(ah2, bl0)) | 0;
          hi = Math.imul(ah2, bh0);
          lo = (lo + Math.imul(al1, bl1)) | 0;
          mid = (mid + Math.imul(al1, bh1)) | 0;
          mid = (mid + Math.imul(ah1, bl1)) | 0;
          hi = (hi + Math.imul(ah1, bh1)) | 0;
          lo = (lo + Math.imul(al0, bl2)) | 0;
          mid = (mid + Math.imul(al0, bh2)) | 0;
          mid = (mid + Math.imul(ah0, bl2)) | 0;
          hi = (hi + Math.imul(ah0, bh2)) | 0;
          var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
          w2 &= 0x3ffffff;
          /* k = 3 */
          lo = Math.imul(al3, bl0);
          mid = Math.imul(al3, bh0);
          mid = (mid + Math.imul(ah3, bl0)) | 0;
          hi = Math.imul(ah3, bh0);
          lo = (lo + Math.imul(al2, bl1)) | 0;
          mid = (mid + Math.imul(al2, bh1)) | 0;
          mid = (mid + Math.imul(ah2, bl1)) | 0;
          hi = (hi + Math.imul(ah2, bh1)) | 0;
          lo = (lo + Math.imul(al1, bl2)) | 0;
          mid = (mid + Math.imul(al1, bh2)) | 0;
          mid = (mid + Math.imul(ah1, bl2)) | 0;
          hi = (hi + Math.imul(ah1, bh2)) | 0;
          lo = (lo + Math.imul(al0, bl3)) | 0;
          mid = (mid + Math.imul(al0, bh3)) | 0;
          mid = (mid + Math.imul(ah0, bl3)) | 0;
          hi = (hi + Math.imul(ah0, bh3)) | 0;
          var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
          w3 &= 0x3ffffff;
          /* k = 4 */
          lo = Math.imul(al4, bl0);
          mid = Math.imul(al4, bh0);
          mid = (mid + Math.imul(ah4, bl0)) | 0;
          hi = Math.imul(ah4, bh0);
          lo = (lo + Math.imul(al3, bl1)) | 0;
          mid = (mid + Math.imul(al3, bh1)) | 0;
          mid = (mid + Math.imul(ah3, bl1)) | 0;
          hi = (hi + Math.imul(ah3, bh1)) | 0;
          lo = (lo + Math.imul(al2, bl2)) | 0;
          mid = (mid + Math.imul(al2, bh2)) | 0;
          mid = (mid + Math.imul(ah2, bl2)) | 0;
          hi = (hi + Math.imul(ah2, bh2)) | 0;
          lo = (lo + Math.imul(al1, bl3)) | 0;
          mid = (mid + Math.imul(al1, bh3)) | 0;
          mid = (mid + Math.imul(ah1, bl3)) | 0;
          hi = (hi + Math.imul(ah1, bh3)) | 0;
          lo = (lo + Math.imul(al0, bl4)) | 0;
          mid = (mid + Math.imul(al0, bh4)) | 0;
          mid = (mid + Math.imul(ah0, bl4)) | 0;
          hi = (hi + Math.imul(ah0, bh4)) | 0;
          var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
          w4 &= 0x3ffffff;
          /* k = 5 */
          lo = Math.imul(al5, bl0);
          mid = Math.imul(al5, bh0);
          mid = (mid + Math.imul(ah5, bl0)) | 0;
          hi = Math.imul(ah5, bh0);
          lo = (lo + Math.imul(al4, bl1)) | 0;
          mid = (mid + Math.imul(al4, bh1)) | 0;
          mid = (mid + Math.imul(ah4, bl1)) | 0;
          hi = (hi + Math.imul(ah4, bh1)) | 0;
          lo = (lo + Math.imul(al3, bl2)) | 0;
          mid = (mid + Math.imul(al3, bh2)) | 0;
          mid = (mid + Math.imul(ah3, bl2)) | 0;
          hi = (hi + Math.imul(ah3, bh2)) | 0;
          lo = (lo + Math.imul(al2, bl3)) | 0;
          mid = (mid + Math.imul(al2, bh3)) | 0;
          mid = (mid + Math.imul(ah2, bl3)) | 0;
          hi = (hi + Math.imul(ah2, bh3)) | 0;
          lo = (lo + Math.imul(al1, bl4)) | 0;
          mid = (mid + Math.imul(al1, bh4)) | 0;
          mid = (mid + Math.imul(ah1, bl4)) | 0;
          hi = (hi + Math.imul(ah1, bh4)) | 0;
          lo = (lo + Math.imul(al0, bl5)) | 0;
          mid = (mid + Math.imul(al0, bh5)) | 0;
          mid = (mid + Math.imul(ah0, bl5)) | 0;
          hi = (hi + Math.imul(ah0, bh5)) | 0;
          var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
          w5 &= 0x3ffffff;
          /* k = 6 */
          lo = Math.imul(al6, bl0);
          mid = Math.imul(al6, bh0);
          mid = (mid + Math.imul(ah6, bl0)) | 0;
          hi = Math.imul(ah6, bh0);
          lo = (lo + Math.imul(al5, bl1)) | 0;
          mid = (mid + Math.imul(al5, bh1)) | 0;
          mid = (mid + Math.imul(ah5, bl1)) | 0;
          hi = (hi + Math.imul(ah5, bh1)) | 0;
          lo = (lo + Math.imul(al4, bl2)) | 0;
          mid = (mid + Math.imul(al4, bh2)) | 0;
          mid = (mid + Math.imul(ah4, bl2)) | 0;
          hi = (hi + Math.imul(ah4, bh2)) | 0;
          lo = (lo + Math.imul(al3, bl3)) | 0;
          mid = (mid + Math.imul(al3, bh3)) | 0;
          mid = (mid + Math.imul(ah3, bl3)) | 0;
          hi = (hi + Math.imul(ah3, bh3)) | 0;
          lo = (lo + Math.imul(al2, bl4)) | 0;
          mid = (mid + Math.imul(al2, bh4)) | 0;
          mid = (mid + Math.imul(ah2, bl4)) | 0;
          hi = (hi + Math.imul(ah2, bh4)) | 0;
          lo = (lo + Math.imul(al1, bl5)) | 0;
          mid = (mid + Math.imul(al1, bh5)) | 0;
          mid = (mid + Math.imul(ah1, bl5)) | 0;
          hi = (hi + Math.imul(ah1, bh5)) | 0;
          lo = (lo + Math.imul(al0, bl6)) | 0;
          mid = (mid + Math.imul(al0, bh6)) | 0;
          mid = (mid + Math.imul(ah0, bl6)) | 0;
          hi = (hi + Math.imul(ah0, bh6)) | 0;
          var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
          w6 &= 0x3ffffff;
          /* k = 7 */
          lo = Math.imul(al7, bl0);
          mid = Math.imul(al7, bh0);
          mid = (mid + Math.imul(ah7, bl0)) | 0;
          hi = Math.imul(ah7, bh0);
          lo = (lo + Math.imul(al6, bl1)) | 0;
          mid = (mid + Math.imul(al6, bh1)) | 0;
          mid = (mid + Math.imul(ah6, bl1)) | 0;
          hi = (hi + Math.imul(ah6, bh1)) | 0;
          lo = (lo + Math.imul(al5, bl2)) | 0;
          mid = (mid + Math.imul(al5, bh2)) | 0;
          mid = (mid + Math.imul(ah5, bl2)) | 0;
          hi = (hi + Math.imul(ah5, bh2)) | 0;
          lo = (lo + Math.imul(al4, bl3)) | 0;
          mid = (mid + Math.imul(al4, bh3)) | 0;
          mid = (mid + Math.imul(ah4, bl3)) | 0;
          hi = (hi + Math.imul(ah4, bh3)) | 0;
          lo = (lo + Math.imul(al3, bl4)) | 0;
          mid = (mid + Math.imul(al3, bh4)) | 0;
          mid = (mid + Math.imul(ah3, bl4)) | 0;
          hi = (hi + Math.imul(ah3, bh4)) | 0;
          lo = (lo + Math.imul(al2, bl5)) | 0;
          mid = (mid + Math.imul(al2, bh5)) | 0;
          mid = (mid + Math.imul(ah2, bl5)) | 0;
          hi = (hi + Math.imul(ah2, bh5)) | 0;
          lo = (lo + Math.imul(al1, bl6)) | 0;
          mid = (mid + Math.imul(al1, bh6)) | 0;
          mid = (mid + Math.imul(ah1, bl6)) | 0;
          hi = (hi + Math.imul(ah1, bh6)) | 0;
          lo = (lo + Math.imul(al0, bl7)) | 0;
          mid = (mid + Math.imul(al0, bh7)) | 0;
          mid = (mid + Math.imul(ah0, bl7)) | 0;
          hi = (hi + Math.imul(ah0, bh7)) | 0;
          var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
          w7 &= 0x3ffffff;
          /* k = 8 */
          lo = Math.imul(al8, bl0);
          mid = Math.imul(al8, bh0);
          mid = (mid + Math.imul(ah8, bl0)) | 0;
          hi = Math.imul(ah8, bh0);
          lo = (lo + Math.imul(al7, bl1)) | 0;
          mid = (mid + Math.imul(al7, bh1)) | 0;
          mid = (mid + Math.imul(ah7, bl1)) | 0;
          hi = (hi + Math.imul(ah7, bh1)) | 0;
          lo = (lo + Math.imul(al6, bl2)) | 0;
          mid = (mid + Math.imul(al6, bh2)) | 0;
          mid = (mid + Math.imul(ah6, bl2)) | 0;
          hi = (hi + Math.imul(ah6, bh2)) | 0;
          lo = (lo + Math.imul(al5, bl3)) | 0;
          mid = (mid + Math.imul(al5, bh3)) | 0;
          mid = (mid + Math.imul(ah5, bl3)) | 0;
          hi = (hi + Math.imul(ah5, bh3)) | 0;
          lo = (lo + Math.imul(al4, bl4)) | 0;
          mid = (mid + Math.imul(al4, bh4)) | 0;
          mid = (mid + Math.imul(ah4, bl4)) | 0;
          hi = (hi + Math.imul(ah4, bh4)) | 0;
          lo = (lo + Math.imul(al3, bl5)) | 0;
          mid = (mid + Math.imul(al3, bh5)) | 0;
          mid = (mid + Math.imul(ah3, bl5)) | 0;
          hi = (hi + Math.imul(ah3, bh5)) | 0;
          lo = (lo + Math.imul(al2, bl6)) | 0;
          mid = (mid + Math.imul(al2, bh6)) | 0;
          mid = (mid + Math.imul(ah2, bl6)) | 0;
          hi = (hi + Math.imul(ah2, bh6)) | 0;
          lo = (lo + Math.imul(al1, bl7)) | 0;
          mid = (mid + Math.imul(al1, bh7)) | 0;
          mid = (mid + Math.imul(ah1, bl7)) | 0;
          hi = (hi + Math.imul(ah1, bh7)) | 0;
          lo = (lo + Math.imul(al0, bl8)) | 0;
          mid = (mid + Math.imul(al0, bh8)) | 0;
          mid = (mid + Math.imul(ah0, bl8)) | 0;
          hi = (hi + Math.imul(ah0, bh8)) | 0;
          var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
          w8 &= 0x3ffffff;
          /* k = 9 */
          lo = Math.imul(al9, bl0);
          mid = Math.imul(al9, bh0);
          mid = (mid + Math.imul(ah9, bl0)) | 0;
          hi = Math.imul(ah9, bh0);
          lo = (lo + Math.imul(al8, bl1)) | 0;
          mid = (mid + Math.imul(al8, bh1)) | 0;
          mid = (mid + Math.imul(ah8, bl1)) | 0;
          hi = (hi + Math.imul(ah8, bh1)) | 0;
          lo = (lo + Math.imul(al7, bl2)) | 0;
          mid = (mid + Math.imul(al7, bh2)) | 0;
          mid = (mid + Math.imul(ah7, bl2)) | 0;
          hi = (hi + Math.imul(ah7, bh2)) | 0;
          lo = (lo + Math.imul(al6, bl3)) | 0;
          mid = (mid + Math.imul(al6, bh3)) | 0;
          mid = (mid + Math.imul(ah6, bl3)) | 0;
          hi = (hi + Math.imul(ah6, bh3)) | 0;
          lo = (lo + Math.imul(al5, bl4)) | 0;
          mid = (mid + Math.imul(al5, bh4)) | 0;
          mid = (mid + Math.imul(ah5, bl4)) | 0;
          hi = (hi + Math.imul(ah5, bh4)) | 0;
          lo = (lo + Math.imul(al4, bl5)) | 0;
          mid = (mid + Math.imul(al4, bh5)) | 0;
          mid = (mid + Math.imul(ah4, bl5)) | 0;
          hi = (hi + Math.imul(ah4, bh5)) | 0;
          lo = (lo + Math.imul(al3, bl6)) | 0;
          mid = (mid + Math.imul(al3, bh6)) | 0;
          mid = (mid + Math.imul(ah3, bl6)) | 0;
          hi = (hi + Math.imul(ah3, bh6)) | 0;
          lo = (lo + Math.imul(al2, bl7)) | 0;
          mid = (mid + Math.imul(al2, bh7)) | 0;
          mid = (mid + Math.imul(ah2, bl7)) | 0;
          hi = (hi + Math.imul(ah2, bh7)) | 0;
          lo = (lo + Math.imul(al1, bl8)) | 0;
          mid = (mid + Math.imul(al1, bh8)) | 0;
          mid = (mid + Math.imul(ah1, bl8)) | 0;
          hi = (hi + Math.imul(ah1, bh8)) | 0;
          lo = (lo + Math.imul(al0, bl9)) | 0;
          mid = (mid + Math.imul(al0, bh9)) | 0;
          mid = (mid + Math.imul(ah0, bl9)) | 0;
          hi = (hi + Math.imul(ah0, bh9)) | 0;
          var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
          w9 &= 0x3ffffff;
          /* k = 10 */
          lo = Math.imul(al9, bl1);
          mid = Math.imul(al9, bh1);
          mid = (mid + Math.imul(ah9, bl1)) | 0;
          hi = Math.imul(ah9, bh1);
          lo = (lo + Math.imul(al8, bl2)) | 0;
          mid = (mid + Math.imul(al8, bh2)) | 0;
          mid = (mid + Math.imul(ah8, bl2)) | 0;
          hi = (hi + Math.imul(ah8, bh2)) | 0;
          lo = (lo + Math.imul(al7, bl3)) | 0;
          mid = (mid + Math.imul(al7, bh3)) | 0;
          mid = (mid + Math.imul(ah7, bl3)) | 0;
          hi = (hi + Math.imul(ah7, bh3)) | 0;
          lo = (lo + Math.imul(al6, bl4)) | 0;
          mid = (mid + Math.imul(al6, bh4)) | 0;
          mid = (mid + Math.imul(ah6, bl4)) | 0;
          hi = (hi + Math.imul(ah6, bh4)) | 0;
          lo = (lo + Math.imul(al5, bl5)) | 0;
          mid = (mid + Math.imul(al5, bh5)) | 0;
          mid = (mid + Math.imul(ah5, bl5)) | 0;
          hi = (hi + Math.imul(ah5, bh5)) | 0;
          lo = (lo + Math.imul(al4, bl6)) | 0;
          mid = (mid + Math.imul(al4, bh6)) | 0;
          mid = (mid + Math.imul(ah4, bl6)) | 0;
          hi = (hi + Math.imul(ah4, bh6)) | 0;
          lo = (lo + Math.imul(al3, bl7)) | 0;
          mid = (mid + Math.imul(al3, bh7)) | 0;
          mid = (mid + Math.imul(ah3, bl7)) | 0;
          hi = (hi + Math.imul(ah3, bh7)) | 0;
          lo = (lo + Math.imul(al2, bl8)) | 0;
          mid = (mid + Math.imul(al2, bh8)) | 0;
          mid = (mid + Math.imul(ah2, bl8)) | 0;
          hi = (hi + Math.imul(ah2, bh8)) | 0;
          lo = (lo + Math.imul(al1, bl9)) | 0;
          mid = (mid + Math.imul(al1, bh9)) | 0;
          mid = (mid + Math.imul(ah1, bl9)) | 0;
          hi = (hi + Math.imul(ah1, bh9)) | 0;
          var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
          w10 &= 0x3ffffff;
          /* k = 11 */
          lo = Math.imul(al9, bl2);
          mid = Math.imul(al9, bh2);
          mid = (mid + Math.imul(ah9, bl2)) | 0;
          hi = Math.imul(ah9, bh2);
          lo = (lo + Math.imul(al8, bl3)) | 0;
          mid = (mid + Math.imul(al8, bh3)) | 0;
          mid = (mid + Math.imul(ah8, bl3)) | 0;
          hi = (hi + Math.imul(ah8, bh3)) | 0;
          lo = (lo + Math.imul(al7, bl4)) | 0;
          mid = (mid + Math.imul(al7, bh4)) | 0;
          mid = (mid + Math.imul(ah7, bl4)) | 0;
          hi = (hi + Math.imul(ah7, bh4)) | 0;
          lo = (lo + Math.imul(al6, bl5)) | 0;
          mid = (mid + Math.imul(al6, bh5)) | 0;
          mid = (mid + Math.imul(ah6, bl5)) | 0;
          hi = (hi + Math.imul(ah6, bh5)) | 0;
          lo = (lo + Math.imul(al5, bl6)) | 0;
          mid = (mid + Math.imul(al5, bh6)) | 0;
          mid = (mid + Math.imul(ah5, bl6)) | 0;
          hi = (hi + Math.imul(ah5, bh6)) | 0;
          lo = (lo + Math.imul(al4, bl7)) | 0;
          mid = (mid + Math.imul(al4, bh7)) | 0;
          mid = (mid + Math.imul(ah4, bl7)) | 0;
          hi = (hi + Math.imul(ah4, bh7)) | 0;
          lo = (lo + Math.imul(al3, bl8)) | 0;
          mid = (mid + Math.imul(al3, bh8)) | 0;
          mid = (mid + Math.imul(ah3, bl8)) | 0;
          hi = (hi + Math.imul(ah3, bh8)) | 0;
          lo = (lo + Math.imul(al2, bl9)) | 0;
          mid = (mid + Math.imul(al2, bh9)) | 0;
          mid = (mid + Math.imul(ah2, bl9)) | 0;
          hi = (hi + Math.imul(ah2, bh9)) | 0;
          var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
          w11 &= 0x3ffffff;
          /* k = 12 */
          lo = Math.imul(al9, bl3);
          mid = Math.imul(al9, bh3);
          mid = (mid + Math.imul(ah9, bl3)) | 0;
          hi = Math.imul(ah9, bh3);
          lo = (lo + Math.imul(al8, bl4)) | 0;
          mid = (mid + Math.imul(al8, bh4)) | 0;
          mid = (mid + Math.imul(ah8, bl4)) | 0;
          hi = (hi + Math.imul(ah8, bh4)) | 0;
          lo = (lo + Math.imul(al7, bl5)) | 0;
          mid = (mid + Math.imul(al7, bh5)) | 0;
          mid = (mid + Math.imul(ah7, bl5)) | 0;
          hi = (hi + Math.imul(ah7, bh5)) | 0;
          lo = (lo + Math.imul(al6, bl6)) | 0;
          mid = (mid + Math.imul(al6, bh6)) | 0;
          mid = (mid + Math.imul(ah6, bl6)) | 0;
          hi = (hi + Math.imul(ah6, bh6)) | 0;
          lo = (lo + Math.imul(al5, bl7)) | 0;
          mid = (mid + Math.imul(al5, bh7)) | 0;
          mid = (mid + Math.imul(ah5, bl7)) | 0;
          hi = (hi + Math.imul(ah5, bh7)) | 0;
          lo = (lo + Math.imul(al4, bl8)) | 0;
          mid = (mid + Math.imul(al4, bh8)) | 0;
          mid = (mid + Math.imul(ah4, bl8)) | 0;
          hi = (hi + Math.imul(ah4, bh8)) | 0;
          lo = (lo + Math.imul(al3, bl9)) | 0;
          mid = (mid + Math.imul(al3, bh9)) | 0;
          mid = (mid + Math.imul(ah3, bl9)) | 0;
          hi = (hi + Math.imul(ah3, bh9)) | 0;
          var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
          w12 &= 0x3ffffff;
          /* k = 13 */
          lo = Math.imul(al9, bl4);
          mid = Math.imul(al9, bh4);
          mid = (mid + Math.imul(ah9, bl4)) | 0;
          hi = Math.imul(ah9, bh4);
          lo = (lo + Math.imul(al8, bl5)) | 0;
          mid = (mid + Math.imul(al8, bh5)) | 0;
          mid = (mid + Math.imul(ah8, bl5)) | 0;
          hi = (hi + Math.imul(ah8, bh5)) | 0;
          lo = (lo + Math.imul(al7, bl6)) | 0;
          mid = (mid + Math.imul(al7, bh6)) | 0;
          mid = (mid + Math.imul(ah7, bl6)) | 0;
          hi = (hi + Math.imul(ah7, bh6)) | 0;
          lo = (lo + Math.imul(al6, bl7)) | 0;
          mid = (mid + Math.imul(al6, bh7)) | 0;
          mid = (mid + Math.imul(ah6, bl7)) | 0;
          hi = (hi + Math.imul(ah6, bh7)) | 0;
          lo = (lo + Math.imul(al5, bl8)) | 0;
          mid = (mid + Math.imul(al5, bh8)) | 0;
          mid = (mid + Math.imul(ah5, bl8)) | 0;
          hi = (hi + Math.imul(ah5, bh8)) | 0;
          lo = (lo + Math.imul(al4, bl9)) | 0;
          mid = (mid + Math.imul(al4, bh9)) | 0;
          mid = (mid + Math.imul(ah4, bl9)) | 0;
          hi = (hi + Math.imul(ah4, bh9)) | 0;
          var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
          w13 &= 0x3ffffff;
          /* k = 14 */
          lo = Math.imul(al9, bl5);
          mid = Math.imul(al9, bh5);
          mid = (mid + Math.imul(ah9, bl5)) | 0;
          hi = Math.imul(ah9, bh5);
          lo = (lo + Math.imul(al8, bl6)) | 0;
          mid = (mid + Math.imul(al8, bh6)) | 0;
          mid = (mid + Math.imul(ah8, bl6)) | 0;
          hi = (hi + Math.imul(ah8, bh6)) | 0;
          lo = (lo + Math.imul(al7, bl7)) | 0;
          mid = (mid + Math.imul(al7, bh7)) | 0;
          mid = (mid + Math.imul(ah7, bl7)) | 0;
          hi = (hi + Math.imul(ah7, bh7)) | 0;
          lo = (lo + Math.imul(al6, bl8)) | 0;
          mid = (mid + Math.imul(al6, bh8)) | 0;
          mid = (mid + Math.imul(ah6, bl8)) | 0;
          hi = (hi + Math.imul(ah6, bh8)) | 0;
          lo = (lo + Math.imul(al5, bl9)) | 0;
          mid = (mid + Math.imul(al5, bh9)) | 0;
          mid = (mid + Math.imul(ah5, bl9)) | 0;
          hi = (hi + Math.imul(ah5, bh9)) | 0;
          var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
          w14 &= 0x3ffffff;
          /* k = 15 */
          lo = Math.imul(al9, bl6);
          mid = Math.imul(al9, bh6);
          mid = (mid + Math.imul(ah9, bl6)) | 0;
          hi = Math.imul(ah9, bh6);
          lo = (lo + Math.imul(al8, bl7)) | 0;
          mid = (mid + Math.imul(al8, bh7)) | 0;
          mid = (mid + Math.imul(ah8, bl7)) | 0;
          hi = (hi + Math.imul(ah8, bh7)) | 0;
          lo = (lo + Math.imul(al7, bl8)) | 0;
          mid = (mid + Math.imul(al7, bh8)) | 0;
          mid = (mid + Math.imul(ah7, bl8)) | 0;
          hi = (hi + Math.imul(ah7, bh8)) | 0;
          lo = (lo + Math.imul(al6, bl9)) | 0;
          mid = (mid + Math.imul(al6, bh9)) | 0;
          mid = (mid + Math.imul(ah6, bl9)) | 0;
          hi = (hi + Math.imul(ah6, bh9)) | 0;
          var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
          w15 &= 0x3ffffff;
          /* k = 16 */
          lo = Math.imul(al9, bl7);
          mid = Math.imul(al9, bh7);
          mid = (mid + Math.imul(ah9, bl7)) | 0;
          hi = Math.imul(ah9, bh7);
          lo = (lo + Math.imul(al8, bl8)) | 0;
          mid = (mid + Math.imul(al8, bh8)) | 0;
          mid = (mid + Math.imul(ah8, bl8)) | 0;
          hi = (hi + Math.imul(ah8, bh8)) | 0;
          lo = (lo + Math.imul(al7, bl9)) | 0;
          mid = (mid + Math.imul(al7, bh9)) | 0;
          mid = (mid + Math.imul(ah7, bl9)) | 0;
          hi = (hi + Math.imul(ah7, bh9)) | 0;
          var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
          w16 &= 0x3ffffff;
          /* k = 17 */
          lo = Math.imul(al9, bl8);
          mid = Math.imul(al9, bh8);
          mid = (mid + Math.imul(ah9, bl8)) | 0;
          hi = Math.imul(ah9, bh8);
          lo = (lo + Math.imul(al8, bl9)) | 0;
          mid = (mid + Math.imul(al8, bh9)) | 0;
          mid = (mid + Math.imul(ah8, bl9)) | 0;
          hi = (hi + Math.imul(ah8, bh9)) | 0;
          var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
          w17 &= 0x3ffffff;
          /* k = 18 */
          lo = Math.imul(al9, bl9);
          mid = Math.imul(al9, bh9);
          mid = (mid + Math.imul(ah9, bl9)) | 0;
          hi = Math.imul(ah9, bh9);
          var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
          c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
          w18 &= 0x3ffffff;
          o[0] = w0;
          o[1] = w1;
          o[2] = w2;
          o[3] = w3;
          o[4] = w4;
          o[5] = w5;
          o[6] = w6;
          o[7] = w7;
          o[8] = w8;
          o[9] = w9;
          o[10] = w10;
          o[11] = w11;
          o[12] = w12;
          o[13] = w13;
          o[14] = w14;
          o[15] = w15;
          o[16] = w16;
          o[17] = w17;
          o[18] = w18;
          if (c !== 0) {
            o[19] = c;
            out.length++;
          }
          return out;
        };

        // Polyfill comb
        if (!Math.imul) {
          comb10MulTo = smallMulTo;
        }

        function bigMulTo (self, num, out) {
          out.negative = num.negative ^ self.negative;
          out.length = self.length + num.length;

          var carry = 0;
          var hncarry = 0;
          for (var k = 0; k < out.length - 1; k++) {
            // Sum all words with the same `i + j = k` and accumulate `ncarry`,
            // note that ncarry could be >= 0x3ffffff
            var ncarry = hncarry;
            hncarry = 0;
            var rword = carry & 0x3ffffff;
            var maxJ = Math.min(k, num.length - 1);
            for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
              var i = k - j;
              var a = self.words[i] | 0;
              var b = num.words[j] | 0;
              var r = a * b;

              var lo = r & 0x3ffffff;
              ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
              lo = (lo + rword) | 0;
              rword = lo & 0x3ffffff;
              ncarry = (ncarry + (lo >>> 26)) | 0;

              hncarry += ncarry >>> 26;
              ncarry &= 0x3ffffff;
            }
            out.words[k] = rword;
            carry = ncarry;
            ncarry = hncarry;
          }
          if (carry !== 0) {
            out.words[k] = carry;
          } else {
            out.length--;
          }

          return out._strip();
        }

        function jumboMulTo (self, num, out) {
          // Temporary disable, see https://github.com/indutny/bn.js/issues/211
          // var fftm = new FFTM();
          // return fftm.mulp(self, num, out);
          return bigMulTo(self, num, out);
        }

        BN.prototype.mulTo = function mulTo (num, out) {
          var res;
          var len = this.length + num.length;
          if (this.length === 10 && num.length === 10) {
            res = comb10MulTo(this, num, out);
          } else if (len < 63) {
            res = smallMulTo(this, num, out);
          } else if (len < 1024) {
            res = bigMulTo(this, num, out);
          } else {
            res = jumboMulTo(this, num, out);
          }

          return res;
        };

        // Cooley-Tukey algorithm for FFT
        // slightly revisited to rely on looping instead of recursion

        function FFTM (x, y) {
          this.x = x;
          this.y = y;
        }

        FFTM.prototype.makeRBT = function makeRBT (N) {
          var t = new Array(N);
          var l = BN.prototype._countBits(N) - 1;
          for (var i = 0; i < N; i++) {
            t[i] = this.revBin(i, l, N);
          }

          return t;
        };

        // Returns binary-reversed representation of `x`
        FFTM.prototype.revBin = function revBin (x, l, N) {
          if (x === 0 || x === N - 1) return x;

          var rb = 0;
          for (var i = 0; i < l; i++) {
            rb |= (x & 1) << (l - i - 1);
            x >>= 1;
          }

          return rb;
        };

        // Performs "tweedling" phase, therefore 'emulating'
        // behaviour of the recursive algorithm
        FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
          for (var i = 0; i < N; i++) {
            rtws[i] = rws[rbt[i]];
            itws[i] = iws[rbt[i]];
          }
        };

        FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
          this.permute(rbt, rws, iws, rtws, itws, N);

          for (var s = 1; s < N; s <<= 1) {
            var l = s << 1;

            var rtwdf = Math.cos(2 * Math.PI / l);
            var itwdf = Math.sin(2 * Math.PI / l);

            for (var p = 0; p < N; p += l) {
              var rtwdf_ = rtwdf;
              var itwdf_ = itwdf;

              for (var j = 0; j < s; j++) {
                var re = rtws[p + j];
                var ie = itws[p + j];

                var ro = rtws[p + j + s];
                var io = itws[p + j + s];

                var rx = rtwdf_ * ro - itwdf_ * io;

                io = rtwdf_ * io + itwdf_ * ro;
                ro = rx;

                rtws[p + j] = re + ro;
                itws[p + j] = ie + io;

                rtws[p + j + s] = re - ro;
                itws[p + j + s] = ie - io;

                /* jshint maxdepth : false */
                if (j !== l) {
                  rx = rtwdf * rtwdf_ - itwdf * itwdf_;

                  itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
                  rtwdf_ = rx;
                }
              }
            }
          }
        };

        FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
          var N = Math.max(m, n) | 1;
          var odd = N & 1;
          var i = 0;
          for (N = N / 2 | 0; N; N = N >>> 1) {
            i++;
          }

          return 1 << i + 1 + odd;
        };

        FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
          if (N <= 1) return;

          for (var i = 0; i < N / 2; i++) {
            var t = rws[i];

            rws[i] = rws[N - i - 1];
            rws[N - i - 1] = t;

            t = iws[i];

            iws[i] = -iws[N - i - 1];
            iws[N - i - 1] = -t;
          }
        };

        FFTM.prototype.normalize13b = function normalize13b (ws, N) {
          var carry = 0;
          for (var i = 0; i < N / 2; i++) {
            var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
              Math.round(ws[2 * i] / N) +
              carry;

            ws[i] = w & 0x3ffffff;

            if (w < 0x4000000) {
              carry = 0;
            } else {
              carry = w / 0x4000000 | 0;
            }
          }

          return ws;
        };

        FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
          var carry = 0;
          for (var i = 0; i < len; i++) {
            carry = carry + (ws[i] | 0);

            rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
            rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
          }

          // Pad with zeroes
          for (i = 2 * len; i < N; ++i) {
            rws[i] = 0;
          }

          assert(carry === 0);
          assert((carry & ~0x1fff) === 0);
        };

        FFTM.prototype.stub = function stub (N) {
          var ph = new Array(N);
          for (var i = 0; i < N; i++) {
            ph[i] = 0;
          }

          return ph;
        };

        FFTM.prototype.mulp = function mulp (x, y, out) {
          var N = 2 * this.guessLen13b(x.length, y.length);

          var rbt = this.makeRBT(N);

          var _ = this.stub(N);

          var rws = new Array(N);
          var rwst = new Array(N);
          var iwst = new Array(N);

          var nrws = new Array(N);
          var nrwst = new Array(N);
          var niwst = new Array(N);

          var rmws = out.words;
          rmws.length = N;

          this.convert13b(x.words, x.length, rws, N);
          this.convert13b(y.words, y.length, nrws, N);

          this.transform(rws, _, rwst, iwst, N, rbt);
          this.transform(nrws, _, nrwst, niwst, N, rbt);

          for (var i = 0; i < N; i++) {
            var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
            iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
            rwst[i] = rx;
          }

          this.conjugate(rwst, iwst, N);
          this.transform(rwst, iwst, rmws, _, N, rbt);
          this.conjugate(rmws, _, N);
          this.normalize13b(rmws, N);

          out.negative = x.negative ^ y.negative;
          out.length = x.length + y.length;
          return out._strip();
        };

        // Multiply `this` by `num`
        BN.prototype.mul = function mul (num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return this.mulTo(num, out);
        };

        // Multiply employing FFT
        BN.prototype.mulf = function mulf (num) {
          var out = new BN(null);
          out.words = new Array(this.length + num.length);
          return jumboMulTo(this, num, out);
        };

        // In-place Multiplication
        BN.prototype.imul = function imul (num) {
          return this.clone().mulTo(num, this);
        };

        BN.prototype.imuln = function imuln (num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;

          assert(typeof num === 'number');
          assert(num < 0x4000000);

          // Carry
          var carry = 0;
          for (var i = 0; i < this.length; i++) {
            var w = (this.words[i] | 0) * num;
            var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
            carry >>= 26;
            carry += (w / 0x4000000) | 0;
            // NOTE: lo is 27bit maximum
            carry += lo >>> 26;
            this.words[i] = lo & 0x3ffffff;
          }

          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }

          return isNegNum ? this.ineg() : this;
        };

        BN.prototype.muln = function muln (num) {
          return this.clone().imuln(num);
        };

        // `this` * `this`
        BN.prototype.sqr = function sqr () {
          return this.mul(this);
        };

        // `this` * `this` in-place
        BN.prototype.isqr = function isqr () {
          return this.imul(this.clone());
        };

        // Math.pow(`this`, `num`)
        BN.prototype.pow = function pow (num) {
          var w = toBitArray(num);
          if (w.length === 0) return new BN(1);

          // Skip leading zeroes
          var res = this;
          for (var i = 0; i < w.length; i++, res = res.sqr()) {
            if (w[i] !== 0) break;
          }

          if (++i < w.length) {
            for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
              if (w[i] === 0) continue;

              res = res.mul(q);
            }
          }

          return res;
        };

        // Shift-left in-place
        BN.prototype.iushln = function iushln (bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;
          var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
          var i;

          if (r !== 0) {
            var carry = 0;

            for (i = 0; i < this.length; i++) {
              var newCarry = this.words[i] & carryMask;
              var c = ((this.words[i] | 0) - newCarry) << r;
              this.words[i] = c | carry;
              carry = newCarry >>> (26 - r);
            }

            if (carry) {
              this.words[i] = carry;
              this.length++;
            }
          }

          if (s !== 0) {
            for (i = this.length - 1; i >= 0; i--) {
              this.words[i + s] = this.words[i];
            }

            for (i = 0; i < s; i++) {
              this.words[i] = 0;
            }

            this.length += s;
          }

          return this._strip();
        };

        BN.prototype.ishln = function ishln (bits) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushln(bits);
        };

        // Shift-right in-place
        // NOTE: `hint` is a lowest bit before trailing zeroes
        // NOTE: if `extended` is present - it will be filled with destroyed bits
        BN.prototype.iushrn = function iushrn (bits, hint, extended) {
          assert(typeof bits === 'number' && bits >= 0);
          var h;
          if (hint) {
            h = (hint - (hint % 26)) / 26;
          } else {
            h = 0;
          }

          var r = bits % 26;
          var s = Math.min((bits - r) / 26, this.length);
          var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
          var maskedWords = extended;

          h -= s;
          h = Math.max(0, h);

          // Extended mode, copy masked part
          if (maskedWords) {
            for (var i = 0; i < s; i++) {
              maskedWords.words[i] = this.words[i];
            }
            maskedWords.length = s;
          }

          if (s === 0) {
            // No-op, we should not move anything at all
          } else if (this.length > s) {
            this.length -= s;
            for (i = 0; i < this.length; i++) {
              this.words[i] = this.words[i + s];
            }
          } else {
            this.words[0] = 0;
            this.length = 1;
          }

          var carry = 0;
          for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
            var word = this.words[i] | 0;
            this.words[i] = (carry << (26 - r)) | (word >>> r);
            carry = word & mask;
          }

          // Push carried bits as a mask
          if (maskedWords && carry !== 0) {
            maskedWords.words[maskedWords.length++] = carry;
          }

          if (this.length === 0) {
            this.words[0] = 0;
            this.length = 1;
          }

          return this._strip();
        };

        BN.prototype.ishrn = function ishrn (bits, hint, extended) {
          // TODO(indutny): implement me
          assert(this.negative === 0);
          return this.iushrn(bits, hint, extended);
        };

        // Shift-left
        BN.prototype.shln = function shln (bits) {
          return this.clone().ishln(bits);
        };

        BN.prototype.ushln = function ushln (bits) {
          return this.clone().iushln(bits);
        };

        // Shift-right
        BN.prototype.shrn = function shrn (bits) {
          return this.clone().ishrn(bits);
        };

        BN.prototype.ushrn = function ushrn (bits) {
          return this.clone().iushrn(bits);
        };

        // Test if n bit is set
        BN.prototype.testn = function testn (bit) {
          assert(typeof bit === 'number' && bit >= 0);
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) return false;

          // Check bit and return
          var w = this.words[s];

          return !!(w & q);
        };

        // Return only lowers bits of number (in-place)
        BN.prototype.imaskn = function imaskn (bits) {
          assert(typeof bits === 'number' && bits >= 0);
          var r = bits % 26;
          var s = (bits - r) / 26;

          assert(this.negative === 0, 'imaskn works only with positive numbers');

          if (this.length <= s) {
            return this;
          }

          if (r !== 0) {
            s++;
          }
          this.length = Math.min(s, this.length);

          if (r !== 0) {
            var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
            this.words[this.length - 1] &= mask;
          }

          return this._strip();
        };

        // Return only lowers bits of number
        BN.prototype.maskn = function maskn (bits) {
          return this.clone().imaskn(bits);
        };

        // Add plain number `num` to `this`
        BN.prototype.iaddn = function iaddn (num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.isubn(-num);

          // Possible sign change
          if (this.negative !== 0) {
            if (this.length === 1 && (this.words[0] | 0) <= num) {
              this.words[0] = num - (this.words[0] | 0);
              this.negative = 0;
              return this;
            }

            this.negative = 0;
            this.isubn(num);
            this.negative = 1;
            return this;
          }

          // Add without checks
          return this._iaddn(num);
        };

        BN.prototype._iaddn = function _iaddn (num) {
          this.words[0] += num;

          // Carry
          for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
            this.words[i] -= 0x4000000;
            if (i === this.length - 1) {
              this.words[i + 1] = 1;
            } else {
              this.words[i + 1]++;
            }
          }
          this.length = Math.max(this.length, i + 1);

          return this;
        };

        // Subtract plain number `num` from `this`
        BN.prototype.isubn = function isubn (num) {
          assert(typeof num === 'number');
          assert(num < 0x4000000);
          if (num < 0) return this.iaddn(-num);

          if (this.negative !== 0) {
            this.negative = 0;
            this.iaddn(num);
            this.negative = 1;
            return this;
          }

          this.words[0] -= num;

          if (this.length === 1 && this.words[0] < 0) {
            this.words[0] = -this.words[0];
            this.negative = 1;
          } else {
            // Carry
            for (var i = 0; i < this.length && this.words[i] < 0; i++) {
              this.words[i] += 0x4000000;
              this.words[i + 1] -= 1;
            }
          }

          return this._strip();
        };

        BN.prototype.addn = function addn (num) {
          return this.clone().iaddn(num);
        };

        BN.prototype.subn = function subn (num) {
          return this.clone().isubn(num);
        };

        BN.prototype.iabs = function iabs () {
          this.negative = 0;

          return this;
        };

        BN.prototype.abs = function abs () {
          return this.clone().iabs();
        };

        BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
          var len = num.length + shift;
          var i;

          this._expand(len);

          var w;
          var carry = 0;
          for (i = 0; i < num.length; i++) {
            w = (this.words[i + shift] | 0) + carry;
            var right = (num.words[i] | 0) * mul;
            w -= right & 0x3ffffff;
            carry = (w >> 26) - ((right / 0x4000000) | 0);
            this.words[i + shift] = w & 0x3ffffff;
          }
          for (; i < this.length - shift; i++) {
            w = (this.words[i + shift] | 0) + carry;
            carry = w >> 26;
            this.words[i + shift] = w & 0x3ffffff;
          }

          if (carry === 0) return this._strip();

          // Subtraction overflow
          assert(carry === -1);
          carry = 0;
          for (i = 0; i < this.length; i++) {
            w = -(this.words[i] | 0) + carry;
            carry = w >> 26;
            this.words[i] = w & 0x3ffffff;
          }
          this.negative = 1;

          return this._strip();
        };

        BN.prototype._wordDiv = function _wordDiv (num, mode) {
          var shift = this.length - num.length;

          var a = this.clone();
          var b = num;

          // Normalize
          var bhi = b.words[b.length - 1] | 0;
          var bhiBits = this._countBits(bhi);
          shift = 26 - bhiBits;
          if (shift !== 0) {
            b = b.ushln(shift);
            a.iushln(shift);
            bhi = b.words[b.length - 1] | 0;
          }

          // Initialize quotient
          var m = a.length - b.length;
          var q;

          if (mode !== 'mod') {
            q = new BN(null);
            q.length = m + 1;
            q.words = new Array(q.length);
            for (var i = 0; i < q.length; i++) {
              q.words[i] = 0;
            }
          }

          var diff = a.clone()._ishlnsubmul(b, 1, m);
          if (diff.negative === 0) {
            a = diff;
            if (q) {
              q.words[m] = 1;
            }
          }

          for (var j = m - 1; j >= 0; j--) {
            var qj = (a.words[b.length + j] | 0) * 0x4000000 +
              (a.words[b.length + j - 1] | 0);

            // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
            // (0x7ffffff)
            qj = Math.min((qj / bhi) | 0, 0x3ffffff);

            a._ishlnsubmul(b, qj, j);
            while (a.negative !== 0) {
              qj--;
              a.negative = 0;
              a._ishlnsubmul(b, 1, j);
              if (!a.isZero()) {
                a.negative ^= 1;
              }
            }
            if (q) {
              q.words[j] = qj;
            }
          }
          if (q) {
            q._strip();
          }
          a._strip();

          // Denormalize
          if (mode !== 'div' && shift !== 0) {
            a.iushrn(shift);
          }

          return {
            div: q || null,
            mod: a
          };
        };

        // NOTE: 1) `mode` can be set to `mod` to request mod only,
        //       to `div` to request div only, or be absent to
        //       request both div & mod
        //       2) `positive` is true if unsigned mod is requested
        BN.prototype.divmod = function divmod (num, mode, positive) {
          assert(!num.isZero());

          if (this.isZero()) {
            return {
              div: new BN(0),
              mod: new BN(0)
            };
          }

          var div, mod, res;
          if (this.negative !== 0 && num.negative === 0) {
            res = this.neg().divmod(num, mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.iadd(num);
              }
            }

            return {
              div: div,
              mod: mod
            };
          }

          if (this.negative === 0 && num.negative !== 0) {
            res = this.divmod(num.neg(), mode);

            if (mode !== 'mod') {
              div = res.div.neg();
            }

            return {
              div: div,
              mod: res.mod
            };
          }

          if ((this.negative & num.negative) !== 0) {
            res = this.neg().divmod(num.neg(), mode);

            if (mode !== 'div') {
              mod = res.mod.neg();
              if (positive && mod.negative !== 0) {
                mod.isub(num);
              }
            }

            return {
              div: res.div,
              mod: mod
            };
          }

          // Both numbers are positive at this point

          // Strip both numbers to approximate shift value
          if (num.length > this.length || this.cmp(num) < 0) {
            return {
              div: new BN(0),
              mod: this
            };
          }

          // Very short reduction
          if (num.length === 1) {
            if (mode === 'div') {
              return {
                div: this.divn(num.words[0]),
                mod: null
              };
            }

            if (mode === 'mod') {
              return {
                div: null,
                mod: new BN(this.modrn(num.words[0]))
              };
            }

            return {
              div: this.divn(num.words[0]),
              mod: new BN(this.modrn(num.words[0]))
            };
          }

          return this._wordDiv(num, mode);
        };

        // Find `this` / `num`
        BN.prototype.div = function div (num) {
          return this.divmod(num, 'div', false).div;
        };

        // Find `this` % `num`
        BN.prototype.mod = function mod (num) {
          return this.divmod(num, 'mod', false).mod;
        };

        BN.prototype.umod = function umod (num) {
          return this.divmod(num, 'mod', true).mod;
        };

        // Find Round(`this` / `num`)
        BN.prototype.divRound = function divRound (num) {
          var dm = this.divmod(num);

          // Fast case - exact division
          if (dm.mod.isZero()) return dm.div;

          var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

          var half = num.ushrn(1);
          var r2 = num.andln(1);
          var cmp = mod.cmp(half);

          // Round down
          if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

          // Round up
          return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
        };

        BN.prototype.modrn = function modrn (num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;

          assert(num <= 0x3ffffff);
          var p = (1 << 26) % num;

          var acc = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            acc = (p * acc + (this.words[i] | 0)) % num;
          }

          return isNegNum ? -acc : acc;
        };

        // WARNING: DEPRECATED
        BN.prototype.modn = function modn (num) {
          return this.modrn(num);
        };

        // In-place division by number
        BN.prototype.idivn = function idivn (num) {
          var isNegNum = num < 0;
          if (isNegNum) num = -num;

          assert(num <= 0x3ffffff);

          var carry = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var w = (this.words[i] | 0) + carry * 0x4000000;
            this.words[i] = (w / num) | 0;
            carry = w % num;
          }

          this._strip();
          return isNegNum ? this.ineg() : this;
        };

        BN.prototype.divn = function divn (num) {
          return this.clone().idivn(num);
        };

        BN.prototype.egcd = function egcd (p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var x = this;
          var y = p.clone();

          if (x.negative !== 0) {
            x = x.umod(p);
          } else {
            x = x.clone();
          }

          // A * x + B * y = x
          var A = new BN(1);
          var B = new BN(0);

          // C * x + D * y = y
          var C = new BN(0);
          var D = new BN(1);

          var g = 0;

          while (x.isEven() && y.isEven()) {
            x.iushrn(1);
            y.iushrn(1);
            ++g;
          }

          var yp = y.clone();
          var xp = x.clone();

          while (!x.isZero()) {
            for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
              x.iushrn(i);
              while (i-- > 0) {
                if (A.isOdd() || B.isOdd()) {
                  A.iadd(yp);
                  B.isub(xp);
                }

                A.iushrn(1);
                B.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
              y.iushrn(j);
              while (j-- > 0) {
                if (C.isOdd() || D.isOdd()) {
                  C.iadd(yp);
                  D.isub(xp);
                }

                C.iushrn(1);
                D.iushrn(1);
              }
            }

            if (x.cmp(y) >= 0) {
              x.isub(y);
              A.isub(C);
              B.isub(D);
            } else {
              y.isub(x);
              C.isub(A);
              D.isub(B);
            }
          }

          return {
            a: C,
            b: D,
            gcd: y.iushln(g)
          };
        };

        // This is reduced incarnation of the binary EEA
        // above, designated to invert members of the
        // _prime_ fields F(p) at a maximal speed
        BN.prototype._invmp = function _invmp (p) {
          assert(p.negative === 0);
          assert(!p.isZero());

          var a = this;
          var b = p.clone();

          if (a.negative !== 0) {
            a = a.umod(p);
          } else {
            a = a.clone();
          }

          var x1 = new BN(1);
          var x2 = new BN(0);

          var delta = b.clone();

          while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
            for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
            if (i > 0) {
              a.iushrn(i);
              while (i-- > 0) {
                if (x1.isOdd()) {
                  x1.iadd(delta);
                }

                x1.iushrn(1);
              }
            }

            for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
            if (j > 0) {
              b.iushrn(j);
              while (j-- > 0) {
                if (x2.isOdd()) {
                  x2.iadd(delta);
                }

                x2.iushrn(1);
              }
            }

            if (a.cmp(b) >= 0) {
              a.isub(b);
              x1.isub(x2);
            } else {
              b.isub(a);
              x2.isub(x1);
            }
          }

          var res;
          if (a.cmpn(1) === 0) {
            res = x1;
          } else {
            res = x2;
          }

          if (res.cmpn(0) < 0) {
            res.iadd(p);
          }

          return res;
        };

        BN.prototype.gcd = function gcd (num) {
          if (this.isZero()) return num.abs();
          if (num.isZero()) return this.abs();

          var a = this.clone();
          var b = num.clone();
          a.negative = 0;
          b.negative = 0;

          // Remove common factor of two
          for (var shift = 0; a.isEven() && b.isEven(); shift++) {
            a.iushrn(1);
            b.iushrn(1);
          }

          do {
            while (a.isEven()) {
              a.iushrn(1);
            }
            while (b.isEven()) {
              b.iushrn(1);
            }

            var r = a.cmp(b);
            if (r < 0) {
              // Swap `a` and `b` to make `a` always bigger than `b`
              var t = a;
              a = b;
              b = t;
            } else if (r === 0 || b.cmpn(1) === 0) {
              break;
            }

            a.isub(b);
          } while (true);

          return b.iushln(shift);
        };

        // Invert number in the field F(num)
        BN.prototype.invm = function invm (num) {
          return this.egcd(num).a.umod(num);
        };

        BN.prototype.isEven = function isEven () {
          return (this.words[0] & 1) === 0;
        };

        BN.prototype.isOdd = function isOdd () {
          return (this.words[0] & 1) === 1;
        };

        // And first word and num
        BN.prototype.andln = function andln (num) {
          return this.words[0] & num;
        };

        // Increment at the bit position in-line
        BN.prototype.bincn = function bincn (bit) {
          assert(typeof bit === 'number');
          var r = bit % 26;
          var s = (bit - r) / 26;
          var q = 1 << r;

          // Fast case: bit is much higher than all existing words
          if (this.length <= s) {
            this._expand(s + 1);
            this.words[s] |= q;
            return this;
          }

          // Add bit and propagate, if needed
          var carry = q;
          for (var i = s; carry !== 0 && i < this.length; i++) {
            var w = this.words[i] | 0;
            w += carry;
            carry = w >>> 26;
            w &= 0x3ffffff;
            this.words[i] = w;
          }
          if (carry !== 0) {
            this.words[i] = carry;
            this.length++;
          }
          return this;
        };

        BN.prototype.isZero = function isZero () {
          return this.length === 1 && this.words[0] === 0;
        };

        BN.prototype.cmpn = function cmpn (num) {
          var negative = num < 0;

          if (this.negative !== 0 && !negative) return -1;
          if (this.negative === 0 && negative) return 1;

          this._strip();

          var res;
          if (this.length > 1) {
            res = 1;
          } else {
            if (negative) {
              num = -num;
            }

            assert(num <= 0x3ffffff, 'Number is too big');

            var w = this.words[0] | 0;
            res = w === num ? 0 : w < num ? -1 : 1;
          }
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Compare two numbers and return:
        // 1 - if `this` > `num`
        // 0 - if `this` == `num`
        // -1 - if `this` < `num`
        BN.prototype.cmp = function cmp (num) {
          if (this.negative !== 0 && num.negative === 0) return -1;
          if (this.negative === 0 && num.negative !== 0) return 1;

          var res = this.ucmp(num);
          if (this.negative !== 0) return -res | 0;
          return res;
        };

        // Unsigned comparison
        BN.prototype.ucmp = function ucmp (num) {
          // At this point both numbers have the same sign
          if (this.length > num.length) return 1;
          if (this.length < num.length) return -1;

          var res = 0;
          for (var i = this.length - 1; i >= 0; i--) {
            var a = this.words[i] | 0;
            var b = num.words[i] | 0;

            if (a === b) continue;
            if (a < b) {
              res = -1;
            } else if (a > b) {
              res = 1;
            }
            break;
          }
          return res;
        };

        BN.prototype.gtn = function gtn (num) {
          return this.cmpn(num) === 1;
        };

        BN.prototype.gt = function gt (num) {
          return this.cmp(num) === 1;
        };

        BN.prototype.gten = function gten (num) {
          return this.cmpn(num) >= 0;
        };

        BN.prototype.gte = function gte (num) {
          return this.cmp(num) >= 0;
        };

        BN.prototype.ltn = function ltn (num) {
          return this.cmpn(num) === -1;
        };

        BN.prototype.lt = function lt (num) {
          return this.cmp(num) === -1;
        };

        BN.prototype.lten = function lten (num) {
          return this.cmpn(num) <= 0;
        };

        BN.prototype.lte = function lte (num) {
          return this.cmp(num) <= 0;
        };

        BN.prototype.eqn = function eqn (num) {
          return this.cmpn(num) === 0;
        };

        BN.prototype.eq = function eq (num) {
          return this.cmp(num) === 0;
        };

        //
        // A reduce context, could be using montgomery or something better, depending
        // on the `m` itself.
        //
        BN.red = function red (num) {
          return new Red(num);
        };

        BN.prototype.toRed = function toRed (ctx) {
          assert(!this.red, 'Already a number in reduction context');
          assert(this.negative === 0, 'red works only with positives');
          return ctx.convertTo(this)._forceRed(ctx);
        };

        BN.prototype.fromRed = function fromRed () {
          assert(this.red, 'fromRed works only with numbers in reduction context');
          return this.red.convertFrom(this);
        };

        BN.prototype._forceRed = function _forceRed (ctx) {
          this.red = ctx;
          return this;
        };

        BN.prototype.forceRed = function forceRed (ctx) {
          assert(!this.red, 'Already a number in reduction context');
          return this._forceRed(ctx);
        };

        BN.prototype.redAdd = function redAdd (num) {
          assert(this.red, 'redAdd works only with red numbers');
          return this.red.add(this, num);
        };

        BN.prototype.redIAdd = function redIAdd (num) {
          assert(this.red, 'redIAdd works only with red numbers');
          return this.red.iadd(this, num);
        };

        BN.prototype.redSub = function redSub (num) {
          assert(this.red, 'redSub works only with red numbers');
          return this.red.sub(this, num);
        };

        BN.prototype.redISub = function redISub (num) {
          assert(this.red, 'redISub works only with red numbers');
          return this.red.isub(this, num);
        };

        BN.prototype.redShl = function redShl (num) {
          assert(this.red, 'redShl works only with red numbers');
          return this.red.shl(this, num);
        };

        BN.prototype.redMul = function redMul (num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.mul(this, num);
        };

        BN.prototype.redIMul = function redIMul (num) {
          assert(this.red, 'redMul works only with red numbers');
          this.red._verify2(this, num);
          return this.red.imul(this, num);
        };

        BN.prototype.redSqr = function redSqr () {
          assert(this.red, 'redSqr works only with red numbers');
          this.red._verify1(this);
          return this.red.sqr(this);
        };

        BN.prototype.redISqr = function redISqr () {
          assert(this.red, 'redISqr works only with red numbers');
          this.red._verify1(this);
          return this.red.isqr(this);
        };

        // Square root over p
        BN.prototype.redSqrt = function redSqrt () {
          assert(this.red, 'redSqrt works only with red numbers');
          this.red._verify1(this);
          return this.red.sqrt(this);
        };

        BN.prototype.redInvm = function redInvm () {
          assert(this.red, 'redInvm works only with red numbers');
          this.red._verify1(this);
          return this.red.invm(this);
        };

        // Return negative clone of `this` % `red modulo`
        BN.prototype.redNeg = function redNeg () {
          assert(this.red, 'redNeg works only with red numbers');
          this.red._verify1(this);
          return this.red.neg(this);
        };

        BN.prototype.redPow = function redPow (num) {
          assert(this.red && !num.red, 'redPow(normalNum)');
          this.red._verify1(this);
          return this.red.pow(this, num);
        };

        // Prime numbers with efficient reduction
        var primes = {
          k256: null,
          p224: null,
          p192: null,
          p25519: null
        };

        // Pseudo-Mersenne prime
        function MPrime (name, p) {
          // P = 2 ^ N - K
          this.name = name;
          this.p = new BN(p, 16);
          this.n = this.p.bitLength();
          this.k = new BN(1).iushln(this.n).isub(this.p);

          this.tmp = this._tmp();
        }

        MPrime.prototype._tmp = function _tmp () {
          var tmp = new BN(null);
          tmp.words = new Array(Math.ceil(this.n / 13));
          return tmp;
        };

        MPrime.prototype.ireduce = function ireduce (num) {
          // Assumes that `num` is less than `P^2`
          // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
          var r = num;
          var rlen;

          do {
            this.split(r, this.tmp);
            r = this.imulK(r);
            r = r.iadd(this.tmp);
            rlen = r.bitLength();
          } while (rlen > this.n);

          var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
          if (cmp === 0) {
            r.words[0] = 0;
            r.length = 1;
          } else if (cmp > 0) {
            r.isub(this.p);
          } else {
            if (r.strip !== undefined) {
              // r is a BN v4 instance
              r.strip();
            } else {
              // r is a BN v5 instance
              r._strip();
            }
          }

          return r;
        };

        MPrime.prototype.split = function split (input, out) {
          input.iushrn(this.n, 0, out);
        };

        MPrime.prototype.imulK = function imulK (num) {
          return num.imul(this.k);
        };

        function K256 () {
          MPrime.call(
            this,
            'k256',
            'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
        }
        inherits(K256, MPrime);

        K256.prototype.split = function split (input, output) {
          // 256 = 9 * 26 + 22
          var mask = 0x3fffff;

          var outLen = Math.min(input.length, 9);
          for (var i = 0; i < outLen; i++) {
            output.words[i] = input.words[i];
          }
          output.length = outLen;

          if (input.length <= 9) {
            input.words[0] = 0;
            input.length = 1;
            return;
          }

          // Shift by 9 limbs
          var prev = input.words[9];
          output.words[output.length++] = prev & mask;

          for (i = 10; i < input.length; i++) {
            var next = input.words[i] | 0;
            input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
            prev = next;
          }
          prev >>>= 22;
          input.words[i - 10] = prev;
          if (prev === 0 && input.length > 10) {
            input.length -= 10;
          } else {
            input.length -= 9;
          }
        };

        K256.prototype.imulK = function imulK (num) {
          // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
          num.words[num.length] = 0;
          num.words[num.length + 1] = 0;
          num.length += 2;

          // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
          var lo = 0;
          for (var i = 0; i < num.length; i++) {
            var w = num.words[i] | 0;
            lo += w * 0x3d1;
            num.words[i] = lo & 0x3ffffff;
            lo = w * 0x40 + ((lo / 0x4000000) | 0);
          }

          // Fast length reduction
          if (num.words[num.length - 1] === 0) {
            num.length--;
            if (num.words[num.length - 1] === 0) {
              num.length--;
            }
          }
          return num;
        };

        function P224 () {
          MPrime.call(
            this,
            'p224',
            'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
        }
        inherits(P224, MPrime);

        function P192 () {
          MPrime.call(
            this,
            'p192',
            'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
        }
        inherits(P192, MPrime);

        function P25519 () {
          // 2 ^ 255 - 19
          MPrime.call(
            this,
            '25519',
            '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
        }
        inherits(P25519, MPrime);

        P25519.prototype.imulK = function imulK (num) {
          // K = 0x13
          var carry = 0;
          for (var i = 0; i < num.length; i++) {
            var hi = (num.words[i] | 0) * 0x13 + carry;
            var lo = hi & 0x3ffffff;
            hi >>>= 26;

            num.words[i] = lo;
            carry = hi;
          }
          if (carry !== 0) {
            num.words[num.length++] = carry;
          }
          return num;
        };

        // Exported mostly for testing purposes, use plain name instead
        BN._prime = function prime (name) {
          // Cached version of prime
          if (primes[name]) return primes[name];

          var prime;
          if (name === 'k256') {
            prime = new K256();
          } else if (name === 'p224') {
            prime = new P224();
          } else if (name === 'p192') {
            prime = new P192();
          } else if (name === 'p25519') {
            prime = new P25519();
          } else {
            throw new Error('Unknown prime ' + name);
          }
          primes[name] = prime;

          return prime;
        };

        //
        // Base reduction engine
        //
        function Red (m) {
          if (typeof m === 'string') {
            var prime = BN._prime(m);
            this.m = prime.p;
            this.prime = prime;
          } else {
            assert(m.gtn(1), 'modulus must be greater than 1');
            this.m = m;
            this.prime = null;
          }
        }

        Red.prototype._verify1 = function _verify1 (a) {
          assert(a.negative === 0, 'red works only with positives');
          assert(a.red, 'red works only with red numbers');
        };

        Red.prototype._verify2 = function _verify2 (a, b) {
          assert((a.negative | b.negative) === 0, 'red works only with positives');
          assert(a.red && a.red === b.red,
            'red works only with red numbers');
        };

        Red.prototype.imod = function imod (a) {
          if (this.prime) return this.prime.ireduce(a)._forceRed(this);

          move(a, a.umod(this.m)._forceRed(this));
          return a;
        };

        Red.prototype.neg = function neg (a) {
          if (a.isZero()) {
            return a.clone();
          }

          return this.m.sub(a)._forceRed(this);
        };

        Red.prototype.add = function add (a, b) {
          this._verify2(a, b);

          var res = a.add(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.iadd = function iadd (a, b) {
          this._verify2(a, b);

          var res = a.iadd(b);
          if (res.cmp(this.m) >= 0) {
            res.isub(this.m);
          }
          return res;
        };

        Red.prototype.sub = function sub (a, b) {
          this._verify2(a, b);

          var res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res._forceRed(this);
        };

        Red.prototype.isub = function isub (a, b) {
          this._verify2(a, b);

          var res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        };

        Red.prototype.shl = function shl (a, num) {
          this._verify1(a);
          return this.imod(a.ushln(num));
        };

        Red.prototype.imul = function imul (a, b) {
          this._verify2(a, b);
          return this.imod(a.imul(b));
        };

        Red.prototype.mul = function mul (a, b) {
          this._verify2(a, b);
          return this.imod(a.mul(b));
        };

        Red.prototype.isqr = function isqr (a) {
          return this.imul(a, a.clone());
        };

        Red.prototype.sqr = function sqr (a) {
          return this.mul(a, a);
        };

        Red.prototype.sqrt = function sqrt (a) {
          if (a.isZero()) return a.clone();

          var mod3 = this.m.andln(3);
          assert(mod3 % 2 === 1);

          // Fast case
          if (mod3 === 3) {
            var pow = this.m.add(new BN(1)).iushrn(2);
            return this.pow(a, pow);
          }

          // Tonelli-Shanks algorithm (Totally unoptimized and slow)
          //
          // Find Q and S, that Q * 2 ^ S = (P - 1)
          var q = this.m.subn(1);
          var s = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s++;
            q.iushrn(1);
          }
          assert(!q.isZero());

          var one = new BN(1).toRed(this);
          var nOne = one.redNeg();

          // Find quadratic non-residue
          // NOTE: Max is such because of generalized Riemann hypothesis.
          var lpow = this.m.subn(1).iushrn(1);
          var z = this.m.bitLength();
          z = new BN(2 * z * z).toRed(this);

          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }

          var c = this.pow(z, q);
          var r = this.pow(a, q.addn(1).iushrn(1));
          var t = this.pow(a, q);
          var m = s;
          while (t.cmp(one) !== 0) {
            var tmp = t;
            for (var i = 0; tmp.cmp(one) !== 0; i++) {
              tmp = tmp.redSqr();
            }
            assert(i < m);
            var b = this.pow(c, new BN(1).iushln(m - i - 1));

            r = r.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }

          return r;
        };

        Red.prototype.invm = function invm (a) {
          var inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        };

        Red.prototype.pow = function pow (a, num) {
          if (num.isZero()) return new BN(1).toRed(this);
          if (num.cmpn(1) === 0) return a.clone();

          var windowSize = 4;
          var wnd = new Array(1 << windowSize);
          wnd[0] = new BN(1).toRed(this);
          wnd[1] = a;
          for (var i = 2; i < wnd.length; i++) {
            wnd[i] = this.mul(wnd[i - 1], a);
          }

          var res = wnd[0];
          var current = 0;
          var currentLen = 0;
          var start = num.bitLength() % 26;
          if (start === 0) {
            start = 26;
          }

          for (i = num.length - 1; i >= 0; i--) {
            var word = num.words[i];
            for (var j = start - 1; j >= 0; j--) {
              var bit = (word >> j) & 1;
              if (res !== wnd[0]) {
                res = this.sqr(res);
              }

              if (bit === 0 && current === 0) {
                currentLen = 0;
                continue;
              }

              current <<= 1;
              current |= bit;
              currentLen++;
              if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

              res = this.mul(res, wnd[current]);
              currentLen = 0;
              current = 0;
            }
            start = 26;
          }

          return res;
        };

        Red.prototype.convertTo = function convertTo (num) {
          var r = num.umod(this.m);

          return r === num ? r.clone() : r;
        };

        Red.prototype.convertFrom = function convertFrom (num) {
          var res = num.clone();
          res.red = null;
          return res;
        };

        //
        // Montgomery method engine
        //

        BN.mont = function mont (num) {
          return new Mont(num);
        };

        function Mont (m) {
          Red.call(this, m);

          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - (this.shift % 26);
          }

          this.r = new BN(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);

          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        inherits(Mont, Red);

        Mont.prototype.convertTo = function convertTo (num) {
          return this.imod(num.ushln(this.shift));
        };

        Mont.prototype.convertFrom = function convertFrom (num) {
          var r = this.imod(num.mul(this.rinv));
          r.red = null;
          return r;
        };

        Mont.prototype.imul = function imul (a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }

          var t = a.imul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;

          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.mul = function mul (a, b) {
          if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

          var t = a.mul(b);
          var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          var u = t.isub(c).iushrn(this.shift);
          var res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }

          return res._forceRed(this);
        };

        Mont.prototype.invm = function invm (a) {
          // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
          var res = this.imod(a._invmp(this.m).mul(this.r2));
          return res._forceRed(this);
        };
      })( false || module, this);


      /***/ }),

    /***/ "../../node_modules/buffer/index.js":
    /*!******************************************!*\
  !*** ../../node_modules/buffer/index.js ***!
  \******************************************/
    /***/ ((__unused_webpack_module, exports, __webpack_require__) => {

      "use strict";
      /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
      /* eslint-disable no-proto */



      var base64 = __webpack_require__(/*! base64-js */ "../../node_modules/base64-js/index.js")
      var ieee754 = __webpack_require__(/*! ieee754 */ "../../node_modules/ieee754/index.js")
      var customInspectSymbol =
        (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
          ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
          : null

      exports.Buffer = Buffer
      exports.SlowBuffer = SlowBuffer
      exports.INSPECT_MAX_BYTES = 50

      var K_MAX_LENGTH = 0x7fffffff
      exports.kMaxLength = K_MAX_LENGTH

      /**
       * If `Buffer.TYPED_ARRAY_SUPPORT`:
       *   === true    Use Uint8Array implementation (fastest)
       *   === false   Print warning and recommend using `buffer` v4.x which has an Object
       *               implementation (most compatible, even IE6)
       *
       * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
       * Opera 11.6+, iOS 4.2+.
       *
       * We report that the browser does not support typed arrays if the are not subclassable
       * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
       * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
       * for __proto__ and has a buggy typed array implementation.
       */
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
        typeof console.error === 'function') {
        console.error(
          'This browser lacks typed array (Uint8Array) support which is required by ' +
          '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
        )
      }

      function typedArraySupport () {
        // Can typed array instances can be augmented?
        try {
          var arr = new Uint8Array(1)
          var proto = { foo: function () { return 42 } }
          Object.setPrototypeOf(proto, Uint8Array.prototype)
          Object.setPrototypeOf(arr, proto)
          return arr.foo() === 42
        } catch (e) {
          return false
        }
      }

      Object.defineProperty(Buffer.prototype, 'parent', {
        enumerable: true,
        get: function () {
          if (!Buffer.isBuffer(this)) return undefined
          return this.buffer
        }
      })

      Object.defineProperty(Buffer.prototype, 'offset', {
        enumerable: true,
        get: function () {
          if (!Buffer.isBuffer(this)) return undefined
          return this.byteOffset
        }
      })

      function createBuffer (length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"')
        }
        // Return an augmented `Uint8Array` instance
        var buf = new Uint8Array(length)
        Object.setPrototypeOf(buf, Buffer.prototype)
        return buf
      }

      /**
       * The Buffer constructor returns instances of `Uint8Array` that have their
       * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
       * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
       * and the `Uint8Array` methods. Square bracket notation works as expected -- it
       * returns a single octet.
       *
       * The `Uint8Array` prototype remains unmodified.
       */

      function Buffer (arg, encodingOrOffset, length) {
        // Common case.
        if (typeof arg === 'number') {
          if (typeof encodingOrOffset === 'string') {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            )
          }
          return allocUnsafe(arg)
        }
        return from(arg, encodingOrOffset, length)
      }

      Buffer.poolSize = 8192 // not used by this implementation

      function from (value, encodingOrOffset, length) {
        if (typeof value === 'string') {
          return fromString(value, encodingOrOffset)
        }

        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value)
        }

        if (value == null) {
          throw new TypeError(
            'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
            'or Array-like Object. Received type ' + (typeof value)
          )
        }

        if (isInstance(value, ArrayBuffer) ||
          (value && isInstance(value.buffer, ArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length)
        }

        if (typeof SharedArrayBuffer !== 'undefined' &&
          (isInstance(value, SharedArrayBuffer) ||
            (value && isInstance(value.buffer, SharedArrayBuffer)))) {
          return fromArrayBuffer(value, encodingOrOffset, length)
        }

        if (typeof value === 'number') {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          )
        }

        var valueOf = value.valueOf && value.valueOf()
        if (valueOf != null && valueOf !== value) {
          return Buffer.from(valueOf, encodingOrOffset, length)
        }

        var b = fromObject(value)
        if (b) return b

        if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
          typeof value[Symbol.toPrimitive] === 'function') {
          return Buffer.from(
            value[Symbol.toPrimitive]('string'), encodingOrOffset, length
          )
        }

        throw new TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
          'or Array-like Object. Received type ' + (typeof value)
        )
      }

      /**
       * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
       * if value is a number.
       * Buffer.from(str[, encoding])
       * Buffer.from(array)
       * Buffer.from(buffer)
       * Buffer.from(arrayBuffer[, byteOffset[, length]])
       **/
      Buffer.from = function (value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length)
      }

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
      Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
      Object.setPrototypeOf(Buffer, Uint8Array)

      function assertSize (size) {
        if (typeof size !== 'number') {
          throw new TypeError('"size" argument must be of type number')
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"')
        }
      }

      function alloc (size, fill, encoding) {
        assertSize(size)
        if (size <= 0) {
          return createBuffer(size)
        }
        if (fill !== undefined) {
          // Only pay attention to encoding if it's a string. This
          // prevents accidentally sending in a number that would
          // be interpreted as a start offset.
          return typeof encoding === 'string'
            ? createBuffer(size).fill(fill, encoding)
            : createBuffer(size).fill(fill)
        }
        return createBuffer(size)
      }

      /**
       * Creates a new filled Buffer instance.
       * alloc(size[, fill[, encoding]])
       **/
      Buffer.alloc = function (size, fill, encoding) {
        return alloc(size, fill, encoding)
      }

      function allocUnsafe (size) {
        assertSize(size)
        return createBuffer(size < 0 ? 0 : checked(size) | 0)
      }

      /**
       * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
       * */
      Buffer.allocUnsafe = function (size) {
        return allocUnsafe(size)
      }
      /**
       * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
       */
      Buffer.allocUnsafeSlow = function (size) {
        return allocUnsafe(size)
      }

      function fromString (string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') {
          encoding = 'utf8'
        }

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }

        var length = byteLength(string, encoding) | 0
        var buf = createBuffer(length)

        var actual = buf.write(string, encoding)

        if (actual !== length) {
          // Writing a hex string, for example, that contains invalid characters will
          // cause everything after the first invalid character to be ignored. (e.g.
          // 'abxxcd' will be treated as 'ab')
          buf = buf.slice(0, actual)
        }

        return buf
      }

      function fromArrayLike (array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0
        var buf = createBuffer(length)
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255
        }
        return buf
      }

      function fromArrayView (arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          var copy = new Uint8Array(arrayView)
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
        }
        return fromArrayLike(arrayView)
      }

      function fromArrayBuffer (array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds')
        }

        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds')
        }

        var buf
        if (byteOffset === undefined && length === undefined) {
          buf = new Uint8Array(array)
        } else if (length === undefined) {
          buf = new Uint8Array(array, byteOffset)
        } else {
          buf = new Uint8Array(array, byteOffset, length)
        }

        // Return an augmented `Uint8Array` instance
        Object.setPrototypeOf(buf, Buffer.prototype)

        return buf
      }

      function fromObject (obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0
          var buf = createBuffer(len)

          if (buf.length === 0) {
            return buf
          }

          obj.copy(buf, 0, 0, len)
          return buf
        }

        if (obj.length !== undefined) {
          if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
            return createBuffer(0)
          }
          return fromArrayLike(obj)
        }

        if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data)
        }
      }

      function checked (length) {
        // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
        // length is NaN (which is otherwise coerced to zero.)
        if (length >= K_MAX_LENGTH) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
            'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
        }
        return length | 0
      }

      function SlowBuffer (length) {
        if (+length != length) { // eslint-disable-line eqeqeq
          length = 0
        }
        return Buffer.alloc(+length)
      }

      Buffer.isBuffer = function isBuffer (b) {
        return b != null && b._isBuffer === true &&
          b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
      }

      Buffer.compare = function compare (a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
        if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          )
        }

        if (a === b) return 0

        var x = a.length
        var y = b.length

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i]
            y = b[i]
            break
          }
        }

        if (x < y) return -1
        if (y < x) return 1
        return 0
      }

      Buffer.isEncoding = function isEncoding (encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'latin1':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true
          default:
            return false
        }
      }

      Buffer.concat = function concat (list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }

        if (list.length === 0) {
          return Buffer.alloc(0)
        }

        var i
        if (length === undefined) {
          length = 0
          for (i = 0; i < list.length; ++i) {
            length += list[i].length
          }
        }

        var buffer = Buffer.allocUnsafe(length)
        var pos = 0
        for (i = 0; i < list.length; ++i) {
          var buf = list[i]
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              Buffer.from(buf).copy(buffer, pos)
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              )
            }
          } else if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers')
          } else {
            buf.copy(buffer, pos)
          }
          pos += buf.length
        }
        return buffer
      }

      function byteLength (string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength
        }
        if (typeof string !== 'string') {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
            'Received type ' + typeof string
          )
        }

        var len = string.length
        var mustMatch = (arguments.length > 2 && arguments[2] === true)
        if (!mustMatch && len === 0) return 0

        // Use a for loop to avoid recursion
        var loweredCase = false
        for (;;) {
          switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return len
            case 'utf8':
            case 'utf-8':
              return utf8ToBytes(string).length
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2
            case 'hex':
              return len >>> 1
            case 'base64':
              return base64ToBytes(string).length
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
              }
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }
      Buffer.byteLength = byteLength

      function slowToString (encoding, start, end) {
        var loweredCase = false

        // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
        // property of a typed array.

        // This behaves neither like String nor Uint8Array in that we set start/end
        // to their upper/lower bounds if the value passed is out of range.
        // undefined is handled specially as per ECMA-262 6th Edition,
        // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
        if (start === undefined || start < 0) {
          start = 0
        }
        // Return early if start > this.length. Done here to prevent potential uint32
        // coercion fail below.
        if (start > this.length) {
          return ''
        }

        if (end === undefined || end > this.length) {
          end = this.length
        }

        if (end <= 0) {
          return ''
        }

        // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
        end >>>= 0
        start >>>= 0

        if (end <= start) {
          return ''
        }

        if (!encoding) encoding = 'utf8'

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end)

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end)

            case 'ascii':
              return asciiSlice(this, start, end)

            case 'latin1':
            case 'binary':
              return latin1Slice(this, start, end)

            case 'base64':
              return base64Slice(this, start, end)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = (encoding + '').toLowerCase()
              loweredCase = true
          }
        }
      }

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
      Buffer.prototype._isBuffer = true

      function swap (b, n, m) {
        var i = b[n]
        b[n] = b[m]
        b[m] = i
      }

      Buffer.prototype.swap16 = function swap16 () {
        var len = this.length
        if (len % 2 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 16-bits')
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1)
        }
        return this
      }

      Buffer.prototype.swap32 = function swap32 () {
        var len = this.length
        if (len % 4 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 32-bits')
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3)
          swap(this, i + 1, i + 2)
        }
        return this
      }

      Buffer.prototype.swap64 = function swap64 () {
        var len = this.length
        if (len % 8 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 64-bits')
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7)
          swap(this, i + 1, i + 6)
          swap(this, i + 2, i + 5)
          swap(this, i + 3, i + 4)
        }
        return this
      }

      Buffer.prototype.toString = function toString () {
        var length = this.length
        if (length === 0) return ''
        if (arguments.length === 0) return utf8Slice(this, 0, length)
        return slowToString.apply(this, arguments)
      }

      Buffer.prototype.toLocaleString = Buffer.prototype.toString

      Buffer.prototype.equals = function equals (b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
        if (this === b) return true
        return Buffer.compare(this, b) === 0
      }

      Buffer.prototype.inspect = function inspect () {
        var str = ''
        var max = exports.INSPECT_MAX_BYTES
        str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
        if (this.length > max) str += ' ... '
        return '<Buffer ' + str + '>'
      }
      if (customInspectSymbol) {
        Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
      }

      Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer.from(target, target.offset, target.byteLength)
        }
        if (!Buffer.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. ' +
            'Received type ' + (typeof target)
          )
        }

        if (start === undefined) {
          start = 0
        }
        if (end === undefined) {
          end = target ? target.length : 0
        }
        if (thisStart === undefined) {
          thisStart = 0
        }
        if (thisEnd === undefined) {
          thisEnd = this.length
        }

        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError('out of range index')
        }

        if (thisStart >= thisEnd && start >= end) {
          return 0
        }
        if (thisStart >= thisEnd) {
          return -1
        }
        if (start >= end) {
          return 1
        }

        start >>>= 0
        end >>>= 0
        thisStart >>>= 0
        thisEnd >>>= 0

        if (this === target) return 0

        var x = thisEnd - thisStart
        var y = end - start
        var len = Math.min(x, y)

        var thisCopy = this.slice(thisStart, thisEnd)
        var targetCopy = target.slice(start, end)

        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i]
            y = targetCopy[i]
            break
          }
        }

        if (x < y) return -1
        if (y < x) return 1
        return 0
      }

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
      function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
        // Empty buffer means no match
        if (buffer.length === 0) return -1

        // Normalize byteOffset
        if (typeof byteOffset === 'string') {
          encoding = byteOffset
          byteOffset = 0
        } else if (byteOffset > 0x7fffffff) {
          byteOffset = 0x7fffffff
        } else if (byteOffset < -0x80000000) {
          byteOffset = -0x80000000
        }
        byteOffset = +byteOffset // Coerce to Number.
        if (numberIsNaN(byteOffset)) {
          // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
          byteOffset = dir ? 0 : (buffer.length - 1)
        }

        // Normalize byteOffset: negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset
        if (byteOffset >= buffer.length) {
          if (dir) return -1
          else byteOffset = buffer.length - 1
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0
          else return -1
        }

        // Normalize val
        if (typeof val === 'string') {
          val = Buffer.from(val, encoding)
        }

        // Finally, search either indexOf (if dir is true) or lastIndexOf
        if (Buffer.isBuffer(val)) {
          // Special case: looking for empty string/buffer always fails
          if (val.length === 0) {
            return -1
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
        } else if (typeof val === 'number') {
          val = val & 0xFF // Search for a byte value [0-255]
          if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
        }

        throw new TypeError('val must be string, number or Buffer')
      }

      function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
        var indexSize = 1
        var arrLength = arr.length
        var valLength = val.length

        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase()
          if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
              return -1
            }
            indexSize = 2
            arrLength /= 2
            valLength /= 2
            byteOffset /= 2
          }
        }

        function read (buf, i) {
          if (indexSize === 1) {
            return buf[i]
          } else {
            return buf.readUInt16BE(i * indexSize)
          }
        }

        var i
        if (dir) {
          var foundIndex = -1
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
            } else {
              if (foundIndex !== -1) i -= i - foundIndex
              foundIndex = -1
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
          for (i = byteOffset; i >= 0; i--) {
            var found = true
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false
                break
              }
            }
            if (found) return i
          }
        }

        return -1
      }

      Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1
      }

      Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
      }

      Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
      }

      function hexWrite (buf, string, offset, length) {
        offset = Number(offset) || 0
        var remaining = buf.length - offset
        if (!length) {
          length = remaining
        } else {
          length = Number(length)
          if (length > remaining) {
            length = remaining
          }
        }

        var strLen = string.length

        if (length > strLen / 2) {
          length = strLen / 2
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16)
          if (numberIsNaN(parsed)) return i
          buf[offset + i] = parsed
        }
        return i
      }

      function utf8Write (buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
      }

      function asciiWrite (buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length)
      }

      function base64Write (buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length)
      }

      function ucs2Write (buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
      }

      Buffer.prototype.write = function write (string, offset, length, encoding) {
        // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8'
          length = this.length
          offset = 0
          // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset
          length = this.length
          offset = 0
          // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset >>> 0
          if (isFinite(length)) {
            length = length >>> 0
            if (encoding === undefined) encoding = 'utf8'
          } else {
            encoding = length
            length = undefined
          }
        } else {
          throw new Error(
            'Buffer.write(string, encoding, offset[, length]) is no longer supported'
          )
        }

        var remaining = this.length - offset
        if (length === undefined || length > remaining) length = remaining

        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
          throw new RangeError('Attempt to write outside buffer bounds')
        }

        if (!encoding) encoding = 'utf8'

        var loweredCase = false
        for (;;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length)

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length)

            case 'ascii':
            case 'latin1':
            case 'binary':
              return asciiWrite(this, string, offset, length)

            case 'base64':
              // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }

      Buffer.prototype.toJSON = function toJSON () {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        }
      }

      function base64Slice (buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf)
        } else {
          return base64.fromByteArray(buf.slice(start, end))
        }
      }

      function utf8Slice (buf, start, end) {
        end = Math.min(buf.length, end)
        var res = []

        var i = start
        while (i < end) {
          var firstByte = buf[i]
          var codePoint = null
          var bytesPerSequence = (firstByte > 0xEF)
            ? 4
            : (firstByte > 0xDF)
              ? 3
              : (firstByte > 0xBF)
                ? 2
                : 1

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte
                }
                break
              case 2:
                secondByte = buf[i + 1]
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint
                  }
                }
                break
              case 3:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint
                  }
                }
                break
              case 4:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                fourthByte = buf[i + 3]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint
                  }
                }
            }
          }

          if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD
            bytesPerSequence = 1
          } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000
            res.push(codePoint >>> 10 & 0x3FF | 0xD800)
            codePoint = 0xDC00 | codePoint & 0x3FF
          }

          res.push(codePoint)
          i += bytesPerSequence
        }

        return decodeCodePointsArray(res)
      }

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000

      function decodeCodePointsArray (codePoints) {
        var len = codePoints.length
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = ''
        var i = 0
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          )
        }
        return res
      }

      function asciiSlice (buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 0x7F)
        }
        return ret
      }

      function latin1Slice (buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i])
        }
        return ret
      }

      function hexSlice (buf, start, end) {
        var len = buf.length

        if (!start || start < 0) start = 0
        if (!end || end < 0 || end > len) end = len

        var out = ''
        for (var i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]]
        }
        return out
      }

      function utf16leSlice (buf, start, end) {
        var bytes = buf.slice(start, end)
        var res = ''
        // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
        for (var i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
        }
        return res
      }

      Buffer.prototype.slice = function slice (start, end) {
        var len = this.length
        start = ~~start
        end = end === undefined ? len : ~~end

        if (start < 0) {
          start += len
          if (start < 0) start = 0
        } else if (start > len) {
          start = len
        }

        if (end < 0) {
          end += len
          if (end < 0) end = 0
        } else if (end > len) {
          end = len
        }

        if (end < start) end = start

        var newBuf = this.subarray(start, end)
        // Return an augmented `Uint8Array` instance
        Object.setPrototypeOf(newBuf, Buffer.prototype)

        return newBuf
      }

      /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
      function checkOffset (offset, ext, length) {
        if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
      }

      Buffer.prototype.readUintLE =
        Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) checkOffset(offset, byteLength, this.length)

          var val = this[offset]
          var mul = 1
          var i = 0
          while (++i < byteLength && (mul *= 0x100)) {
            val += this[offset + i] * mul
          }

          return val
        }

      Buffer.prototype.readUintBE =
        Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            checkOffset(offset, byteLength, this.length)
          }

          var val = this[offset + --byteLength]
          var mul = 1
          while (byteLength > 0 && (mul *= 0x100)) {
            val += this[offset + --byteLength] * mul
          }

          return val
        }

      Buffer.prototype.readUint8 =
        Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 1, this.length)
          return this[offset]
        }

      Buffer.prototype.readUint16LE =
        Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          return this[offset] | (this[offset + 1] << 8)
        }

      Buffer.prototype.readUint16BE =
        Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 2, this.length)
          return (this[offset] << 8) | this[offset + 1]
        }

      Buffer.prototype.readUint32LE =
        Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return ((this[offset]) |
              (this[offset + 1] << 8) |
              (this[offset + 2] << 16)) +
            (this[offset + 3] * 0x1000000)
        }

      Buffer.prototype.readUint32BE =
        Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
          offset = offset >>> 0
          if (!noAssert) checkOffset(offset, 4, this.length)

          return (this[offset] * 0x1000000) +
            ((this[offset + 1] << 16) |
              (this[offset + 2] << 8) |
              this[offset + 3])
        }

      Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var val = this[offset]
        var mul = 1
        var i = 0
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
        offset = offset >>> 0
        byteLength = byteLength >>> 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var i = byteLength
        var mul = 1
        var val = this[offset + --i]
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 1, this.length)
        if (!(this[offset] & 0x80)) return (this[offset])
        return ((0xff - this[offset] + 1) * -1)
      }

      Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset] | (this[offset + 1] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset + 1] | (this[offset] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16) |
          (this[offset + 3] << 24)
      }

      Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset] << 24) |
          (this[offset + 1] << 16) |
          (this[offset + 2] << 8) |
          (this[offset + 3])
      }

      Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, true, 23, 4)
      }

      Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, false, 23, 4)
      }

      Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, true, 52, 8)
      }

      Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, false, 52, 8)
      }

      function checkInt (buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
        if (offset + ext > buf.length) throw new RangeError('Index out of range')
      }

      Buffer.prototype.writeUintLE =
        Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1
            checkInt(this, value, offset, byteLength, maxBytes, 0)
          }

          var mul = 1
          var i = 0
          this[offset] = value & 0xFF
          while (++i < byteLength && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF
          }

          return offset + byteLength
        }

      Buffer.prototype.writeUintBE =
        Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
          value = +value
          offset = offset >>> 0
          byteLength = byteLength >>> 0
          if (!noAssert) {
            var maxBytes = Math.pow(2, 8 * byteLength) - 1
            checkInt(this, value, offset, byteLength, maxBytes, 0)
          }

          var i = byteLength - 1
          var mul = 1
          this[offset + i] = value & 0xFF
          while (--i >= 0 && (mul *= 0x100)) {
            this[offset + i] = (value / mul) & 0xFF
          }

          return offset + byteLength
        }

      Buffer.prototype.writeUint8 =
        Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
          this[offset] = (value & 0xff)
          return offset + 1
        }

      Buffer.prototype.writeUint16LE =
        Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
          return offset + 2
        }

      Buffer.prototype.writeUint16BE =
        Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
          this[offset] = (value >>> 8)
          this[offset + 1] = (value & 0xff)
          return offset + 2
        }

      Buffer.prototype.writeUint32LE =
        Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
          this[offset + 3] = (value >>> 24)
          this[offset + 2] = (value >>> 16)
          this[offset + 1] = (value >>> 8)
          this[offset] = (value & 0xff)
          return offset + 4
        }

      Buffer.prototype.writeUint32BE =
        Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
          value = +value
          offset = offset >>> 0
          if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
          this[offset] = (value >>> 24)
          this[offset + 1] = (value >>> 16)
          this[offset + 2] = (value >>> 8)
          this[offset + 3] = (value & 0xff)
          return offset + 4
        }

      Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          var limit = Math.pow(2, (8 * byteLength) - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = 0
        var mul = 1
        var sub = 0
        this[offset] = value & 0xFF
        while (++i < byteLength && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1
          }
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          var limit = Math.pow(2, (8 * byteLength) - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = byteLength - 1
        var mul = 1
        var sub = 0
        this[offset + i] = value & 0xFF
        while (--i >= 0 && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1
          }
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
        if (value < 0) value = 0xff + value + 1
        this[offset] = (value & 0xff)
        return offset + 1
      }

      Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        return offset + 2
      }

      Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        this[offset] = (value >>> 8)
        this[offset + 1] = (value & 0xff)
        return offset + 2
      }

      Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        this[offset + 2] = (value >>> 16)
        this[offset + 3] = (value >>> 24)
        return offset + 4
      }

      Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        if (value < 0) value = 0xffffffff + value + 1
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = (value & 0xff)
        return offset + 4
      }

      function checkIEEE754 (buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('Index out of range')
        if (offset < 0) throw new RangeError('Index out of range')
      }

      function writeFloat (buf, value, offset, littleEndian, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4)
        return offset + 4
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert)
      }

      function writeDouble (buf, value, offset, littleEndian, noAssert) {
        value = +value
        offset = offset >>> 0
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8)
        return offset + 8
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert)
      }

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy (target, targetStart, start, end) {
        if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
        if (!start) start = 0
        if (!end && end !== 0) end = this.length
        if (targetStart >= target.length) targetStart = target.length
        if (!targetStart) targetStart = 0
        if (end > 0 && end < start) end = start

        // Copy 0 bytes; we're done
        if (end === start) return 0
        if (target.length === 0 || this.length === 0) return 0

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds')
        }
        if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
        if (end < 0) throw new RangeError('sourceEnd out of bounds')

        // Are we oob?
        if (end > this.length) end = this.length
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start
        }

        var len = end - start

        if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
          // Use built-in when available, missing from IE11
          this.copyWithin(targetStart, start, end)
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          )
        }

        return len
      }

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
      Buffer.prototype.fill = function fill (val, start, end, encoding) {
        // Handle string cases:
        if (typeof val === 'string') {
          if (typeof start === 'string') {
            encoding = start
            start = 0
            end = this.length
          } else if (typeof end === 'string') {
            encoding = end
            end = this.length
          }
          if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string')
          }
          if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding)
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0)
            if ((encoding === 'utf8' && code < 128) ||
              encoding === 'latin1') {
              // Fast path: If `val` fits into a single byte, use that numeric value.
              val = code
            }
          }
        } else if (typeof val === 'number') {
          val = val & 255
        } else if (typeof val === 'boolean') {
          val = Number(val)
        }

        // Invalid ranges are not set to a default, so can range check early.
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError('Out of range index')
        }

        if (end <= start) {
          return this
        }

        start = start >>> 0
        end = end === undefined ? this.length : end >>> 0

        if (!val) val = 0

        var i
        if (typeof val === 'number') {
          for (i = start; i < end; ++i) {
            this[i] = val
          }
        } else {
          var bytes = Buffer.isBuffer(val)
            ? val
            : Buffer.from(val, encoding)
          var len = bytes.length
          if (len === 0) {
            throw new TypeError('The value "' + val +
              '" is invalid for argument "value"')
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len]
          }
        }

        return this
      }

// HELPER FUNCTIONS
// ================

      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

      function base64clean (str) {
        // Node takes equal signs as end of the Base64 encoding
        str = str.split('=')[0]
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = str.trim().replace(INVALID_BASE64_RE, '')
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return ''
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '='
        }
        return str
      }

      function utf8ToBytes (string, units) {
        units = units || Infinity
        var codePoint
        var length = string.length
        var leadSurrogate = null
        var bytes = []

        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i)

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
              // no lead yet
              if (codePoint > 0xDBFF) {
                // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              } else if (i + 1 === length) {
                // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              }

              // valid lead
              leadSurrogate = codePoint

              continue
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              leadSurrogate = codePoint
              continue
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
          } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          }

          leadSurrogate = null

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break
            bytes.push(codePoint)
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break
            bytes.push(
              codePoint >> 0x6 | 0xC0,
              codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break
            bytes.push(
              codePoint >> 0xC | 0xE0,
              codePoint >> 0x6 & 0x3F | 0x80,
              codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break
            bytes.push(
              codePoint >> 0x12 | 0xF0,
              codePoint >> 0xC & 0x3F | 0x80,
              codePoint >> 0x6 & 0x3F | 0x80,
              codePoint & 0x3F | 0x80
            )
          } else {
            throw new Error('Invalid code point')
          }
        }

        return bytes
      }

      function asciiToBytes (str) {
        var byteArray = []
        for (var i = 0; i < str.length; ++i) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF)
        }
        return byteArray
      }

      function utf16leToBytes (str, units) {
        var c, hi, lo
        var byteArray = []
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break

          c = str.charCodeAt(i)
          hi = c >> 8
          lo = c % 256
          byteArray.push(lo)
          byteArray.push(hi)
        }

        return byteArray
      }

      function base64ToBytes (str) {
        return base64.toByteArray(base64clean(str))
      }

      function blitBuffer (src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if ((i + offset >= dst.length) || (i >= src.length)) break
          dst[i + offset] = src[i]
        }
        return i
      }

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
      function isInstance (obj, type) {
        return obj instanceof type ||
          (obj != null && obj.constructor != null && obj.constructor.name != null &&
            obj.constructor.name === type.name)
      }
      function numberIsNaN (obj) {
        // For IE11 support
        return obj !== obj // eslint-disable-line no-self-compare
      }

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
      var hexSliceLookupTable = (function () {
        var alphabet = '0123456789abcdef'
        var table = new Array(256)
        for (var i = 0; i < 16; ++i) {
          var i16 = i * 16
          for (var j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j]
          }
        }
        return table
      })()


      /***/ }),

    /***/ "../../node_modules/eventemitter3/index.js":
    /*!*************************************************!*\
  !*** ../../node_modules/eventemitter3/index.js ***!
  \*************************************************/
    /***/ ((module) => {

      "use strict";


      var has = Object.prototype.hasOwnProperty
        , prefix = '~';

      /**
       * Constructor to create a storage for our `EE` objects.
       * An `Events` instance is a plain object whose properties are event names.
       *
       * @constructor
       * @private
       */
      function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
      if (Object.create) {
        Events.prototype = Object.create(null);

        //
        // This hack is needed because the `__proto__` property is still inherited in
        // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
        //
        if (!new Events().__proto__) prefix = false;
      }

      /**
       * Representation of a single event listener.
       *
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
       * @constructor
       * @private
       */
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }

      /**
       * Add a listener for a given event.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} once Specify if the listener is a one-time listener.
       * @returns {EventEmitter}
       * @private
       */
      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== 'function') {
          throw new TypeError('The listener must be a function');
        }

        var listener = new EE(fn, context || emitter, once)
          , evt = prefix ? prefix + event : event;

        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
        else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
        else emitter._events[evt] = [emitter._events[evt], listener];

        return emitter;
      }

      /**
       * Clear event by name.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} evt The Event name.
       * @private
       */
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();
        else delete emitter._events[evt];
      }

      /**
       * Minimal `EventEmitter` interface that is molded against the Node.js
       * `EventEmitter` interface.
       *
       * @constructor
       * @public
       */
      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }

      /**
       * Return an array listing the events for which the emitter has registered
       * listeners.
       *
       * @returns {Array}
       * @public
       */
      EventEmitter.prototype.eventNames = function eventNames() {
        var names = []
          , events
          , name;

        if (this._eventsCount === 0) return names;

        for (name in (events = this._events)) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }

        return names;
      };

      /**
       * Return the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Array} The registered listeners.
       * @public
       */
      EventEmitter.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event
          , handlers = this._events[evt];

        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];

        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }

        return ee;
      };

      /**
       * Return the number of listeners listening to a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Number} The number of listeners.
       * @public
       */
      EventEmitter.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event
          , listeners = this._events[evt];

        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };

      /**
       * Calls each of the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Boolean} `true` if the event had listeners, else `false`.
       * @public
       */
      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return false;

        var listeners = this._events[evt]
          , len = arguments.length
          , args
          , i;

        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

          switch (len) {
            case 1: return listeners.fn.call(listeners.context), true;
            case 2: return listeners.fn.call(listeners.context, a1), true;
            case 3: return listeners.fn.call(listeners.context, a1, a2), true;
            case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }

          for (i = 1, args = new Array(len -1); i < len; i++) {
            args[i - 1] = arguments[i];
          }

          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length
            , j;

          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
              case 1: listeners[i].fn.call(listeners[i].context); break;
              case 2: listeners[i].fn.call(listeners[i].context, a1); break;
              case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
              case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
              default:
                if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }

                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }

        return true;
      };

      /**
       * Add a listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };

      /**
       * Add a one-time listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };

      /**
       * Remove the listeners of a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn Only remove the listeners that match this function.
       * @param {*} context Only remove the listeners that have this context.
       * @param {Boolean} once Only remove one-time listeners.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;

        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }

        var listeners = this._events[evt];

        if (listeners.fn) {
          if (
            listeners.fn === fn &&
            (!once || listeners.once) &&
            (!context || listeners.context === context)
          ) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (
              listeners[i].fn !== fn ||
              (once && !listeners[i].once) ||
              (context && listeners[i].context !== context)
            ) {
              events.push(listeners[i]);
            }
          }

          //
          // Reset the array, or remove it completely if we have no more listeners.
          //
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
          else clearEvent(this, evt);
        }

        return this;
      };

      /**
       * Remove all listeners, or those of the specified event.
       *
       * @param {(String|Symbol)} [event] The event name.
       * @returns {EventEmitter} `this`.
       * @public
       */
      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;

        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }

        return this;
      };

//
// Alias methods names because people roll like that.
//
      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
      EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
      EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
      if (true) {
        module.exports = EventEmitter;
      }


      /***/ }),

    /***/ "../../node_modules/events/events.js":
    /*!*******************************************!*\
  !*** ../../node_modules/events/events.js ***!
  \*******************************************/
    /***/ ((module) => {

      "use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



      var R = typeof Reflect === 'object' ? Reflect : null
      var ReflectApply = R && typeof R.apply === 'function'
        ? R.apply
        : function ReflectApply(target, receiver, args) {
          return Function.prototype.apply.call(target, receiver, args);
        }

      var ReflectOwnKeys
      if (R && typeof R.ownKeys === 'function') {
        ReflectOwnKeys = R.ownKeys
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target)
            .concat(Object.getOwnPropertySymbols(target));
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys(target) {
          return Object.getOwnPropertyNames(target);
        };
      }

      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning);
      }

      var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
        return value !== value;
      }

      function EventEmitter() {
        EventEmitter.init.call(this);
      }
      module.exports = EventEmitter;
      module.exports.once = once;

// Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter;

      EventEmitter.prototype._events = undefined;
      EventEmitter.prototype._eventsCount = 0;
      EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
      var defaultMaxListeners = 10;

      function checkListener(listener) {
        if (typeof listener !== 'function') {
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
      }

      Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
        enumerable: true,
        get: function() {
          return defaultMaxListeners;
        },
        set: function(arg) {
          if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
          }
          defaultMaxListeners = arg;
        }
      });

      EventEmitter.init = function() {

        if (this._events === undefined ||
          this._events === Object.getPrototypeOf(this)._events) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        }

        this._maxListeners = this._maxListeners || undefined;
      };

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
        }
        this._maxListeners = n;
        return this;
      };

      function _getMaxListeners(that) {
        if (that._maxListeners === undefined)
          return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
      }

      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };

      EventEmitter.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        var doError = (type === 'error');

        var events = this._events;
        if (events !== undefined)
          doError = (doError && events.error === undefined);
        else if (!doError)
          return false;

        // If there is no 'error' event listener then throw.
        if (doError) {
          var er;
          if (args.length > 0)
            er = args[0];
          if (er instanceof Error) {
            // Note: The comments on the `throw` lines are intentional, they show
            // up in Node's output if this results in an unhandled exception.
            throw er; // Unhandled 'error' event
          }
          // At least give some kind of context to the user
          var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
          err.context = er;
          throw err; // Unhandled 'error' event
        }

        var handler = events[type];

        if (handler === undefined)
          return false;

        if (typeof handler === 'function') {
          ReflectApply(handler, this, args);
        } else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i)
            ReflectApply(listeners[i], this, args);
        }

        return true;
      };

      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;

        checkListener(listener);

        events = target._events;
        if (events === undefined) {
          events = target._events = Object.create(null);
          target._eventsCount = 0;
        } else {
          // To avoid recursion in the case that type === "newListener"! Before
          // adding it to the listeners, first emit "newListener".
          if (events.newListener !== undefined) {
            target.emit('newListener', type,
              listener.listener ? listener.listener : listener);

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events;
          }
          existing = events[type];
        }

        if (existing === undefined) {
          // Optimize the case of one listener. Don't need the extra array object.
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === 'function') {
            // Adding the second element, need to change to array.
            existing = events[type] =
              prepend ? [listener, existing] : [existing, listener];
            // If we've already got an array, just append.
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }

          // Check for listener leak
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            // No error code for this since it is a Warning
            // eslint-disable-next-line no-restricted-syntax
            var w = new Error('Possible EventEmitter memory leak detected. ' +
              existing.length + ' ' + String(type) + ' listeners ' +
              'added. Use emitter.setMaxListeners() to ' +
              'increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }

        return target;
      }

      EventEmitter.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          if (arguments.length === 0)
            return this.listener.call(this.target);
          return this.listener.apply(this.target, arguments);
        }
      }

      function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }

      EventEmitter.prototype.once = function once(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };

      EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

// Emits a 'removeListener' event if and only if the listener was removed.
      EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          checkListener(listener);

          events = this._events;
          if (events === undefined)
            return this;

          list = events[type];
          if (list === undefined)
            return this;

          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
              this._events = Object.create(null);
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length - 1; i >= 0; i--) {
              if (list[i] === listener || list[i].listener === listener) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (position === 0)
              list.shift();
            else {
              spliceOne(list, position);
            }

            if (list.length === 1)
              events[type] = list[0];

            if (events.removeListener !== undefined)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };

      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

      EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events, i;

          events = this._events;
          if (events === undefined)
            return this;

          // not listening for removeListener, no need to emit
          if (events.removeListener === undefined) {
            if (arguments.length === 0) {
              this._events = Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== undefined) {
              if (--this._eventsCount === 0)
                this._events = Object.create(null);
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i = 0; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = Object.create(null);
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners !== undefined) {
            // LIFO order
            for (i = listeners.length - 1; i >= 0; i--) {
              this.removeListener(type, listeners[i]);
            }
          }

          return this;
        };

      function _listeners(target, type, unwrap) {
        var events = target._events;

        if (events === undefined)
          return [];

        var evlistener = events[type];
        if (evlistener === undefined)
          return [];

        if (typeof evlistener === 'function')
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];

        return unwrap ?
          unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }

      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };

      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };

      EventEmitter.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };

      EventEmitter.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;

        if (events !== undefined) {
          var evlistener = events[type];

          if (typeof evlistener === 'function') {
            return 1;
          } else if (evlistener !== undefined) {
            return evlistener.length;
          }
        }

        return 0;
      }

      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
      };

      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
          copy[i] = arr[i];
        return copy;
      }

      function spliceOne(list, index) {
        for (; index + 1 < list.length; index++)
          list[index] = list[index + 1];
        list.pop();
      }

      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }

      function once(emitter, name) {
        return new Promise(function (resolve, reject) {
          function errorListener(err) {
            emitter.removeListener(name, resolver);
            reject(err);
          }

          function resolver() {
            if (typeof emitter.removeListener === 'function') {
              emitter.removeListener('error', errorListener);
            }
            resolve([].slice.call(arguments));
          };

          eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
          if (name !== 'error') {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
          }
        });
      }

      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === 'function') {
          eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
        }
      }

      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === 'function') {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === 'function') {
          // EventTarget does not have `error` event semantics like Node
          // EventEmitters, we do not listen for `error` events here.
          emitter.addEventListener(name, function wrapListener(arg) {
            // IE does not have builtin `{ once: true }` support so we
            // have to do it manually.
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
      }


      /***/ }),

    /***/ "../../node_modules/ieee754/index.js":
    /*!*******************************************!*\
  !*** ../../node_modules/ieee754/index.js ***!
  \*******************************************/
    /***/ ((__unused_webpack_module, exports) => {

      /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m
        var eLen = (nBytes * 8) - mLen - 1
        var eMax = (1 << eLen) - 1
        var eBias = eMax >> 1
        var nBits = -7
        var i = isLE ? (nBytes - 1) : 0
        var d = isLE ? -1 : 1
        var s = buffer[offset + i]

        i += d

        e = s & ((1 << (-nBits)) - 1)
        s >>= (-nBits)
        nBits += eLen
        for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & ((1 << (-nBits)) - 1)
        e >>= (-nBits)
        nBits += mLen
        for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias
        } else if (e === eMax) {
          return m ? NaN : ((s ? -1 : 1) * Infinity)
        } else {
          m = m + Math.pow(2, mLen)
          e = e - eBias
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
      }

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c
        var eLen = (nBytes * 8) - mLen - 1
        var eMax = (1 << eLen) - 1
        var eBias = eMax >> 1
        var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
        var i = isLE ? 0 : (nBytes - 1)
        var d = isLE ? 1 : -1
        var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

        value = Math.abs(value)

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0
          e = eMax
        } else {
          e = Math.floor(Math.log(value) / Math.LN2)
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--
            c *= 2
          }
          if (e + eBias >= 1) {
            value += rt / c
          } else {
            value += rt * Math.pow(2, 1 - eBias)
          }
          if (value * c >= 2) {
            e++
            c /= 2
          }

          if (e + eBias >= eMax) {
            m = 0
            e = eMax
          } else if (e + eBias >= 1) {
            m = ((value * c) - 1) * Math.pow(2, mLen)
            e = e + eBias
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
            e = 0
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = (e << mLen) | m
        eLen += mLen
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128
      }


      /***/ }),

    /***/ "../../node_modules/process/browser.js":
    /*!*********************************************!*\
  !*** ../../node_modules/process/browser.js ***!
  \*********************************************/
    /***/ ((module) => {

// shim for using process in browser
      var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      } ())
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch(e){
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }


      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e){
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }



      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

// v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) { return [] }

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () { return '/' };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function() { return 0; };


      /***/ }),

    /***/ "?2e65":
    /*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
    /***/ (() => {

      /* (ignored) */

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/format/formatDate.js":
    /*!**************************************************************!*\
  !*** ../../node_modules/@polkadot/util/format/formatDate.js ***!
  \**************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "formatDate": () => (/* binding */ formatDate)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      /** @internal */
      function zeroPad(value) {
        return value.toString().padStart(2, '0');
      }
      /**
       * @name formatDate
       * @description Formats a date in CCYY-MM-DD HH:MM:SS format
       */


      function formatDate(date) {
        const year = date.getFullYear().toString();
        const month = zeroPad(date.getMonth() + 1);
        const day = zeroPad(date.getDate());
        const hour = zeroPad(date.getHours());
        const minute = zeroPad(date.getMinutes());
        const second = zeroPad(date.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/has.js":
    /*!************************************************!*\
  !*** ../../node_modules/@polkadot/util/has.js ***!
  \************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "hasBigInt": () => (/* binding */ hasBigInt),
        /* harmony export */   "hasBuffer": () => (/* binding */ hasBuffer),
        /* harmony export */   "hasCjs": () => (/* binding */ hasCjs),
        /* harmony export */   "hasDirname": () => (/* binding */ hasDirname),
        /* harmony export */   "hasEsm": () => (/* binding */ hasEsm),
        /* harmony export */   "hasProcess": () => (/* binding */ hasProcess),
        /* harmony export */   "hasWasm": () => (/* binding */ hasWasm)
        /* harmony export */ });
      /* harmony import */ var _polkadot_x_bigint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @polkadot/x-bigint */ "../../node_modules/@polkadot/x-bigint/index.js");
      /* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "../../node_modules/buffer/index.js")["Buffer"];
      /* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../../node_modules/process/browser.js");
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
      // Since we run in very different environments, we have to ensure we have all
// the types used here for detection (some of these may require Node definitions,
// which are not available in Deno/browser)

      /** true if the environment has proper BigInt support */
      const hasBigInt = typeof _polkadot_x_bigint__WEBPACK_IMPORTED_MODULE_0__.BigInt === 'function' && typeof _polkadot_x_bigint__WEBPACK_IMPORTED_MODULE_0__.BigInt.asIntN === 'function';
      /** true if the environment has support for Buffer */

      const hasBuffer = typeof Buffer !== 'undefined';
      /** true if the environment is CJS */

      const hasCjs = typeof require === 'function' && typeof module !== 'undefined';
      /** true if the environment has __dirname available */

      const hasDirname = typeof __dirname !== 'undefined';
      /** true if the environment is ESM */

      const hasEsm = !hasCjs;
      /** true if the environment has process available (typically Node.js) */

      const hasProcess = typeof process === 'object';
      /** true if the environment has WebAssembly available */

      const hasWasm = typeof WebAssembly !== 'undefined';

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/hex/toU8a.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/util/hex/toU8a.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "hexToU8a": () => (/* binding */ hexToU8a)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
      const CHR = '0123456789abcdef';
      const U8 = new Array(256);
      const U16 = new Array(256 * 256);

      for (let i = 0; i < CHR.length; i++) {
        U8[CHR[i].charCodeAt(0) | 0] = i | 0;

        if (i > 9) {
          U8[CHR[i].toUpperCase().charCodeAt(0) | 0] = i | 0;
        }
      }

      for (let i = 0; i < 256; i++) {
        const s = i << 8;

        for (let j = 0; j < 256; j++) {
          U16[s | j] = U8[i] << 4 | U8[j];
        }
      }
      /**
       * @name hexToU8a
       * @summary Creates a Uint8Array object from a hex string.
       * @description
       * `null` inputs returns an empty `Uint8Array` result. Hex input values return the actual bytes value converted to a Uint8Array. Anything that is not a hex string (including the `0x` prefix) throws an error.
       * @example
       * <BR>
       *
       * ```javascript
       * import { hexToU8a } from '@polkadot/util';
       *
       * hexToU8a('0x80001f'); // Uint8Array([0x80, 0x00, 0x1f])
       * hexToU8a('0x80001f', 32); // Uint8Array([0x00, 0x80, 0x00, 0x1f])
       * ```
       */


      function hexToU8a(value, bitLength = -1) {
        if (!value) {
          return new Uint8Array();
        }

        let s = value.startsWith('0x') ? 2 : 0;
        const decLength = Math.ceil((value.length - s) / 2);
        const endLength = Math.ceil(bitLength === -1 ? decLength : bitLength / 8);
        const result = new Uint8Array(endLength);
        const offset = endLength > decLength ? endLength - decLength : 0;

        for (let i = offset; i < endLength; i++, s += 2) {
          // The big factor here is actually the string lookups. If we do
          // HEX_TO_U16[value.substring()] we get an 10x slowdown. In the
          // same vein using charCodeAt (as opposed to value[s] or value.charAt(s)) is
          // also the faster operation by at least 2x with the character map above
          result[i] = U16[value.charCodeAt(s) << 8 | value.charCodeAt(s + 1)];
        }

        return result;
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/bn.js":
    /*!**************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/bn.js ***!
  \**************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isBn": () => (/* binding */ isBn)
        /* harmony export */ });
      /* harmony import */ var _bn_bn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bn/bn.js */ "../../node_modules/bn.js/lib/bn.js");
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      /**
       * @name isBn
       * @summary Tests for a `BN` object instance.
       * @description
       * Checks to see if the input object is an instance of `BN` (bn.js).
       * @example
       * <BR>
       *
       * ```javascript
       * import BN from 'bn.js';
       * import { isBn } from '@polkadot/util';
       *
       * console.log('isBn', isBn(new BN(1))); // => true
       * ```
       */

      function isBn(value) {
        return _bn_bn_js__WEBPACK_IMPORTED_MODULE_0__.isBN(value);
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/buffer.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/buffer.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isBuffer": () => (/* binding */ isBuffer)
        /* harmony export */ });
      /* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../has.js */ "../../node_modules/@polkadot/util/has.js");
      /* harmony import */ var _function_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./function.js */ "../../node_modules/@polkadot/util/is/function.js");
      /* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "../../node_modules/buffer/index.js")["Buffer"];
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0


      /**
       * @name isBuffer
       * @summary Tests for a `Buffer` object instance.
       * @description
       * Checks to see if the input object is an instance of `Buffer`.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isBuffer } from '@polkadot/util';
       *
       * console.log('isBuffer', isBuffer(Buffer.from([]))); // => true
       * ```
       */

      function isBuffer(value) {
        // we do check a function first, since it is slightly faster than isBuffer itself
        return _has_js__WEBPACK_IMPORTED_MODULE_0__.hasBuffer && (0,_function_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(value && value.readDoubleLE) && Buffer.isBuffer(value);
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/function.js":
    /*!********************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/function.js ***!
  \********************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isFunction": () => (/* binding */ isFunction)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/ban-types

      /**
       * @name isFunction
       * @summary Tests for a `function`.
       * @description
       * Checks to see if the input value is a JavaScript function.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isFunction } from '@polkadot/util';
       *
       * isFunction(() => false); // => true
       * ```
       */
      function isFunction(value) {
        return typeof value === 'function';
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/hex.js":
    /*!***************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/hex.js ***!
  \***************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "REGEX_HEX_NOPREFIX": () => (/* binding */ REGEX_HEX_NOPREFIX),
        /* harmony export */   "REGEX_HEX_PREFIXED": () => (/* binding */ REGEX_HEX_PREFIXED),
        /* harmony export */   "isHex": () => (/* binding */ isHex)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
      const REGEX_HEX_PREFIXED = /^0x[\da-fA-F]+$/;
      const REGEX_HEX_NOPREFIX = /^[\da-fA-F]+$/;
      /**
       * @name isHex
       * @summary Tests for a hex string.
       * @description
       * Checks to see if the input value is a `0x` prefixed hex string. Optionally (`bitLength` !== -1) checks to see if the bitLength is correct.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isHex } from '@polkadot/util';
       *
       * isHex('0x1234'); // => true
       * isHex('0x1234', 8); // => false
       * ```
       */

      function isHex(value, bitLength = -1, ignoreLength) {
        return typeof value === 'string' && (value === '0x' || REGEX_HEX_PREFIXED.test(value)) && (bitLength === -1 ? ignoreLength || value.length % 2 === 0 : value.length === 2 + Math.ceil(bitLength / 4));
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/object.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/object.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isObject": () => (/* binding */ isObject)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      /**
       * @name isObject
       * @summary Tests for an `object`.
       * @description
       * Checks to see if the input value is a JavaScript object.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isObject } from '@polkadot/util';
       *
       * isObject({}); // => true
       * isObject('something'); // => false
       * ```
       */
      function isObject(value) {
        return !!value && typeof value === 'object';
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/u8a.js":
    /*!***************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/u8a.js ***!
  \***************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isU8a": () => (/* binding */ isU8a)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      /**
       * @name isU8a
       * @summary Tests for a `Uint8Array` object instance.
       * @description
       * Checks to see if the input object is an instance of `Uint8Array`.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isUint8Array } from '@polkadot/util';
       *
       * console.log('isU8a', isU8a([])); // => false
       * ```
       */
      function isU8a(value) {
        // here we defer the instanceof check which is actually slightly
        // slower than just checking the constrctor (direct instances)
        return (value && value.constructor) === Uint8Array || value instanceof Uint8Array;
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/is/undefined.js":
    /*!*********************************************************!*\
  !*** ../../node_modules/@polkadot/util/is/undefined.js ***!
  \*********************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "isUndefined": () => (/* binding */ isUndefined)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      /**
       * @name isUndefined
       * @summary Tests for a `undefined` values.
       * @description
       * Checks to see if the input value is `undefined`.
       * @example
       * <BR>
       *
       * ```javascript
       * import { isUndefined } from '@polkadot/util';
       *
       * console.log('isUndefined', isUndefined(void(0))); // => true
       * ```
       */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      function isUndefined(value) {
        return value === undefined;
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/logger.js":
    /*!***************************************************!*\
  !*** ../../node_modules/@polkadot/util/logger.js ***!
  \***************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "logger": () => (/* binding */ logger),
        /* harmony export */   "loggerFormat": () => (/* binding */ loggerFormat)
        /* harmony export */ });
      /* harmony import */ var _format_formatDate_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./format/formatDate.js */ "../../node_modules/@polkadot/util/format/formatDate.js");
      /* harmony import */ var _is_bn_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is/bn.js */ "../../node_modules/@polkadot/util/is/bn.js");
      /* harmony import */ var _is_buffer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./is/buffer.js */ "../../node_modules/@polkadot/util/is/buffer.js");
      /* harmony import */ var _is_function_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./is/function.js */ "../../node_modules/@polkadot/util/is/function.js");
      /* harmony import */ var _is_object_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./is/object.js */ "../../node_modules/@polkadot/util/is/object.js");
      /* harmony import */ var _is_u8a_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is/u8a.js */ "../../node_modules/@polkadot/util/is/u8a.js");
      /* harmony import */ var _u8a_toHex_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./u8a/toHex.js */ "../../node_modules/@polkadot/util/u8a/toHex.js");
      /* harmony import */ var _u8a_toU8a_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./u8a/toU8a.js */ "../../node_modules/@polkadot/util/u8a/toU8a.js");
      /* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./has.js */ "../../node_modules/@polkadot/util/has.js");
      /* provided dependency */ var process = __webpack_require__(/*! process/browser.js */ "../../node_modules/process/browser.js");
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0









      const logTo = {
        debug: 'log',
        error: 'error',
        log: 'log',
        warn: 'warn'
      };

      function formatOther(value) {
        if (value && (0,_is_object_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(value) && value.constructor === Object) {
          const result = {};

          for (const k of Object.keys(value)) {
            result[k] = loggerFormat(value[k]);
          }

          return result;
        }

        return value;
      }

      function loggerFormat(value) {
        if (Array.isArray(value)) {
          return value.map(loggerFormat);
        } else if ((0,_is_bn_js__WEBPACK_IMPORTED_MODULE_1__.isBn)(value)) {
          return value.toString();
        } else if ((0,_is_u8a_js__WEBPACK_IMPORTED_MODULE_2__.isU8a)(value) || (0,_is_buffer_js__WEBPACK_IMPORTED_MODULE_3__.isBuffer)(value)) {
          return (0,_u8a_toHex_js__WEBPACK_IMPORTED_MODULE_4__.u8aToHex)((0,_u8a_toU8a_js__WEBPACK_IMPORTED_MODULE_5__.u8aToU8a)(value));
        }

        return formatOther(value);
      }

      function formatWithLength(maxLength) {
        return v => {
          if (maxLength <= 0) {
            return v;
          }

          const r = `${v}`;
          return r.length < maxLength ? v : `${r.substring(0, maxLength)} ...`;
        };
      }

      function apply(log, type, values, maxSize = -1) {
        if (values.length === 1 && (0,_is_function_js__WEBPACK_IMPORTED_MODULE_6__.isFunction)(values[0])) {
          const fnResult = values[0]();
          return apply(log, type, Array.isArray(fnResult) ? fnResult : [fnResult], maxSize);
        }

        console[logTo[log]]((0,_format_formatDate_js__WEBPACK_IMPORTED_MODULE_7__.formatDate)(new Date()), type, ...values.map(loggerFormat).map(formatWithLength(maxSize)));
      }

      function noop() {// noop
      }

      function isDebugOn(e, type) {
        return !!e && (e === '*' || type === e || e.endsWith('*') && type.startsWith(e.slice(0, -1)));
      }

      function isDebugOff(e, type) {
        return !!e && e.startsWith('-') && (type === e.slice(1) || e.endsWith('*') && type.startsWith(e.slice(1, -1)));
      }

      function getDebugFlag(env, type) {
        let flag = false;

        for (const e of env) {
          if (isDebugOn(e, type)) {
            flag = true;
          } else if (isDebugOff(e, type)) {
            flag = false;
          }
        }

        return flag;
      }

      function parseEnv(type) {
        const env = (_has_js__WEBPACK_IMPORTED_MODULE_8__.hasProcess ? process : {}).env || {};
        const maxSize = parseInt(env.DEBUG_MAX || '-1', 10);
        return [getDebugFlag((env.DEBUG || '').toLowerCase().split(','), type), isNaN(maxSize) ? -1 : maxSize];
      }
      /**
       * @name Logger
       * @summary Creates a consistent log interface for messages
       * @description
       * Returns a `Logger` that has `.log`, `.error`, `.warn` and `.debug` (controlled with environment `DEBUG=typeA,typeB`) methods. Logging is done with a consistent prefix (type of logger, date) followed by the actual message using the underlying console.
       * @example
       * <BR>
       *
       * ```javascript
       * import { logger } from '@polkadot/util';
       *
       * const l = logger('test');
       * ```
       */


      function logger(_type) {
        const type = `${_type.toUpperCase()}:`.padStart(16);
        const [isDebug, maxSize] = parseEnv(_type.toLowerCase());
        return {
          debug: isDebug ? (...values) => apply('debug', type, values, maxSize) : noop,
          error: (...values) => apply('error', type, values),
          log: (...values) => apply('log', type, values),
          noop,
          warn: (...values) => apply('warn', type, values)
        };
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/string/toU8a.js":
    /*!*********************************************************!*\
  !*** ../../node_modules/@polkadot/util/string/toU8a.js ***!
  \*********************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "stringToU8a": () => (/* binding */ stringToU8a)
        /* harmony export */ });
      /* harmony import */ var _polkadot_x_textencoder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @polkadot/x-textencoder */ "../../node_modules/@polkadot/x-textencoder/browser.js");
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0

      const encoder = new _polkadot_x_textencoder__WEBPACK_IMPORTED_MODULE_0__.TextEncoder();
      /**
       * @name stringToU8a
       * @summary Creates a Uint8Array object from a utf-8 string.
       * @description
       * String input values return the actual encoded `UInt8Array`. `null` or `undefined` values returns an empty encoded array.
       * @example
       * <BR>
       *
       * ```javascript
       * import { stringToU8a } from '@polkadot/util';
       *
       * stringToU8a('hello'); // [0x68, 0x65, 0x6c, 0x6c, 0x6f]
       * ```
       */

      function stringToU8a(value) {
        return value ? encoder.encode(value.toString()) : new Uint8Array();
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/u8a/toHex.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/util/u8a/toHex.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "u8aToHex": () => (/* binding */ u8aToHex)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0
      const U8 = new Array(256);
      const U16 = new Array(256 * 256);

      for (let n = 0; n < 256; n++) {
        U8[n] = n.toString(16).padStart(2, '0');
      }

      for (let i = 0; i < 256; i++) {
        const s = i << 8;

        for (let j = 0; j < 256; j++) {
          U16[s | j] = U8[i] + U8[j];
        }
      }
      /** @internal */


      function hex(value, result) {
        const mod = value.length % 2 | 0;
        const length = value.length - mod | 0;

        for (let i = 0; i < length; i += 2) {
          result += U16[value[i] << 8 | value[i + 1]];
        }

        if (mod) {
          result += U8[value[length] | 0];
        }

        return result;
      }
      /**
       * @name u8aToHex
       * @summary Creates a hex string from a Uint8Array object.
       * @description
       * `UInt8Array` input values return the actual hex string. `null` or `undefined` values returns an `0x` string.
       * @example
       * <BR>
       *
       * ```javascript
       * import { u8aToHex } from '@polkadot/util';
       *
       * u8aToHex(new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0xf])); // 0x68656c0f
       * ```
       */


      function u8aToHex(value, bitLength = -1, isPrefixed = true) {
        // this is not 100% correct sinmce we support isPrefixed = false....
        const empty = isPrefixed ? '0x' : '';

        if (!value || !value.length) {
          return empty;
        } else if (bitLength > 0) {
          const length = Math.ceil(bitLength / 8);

          if (value.length > length) {
            return `${hex(value.subarray(0, length / 2), empty)}…${hex(value.subarray(value.length - length / 2), '')}`;
          }
        }

        return hex(value, empty);
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/util/u8a/toU8a.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/util/u8a/toU8a.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "u8aToU8a": () => (/* binding */ u8aToU8a)
        /* harmony export */ });
      /* harmony import */ var _hex_toU8a_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hex/toU8a.js */ "../../node_modules/@polkadot/util/hex/toU8a.js");
      /* harmony import */ var _is_buffer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../is/buffer.js */ "../../node_modules/@polkadot/util/is/buffer.js");
      /* harmony import */ var _is_hex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../is/hex.js */ "../../node_modules/@polkadot/util/is/hex.js");
      /* harmony import */ var _is_u8a_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../is/u8a.js */ "../../node_modules/@polkadot/util/is/u8a.js");
      /* harmony import */ var _string_toU8a_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../string/toU8a.js */ "../../node_modules/@polkadot/util/string/toU8a.js");
// Copyright 2017-2022 @polkadot/util authors & contributors
// SPDX-License-Identifier: Apache-2.0





      /**
       * @name u8aToU8a
       * @summary Creates a Uint8Array value from a Uint8Array, Buffer, string or hex input.
       * @description
       * `null` or `undefined` inputs returns a `[]` result, Uint8Array values returns the value, hex strings returns a Uint8Array representation.
       * @example
       * <BR>
       *
       * ```javascript
       * import { u8aToU8a } from '@polkadot/util';
       *
       * u8aToU8a(new Uint8Array([0x12, 0x34]); // => Uint8Array([0x12, 0x34])
       * u8aToU8a(0x1234); // => Uint8Array([0x12, 0x34])
       * ```
       */

      function u8aToU8a(value) {
        return (0,_is_u8a_js__WEBPACK_IMPORTED_MODULE_0__.isU8a)(value) ? value : (0,_is_hex_js__WEBPACK_IMPORTED_MODULE_1__.isHex)(value) ? (0,_hex_toU8a_js__WEBPACK_IMPORTED_MODULE_2__.hexToU8a)(value) : (0,_is_buffer_js__WEBPACK_IMPORTED_MODULE_3__.isBuffer)(value) || Array.isArray(value) ? new Uint8Array(value) : (0,_string_toU8a_js__WEBPACK_IMPORTED_MODULE_4__.stringToU8a)(value);
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-bigint/index.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/x-bigint/index.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "BigInt": () => (/* binding */ BigInt),
        /* harmony export */   "packageInfo": () => (/* reexport safe */ _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__.packageInfo)
        /* harmony export */ });
      /* harmony import */ var _polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @polkadot/x-global */ "../../node_modules/@polkadot/x-global/index.js");
      /* harmony import */ var _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./packageInfo.js */ "../../node_modules/@polkadot/x-bigint/packageInfo.js");
// Copyright 2017-2022 @polkadot/x-bigint authors & contributors
// SPDX-License-Identifier: Apache-2.0


      const BigInt = typeof _polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__.xglobal.BigInt === 'function' && typeof _polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__.xglobal.BigInt.asIntN === 'function' ? _polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__.xglobal.BigInt : () => Number.NaN;

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-bigint/packageInfo.js":
    /*!************************************************************!*\
  !*** ../../node_modules/@polkadot/x-bigint/packageInfo.js ***!
  \************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "packageInfo": () => (/* binding */ packageInfo)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/x-bigint authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Do not edit, auto-generated by @polkadot/dev
      const packageInfo = {
        name: '@polkadot/x-bigint',
        path: ( true) ? new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-bigint/packageInfo.js").pathname.substring(0, new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-bigint/packageInfo.js").pathname.lastIndexOf('/') + 1) : 0,
        type: 'esm',
        version: '10.1.11'
      };

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-global/index.js":
    /*!******************************************************!*\
  !*** ../../node_modules/@polkadot/x-global/index.js ***!
  \******************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "exposeGlobal": () => (/* binding */ exposeGlobal),
        /* harmony export */   "extractGlobal": () => (/* binding */ extractGlobal),
        /* harmony export */   "packageInfo": () => (/* reexport safe */ _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__.packageInfo),
        /* harmony export */   "xglobal": () => (/* binding */ xglobal)
        /* harmony export */ });
      /* harmony import */ var _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./packageInfo.js */ "../../node_modules/@polkadot/x-global/packageInfo.js");
// Copyright 2017-2022 @polkadot/x-global authors & contributors
// SPDX-License-Identifier: Apache-2.0
      // Ensure that we are able to run this without any @types/node definitions
// and without having lib: ['dom'] in our TypeScript configuration
// (may not be available in all environments, e.g. Deno springs to mind)

      function evaluateThis(fn) {
        return fn('return this');
      }

      const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : evaluateThis(Function);
      function extractGlobal(name, fallback) {
        // Not quite sure why this is here - snuck in with TS 4.7.2 with no real idea
        // (as of now) as to why this looks like an "any" when we do cast it to a T
        //
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return typeof xglobal[name] === 'undefined' ? fallback : xglobal[name];
      }
      function exposeGlobal(name, fallback) {
        if (typeof xglobal[name] === 'undefined') {
          xglobal[name] = fallback;
        }
      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-global/packageInfo.js":
    /*!************************************************************!*\
  !*** ../../node_modules/@polkadot/x-global/packageInfo.js ***!
  \************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "packageInfo": () => (/* binding */ packageInfo)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/x-global authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Do not edit, auto-generated by @polkadot/dev
      const packageInfo = {
        name: '@polkadot/x-global',
        path: ( true) ? new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-global/packageInfo.js").pathname.substring(0, new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-global/packageInfo.js").pathname.lastIndexOf('/') + 1) : 0,
        type: 'esm',
        version: '10.1.11'
      };

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-textencoder/browser.js":
    /*!*************************************************************!*\
  !*** ../../node_modules/@polkadot/x-textencoder/browser.js ***!
  \*************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "TextEncoder": () => (/* binding */ TextEncoder),
        /* harmony export */   "packageInfo": () => (/* reexport safe */ _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__.packageInfo)
        /* harmony export */ });
      /* harmony import */ var _polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @polkadot/x-global */ "../../node_modules/@polkadot/x-global/index.js");
      /* harmony import */ var _fallback_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fallback.js */ "../../node_modules/@polkadot/x-textencoder/fallback.js");
      /* harmony import */ var _packageInfo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./packageInfo.js */ "../../node_modules/@polkadot/x-textencoder/packageInfo.js");
// Copyright 2017-2022 @polkadot/x-textencoder authors & contributors
// SPDX-License-Identifier: Apache-2.0



      const TextEncoder = (0,_polkadot_x_global__WEBPACK_IMPORTED_MODULE_1__.extractGlobal)('TextEncoder', _fallback_js__WEBPACK_IMPORTED_MODULE_2__.TextEncoder);

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-textencoder/fallback.js":
    /*!**************************************************************!*\
  !*** ../../node_modules/@polkadot/x-textencoder/fallback.js ***!
  \**************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "TextEncoder": () => (/* binding */ TextEncoder)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/x-textencoder authors & contributors
// SPDX-License-Identifier: Apache-2.0
// This is very limited, only handling Ascii values
      class TextEncoder {
        encode(value) {
          const u8a = new Uint8Array(value.length);

          for (let i = 0; i < value.length; i++) {
            u8a[i] = value.charCodeAt(i);
          }

          return u8a;
        }

      }

      /***/ }),

    /***/ "../../node_modules/@polkadot/x-textencoder/packageInfo.js":
    /*!*****************************************************************!*\
  !*** ../../node_modules/@polkadot/x-textencoder/packageInfo.js ***!
  \*****************************************************************/
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

      "use strict";
      __webpack_require__.r(__webpack_exports__);
      /* harmony export */ __webpack_require__.d(__webpack_exports__, {
        /* harmony export */   "packageInfo": () => (/* binding */ packageInfo)
        /* harmony export */ });
// Copyright 2017-2022 @polkadot/x-textencoder authors & contributors
// SPDX-License-Identifier: Apache-2.0
// Do not edit, auto-generated by @polkadot/dev
      const packageInfo = {
        name: '@polkadot/x-textencoder',
        path: ( true) ? new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-textencoder/packageInfo.js").pathname.substring(0, new URL("file:///C:/Users/LW/Desktop/WORK/xampp/htdocs/Subwallet-Extension-2/node_modules/@polkadot/x-textencoder/packageInfo.js").pathname.lastIndexOf('/') + 1) : 0,
        type: 'esm',
        version: '10.1.11'
      };

      /***/ })

    /******/ 	});
  /************************************************************************/
  /******/ 	// The module cache
  /******/ 	var __webpack_module_cache__ = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
    /******/ 		// Check if module is in cache
    /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
    /******/ 		if (cachedModule !== undefined) {
      /******/ 			return cachedModule.exports;
      /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = __webpack_module_cache__[moduleId] = {
      /******/ 			id: moduleId,
      /******/ 			loaded: false,
      /******/ 			exports: {}
      /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.loaded = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
  /******/
  /************************************************************************/
  /******/ 	/* webpack/runtime/compat get default export */
  /******/ 	(() => {
    /******/ 		// getDefaultExport function for compatibility with non-harmony modules
    /******/ 		__webpack_require__.n = (module) => {
      /******/ 			var getter = module && module.__esModule ?
        /******/ 				() => (module['default']) :
        /******/ 				() => (module);
      /******/ 			__webpack_require__.d(getter, { a: getter });
      /******/ 			return getter;
      /******/ 		};
    /******/ 	})();
  /******/
  /******/ 	/* webpack/runtime/define property getters */
  /******/ 	(() => {
    /******/ 		// define getter functions for harmony exports
    /******/ 		__webpack_require__.d = (exports, definition) => {
      /******/ 			for(var key in definition) {
        /******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          /******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          /******/ 				}
        /******/ 			}
      /******/ 		};
    /******/ 	})();
  /******/
  /******/ 	/* webpack/runtime/hasOwnProperty shorthand */
  /******/ 	(() => {
    /******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
    /******/ 	})();
  /******/
  /******/ 	/* webpack/runtime/make namespace object */
  /******/ 	(() => {
    /******/ 		// define __esModule on exports
    /******/ 		__webpack_require__.r = (exports) => {
      /******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        /******/ 			}
      /******/ 			Object.defineProperty(exports, '__esModule', { value: true });
      /******/ 		};
    /******/ 	})();
  /******/
  /******/ 	/* webpack/runtime/node module decorator */
  /******/ 	(() => {
    /******/ 		__webpack_require__.nmd = (module) => {
      /******/ 			module.paths = [];
      /******/ 			if (!module.children) module.children = [];
      /******/ 			return module;
      /******/ 		};
    /******/ 	})();
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
  (() => {
    "use strict";
    /*!*********************!*\
  !*** ./src/page.ts ***!
  \*********************/
    __webpack_require__.r(__webpack_exports__);
    /* harmony import */ var _subwallet_extension_base_defaults__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @subwallet/extension-base/defaults */ "../extension-base/src/defaults.ts");
    /* harmony import */ var _subwallet_extension_base_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @subwallet/extension-base/page */ "../extension-base/src/page/index.ts");
    /* harmony import */ var _subwallet_extension_inject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @subwallet/extension-inject */ "../extension-inject/src/index.ts");
    /* harmony import */ var _subwallet_extension_koni_base_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @subwallet/extension-koni-base/page */ "../extension-koni-base/src/page/index.ts");
// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0





    const version = "0.6.7-1";
    function inject() {
      (0,_subwallet_extension_inject__WEBPACK_IMPORTED_MODULE_0__.injectExtension)(_subwallet_extension_base_page__WEBPACK_IMPORTED_MODULE_1__.enable, {
        name: 'subwallet-js',
        version: version
      });
      (0,_subwallet_extension_inject__WEBPACK_IMPORTED_MODULE_0__.injectEvmExtension)((0,_subwallet_extension_koni_base_page__WEBPACK_IMPORTED_MODULE_2__.initEvmProvider)(version));
    }

// setup a response listener (events created by the loader for extension responses)
    window.addEventListener('message', ({
                                          data,
                                          source
                                        }) => {
      // only allow messages from our window, by the loader
      if (source !== window || data.origin !== _subwallet_extension_base_defaults__WEBPACK_IMPORTED_MODULE_3__.MESSAGE_ORIGIN_CONTENT) {
        return;
      }
      if (data.id) {
        (0,_subwallet_extension_base_page__WEBPACK_IMPORTED_MODULE_1__.handleResponse)(data);
      } else {
        console.error('Missing id for response.');
      }
    });
    inject();
  })();

  /******/ })()
;