import React, { useState, useCallback, useMemo, useContext, createContext } from "react";
import api from "../../../utils/Api";

export interface BedClass {
  bed_class_id: number;
  description: string;
  smallest_number_of_hours: number;
  rounding_required: string;
  patient_care_pct: number;
  accumulate_fractions: string;
  fraction_weight_priority: number;
  facility_id: string;
  created_by: string;
  creation_date?: string;
}

export interface BedClassService {
  bed_class_service_id: string;
  bed_class_id: number;
  item_id: string | null;
  payer_id: string | null;
  from_day: number;
  to_day: number;
  time_calculation_basis: string;
  units: number;
}

export interface BedClassMasterWithServices {
  masterData: BedClass;
  servicesData: BedClassService[];
}

interface BedClassContextType {
  // Selected items
  selectedBedClass: BedClass | null;
  selectedBedClassService: BedClassService | null;
  
  // Setters
  setSelectedBedClass: (bedClassData: BedClass | null) => void;
  setSelectedBedClassService: (bedClassServiceData: BedClassService | null) => void;
  
  // Additional utility functions
  clearSelections: () => void;
  clearSelectedBedClass: () => void;
  clearSelectedBedClassService: () => void;
  
  // State management for forms
  isEditingMaster: boolean;
  setIsEditingMaster: (isEditing: boolean) => void;
  isEditingService: boolean;
  setIsEditingService: (isEditing: boolean) => void;
  
  // Form data for create/update
  masterFormData: Partial<BedClass>;
  setMasterFormData: (data: Partial<BedClass>) => void;
  serviceFormData: Partial<BedClassService>;
  setServiceFormData: (data: Partial<BedClassService>) => void;
  
  // Reset form data
  resetMasterForm: () => void;
  resetServiceForm: () => void;
  
  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Dialog visibility states
  isMasterDialogOpen: boolean;
  setIsMasterDialogOpen: (isOpen: boolean) => void;
  isServiceDialogOpen: boolean;
  setIsServiceDialogOpen: (isOpen: boolean) => void;
  isMasterWithServicesDialogOpen: boolean;
  setIsMasterWithServicesDialogOpen: (isOpen: boolean) => void;
  
  // API functions
  fetchMasterData: (params?: any) => Promise<any>;
  fetchServicesData: (params?: any) => Promise<any>;
  addMaster: (data: Omit<BedClass, 'bed_class_id' | 'creation_date'>) => Promise<any>;
  updateMaster: (bedClassId: number, data: Partial<BedClass>) => Promise<any>;
  deleteMaster: (bedClassId: number) => Promise<any>;
  addService: (data: Omit<BedClassService, 'bed_class_service_id'>) => Promise<any>;
  updateService: (serviceId: string, data: Partial<BedClassService>) => Promise<any>;
  deleteService: (serviceId: string) => Promise<any>;
  addMasterWithServices: (data: BedClassMasterWithServices) => Promise<any>;
  
  // Table params
  tableParams: any;
  setTableParams: (params: any) => void;

//   masterTableRef: React.RefObject<any>;
    masterTableRef: React.RefObject<any>;
    serviceTableRef: React.RefObject<any>;
}

const defaultBedClass: BedClass = {
  bed_class_id: 0,
  description: "",
  smallest_number_of_hours: 0,
  rounding_required: "U",
  patient_care_pct: 0,
  accumulate_fractions: '',
  fraction_weight_priority: 0,
  facility_id: "",
  created_by: "",
  creation_date: ""
};

const defaultBedClassService: BedClassService = {
  bed_class_service_id: "",
  bed_class_id: 0,
  item_id: "",
  payer_id: "",
  from_day: 0,
  to_day: 0,
  time_calculation_basis: "",
  units: 1
};

