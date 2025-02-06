import {
  ExtrinsicStatus,
  ExtrinsicType,
  TransactionDirection,
  TransactionHistoryItem,
} from '@subwallet/extension-base/background/KoniTypes';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { HideBalanceItem } from 'components/HideBalanceItem';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { HistoryStatusMap } from 'screens/Home/History/shared';
import { ThemeTypes } from 'styles/themes';
import { TransactionHistoryDisplayItem } from 'types/history';
import HistoryItemStyles from './style';
import { RequestClaimBridge } from '@subwallet/extension-base/types/bridge';
import {
  ClaimPolygonBridgeNotificationMetadata,
  NotificationActionType,
} from '@subwallet/extension-base/services/inapp-notification-service/interfaces';

interface Props {
  item: TransactionHistoryDisplayItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  isShowBalance?: boolean;
}

function getIconColor(status: ExtrinsicStatus, theme: ThemeTypes): string | undefined {
  const historyStatusMap = HistoryStatusMap();
  const color = historyStatusMap[status]?.color;

  return theme[color || ''];
}

export function isAbleToShowFee(item: TransactionHistoryItem): boolean {
  return !!(item.fee && item.fee.value && item.fee.value !== '0');
}

export const HistoryItem = ({ item, onPress, style, isShowBalance }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const displayData = item.displayData;
  const _style = HistoryItemStyles(theme);

  let amountValue = item?.amount?.value;

  if (item.type === ExtrinsicType.CLAIM_BRIDGE) {
    const additionalInfo = item.additionalInfo as RequestClaimBridge;

    if (additionalInfo.notification.actionType === NotificationActionType.CLAIM_POLYGON_BRIDGE) {
      const metadata = additionalInfo.notification.metadata as ClaimPolygonBridgeNotificationMetadata;

      amountValue = metadata.amounts[0];
    }
  }

  return (
    <>
      <TouchableOpacity style={[_style.item, style]} onPress={onPress}>
        <View style={_style.leftPart}>
          <View style={_style.mainIconWrapper}>
            <View style={[_style.mainIconBackground, { backgroundColor: getIconColor(item.status, theme) }]} />
            <Icon phosphorIcon={displayData.icon} size={'md'} iconColor={getIconColor(item.status, theme)} />
            <View style={_style.logoWrapper}>
              <Logo network={item.chain} size={16} />
            </View>
          </View>
        </View>

        <View style={_style.middlePart}>
          <Typography.Text ellipsis style={{ ..._style.upperText }}>
            {item.direction === TransactionDirection.SEND
              ? item.fromName || item.from || ''
              : item.toName || item.to || ''}
          </Typography.Text>
          <Typography.Text ellipsis style={_style.lowerText}>
            {displayData.typeName}
          </Typography.Text>
        </View>

        <View style={_style.rightPart}>
          <View style={{ alignItems: 'flex-end' }}>
            {isShowBalance && (
              <>
                <Number
                  decimal={item?.amount?.decimals || 0}
                  intOpacity={1}
                  decimalOpacity={0.45}
                  suffix={item?.amount?.symbol}
                  value={amountValue || '0'}
                  textStyle={_style.upperText}
                />
                {isAbleToShowFee(item) ? (
                  <Number
                    decimal={item?.fee?.decimals || 0}
                    decimalOpacity={1}
                    intOpacity={1}
                    suffix={item.fee?.symbol}
                    unitOpacity={1}
                    value={item.fee?.value || '0'}
                    size={theme.fontSizeSM}
                    textStyle={_style.lowerText}
                  />
                ) : (
                  <View style={{ height: 20 }} />
                )}
              </>
            )}

            {!isShowBalance && <HideBalanceItem isShowConvertedBalance={isAbleToShowFee(item)} />}
          </View>

          <View style={_style.arrowWrapper}>
            <Icon phosphorIcon={CaretRight} size="sm" />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
};
