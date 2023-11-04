export const deeplinks = ['subwallet://', 'https://mobile.subwallet.app'];

export function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?://)?' + // protocol
      '([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.' + // domain name
      '[a-z]{2,}', // top-level domain (TLD)
  ); // fragment locator
  return pattern.test(str);
}

export function getHostName(url: string) {
  try {
    const address = url.split('://')[1].split('/')[0];
    return address.split(':')[0];
  } catch (e) {
    return url;
  }
}

export const searchDomain = 'duckduckgo.com';
export function getProtocol(url: string) {
  try {
    const protocol = url.split('://')[0];
    return protocol;
  } catch (e) {
    return url;
  }
}

export function getValidURL(address: string): string {
  if (isValidURL(address)) {
    return address.startsWith('http://') || address.startsWith('https://') ? address : `https://${address}`;
  } else {
    return `https://${searchDomain}/?q=${encodeURIComponent(address)}`;
  }
}
