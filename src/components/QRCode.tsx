import { SVG } from '@/assets';
import QRCodeStyling from 'qr-code-styling';
import { FC, useEffect, useRef, useState } from 'react';

interface QRCodeProps {
  className?: string;
  width?: number;
  height?: number;
  data: string;
}

const QRCode: FC<QRCodeProps> = ({ data, className, width, height }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [qrCode] = useState(
    new QRCodeStyling({
      width: width || 248,
      height: height || 248,
      type: 'canvas',
      image: SVG.USDT,
      imageOptions: { imageSize: 0.2, margin: 4, crossOrigin: 'anonymous' },
      dotsOptions: { type: 'rounded', color: '#E5E7EB' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#60A5FA' },
      cornersDotOptions: { type: 'dot', color: '#93C5FD' },
      backgroundOptions: { color: 'transparent' },
      data,
    })
  );

  useEffect(() => {
    if (qrCodeRef.current) {
      qrCode.append(qrCodeRef.current);
    }
  }, [qrCode]);

  useEffect(() => {
    qrCode.update({
      data,
      width: width || 248,
      height: height || 248,
    });
  }, [data, width, height]);

  return <div ref={qrCodeRef} className={className}></div>;
};

export default QRCode;
