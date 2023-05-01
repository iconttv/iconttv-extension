export function assignDefaults<T>(target: Record<any, any>, defaults: T) {
  for (const key in defaults) {
    if (target[key] === undefined) {
      if (typeof defaults[key] === 'object') {
        target[key] = { ...defaults[key] };
      } else {
        target[key] = defaults[key];
      }
    } else if (typeof target[key] === 'object') {
      target[key] = assignDefaults(target[key], defaults[key]);
    }
  }
  return target;
}
