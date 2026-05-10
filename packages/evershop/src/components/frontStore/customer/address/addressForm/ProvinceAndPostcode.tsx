import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface ProvinceAndPostcodeProps {
  provinces: {
    value: string;
    label: string;
  }[];
  province?: {
    code: string;
  };
  postcode?: string;
  getFieldName?: (fieldName: string) => string;
}
export function ProvinceAndPostcode({
  provinces,
  province,
  postcode,
  getFieldName
}: ProvinceAndPostcodeProps) {
  const { register } = useFormContext();
  const provinceField = getFieldName ? getFieldName('province') : 'address.province';
  const postcodeField = getFieldName ? getFieldName('postcode') : 'postcode';

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="baghel-native-field">
        <label>
          {_('Province')} <span>*</span>
        </label>
        <select
          defaultValue={province?.code || ''}
          {...register(provinceField, {
            required: _('Province is required')
          })}
        >
          <option value="">{_('Province')}</option>
          {provinces.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="baghel-native-field">
        <label>
          {_('Postcode')} <span>*</span>
        </label>
        <input
          type="text"
          placeholder={_('Postcode')}
          defaultValue={postcode}
          {...register(postcodeField, {
            required: _('Postcode is required')
          })}
        />
      </div>
    </div>
  );
}
