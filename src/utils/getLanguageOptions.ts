// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EN_US, VI_VN } from 'utils/i18n/i18n';

interface Option {
  info?: string;
  isDisabled?: boolean;
  isHeader?: boolean;
  text: string;
  value: string | number;
}

export default function getLanguageOptions(): Option[] {
  return [
    // default/native
    {
      text: 'English',
      value: EN_US,
    },
    {
      text: 'Vietnamese',
      value: VI_VN,
    },
    {
      text: 'Chinies',
      value: 'zh',
    },
    {
      text: 'Français',
      value: 'fr',
    },
    {
      text: 'Türkce',
      value: 'tr',
    },
    {
      text: 'Polski',
      value: 'pl',
    },
    {
      text: 'ภาษาไทย',
      value: 'th',
    },
    {
      text: 'اردو',
      value: 'ur',
    },
  ];
}
