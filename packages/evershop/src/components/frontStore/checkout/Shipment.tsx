import Area from '@components/common/Area.js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import {
  useCartDispatch,
  useCartState
} from '@components/frontStore/cart/CartContext.js';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/frontStore/checkout/CheckoutContext.js';
import { ShippingMethods } from '@components/frontStore/checkout/shipment/ShippingMethods.js';
import CustomerAddressForm from '@components/frontStore/customer/address/addressForm/Index.js';
import {
  ExtendedCustomerAddress,
  useCustomer
} from '@components/frontStore/customer/CustomerContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { CustomerAddressGraphql } from '@evershop/evershop/types/customerAddress';
import { MapPin } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

const getAddressKey = (
  address?: CustomerAddressGraphql & {
    addressId?: string | number;
  }
) => String(address?.addressId || address?.uuid || '');

const toCheckoutAddress = (address: CustomerAddressGraphql) => ({
  full_name: address.fullName || '',
  telephone: address.telephone || '',
  address_1: address.address1 || '',
  address_2: address.address2 || '',
  city: address.city || '',
  country: address.country?.code || 'IN',
  province: address.province?.code || '',
  postcode: address.postcode || ''
});

export function Shipment() {
  const {
    data: {
      shippingAddress,
      noShippingRequired,
      availableShippingMethods,
      shippingMethod: selectedShippingMethod
    },
    loadingStates: { fetchingShippingMethods }
  } = useCartState();

  const {
    addShippingAddress,
    addShippingMethod,
    fetchAvailableShippingMethods
  } = useCartDispatch();
  const { form } = useCheckout();
  const { updateCheckoutData } = useCheckoutDispatch();

  // Use useWatch for better performance and cleaner code
  const watchedShippingAddress = useWatch({
    control: form.control,
    name: 'shippingAddress'
  });

  const dirtyFields = form.formState.dirtyFields;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchParamsRef = useRef<{
    country?: string;
    province?: string;
    postcode?: string;
  } | null>(
    // Initialize with current shipping address if available
    shippingAddress
      ? {
          country: shippingAddress.country?.code,
          province: shippingAddress.province?.code,
          postcode: shippingAddress.postcode || undefined
        }
      : null
  );
  const { customer } = useCustomer();
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState('');
  const savedAddresses = customer?.addresses || [];
  const defaultSavedAddress = useMemo(
    () =>
      savedAddresses.find((address) => address.isDefault) || savedAddresses[0],
    [savedAddresses]
  );
  const selectedSavedAddress = useMemo(() => {
    if (!savedAddresses.length) {
      return undefined;
    }
    return (
      savedAddresses.find(
        (address) => getAddressKey(address) === selectedSavedAddressId
      ) || defaultSavedAddress
    );
  }, [defaultSavedAddress, savedAddresses, selectedSavedAddressId]);
  const activeAddress = shippingAddress || selectedSavedAddress;
  const activeAddressKey =
    shippingAddress?.uuid ||
    (selectedSavedAddress ? getAddressKey(selectedSavedAddress) : 'empty');

  const applySavedAddress = async (
    address: ExtendedCustomerAddress,
    showToast = false
  ) => {
    const checkoutAddress = toCheckoutAddress(address);
    setSelectedSavedAddressId(getAddressKey(address));
    form.setValue('shippingAddress', checkoutAddress, {
      shouldDirty: true,
      shouldValidate: true
    });
    updateCheckoutData({ shippingAddress: checkoutAddress });

    if (checkoutAddress.country) {
      lastFetchParamsRef.current = {
        country: checkoutAddress.country,
        province: checkoutAddress.province,
        postcode: checkoutAddress.postcode || undefined
      };
      await fetchAvailableShippingMethods({
        country: checkoutAddress.country,
        province: checkoutAddress.province,
        postcode: checkoutAddress.postcode || undefined
      });
    }

    if (showToast) {
      toast.success(_('Saved address applied to checkout'));
    }
  };

  useEffect(() => {
    if (noShippingRequired || shippingAddress || !selectedSavedAddress) {
      return;
    }

    applySavedAddress(selectedSavedAddress).catch((error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : _('Failed to apply saved address')
      );
    });
  }, [noShippingRequired, shippingAddress, selectedSavedAddress]);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const country = form.getValues('shippingAddress.country');
        const province = form.getValues('shippingAddress.province');
        const postcode = form.getValues('shippingAddress.postcode');

        if (!country) {
          return;
        }

        // Check if parameters have actually changed
        const currentParams = { country, province, postcode };
        const lastParams = lastFetchParamsRef.current;

        if (
          lastParams &&
          lastParams.country === country &&
          lastParams.province === province &&
          lastParams.postcode === postcode
        ) {
          // Parameters haven't changed, skip API call
          return;
        }

        // Cache the current parameters
        lastFetchParamsRef.current = currentParams;

        await fetchAvailableShippingMethods({ country, province, postcode });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : _('Failed to update shipment')
        );
      }
    };

    if (!noShippingRequired && watchedShippingAddress && dirtyFields.shippingAddress) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        fetchShippingMethods();
      }, 800);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [noShippingRequired, watchedShippingAddress, dirtyFields.shippingAddress]);

  // Early return if no shipping is required
  if (noShippingRequired) {
    return null;
  }

  const updateShipment = async (method: { code: string; name: string }) => {
    try {
      const validate = await form.trigger('shippingAddress');
      if (!validate) {
        return false;
      }
      const shippingAddress = form.getValues('shippingAddress');

      await addShippingAddress(shippingAddress);
      await addShippingMethod(method.code, method.name);
      updateCheckoutData({ shippingAddress, shippingMethod: method.code });
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : _('Failed to update shipment')
      );
      return false;
    }
  };

  return (
    <>
      <Area id="checkoutShipmentBefore" />
      <div className="checkout__shipment space-y-6 mt-6">
        <Card className="transition-all overflow-hidden duration-200">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{_('Shipping Address')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedAddresses.length > 0 && (
              <div className="baghel-checkout-saved-addresses">
                <div className="baghel-checkout-saved-addresses__top">
                  <div>
                    <span>{_('Saved address')}</span>
                    <strong>{_('Use address from your account')}</strong>
                  </div>
                  <select
                    value={
                      selectedSavedAddress
                        ? getAddressKey(selectedSavedAddress)
                        : ''
                    }
                    onChange={(event) => {
                      const address = savedAddresses.find(
                        (item) => getAddressKey(item) === event.target.value
                      );
                      if (address) {
                        applySavedAddress(address, true);
                      }
                    }}
                  >
                    {savedAddresses.map((address) => (
                      <option key={getAddressKey(address)} value={getAddressKey(address)}>
                        {[
                          address.fullName,
                          address.city,
                          address.province?.name
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSavedAddress && (
                  <div className="baghel-checkout-saved-addresses__preview">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <strong>{selectedSavedAddress.fullName}</strong>
                      <span>
                        {[
                          selectedSavedAddress.address1,
                          selectedSavedAddress.address2,
                          selectedSavedAddress.city,
                          selectedSavedAddress.province?.name,
                          selectedSavedAddress.postcode
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <CustomerAddressForm
              key={activeAddressKey}
              areaId="checkoutShippingAddressForm"
              fieldNamePrefix="shippingAddress"
              address={activeAddress}
            />
          </CardContent>
        </Card>
        <Area id="checkoutShippingMethodsBefore" noOuter />
        <ShippingMethods
          methods={availableShippingMethods?.map((method) => ({
            ...method,
            isSelected: method.code === selectedShippingMethod
          }))}
          shippingAddress={activeAddress}
          onSelect={updateShipment}
          isLoading={fetchingShippingMethods}
        />
        <Area id="checkoutShippingMethodsAfter" noOuter />
      </div>
      <Area id="checkoutShipmentAfter" />
    </>
  );
}
