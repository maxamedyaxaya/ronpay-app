// Lets TypeScript understand `import logo from './logo.png'` (Metro bundles the image).
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';
  const source: ImageSourcePropType;
  export default source;
}
