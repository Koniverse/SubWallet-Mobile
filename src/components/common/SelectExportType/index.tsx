import React, { useCallback, useMemo } from 'react';
import {Text, View, ViewStyle} from 'react-native';
import { Icon, SelectItem } from '../../design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import SelectExportTypeStyles from './style';
import { FileJs, IconProps, Leaf, QrCode, Wallet } from 'phosphor-react-native';

export enum ExportType {
  JSON_FILE = 'json-file',
  PRIVATE_KEY = 'private-key',
  QR_CODE = 'qr-code',
  SEED_PHRASE = 'seed-phrase',
}

interface ExportTypeItem {
  label: string;
  key: ExportType;
  icon: React.ElementType<IconProps>;
  onClick: () => void;
}

interface SelectAccountTypeProps {
  selectedItems: ExportType[];
  setSelectedItems: React.Dispatch<React.SetStateAction<ExportType[]>>;
  title?: string;
  styles?: ViewStyle;
}

export const SelectExportType = (props: SelectAccountTypeProps) => {
  const { title, selectedItems, setSelectedItems, styles } = props;
  const theme = useSubWalletTheme().swThemes;
  const _style = SelectExportTypeStyles(theme);

  const onClickItem = useCallback(
    (key: ExportType): (() => void) => {
      return () => {
        setSelectedItems(prevState => {
          const result = [...prevState];
          const exists = result.find(i => i === key);

          if (exists) {
            return result.filter(i => i !== key);
          } else {
            result.push(key);
            return result;
          }
        });
      };
    },
    [setSelectedItems],
  );
  const items = useMemo(
    (): ExportTypeItem[] => [
      {
        icon: Leaf,
        key: ExportType.SEED_PHRASE,
        label: 'Export Seed Phrase',
        onClick: onClickItem(ExportType.SEED_PHRASE),
      },
      {
        icon: FileJs,
        key: ExportType.PRIVATE_KEY,
        label: 'Export Private key',
        onClick: onClickItem(ExportType.PRIVATE_KEY),
      },
      {
        icon: Wallet,
        key: ExportType.JSON_FILE,
        label: 'Export JSON file',
        onClick: onClickItem(ExportType.JSON_FILE),
      },
      {
        icon: QrCode,
        key: ExportType.QR_CODE,
        label: 'Export QR Code',
        onClick: onClickItem(ExportType.QR_CODE),
      },
    ],
    [onClickItem],
  );

  return (
    <View style={styles}>
      {title && (
        <View>
          <Text style={_style.titleStyle}>{title}</Text>
        </View>
      )}
      {items.map(item => {
        const _selected = selectedItems.find(i => i === item.key);

        return (
          <SelectItem
            key={item.label}
            label={item.label}
            leftItemIcon={<Icon phosphorIcon={item.icon} />}
            isSelected={!!_selected}
            onPress={item.onClick}
          />
        );
      })}
    </View>
  );
};
