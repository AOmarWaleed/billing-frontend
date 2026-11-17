import api from "../../utils/Api";
import { LimitCategoryPayload, Package, PackageResponse } from "../../types/PackageSetup";

const PackageSetupService = {
  getPackages: (params: { page?: number; limit?: number; sortField?: string; sortOrder?: string; searchField?: string }) => {
    return api.get<PackageResponse>("/api/package/new", { params });
  },
  getDeps: () => {
    return api.get<PackageResponse>("/api/package/deps");
  },
  getPackageById(packageId: string | number) {
    return api.get(`/api/package/${packageId}`);
  },
  createPackage: (packageData: Partial<Package>) => {
    return api.post<Package>("/api/package", packageData);
  },

  updatePackage: (packageId: string, packageData: Partial<Package>) => {
    return api.put<Package>(`/api/package/${packageId}`, packageData);
  },

  deleteParentPackage: (packageId: string) => {
    return api.delete(`/api/package/parent/${packageId}`);
  },

  deleteChildPackage: (packageId: string) => {
    return api.delete(`/api/package/child/${packageId}`);
  },

  getCodeDataListByCodeType: (id: string | number) => {
    return api.get(`/api/codedata/code/list/${id}`);
  },
  // PackageSetupService.ts
  limitItemInPackage(packageData: Partial<Package>) {
    return api.post(`/api/package/items/limit`, packageData);
  },
  excludeItemFromPackage(packageData: Partial<Package>) {
    return api.post(`api/package/items/exclude`, packageData);
  },

  limitCategoryInPackageService(packageData: any) {
    return api.post(`/api/package/items/limit-category`, packageData);
  },

  updateItemService(packageData: any) {
    return api.put(`/api/package/items/update`, packageData);
  },
};
export default PackageSetupService;
