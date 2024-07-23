import { ArrowsLeftRight, CopySimple, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';

export const ButtonIcon = {
  Receive: getButtonIcon(CopySimple, 'duotone', 'md'),
  SendFund: getButtonIcon(PaperPlaneTilt, 'duotone', 'md'),
  Buy: getButtonIcon(ShoppingCartSimple, 'duotone', 'md'),
  Swap: getButtonIcon(ArrowsLeftRight, 'duotone', 'md'),
};
