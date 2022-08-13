export enum ErrorCode {
  REDUX_ERROR = 1100,
  REACT_NATIVE_ERROR = 1200,
  REACT_NATIVE_CRYPTO_ERROR = 1201,
  WEBVIEW_ERROR = 1300,
  WEBVIEW_NOT_READY_ERROR = 1301,
  WEBVIEW_RESPONSE_ERROR = 1302,
}

export class SubWalletMobileError extends Error {
  swErrorCode: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.swErrorCode = code;
  }
}
