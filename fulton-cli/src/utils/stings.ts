import * as lodash from 'lodash';

/**
 Returns the UpperCamelCase form of a string.
 ```typescript
 classify('innerHTML');          // 'InnerHTML'
 classify('action_name');        // 'ActionName'
 classify('css-class-name');     // 'CssClassName'
 classify('my favorite items');  // 'MyFavoriteItems'
 ```
 */
export function classify(str: string): string {
  return str.split('.').map(part => lodash.upperFirst(lodash.camelCase(part))).join('.');
}

/**
 normalize input to the filename with path
 ```typescript
 normalizeFilename("MyRouter") // ["my-router"]
 normalizeFilename("my-router") // ["my-router"]
 normalizeFilename("my_router") // ["my_router"]
 normalizeFilename("folder/my-router") // ["folder", "my-router"]
 normalizeFilename("folder\my-router") // ["folder", "my-router"]
 ```
 */
export function normalizeFilename(str: string): string[] {
  let result = pathToArray(str);
  let name = result[result.length - 1];

  result[result.length - 1] = lodash.kebabCase(name)

  return result;
}

export function pathToArray(str: string): string[] {
  return str.split(/[/\\]/);;
}