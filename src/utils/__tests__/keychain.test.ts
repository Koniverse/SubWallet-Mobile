jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'android' },
}));

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockDeleteItem = jest.fn();
jest.mock('react-native-sensitive-info', () => ({
  __esModule: true,
  default: {
    getItem: (...args: unknown[]) => mockGetItem(...args),
    setItem: (...args: unknown[]) => mockSetItem(...args),
    deleteItem: (...args: unknown[]) => mockDeleteItem(...args),
  },
}));

const mockReadLegacy = jest.fn();
jest.mock('../legacyKeychain', () => ({
  readLegacyKeychainPassword: (...args: unknown[]) => mockReadLegacy(...args),
}));

jest.mock('../i18n/i18n', () => ({
  __esModule: true,
  default: { buttonTitles: { unlockWithBiometric: 'Unlock', cancel: 'Cancel' }, common: { tooManyAttemps: 'x' } },
}));

import { getKeychainPassword } from '../keychain';

describe('getKeychainPassword Android legacy fallback', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockReadLegacy.mockReset();
  });

  it('returns the v6 value when v6 storage already has it', async () => {
    mockGetItem.mockResolvedValue({ value: 'v6-password' });
    const result = await getKeychainPassword();
    expect(result).toBe('v6-password');
    expect(mockReadLegacy).not.toHaveBeenCalled();
  });

  it('falls back to the legacy module and re-stores via v6 when v6 storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);
    mockReadLegacy.mockResolvedValue('legacy-password');
    mockSetItem.mockResolvedValue(undefined);

    const result = await getKeychainPassword();

    expect(result).toBe('legacy-password');
    expect(mockReadLegacy).toHaveBeenCalledTimes(1);
    expect(mockSetItem).toHaveBeenCalledWith('sw-user', 'legacy-password', expect.anything());
  });

  it('returns undefined when neither v6 nor legacy storage has a value', async () => {
    mockGetItem.mockResolvedValue(null);
    mockReadLegacy.mockResolvedValue(undefined);

    const result = await getKeychainPassword();

    expect(result).toBeUndefined();
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});
