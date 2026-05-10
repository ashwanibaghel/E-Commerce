import Area from '@components/common/Area.js';
import {
  useCustomer,
  useCustomerDispatch
} from '@components/frontStore/customer/CustomerContext.jsx';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import React from 'react';
import { toast } from 'react-toastify';

interface AccountInfoProps {
  title?: string;
  showLogout?: boolean;
}
export default function AccountInfo({ title, showLogout }: AccountInfoProps) {
  const { customer: account } = useCustomer();
  const { logout } = useCustomerDispatch();
  return (
    <div className="account__details baghel-account-card">
      <div className="baghel-account-card__header">
        <div>
          <span>Profile</span>
          {title && <h2>{title}</h2>}
        </div>
        {showLogout && (
          <a
            className="baghel-account-logout"
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              try {
                await logout();
                window.location.href = '/';
              } catch (error) {
                toast.error(error.message);
              }
            }}
          >
            <LogOut size={16} />
            {_('Logout')}
          </a>
        )}
      </div>
      <div className="baghel-account-avatar">
        <div>{account?.fullName?.slice(0, 1).toUpperCase() || 'B'}</div>
        <strong>{account?.fullName}</strong>
        <span>Baghel Digital customer</span>
      </div>
      <div className="baghel-account-info-list">
        <Area
          id="accountDetails"
          coreComponents={[
            {
              component: {
                default: (
                  <div className="account__details__name">
                    <User width={18} height={18} />
                    <span>{account?.fullName}</span>
                  </div>
                )
              },
              sortOrder: 10
            },
            {
              component: {
                default: () => (
                  <div className="account__details__email">
                    <Mail width={18} height={18} />
                    <span>{account?.email}</span>
                  </div>
                )
              },
              sortOrder: 15
            }
          ]}
        />
        <div className="baghel-account-secure-note">
          <ShieldCheck size={18} />
          <span>Saved securely for faster checkout and order tracking.</span>
        </div>
      </div>
    </div>
  );
}