export const BedClassContext = createContext<BedClassContextType>({
  selectedBedClass: null,
  setSelectedBedClass: () => {},
  selectedBedClassService: null,
  setSelectedBedClassService: () => {},
  clearSelections: () => {},
  clearSelectedBedClass: () => {},
  clearSelectedBedClassService: () => {},
  isEditingMaster: false,
  setIsEditingMaster: () => {},
  isEditingService: false,
  setIsEditingService: () => {},
  masterFormData: {},
  setMasterFormData: () => {},
  serviceFormData: {},
  setServiceFormData: () => {},
  resetMasterForm: () => {},
  resetServiceForm: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  isMasterDialogOpen: false,
  setIsMasterDialogOpen: () => {},
  isServiceDialogOpen: false,
  setIsServiceDialogOpen: () => {},
  isMasterWithServicesDialogOpen: false,
  setIsMasterWithServicesDialogOpen: () => {},
  fetchMasterData: async () => {},
  fetchServicesData: async () => {},
  addMaster: async () => {},
  updateMaster: async () => {},
  deleteMaster: async () => {},
  addService: async () => {},
  updateService: async () => {},
  deleteService: async () => {},
  addMasterWithServices: async () => {},
  tableParams: {},
  setTableParams: () => {},
  masterTableRef: React.createRef(),
  serviceTableRef: React.createRef()
});

