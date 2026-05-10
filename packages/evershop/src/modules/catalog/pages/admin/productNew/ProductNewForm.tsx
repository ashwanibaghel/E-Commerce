import { FormButtons } from '@components/admin/FormButtons.js';
import Area from '@components/common/Area.js';
import { Form } from '@components/common/form/Form.js';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const slugify = (value: string | undefined) =>
  (value || 'product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';

const buildSku = (name: string | undefined) => {
  const prefix = slugify(name).replace(/-/g, '').toUpperCase().slice(0, 10);
  return `BD-${prefix || 'ITEM'}-${Date.now().toString().slice(-6)}`;
};

const escapeHtml = (value: string | undefined) =>
  (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const lines = (value: string | undefined) =>
  (value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const specLines = (value: string | undefined) =>
  lines(value).map((line) => {
    const [label, ...rest] = line.split(':');
    return {
      label: (label || 'Specification').trim(),
      value: rest.join(':').trim() || 'As per selected model'
    };
  });

const buildDescriptionRows = (data: Record<string, any>) => {
  const overview = data.simple_description || `${data.name} from Baghel Digital.`;
  const highlights = lines(data.highlights);
  const specs = specLines(data.specifications);
  const box = lines(data.box_contents);
  const service = lines(data.service_notes);
  const warranty = data.warranty || '1 year standard service support';
  const safeOverview = escapeHtml(overview).replace(/\r?\n/g, '<br />');
  const highlightHtml = highlights
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const specsHtml = specs
    .map(
      ({ label, value }) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    )
    .join('');
  const boxHtml = box.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const serviceHtml = service
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const detailData = `
    <div class="baghel-product-data">
      <ul class="baghel-detail-highlights">${highlightHtml}</ul>
      <div class="baghel-detail-specs">${specsHtml}</div>
      <ul class="baghel-detail-box">${boxHtml}</ul>
      <ul class="baghel-detail-service">${serviceHtml}</ul>
      <p class="baghel-detail-warranty">${escapeHtml(warranty)}</p>
    </div>
  `;

  return [
    {
      id: `r__baghel_${Date.now()}`,
      size: 1,
      columns: [
        {
          id: `c__baghel_${Date.now()}`,
          size: 1,
          data: {
            time: Date.now(),
            blocks: [
              {
                id: `b__baghel_${Date.now()}`,
                type: 'raw',
                data: {
                  html: `<p>${safeOverview}</p>${detailData}`
                }
              }
            ],
            version: '2.30.2'
          }
        }
      ]
    }
  ];
};

const normalizeProductData = (data: Record<string, any>) => {
  const name = data.name || 'Baghel Digital Product';
  const simpleDetails = data.simple_description || data.meta_description || '';
  const urlKey = data.url_key || `${slugify(name)}-${Date.now().toString().slice(-6)}`;

  return {
    ...data,
    name,
    description: buildDescriptionRows({ ...data, name }),
    sku: data.sku || buildSku(name),
    url_key: urlKey,
    meta_title: data.meta_title || name,
    meta_description: data.meta_description || simpleDetails || name,
    price: data.price || 0,
    qty: data.qty || 10,
    weight: data.weight || 1,
    status: data.status ?? 1,
    visibility: data.visibility ?? 1,
    manage_stock: data.manage_stock ?? 1,
    stock_availability: data.stock_availability ?? 1,
    group_id: data.group_id || 1,
    tax_class: data.tax_class || null,
    attributes: data.attributes || [],
    highlights: undefined,
    specifications: undefined,
    box_contents: undefined,
    warranty: undefined,
    service_notes: undefined
  };
};

export default function ProductNewForm({
  action,
  gridUrl
}: {
  action: string;
  gridUrl: string;
}) {
  const form = useForm({
    shouldUnregister: true
  });
  const submit: SubmitHandler<any> = async (data) => {
    try {
      const payload = normalizeProductData(data);
      const images = (data.images || []).map(
        (image: { uuid: string; url: string }) => image.url
      );
      payload.images = images;
      const response = await fetch(action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          action: undefined,
          method: undefined,
          simple_description: undefined
        })
      });
      const result = await response.json();
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Product created successfully');
        const editUrl = result.data.links.find(
          (link) => link.rel === 'edit'
        ).href;
        setTimeout(() => {
          window.location.href = editUrl;
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <Form
      id="productNewForm"
      method="POST"
      action={action}
      form={form}
      onSubmit={submit}
      submitBtn={false}
    >
      <div className="baghel-simple-product-form grid grid-cols-3 gap-x-5 grid-flow-row ">
        <div className="col-span-2 grid grid-cols-1 gap-5 auto-rows-max">
          <Area id="leftSide" noOuter />
        </div>
        <div className="col-span-1 grid grid-cols-1 gap-5 auto-rows-max">
          <Area id="rightSide" noOuter />
        </div>
      </div>
      <FormButtons formId="productNewForm" cancelUrl={gridUrl} />
    </Form>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    action: url(routeId: "createProduct"),
    gridUrl: url(routeId: "productGrid")
  }
`;
