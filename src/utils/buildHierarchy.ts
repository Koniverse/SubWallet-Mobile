// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@subwallet/extension-base/background/types';
import { AccountJson } from '@subwallet/extension-base/types';
import { isAccountAll } from './accountAll';

import getNetworkMap from './getNetworkMap';

type ChildFilter = (account: AccountJson) => AccountWithChildren;

function compareByCreation(a: AccountJson, b: AccountJson): number {
  return (a.whenCreated || Infinity) - (b.whenCreated || Infinity);
}

function compareByName(a: AccountJson, b: AccountJson): number {
  if (!a.name && !b.name) {
    return 0;
  }

  if (!a.name) {
    return 1;
  }

  if (!b.name) {
    return -1;
  }

  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();

  return nameA.localeCompare(nameB);
}

function compareByPath(a: AccountJson, b: AccountJson): number {
  const suriA = a.suri?.toUpperCase() || '';
  const suriB = b.suri?.toUpperCase() || '';

  return suriA.localeCompare(suriB);
}

function compareByNetwork(a: AccountJson, b: AccountJson): number {
  const networkMap = getNetworkMap();
  const networkA = networkMap.get(a?.genesisHash || '') || '';
  const networkB = networkMap.get(b?.genesisHash || '') || '';

  return networkA.localeCompare(networkB);
}

function compareByPathThenCreation(a: AccountJson, b: AccountJson): number {
  // if the paths are equal, compare by creation time
  return compareByPath(a, b) || compareByCreation(a, b);
}

function compareByNameThenPathThenCreation(a: AccountJson, b: AccountJson): number {
  // if the names are equal, compare by path then creation time
  return compareByName(a, b) || compareByPathThenCreation(a, b);
}

export function accountWithChildren(accounts: AccountJson[]): ChildFilter {
  return (account: AccountJson): AccountWithChildren => {
    const children = accounts
      .filter(({ parentAddress }) => account.address === parentAddress)
      .map(accountWithChildren(accounts))
      .sort(compareByNameThenPathThenCreation);

    return children.length === 0 ? account : { children, ...account };
  };
}

export function buildHierarchy(accounts: AccountJson[]): AccountWithChildren[] {
  const accountAll = accounts.find(a => isAccountAll(a.address));

  const otherAccountsExceptAll = accounts
    .filter(({ address, parentAddress }) => {
      if (isAccountAll(address)) {
        return false;
      }

      return (
        !parentAddress || // it is a parent
        !accounts.some(({ a }) => parentAddress === a)
      ); // we don't have a parent for this one
    })
    .map(accountWithChildren(accounts))
    .sort(compareByNetwork)
    .sort(compareByNameThenPathThenCreation);

  return accountAll ? [accountAll, ...otherAccountsExceptAll] : [...otherAccountsExceptAll];
}
