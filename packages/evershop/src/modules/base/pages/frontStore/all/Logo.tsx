import React from 'react';

interface LogoProps {
  themeConfig: {
    logo: {
      src?: string;
      alt?: string;
      width?: number;
      height?: number;
    };
  };
}
export default function Logo({
  themeConfig: {
    logo: { src, alt = 'Baghel Digital', width = 128, height = 128 }
  }
}: LogoProps) {
  return (
    <div className="logo md:ml-0 flex justify-center items-center">
      {src && (
        <a href="/" className="logo-icon">
          <img src={src} alt={alt} width={width} height={height} />
        </a>
      )}
      {!src && (
        <a href="/" className="baghel-logo" aria-label={alt}>
          <span className="baghel-logo__mark">BD</span>
          <span className="baghel-logo__text">
            <span>Baghel</span>
            <span>Digital</span>
          </span>
        </a>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleLeft',
  sortOrder: 1
};

export const query = `
  query query {
    themeConfig {
      logo {
        src
        alt
        width
        height
      }
    }
  }
`;
