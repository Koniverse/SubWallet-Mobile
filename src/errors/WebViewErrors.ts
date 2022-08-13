import { ErrorCode, SubWalletMobileError } from './SubWalletMobileError';

export class WebviewError extends SubWalletMobileError {
  constructor(message: string) {
    super(ErrorCode.WEBVIEW_ERROR, message);
  }
}

export class WebviewNotReadyError extends SubWalletMobileError {
  constructor(message: string) {
    super(ErrorCode.WEBVIEW_NOT_READY_ERROR, message);
  }
}

export class WebviewResponseError extends SubWalletMobileError {
  constructor(message: string) {
    super(ErrorCode.WEBVIEW_RESPONSE_ERROR, message);
  }
}
