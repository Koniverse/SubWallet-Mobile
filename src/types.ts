export interface WebViewMessageBase<T> {
  id: string;
  method: string;
  payload: T;
}

export interface WebViewMessageRequest<T> extends WebViewMessageBase<T> {
  isSubscribe?: boolean;
}

export interface WebViewMessageResponse<T> extends WebViewMessageRequest<T> {}
