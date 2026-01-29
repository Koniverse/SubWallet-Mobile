import { ArrowsLeftRightIcon, CopySimpleIcon, PaperPlaneTiltIcon, ShoppingCartSimpleIcon } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';

export const ButtonIcon = {
  Receive: getButtonIcon(CopySimpleIcon, 'duotone', 'md'),
  SendFund: getButtonIcon(PaperPlaneTiltIcon, 'duotone', 'md'),
  Buy: getButtonIcon(ShoppingCartSimpleIcon, 'duotone', 'md'),
  Swap: getButtonIcon(ArrowsLeftRightIcon, 'duotone', 'md'),
};
