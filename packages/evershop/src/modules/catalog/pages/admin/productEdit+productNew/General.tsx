import { CategorySelector } from '@components/admin/CategorySelector.js';
import Area from '@components/common/Area.js';
import { Editor } from '@components/common/form/Editor.js';
import { InputField } from '@components/common/form/InputField.js';
import { NumberField } from '@components/common/form/NumberField.js';
import { SelectField } from '@components/common/form/SelectField.js';
import { TextareaField } from '@components/common/form/TextareaField.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@components/common/ui/Dialog.js';
import { Label } from '@components/common/ui/Label.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { useQuery } from 'urql';
import './General.scss';
import { useFormContext } from 'react-hook-form';

const SKUAndPrice: React.FC<{
  sku: string;
  price: {
    value: number | undefined;
  };
  setting: {
    storeCurrency: string;
    weightUnit: string;
  };
}> = ({ sku, price, setting }) => {
  if (!sku) {
    return (
      <NumberField
        name="price"
        placeholder="Example: 24999"
        label="Selling Price"
        defaultValue={price?.value}
        unit={setting.storeCurrency}
        min={0}
        required
        helperText="SKU will be generated automatically."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <InputField
        name="sku"
        label="SKU"
        placeholder="Enter SKU"
        defaultValue={sku}
        required
        helperText={_('SKU must be unique')}
      />
      <NumberField
        name="price"
        placeholder="Enter price"
        label={`Price`}
        defaultValue={price?.value}
        unit={setting.storeCurrency}
        min={0}
        required
      />
    </div>
  );
};

const CategoryQuery = `
  query Query ($id: Int!) {
    category(id: $id) {
      categoryId
      name
      path {
        name
      }
    }
  }
`;

const ProductCategory: React.FC<{
  categoryId: number;
  onChange: () => void;
  onUnassign: () => void;
}> = ({ categoryId, onChange, onUnassign }) => {
  const { register } = useFormContext();
  const [result] = useQuery({
    query: CategoryQuery,
    variables: {
      id: categoryId
    }
  });
  const { data, fetching, error } = result;
  if (error) {
    return (
      <p className="text-destructive">
        There was an error fetching categories.
        {error.message}
      </p>
    );
  }
  if (fetching) {
    return <span>Loading...</span>;
  }
  return (
    <div>
      {data.category.path.map((item, index) => (
        <span key={item.name} className="text-gray-500">
          {item.name}
          {index < data.category.path.length - 1 && ' > '}
        </span>
      ))}
      <span className="text-interactive pl-5">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onChange();
          }}
        >
          Change
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onUnassign();
          }}
          className="text-destructive ml-5"
        >
          Unassign
        </a>
      </span>
      <input type="hidden" {...register('category_id')} value={categoryId} />
    </div>
  );
};

