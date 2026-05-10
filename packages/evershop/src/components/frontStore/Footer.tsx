import Area from '@components/common/Area.js';
import { Toaster } from '@components/common/ui/Sonner.js';
import React from 'react';

interface FooterProps {
  copyRight: string;
}

export function Footer({ copyRight }: FooterProps) {
  return (
    <footer className="footer baghel-footer mt-24">
      <Area id="footerTop" className="footer__top" />
      <div className="footer__middle flex justify-between items-center">
        <Area id="footerMiddleLeft" className="footer__middle__left" />
        <Area id="footerMiddleCenter" className="footer__middle__center" />
        <Area id="footerMiddleRight" className="footer__middle__right" />
      </div>
      <Area
        id="footerBottom"
        className="footer__bottom"
        coreComponents={[
          {
            component: {
              default: (
                <div className="page-width baghel-footer__grid">
                  <div>
                    <div className="baghel-footer__brand">Baghel Digital</div>
                    <p>
                      Premium electronics, smart gadgets and reliable local
                      service for every modern setup.
                    </p>
                  </div>
                  <div className="baghel-footer__badges">
                    <span>Cash on Delivery</span>
                    <span>Best Deal Promise</span>
                    <span>Local Support</span>
                  </div>
                  <div className="copyright text-textSubdued">
                    <span>{copyRight}</span>
                  </div>
                </div>
              )
            },
            sortOrder: 10
          }
        ]}
      />
      <Toaster />
    </footer>
  );
}
