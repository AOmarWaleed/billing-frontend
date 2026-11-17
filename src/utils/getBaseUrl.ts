// export function getBaseUrl(url: string) {
//   if (url.startsWith("/")) {
//     url = url.replace("/", "");
//   }
//   return `/${location.pathname.split("/")[1]}/${url}`;
// }



export function getBaseUrl(url: string) {
  if (url) {
    return url;
  }
  return "/api/";
}