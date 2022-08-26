import { useEffect, useState } from 'react';
import { CrowdloanItemType } from '../../../../types';

export default function useFilteredCrowdloan(
  crowdloanList: CrowdloanItemType[],
  searchString: string,
): CrowdloanItemType[] {
  const [filteredOptions, setFilteredOption] = useState<CrowdloanItemType[]>(crowdloanList);

  const dep = JSON.stringify(crowdloanList);

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(
        crowdloanList.filter(
          ({ networkDisplayName, groupDisplayName }) =>
            networkDisplayName.toLowerCase().includes(lowerCaseSearchString) ||
            groupDisplayName.toLowerCase().includes(lowerCaseSearchString),
        ),
      );
    } else {
      setFilteredOption(crowdloanList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, searchString]);

  return filteredOptions;
}
