import Area from '@components/common/Area.js';
import { Editor } from '@components/common/Editor.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import { getProductDetails } from '@components/frontStore/catalog/productDetails.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export const ProductSingleDescription = () => {
  const product = useProduct();
  const { description } = product;
  const details = getProductDetails(product);

  return (
    <>
      <Area id="productDescriptionBefore" noOuter />
      <section className="product__single__description baghel-product-details mt-8">
        <div className="baghel-product-details__header">
          <p>Buying details customers check</p>
          <h2>{_('Product Details')}</h2>
        </div>

        <div className="baghel-product-details__grid">
          <div className="baghel-product-details__description">
            <h3>{_('Overview')}</h3>
            <Editor rows={description} />
          </div>

          <div className="baghel-product-details__box">
            <h3>What is in the box</h3>
            <ul>
              {details.box.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="baghel-spec-table">
          <h3>Technical Specifications</h3>
          <div>
            {details.specs.map((spec) => (
              <div className="baghel-spec-table__row" key={spec.label}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="baghel-service-notes">
          {details.service.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      </section>
      <Area id="productDescriptionAfter" noOuter />
    </>
  );
};
