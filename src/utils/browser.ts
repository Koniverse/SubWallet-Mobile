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

/**
 * A dApp entry matches a visited page when they share a host. Comparing the whole URLs with
 * `includes` missed every variant the user actually browses (`pinterest.com/x` vs a dApp listed as
 * `https://www.pinterest.com`), which left those rows without the dApp's curated icon and title.
 */
export function findDAppByUrl<T extends { url: string }>(dApps: T[] | undefined, url: string): T | undefined {
  const host = normalizeHostName(url);

  if (!host) {
    return undefined;
  }

  return dApps?.find(dApp => {
    const dAppHost = normalizeHostName(dApp.url);

    return !!dAppHost && (host === dAppHost || host.endsWith(`.${dAppHost}`));
  });
}

function normalizeHostName(url: string): string {
  return getHostName(url).toLowerCase().replace(/^www\./, '');
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