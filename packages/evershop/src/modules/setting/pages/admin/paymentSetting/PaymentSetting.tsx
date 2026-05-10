import { SettingMenu } from '@components/admin/SettingMenu.js';
import Area from '@components/common/Area.js';
import { Form } from '@components/common/form/Form.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import React from 'react';

interface PaymentSettingProps {
  saveSettingApi: string;
}

export default function PaymentSetting({
  saveSettingApi
}: PaymentSettingProps) {
  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-5 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4">
          <Form
            id="paymentSettingForm"
            method="POST"
            action={saveSettingApi}
            successMessage="Payment setting saved"
          >
            <Card className="baghel-admin-card">
              <CardHeader>
                <CardTitle>Online Payment Gateway</CardTitle>
                <CardDescription>
                  Coming soon. Stripe and PayPal will be added after client approval.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5">
                  <strong>Coming soon</strong>
                  <p className="mt-1 text-sm text-muted-foreground">
                    For this demo, Cash on Delivery stays active and online
                    gateway setup is intentionally hidden.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Area id="paymentSetting" className="grid gap-5" />
          </Form>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    saveSettingApi: url(routeId: "saveSetting")
  }
`;
