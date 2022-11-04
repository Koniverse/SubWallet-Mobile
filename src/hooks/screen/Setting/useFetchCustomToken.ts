import { CustomToken } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchCustomToken(): CustomToken[] {
  const customToken = useSelector((state: RootState) => state.customToken.details);
  const filteredCustomTokens: CustomToken[] = [];

  Object.values(customToken).forEach(_tokenList => {
    const tokenList = _tokenList as CustomToken[];

    for (const token of tokenList) {
      if (!token.isDeleted) {
        filteredCustomTokens.push(token);
      }
    }
  });

  return filteredCustomTokens;
}
