// Type declarations for Next.js modules
declare module 'next' {
  export type Metadata = any;
  const next: any;
  export default next;
}

declare module 'next/font/google' {
  export function Inter(options?: any): any;
  export function Geist(options?: any): any;
  export function Geist_Mono(options?: any): any;
}

declare module 'next/image' {
  import React from 'react';
  const Image: React.FC<any>;
  export default Image;
}

declare module 'next/headers' {
  export function cookies(): Promise<any>;
  export function headers(): Promise<any>;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function redirect(url: string): never;
}

declare module 'next/link' {
  import React from 'react';
  const Link: React.FC<any>;
  export default Link;
}

declare module 'next/dist/*' {
  const content: any;
  export default content;
}
