import { AddressSummary } from '@components/common/customer/address/AddressSummary.jsx';
import { CheckboxField } from '@components/common/form/CheckboxField.js';
import { Form } from '@components/common/form/Form.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/common/ui/Dialog.js';
import { Item, ItemActions, ItemContent } from '@components/common/ui/Item.js';
import CustomerAddressForm from '@components/frontStore/customer/address/addressForm/Index.js';
import {
  ExtendedCustomerAddress,
  useCustomer,
  useCustomerDispatch
} from '@components/frontStore/customer/CustomerContext.jsx';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { MapPin, Plus } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';

const Address: React.FC<{
  address: ExtendedCustomerAddress;
}> = ({ address }) => {
  const { updateAddress, deleteAddress } = useCustomerDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const classes = address.isDefault ? 'border-2 border-primary' : '';
  return (
    <Item variant={'outline'} className={`${classes}`}>
      <ItemContent>
        <AddressSummary address={address} />
      </ItemContent>
      <ItemActions>
        <div className="flex flex-col items-start gap-1">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                {_('Edit')}
              </Button>
            </DialogTrigger>
            <DialogContent className="baghel-address-dialog">
              <DialogHeader>
                <DialogTitle>{_('Edit Address')}</DialogTitle>
              </DialogHeader>
              <Form
                id="customerAddressForm"
                method="PATCH"
                className="baghel-address-dialog__form"
                submitBtnText={_('Save address')}
                onSubmit={async (data) => {
                  try {
                    await updateAddress(address.addressId, data);
                    setDialogOpen(false);
                    toast.success(_('Address has been updated successfully!'));
                  } catch (error) {
                    toast.error(error.message);
                  }
                }}
              >
                <CustomerAddressForm address={address} fieldNamePrefix="" />
                <div className="mt-3">
                  <CheckboxField
                    label={_('Set as default')}
                    defaultChecked={address.isDefault}
                    name="is_default"
                  />
                </div>
                <div className="baghel-address-dialog__danger">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await deleteAddress(address.addressId);
                        setDialogOpen(false);
                        toast.success(
                          _('Address has been deleted successfully!')
                        );
                      } catch (error) {
                        toast.error(error.message);
                      }
                    }}
                  >
                    {_('Delete address')}
                  </Button>
                </div>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </ItemActions>
    </Item>
  );
};

export function MyAddresses({ title }: { title?: string }) {
  const { customer } = useCustomer();
  const { addAddress } = useCustomerDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  if (!customer) {
    return null;
  }
  return (
    <div className="baghel-account-card baghel-address-card">
      {title && (
        <div className="baghel-account-card__header">
          <div>
            <span>Delivery</span>
            <h2>{_('Address Book')}</h2>
          </div>
          <div className="baghel-account-count">
            <MapPin size={17} />
            {customer.addresses.length}
          </div>
        </div>
      )}
      {customer.addresses.length === 0 && (
        <div className="order-history-empty baghel-empty-state baghel-empty-state--compact">
          <MapPin size={28} />
          <strong>{_('You have no addresses saved')}</strong>
          <span>
            Add a delivery address now so checkout feels quick and polished.
          </span>
        </div>
      )}
      <div className="baghel-address-grid">
        {customer.addresses.map((address) => (
          <Address key={address.uuid} address={address} />
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger>
          <Button
            variant="outline"
            className="baghel-add-address-btn"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Plus size={17} />
            {_('Add new address')}
          </Button>
        </DialogTrigger>
        <DialogContent className="baghel-address-dialog">
          <DialogHeader>
            <DialogTitle>{_('Add new address')}</DialogTitle>
          </DialogHeader>
          <Form
            id="customerAddressForm"
            method={'POST'}
            className="baghel-address-dialog__form"
            submitBtnText={_('Save address')}
            onSubmit={async (data) => {
              try {
                await addAddress(data as ExtendedCustomerAddress);
                setDialogOpen(false);
                toast.success(_('Address has been saved successfully!'));
              } catch (error) {
                toast.error(error.message);
              }
            }}
          >
            <CustomerAddressForm address={undefined} fieldNamePrefix="" />
            <div className="mt-3">
              <CheckboxField
                label={_('Set as default')}
                defaultChecked={false}
                name="is_default"
              />
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
