// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { fetchStaticData } from '@subwallet/extension-base/utils';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
// import { getStaticContentByDevMode } from 'utils/storage';
// const dataByDevModeStatus = getStaticContentByDevMode(); change this later

const useFetchMarkdownContentData = () => {
  const currentLanguage = useSelector((state: RootState) => state.settings.language);

  const getJsonFile = useCallback(
    (supportedLanguages: LanguageType[], fallbackLanguage: LanguageType) => {
      const resultLanguage = supportedLanguages.includes(currentLanguage) ? currentLanguage : fallbackLanguage;

      return `preview-${resultLanguage}.json`;
    },
    [currentLanguage],
  );

  return useCallback(
    <T = unknown,>(folder: string, supportedLanguages: LanguageType[], fallbackLanguage: LanguageType = 'en') => {
      const jsonFile = getJsonFile(supportedLanguages, fallbackLanguage);

      return fetchStaticData<T>(`markdown-contents/${folder}`, jsonFile, true);
    },
    [getJsonFile],
  );
};

export default useFetchMarkdownContentData;
