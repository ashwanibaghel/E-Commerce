import Area from '@components/common/Area.js';
import { InputField } from '@components/common/form/InputField.js';
import { NameAndTelephone } from '@components/frontStore/customer/address/addressForm/NameAndTelephone.js';
import { ProvinceAndPostcode } from '@components/frontStore/customer/address/addressForm/ProvinceAndPostcode.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { CustomerAddressGraphql } from '@evershop/evershop/types/customerAddress';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const INDIA_PROVINCES = [
  { value: 'IN-AP', label: 'Andhra Pradesh' },
  { value: 'IN-AR', label: 'Arunachal Pradesh' },
  { value: 'IN-AS', label: 'Assam' },
  { value: 'IN-BR', label: 'Bihar' },
  { value: 'IN-CT', label: 'Chhattisgarh' },
  { value: 'IN-GA', label: 'Goa' },
  { value: 'IN-GJ', label: 'Gujarat' },
  { value: 'IN-HR', label: 'Haryana' },
  { value: 'IN-HP', label: 'Himachal Pradesh' },
  { value: 'IN-JH', label: 'Jharkhand' },
  { value: 'IN-KA', label: 'Karnataka' },
  { value: 'IN-KL', label: 'Kerala' },
  { value: 'IN-MP', label: 'Madhya Pradesh' },
  { value: 'IN-MH', label: 'Maharashtra' },
  { value: 'IN-MN', label: 'Manipur' },
  { value: 'IN-ML', label: 'Meghalaya' },
  { value: 'IN-MZ', label: 'Mizoram' },
  { value: 'IN-NL', label: 'Nagaland' },
  { value: 'IN-OR', label: 'Odisha' },
  { value: 'IN-PB', label: 'Punjab' },
  { value: 'IN-RJ', label: 'Rajasthan' },
  { value: 'IN-SK', label: 'Sikkim' },
  { value: 'IN-TN', label: 'Tamil Nadu' },
  { value: 'IN-TG', label: 'Telangana' },
  { value: 'IN-TR', label: 'Tripura' },
  { value: 'IN-UP', label: 'Uttar Pradesh' },
  { value: 'IN-UT', label: 'Uttarakhand' },
  { value: 'IN-WB', label: 'West Bengal' },
  { value: 'IN-AN', label: 'Andaman and Nicobar Islands' },
  { value: 'IN-CH', label: 'Chandigarh' },
  { value: 'IN-DH', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'IN-DL', label: 'Delhi' },
  { value: 'IN-JK', label: 'Jammu and Kashmir' },
  { value: 'IN-LA', label: 'Ladakh' },
  { value: 'IN-LD', label: 'Lakshadweep' },
  { value: 'IN-PY', label: 'Puducherry' }
];

interface CustomerAddressFormProps {
  allowCountries: {
    value: string;
    label: string;
    provinces: {
      value: string;
      label: string;
    }[];
  }[];
  address?: CustomerAddressGraphql;
  areaId?: string;
  fieldNamePrefix?: string;
}
export function CustomerAddressForm({
  address = {},
  areaId = 'customerAddressForm',
  fieldNamePrefix = 'address'
}: CustomerAddressFormProps) {
  const { register, setValue } = useFormContext();

  const getFieldName = (fieldName: string) => {
    return fieldNamePrefix ? `${fieldNamePrefix}.${fieldName}` : fieldName;
  };
  const countryFieldName = getFieldName('country');

  React.useEffect(() => {
    setValue(countryFieldName, 'IN');
  }, [countryFieldName, setValue]);

  return (
    <Area
      id={areaId}
      className="space-y-3"
      coreComponents={[
        {
          component: {
            default: (
              <NameAndTelephone
                fullName={address?.fullName || ''}
                telephone={address?.telephone || ''}
                getFieldName={getFieldName}
              />
            )
          },
          sortOrder: 10
        },
        {
          component: {
            default: (
              <InputField
                name={getFieldName('address_1')}
                label={_('Address')}
                placeholder={_('Address')}
                defaultValue={address?.address1 || ''}
                required
                validation={{
                  required: _('Address is required')
                }}
              />
            )
          },
          sortOrder: 20
        },
        {
          component: {
            default: (
              <InputField
                name={getFieldName('address_2')}
                label={_('Address 2')}
                placeholder={_('Address 2')}
                defaultValue={address?.address2 || ''}
              />
            )
          },
          sortOrder: 30
        },
        {
          component: {
            default: (
              <InputField
                name={getFieldName('city')}
                label={_('City')}
                placeholder={_('City')}
                required
                validation={{ required: _('City is required') }}
                defaultValue={address?.city || ''}
              />
            )
          },
          sortOrder: 40
        },
        {
          component: {
            default: (
              <div className="baghel-fixed-country">
                <label>
                  {_('Country')} <span>*</span>
                </label>
                <input
                  type="hidden"
                  defaultValue="IN"
                  {...register(countryFieldName, {
                    required: _('Country is required')
                  })}
                />
                <div>India</div>
              </div>
            )
          },
          sortOrder: 50
        },
        {
          component: {
            default: (
              <ProvinceAndPostcode
                key="IN"
                provinces={INDIA_PROVINCES}
                province={address?.province || { code: '' }}
                postcode={address?.postcode || ''}
                getFieldName={getFieldName}
              />
            )
          },
          sortOrder: 60
        }
      ]}
    />
  );
}
