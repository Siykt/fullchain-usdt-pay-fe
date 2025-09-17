declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.ComponentProps<'svg'> & { title?: string; titleId?: string; desc?: string; descId?: string }
  >;

  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
}
