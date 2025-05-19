import React, { useMemo } from 'react';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo } from 'react-native';
import { ServiceSelectItem } from 'components/ServiceSelectItem';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { ServiceSelectField } from 'components/Field/ServiceSelect';
import { SupportService } from 'types/buy';
import { Image } from 'components/design-system-ui';
import { ImageLogosMap } from 'assets/logo';

interface Props {
  items: ServiceItem[];
  serviceRef?: React.MutableRefObject<ModalRef | undefined>;
  disabled?: boolean;
  onPressItem: (currentValue: SupportService) => void;
  selectedService?: string;
}

export interface SelectModalItem extends Record<string, any> {
  disabled?: boolean;
}

export interface ServiceItem extends SelectModalItem {
  key: SupportService;
  name: string;
}

export const baseServiceItems: ServiceItem[] = [
  {
    key: 'transak',
    name: 'Transak',
    disabled: false,
  },
  {
    key: 'banxa',
    name: 'Banxa',
    disabled: false,
  },
  {
    key: 'coinbase',
    name: 'Coinbase Pay',
    disabled: false,
  },
  {
    key: 'meld',
    name: 'Meld',
    disabled: false,
  },
  {
    key: 'moonpay',
    name: 'MoonPay (Coming soon)',
    disabled: true,
  },
];

const filterFunction = (items: ServiceItem[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.name.toLowerCase().includes(lowerCaseSearchString));
};

export const ServiceModal = ({ serviceRef, disabled, onPressItem, selectedService, items }: Props) => {
  const selectedValue = useMemo(() => {
    return baseServiceItems.find(ser => ser.key === selectedService);
  }, [selectedService]);

  const renderItem = ({ item }: ListRenderItemInfo<ServiceItem>) => {
    return (
      <ServiceSelectItem
        disabled={item.disabled}
        logo={<Image src={ImageLogosMap[item.key]} style={{ width: 24, height: 24 }} />}
        serviceName={item.name}
        onPressItem={() => onPressItem(item.key)}
      />
    );
  };

  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={{}}
      title={i18n.title.serviceSelect}
      renderCustomItem={renderItem}
      searchFunc={filterFunction}
      closeModalAfterSelect={false}
      selectModalType={'single'}
      disabled={disabled}
      renderSelected={() => (
        <ServiceSelectField
          source={selectedValue ? ImageLogosMap[selectedValue.key] : ''}
          serviceName={selectedValue ? selectedValue.name : ''}
          value={selectedService || ''}
          showIcon
        />
      )}
      ref={serviceRef}
    />
  );
};
