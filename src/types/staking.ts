export interface NetworkValidatorsInfo {
  maxNominatorPerValidator: number;
  isBondedBefore: boolean;
  bondedValidators: string[];
  maxNominations: number;
}

export type ValidatorSortBy = 'Default' | 'Commission' | 'Return';
