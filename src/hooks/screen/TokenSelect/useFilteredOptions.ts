import { useEffect, useState } from 'react';
import { TokenItemType } from 'types/ui-types';

export default function useFilteredOptions(tokenOptions: TokenItemType[], searchString: string): TokenItemType[] {
  const [filteredOptions, setFilteredOption] = useState<TokenItemType[]>(tokenOptions);

  const dep = JSON.stringify(tokenOptions);

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(
        tokenOptions.filter(
          ({ displayedSymbol, networkDisplayName }) =>
            displayedSymbol.toLowerCase().includes(lowerCaseSearchString) ||
            networkDisplayName.toLowerCase().includes(lowerCaseSearchString),
        ),
      );
    } else {
      setFilteredOption(tokenOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  return filteredOptions;
}