const CategorySelect: React.FC<{
  product?:
    | {
        category?: {
          categoryId: number;
          name?: string;
          path?: Array<{ name: string }>;
        };
      }
    | undefined;
}> = ({ product }) => {
  const { setValue } = useFormContext();
  const [category, setCategory] = React.useState(
    product ? product.category : null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const onSelect = (categoryId) => {
    setCategory({ categoryId });
    setValue('category_id', categoryId || '');
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="space-y-3">
        <Label>Category</Label>
        {category && (
          <div className="border rounded border-border p-2">
            <ProductCategory
              categoryId={category.categoryId}
              onChange={() => {
                setDialogOpen(true);
              }}
              onUnassign={() => {
                setCategory(null);
                setValue('category_id', '');
              }}
            />
          </div>
        )}
        {!category && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
          >
            Select category
          </Button>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Category</DialogTitle>
          </DialogHeader>
          <CategorySelector
            onSelect={onSelect}
            onUnSelect={() => {}}
            selectedCategories={category ? [category] : []}
          />
        </DialogContent>
      </div>
    </Dialog>
  );
};

interface GeneralProps {
  product?: {
    description?: Array<{
      id: string;
      size: number;
      columns: Array<{
        id: string;
        size: number;
        data: object;
      }>;
    }>;
    name: string;
    price: {
      regular: {
        currency: string;
        value: number;
      };
    };
    productId: number;
    uuid: string;
    taxClass: number;
    sku: string;
    weight: {
      unit: string;
      value: number;
    };
    category?: {
      categoryId: number;
      name?: string;
      path?: Array<{ name: string }>;
    };
  };
  setting: {
    storeCurrency: string;
    weightUnit: string;
  };
  productTaxClasses: {
    items: Array<{
      value: number;
      text: string;
    }>;
  };
}
export default function General({
  product,
  setting,
  productTaxClasses: { items: taxClasses }
}: GeneralProps) {
  const isNewProduct = !product;

  return (
    <Card className={isNewProduct ? 'baghel-product-card' : undefined}>
      <CardHeader>
        <CardTitle>{isNewProduct ? 'Product Details' : 'General Information'}</CardTitle>
        <CardDescription>
          {isNewProduct
            ? 'Add the customer-facing details shown on the product page.'
            : 'Manage the general information of the product.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Area
          id="productEditGeneral"
          className="flex flex-col gap-2"
          coreComponents={[
            {
              component: {
                default: (
                  <InputField
                    name="name"
                    placeholder="Example: Sony 55 inch 4K Smart TV"
                    label="Product Name"
                    defaultValue={product?.name}
                    required
                    helperText={_('Product name is required')}
                  />
                )
              },
              sortOrder: 10,
              id: 'name'
            },
            {
              component: {
                default: (
                  <SKUAndPrice
                    sku={product?.sku || ''}
                    price={
                      product?.price.regular || {
                        value: undefined
                      }
                    }
                    setting={setting}
                  />
                )
              },
              sortOrder: 20,
              id: 'SKUAndPrice'
            },
            {
              component: {
                default: <CategorySelect product={product} />
              },
              sortOrder: 22,
              id: 'category'
            },
            {
              component: {
                default: isNewProduct ? null : (
                  <SelectField
                    name="tax_class"
                    label="Tax Class"
                    options={taxClasses.map((taxClass) => ({
                      value: taxClass.value,
                      label: taxClass.text
                    }))}
                    defaultValue={product?.taxClass || ''}
                    required
                    validation={{ required: true }}
                  />
                )
              },
              sortOrder: 25,
              id: 'tax_class'
            },
            {
              component: {
                default: isNewProduct ? (
                  <TextareaField
                    name="simple_description"
                    label="Overview"
                    placeholder="Example: 55 inch 4K display, Google TV, Dolby Audio, 1 year brand warranty."
                    rows={5}
                    helperText="Short customer-facing summary shown in product details."
                  />
                ) : (
                  <Editor
                    name="description"
                    label="Description"
                    value={product?.description}
                  />
                )
              },
              sortOrder: 30,
              id: 'description'
            },
            {
              component: {
                default: isNewProduct ? (
                  <TextareaField
                    name="highlights"
                    label="Key Highlights"
                    placeholder={'Example:\n55 inch 4K UHD display\nGoogle TV with voice remote\nDolby Audio speakers\n1 year brand warranty'}
                    rows={5}
                    helperText="One highlight per line. These appear near the buy button."
                  />
                ) : null
              },
              sortOrder: 35,
              id: 'highlights'
            },
            {
              component: {
                default: isNewProduct ? (
                  <TextareaField
                    name="specifications"
                    label="Technical Specifications"
                    placeholder={'Example:\nDisplay: 55 inch 4K UHD\nConnectivity: HDMI, USB, Wi-Fi, Bluetooth\nAudio: Dolby Audio speakers\nWarranty: 1 year brand warranty'}
                    rows={6}
                    helperText="Use Label: Value on each line."
                  />
                ) : null
              },
              sortOrder: 40,
              id: 'specifications'
            },
            {
              component: {
                default: isNewProduct ? (
                  <TextareaField
                    name="box_contents"
                    label="Box Contents"
                    placeholder={'Example:\nTV unit\nVoice remote\nTable stand\nPower cable\nWarranty card'}
                    rows={5}
                    helperText="One item per line."
                  />
                ) : null
              },
              sortOrder: 45,
              id: 'box_contents'
            },
            {
              component: {
                default: isNewProduct ? (
                  <InputField
                    name="warranty"
                    label="Warranty / Support"
                    placeholder="Example: 1 year brand warranty with local setup support"
                    defaultValue="1 year standard service support"
                  />
                ) : null
              },
              sortOrder: 50,
              id: 'warranty'
            },
            {
              component: {
                default: isNewProduct ? (
                  <TextareaField
                    name="service_notes"
                    label="Store Service Notes"
                    placeholder={'Example:\nCash on Delivery available on eligible local orders\nQuality checked before dispatch\nLocal setup guidance available'}
                    rows={4}
                    helperText="One service promise per line."
                  />
                ) : null
              },
              sortOrder: 55,
              id: 'service_notes'
            }
          ]}
        />
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 10
};

export const query = `
  query Query {
    product(id: getContextValue("productId", null)) {
      productId
      uuid
      name
      description
      sku
      taxClass
      price {
        regular {
          value
          currency
        }
      }
      weight {
        value
        unit
      }
      category {
        categoryId
        path {
          name
        }
      }
    }
    setting {
      weightUnit
      storeCurrency
    }
    productTaxClasses: taxClasses {
      items {
        value: taxClassId
        text: name
      }
    }
  }
`;
