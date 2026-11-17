import { ResourceItem } from "../../types/ComponentStatesResponse";

export function createResourceHelpers(resources: ResourceItem[]) {
  const getText = (id: string): string =>
    resources.find((r) => r.resource_id === id)?.text || "";

  const getDisable = (id: string): boolean =>
    resources.find((r) => r.resource_id === id)?.disabled === "Y";

  return { getText, getDisable };
}
