export function apiUtility(key: any , url: string) {
  return Array.isArray(key) &&
    typeof key[0] === "string" &&
    key[0].includes(url);
}
