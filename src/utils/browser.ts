export function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
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

export function getValidURL(address: string): string {
  if (isValidURL(address)) {
    return address.startsWith('http://') || address.startsWith('https://') ? address : `https://${address}`;
  } else {
    return `https://${searchDomain}/?q=${encodeURIComponent(address)}`;
  }
}
