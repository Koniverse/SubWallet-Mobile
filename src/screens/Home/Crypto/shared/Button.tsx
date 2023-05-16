import { ArrowFatLinesDown, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';

export const ButtonIcon = {
  Receive: getButtonIcon(ArrowFatLinesDown, 'duotone', 'md'),
  SendFund: getButtonIcon(PaperPlaneTilt, 'duotone', 'md'),
  Buy: getButtonIcon(ShoppingCartSimple, 'duotone', 'md'),
};
