import { useState, type ImgHTMLAttributes } from 'react';

const RESPALDO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef1f5"/><path d="M140 170 200 120l60 50v50H140z" fill="#c9d1dc"/><rect x="185" y="185" width="30" height="35" fill="#eef1f5"/></svg>',
  );

/** Imagen con respaldo si la foto no carga (por ejemplo, sin conexión). */
export function Img(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = useState(false);
  return <img loading="lazy" {...props} src={error || !props.src ? RESPALDO : props.src} onError={() => setError(true)} />;
}
