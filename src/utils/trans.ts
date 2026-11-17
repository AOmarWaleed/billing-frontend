interface ContentHelperParams {
  content: any;
  type?: string;
  pageId: number;
  key?: string;
}

export const getContentHelperFun = (params: ContentHelperParams) => {
  const lang = sessionStorage.getItem("lang") || 'en';
  const { content, type = "LABEL", pageId, key = "NOT_PROVIDED" } = params;
  return content?.[pageId]?.[type]?.[key]?.[`${lang}_text`] || key;
};
export const isDisabledHelperFun = (params: ContentHelperParams) => {
  const { content, type = "LABEL", pageId, key = "NOT_PROVIDED" } = params;
  return !!content?.[pageId]?.[type]?.[key]?.disabled;
};
export const isHiddenHelperFun = (params: ContentHelperParams) => {
  const { content, type = "LABEL", pageId, key = "NOT_PROVIDED" } = params;
  return !!content?.[pageId]?.[type]?.[key]?.hidden;
};

export function flattenPages(pages: any[]): any[] {
  const result: any[] = [];
  const walk = (items: any[]) => {
    for (const item of items) {
      if (item.url && item.url !== "/") result.push(item);
      if (item.children) walk(item.children);
    }
  };
  walk(pages);
  return result;
}

export const PAGES = {
  HOME: 1,
  SYSTEM_RULES: 3,
  ITEMS: 5,
  ITEM_PRICES: 6,
  PAYERS: 7,
  CODES: 8,
  USERS: 9,
  PATIENT: 20,
};

const PAGE_NAME_OVERRIDES: Record<string, string> = {
  "/send-feedback": "Feedback",
  "/feedback-admin": "Feedback Admin",
  "/change-password": "Change Password",
  "/home": "Home",
  "/login": "Login",
};

const PAGE_FUNCTION_OVERRIDES: Record<string, number> = {
  "/send-feedback": 46,
  "/feedback-admin": 45,
  "/change-password": 48,
};

function urlToPageName(path: string): string {
  const segment = path.split("/").filter(Boolean).pop() || "";
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function findBestPage(pages: any[], pathname: string): any | undefined {
  const flat = flattenPages(pages);
  let best: any | undefined;
  for (const p of flat) {
    if (
      p.url &&
      p.url !== "/" &&
      (pathname === p.url || pathname.startsWith(p.url + "/")) &&
      (!best || p.url.length > best.url.length)
    ) {
      best = p;
    }
  }
  return best;
}

export function getCurrentPageName(menuPages: any[], pathname: string): string {
  const best = findBestPage(menuPages, pathname);
  if (best?.en_text) return best.en_text;
  return PAGE_NAME_OVERRIDES[pathname] || urlToPageName(pathname);
}

export function getCurrentFunctionId(menuPages: any[], pathname: string): number | undefined {
  const best = findBestPage(menuPages, pathname);
  if (best?.function_id) return best.function_id;
  return PAGE_FUNCTION_OVERRIDES[pathname];
}
