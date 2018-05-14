import * as lodash from 'lodash';

/**
 Returns the UpperCamelCase form of a string.
 ```javascript
 'innerHTML'.classify();          // 'InnerHTML'
 'action_name'.classify();        // 'ActionName'
 'css-class-name'.classify();     // 'CssClassName'
 'my favorite items'.classify();  // 'MyFavoriteItems'
 ```
 */
export function classify(str: string): string {
    return str.split('.').map(part => lodash.upperFirst(lodash.camelCase(part))).join('.');
  }