export function BedClassProvider({ children }: { children: React.ReactNode }) {

    //! ref for the master and detail table 
    const masterTableRef = React.useRef<any>(null);
    const serviceTableRef = React.useRef<any>(null);

  // Selected items state
  const [selectedBedClass, setSelectedBedClass] = useState<BedClass | null>(null);
  const [selectedBedClassService, setSelectedBedClassService] = useState<BedClassService | null>(null);
  
  // Editing states
  const [isEditingMaster, setIsEditingMaster] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  
  // Form data states
  const [masterFormData, setMasterFormData] = useState<Partial<BedClass>>({});
  const [serviceFormData, setServiceFormData] = useState<Partial<BedClassService>>({});
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog visibility states
  const [isMasterDialogOpen, setIsMasterDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isMasterWithServicesDialogOpen, setIsMasterWithServicesDialogOpen] = useState(false);
  
  // Table params state
  const [tableParams, setTableParams] = useState({});
  
  // Utility functions
  const clearSelections = useCallback(() => {
    setSelectedBedClass(null);
    setSelectedBedClassService(null);
  }, []);
  
  const clearSelectedBedClass = useCallback(() => {
    setSelectedBedClass(null);
  }, []);
  
  const clearSelectedBedClassService = useCallback(() => {
    setSelectedBedClassService(null);
  }, []);
  
  const resetMasterForm = useCallback(() => {
    setMasterFormData({});
    setIsEditingMaster(false);
  }, []);
  
  const resetServiceForm = useCallback(() => {
    setServiceFormData({});
    setIsEditingService(false);
  }, []);
  
  // API Functions
  const fetchMasterData = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/bed-class/master', { params });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch master data";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fetchServicesData = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/bed-class/services', { params });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch services data";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const addMaster = useCallback(async (data: Omit<BedClass, 'bed_class_id' | 'creation_date'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/api/bed-class/master', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to add master";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateMaster = useCallback(async (bedClassId: number, data: Partial<BedClass>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put(`/api/bed-class/master/${bedClassId}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update master";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteMaster = useCallback(async (bedClassId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.delete(`/api/bed-class/master/${bedClassId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete master";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const addService = useCallback(async (data: Omit<BedClassService, 'bed_class_service_id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/api/bed-class/services', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to add service";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateService = useCallback(async (serviceId: string, data: Partial<BedClassService>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.put(`/api/bed-class/services/${serviceId}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update service";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteService = useCallback(async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.delete(`/api/bed-class/services/${serviceId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete service";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const addMasterWithServices = useCallback(async (data: BedClassMasterWithServices) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/api/bed-class/master-with-services', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to add master with services";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Memoized context value
  const contextValue = useMemo<BedClassContextType>(
    () => ({
      selectedBedClass,
      setSelectedBedClass,
      selectedBedClassService,
      setSelectedBedClassService,
      clearSelections,
      clearSelectedBedClass,
      clearSelectedBedClassService,
      isEditingMaster,
      setIsEditingMaster,
      isEditingService,
      setIsEditingService,
      masterFormData,
      setMasterFormData,
      serviceFormData,
      setServiceFormData,
      resetMasterForm,
      resetServiceForm,
      isLoading,
      setIsLoading,
      error,
      setError,
      isMasterDialogOpen,
      setIsMasterDialogOpen,
      isServiceDialogOpen,
      setIsServiceDialogOpen,
      isMasterWithServicesDialogOpen,
      setIsMasterWithServicesDialogOpen,
      fetchMasterData,
      fetchServicesData,
      addMaster,
      updateMaster,
      deleteMaster,
      addService,
      updateService,
      deleteService,
      addMasterWithServices,
      tableParams,
      setTableParams,
        masterTableRef,
        serviceTableRef
    }),
    [
      selectedBedClass,
      selectedBedClassService,
      clearSelections,
      clearSelectedBedClass,
      clearSelectedBedClassService,
      isEditingMaster,
      isEditingService,
      masterFormData,
      serviceFormData,
      resetMasterForm,
      resetServiceForm,
      isLoading,
      error,
      isMasterDialogOpen,
      isServiceDialogOpen,
      isMasterWithServicesDialogOpen,
      fetchMasterData,
      fetchServicesData,
      addMaster,
      updateMaster,
      deleteMaster,
      addService,
      updateService,
      deleteService,
      addMasterWithServices,
      tableParams,
      setTableParams,
      masterTableRef,
        serviceTableRef
    ]
  );
  
  return (
    <BedClassContext.Provider value={contextValue}>
      {children}
    </BedClassContext.Provider>
  );
}

// Custom hook for using the context
export const useBedClassContext = () => {
  const context = useContext(BedClassContext);
  if (!context) {
    throw new Error("useBedClassContext must be used within a BedClassProvider");
  }
  return context;
};

// Helper hook for master operations
export const useBedClassMaster = () => {
  const {
    selectedBedClass,
    setSelectedBedClass,
    isEditingMaster,
    setIsEditingMaster,
    masterFormData,
    setMasterFormData,
    resetMasterForm,
    isMasterDialogOpen,
    setIsMasterDialogOpen,
    addMaster,
    updateMaster,
    deleteMaster,
    fetchMasterData
  } = useBedClassContext();
  
  const openCreateMasterDialog = useCallback(() => {
    resetMasterForm();
    setIsEditingMaster(false);
    setIsMasterDialogOpen(true);
  }, [resetMasterForm, setIsEditingMaster, setIsMasterDialogOpen]);
  
  const openEditMasterDialog = useCallback((bedClass: BedClass) => {
    setSelectedBedClass(bedClass);
    setMasterFormData(bedClass);
    setIsEditingMaster(true);
    setIsMasterDialogOpen(true);
  }, [setSelectedBedClass, setMasterFormData, setIsEditingMaster, setIsMasterDialogOpen]);
  
  const closeMasterDialog = useCallback(() => {
    setIsMasterDialogOpen(false);
    resetMasterForm();
  }, [setIsMasterDialogOpen, resetMasterForm]);
  
  const handleAddMaster = useCallback(async (data: Omit<BedClass, 'bed_class_id' | 'creation_date'>) => {
    const result = await addMaster(data);
    await fetchMasterData();
    closeMasterDialog();
    return result;
  }, [addMaster, fetchMasterData, closeMasterDialog]);
  
  const handleUpdateMaster = useCallback(async (bedClassId: number, data: Partial<BedClass>) => {
    const result = await updateMaster(bedClassId, data);
    await fetchMasterData();
    closeMasterDialog();
    return result;
  }, [updateMaster, fetchMasterData, closeMasterDialog]);
  
  const handleDeleteMaster = useCallback(async (bedClassId: number) => {
    const result = await deleteMaster(bedClassId);
    await fetchMasterData();
    return result;
  }, [deleteMaster, fetchMasterData]);
  
  return {
    selectedBedClass,
    masterFormData,
    setMasterFormData,
    isEditingMaster,
    isMasterDialogOpen,
    openCreateMasterDialog,
    openEditMasterDialog,
    closeMasterDialog,
    handleAddMaster,
    handleUpdateMaster,
    handleDeleteMaster,
    fetchMasterData
  };
};

// Helper hook for service operations
export const useBedClassService = () => {
  const {
    selectedBedClassService,
    setSelectedBedClassService,
    isEditingService,
    setIsEditingService,
    serviceFormData,
    setServiceFormData,
    resetServiceForm,
    isServiceDialogOpen,
    setIsServiceDialogOpen,
    addService,
    updateService,
    deleteService,
    fetchServicesData
  } = useBedClassContext();
  
  const openCreateServiceDialog = useCallback(() => {
    resetServiceForm();
    setIsEditingService(false);
    setIsServiceDialogOpen(true);
  }, [resetServiceForm, setIsEditingService, setIsServiceDialogOpen]);
  
  const openEditServiceDialog = useCallback((service: BedClassService) => {
    setSelectedBedClassService(service);
    setServiceFormData(service);
    setIsEditingService(true);
    setIsServiceDialogOpen(true);
  }, [setSelectedBedClassService, setServiceFormData, setIsEditingService, setIsServiceDialogOpen]);
  
  const closeServiceDialog = useCallback(() => {
    setIsServiceDialogOpen(false);
    resetServiceForm();
  }, [setIsServiceDialogOpen, resetServiceForm]);
  
  const handleAddService = useCallback(async (data: Omit<BedClassService, 'bed_class_service_id'>) => {
    const result = await addService(data);
    await fetchServicesData();
    closeServiceDialog();
    return result;
  }, [addService, fetchServicesData, closeServiceDialog]);
  
  const handleUpdateService = useCallback(async (serviceId: string, data: Partial<BedClassService>) => {
    const result = await updateService(serviceId, data);
    await fetchServicesData();
    closeServiceDialog();
    return result;
  }, [updateService, fetchServicesData, closeServiceDialog]);
  
  const handleDeleteService = useCallback(async (serviceId: string) => {
    const result = await deleteService(serviceId);
    await fetchServicesData();
    return result;
  }, [deleteService, fetchServicesData]);
  
  return {
    selectedBedClassService,
    serviceFormData,
    setServiceFormData,
    isEditingService,
    isServiceDialogOpen,
    openCreateServiceDialog,
    openEditServiceDialog,
    closeServiceDialog,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
    fetchServicesData
  };
};

// Helper hook for master with services operations
export const useBedClassMasterWithServices = () => {
  const {
    addMasterWithServices,
    isLoading,
    error,
    isMasterWithServicesDialogOpen,
    setIsMasterWithServicesDialogOpen,
    tableParams,
    setTableParams
  } = useBedClassContext();
  
  const openDialog = useCallback(() => {
    setIsMasterWithServicesDialogOpen(true);
  }, [setIsMasterWithServicesDialogOpen]);
  
  const closeDialog = useCallback(() => {
    setIsMasterWithServicesDialogOpen(false);
  }, [setIsMasterWithServicesDialogOpen]);
  
  const handleAddMasterWithServices = useCallback(async (data: BedClassMasterWithServices) => {
    const result = await addMasterWithServices(data);
    // Refresh table after successful addition
    setTableParams({ ...tableParams, refresh: Date.now() });
    closeDialog();
    return result;
  }, [addMasterWithServices, closeDialog, tableParams, setTableParams]);
  
  return {
    openDialog,
    closeDialog,
    handleAddMasterWithServices,
    isLoading,
    error,
    isDialogOpen: isMasterWithServicesDialogOpen
  };
};