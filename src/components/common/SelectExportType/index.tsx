import { BackgroundIcon } from 'components/design-system-ui';
import React, { useCallback, useMemo } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { SelectItem } from '../../design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import SelectExportTypeStyles from './style';
import { FileJs, IconProps, Leaf, QrCode, Wallet } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import { AccountActions, AccountProxy } from '@subwallet/extension-base/types';

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
  bgColor: string;
  disable: boolean;
  hidden: boolean;
}

interface SelectAccountTypeProps {
  selectedItems: ExportType[];
  setSelectedItems: React.Dispatch<React.SetStateAction<ExportType[]>>;
  accountProxy: AccountProxy | null;
  title?: string;
  styles?: ViewStyle;
  loading: boolean;
}

export const SelectExportType = (props: SelectAccountTypeProps) => {
  const { title, selectedItems, setSelectedItems, styles, accountProxy, loading } = props;
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
        label: i18n.exportAccount.exportSeedPhrase,
        onClick: onClickItem(ExportType.SEED_PHRASE),
        bgColor: theme['orange-7'],
        disable: !accountProxy || !accountProxy.accountActions.includes(AccountActions.EXPORT_MNEMONIC),
        hidden: false,
      },
      {
        icon: FileJs,
        key: ExportType.JSON_FILE,
        label: i18n.exportAccount.exportJsonFile,
        onClick: onClickItem(ExportType.JSON_FILE),
        bgColor: theme['geekblue-7'],
        disable: !accountProxy || !accountProxy.accountActions.includes(AccountActions.EXPORT_JSON),
        hidden: false,
      },
      {
        icon: Wallet,
        key: ExportType.PRIVATE_KEY,
        label: i18n.exportAccount.exportPrivateKey,
        onClick: onClickItem(ExportType.PRIVATE_KEY),
        bgColor: theme['magenta-7'],
        disable: !accountProxy || !accountProxy.accountActions.includes(AccountActions.EXPORT_PRIVATE_KEY),
        hidden: false,
      },
      {
        icon: QrCode,
        key: ExportType.QR_CODE,
        label: i18n.exportAccount.exportQRCode,
        onClick: onClickItem(ExportType.QR_CODE),
        bgColor: theme['green-7'],
        disable: !accountProxy || !accountProxy.accountActions.includes(AccountActions.EXPORT_QR),
        hidden: false,
      },
    ],
    [accountProxy, onClickItem, theme],
  );

  return (
    <View style={[styles]}>
      {/*{!!account?.isExternal && (*/}
      {/*  <View style={{ paddingBottom: theme.paddingSM }}>*/}
      {/*    <AlertBox*/}
      {/*      title={i18n.warningTitle.payAttention}*/}
      {/*      description={`Your account is ${accountProxy?.accountType} account, which doesn't support export and back up. Change to another account to use this feature`}*/}
      {/*      type="warning"*/}
      {/*    />*/}
      {/*  </View>*/}
      {/*)}*/}
      {title && (
        <View>
          <Text style={_style.titleStyle}>{title}</Text>
        </View>
      )}
      <View style={{ gap: theme.marginXS }}>
        {items.map(item => {
          const _selected = selectedItems.find(i => i === item.key);

          if (item.hidden) {
            return null;
          }

          return (
            <SelectItem
              key={item.label}
              label={item.label}
              leftItemIcon={
                <BackgroundIcon
                  phosphorIcon={item.icon}
                  backgroundColor={item.bgColor}
                  shape="circle"
                  size="sm"
                  weight="fill"
                />
              }
              isSelected={!!_selected}
              onPress={item.disable || loading ? undefined : item.onClick}
              showUnselect={true}
              disabled={item.disable}
            />
          );
        })}
      </View>
    </View>
  );
};
