import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { useFormContext } from 'react-hook-form';

interface NameAndTelephoneProps {
  fullName?: string;
  telephone?: string;
  getFieldName?: (fieldName: string) => string;
}
export function NameAndTelephone({
  fullName,
  telephone,
  getFieldName
}: NameAndTelephoneProps) {
  const { register } = useFormContext();
  const fullNameField = getFieldName ? getFieldName('full_name') : 'full_name';
  const telephoneField = getFieldName ? getFieldName('telephone') : 'telephone';

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="baghel-native-field">
        <label>
          {_('Full name')} <span>*</span>
        </label>
        <input
          type="text"
          placeholder={_('Full name')}
          defaultValue={fullName}
          {...register(fullNameField, {
            required: _('Full name is required')
          })}
        />
      </div>
      <div className="baghel-native-field">
        <label>
          {_('Mobile')} <span>*</span>
        </label>
        <input
          type="tel"
          placeholder={_('Mobile number')}
          defaultValue={telephone}
          {...register(telephoneField, {
            required: _('Mobile number is required')
          })}
        />
      </div>
    </div>
  );
}
