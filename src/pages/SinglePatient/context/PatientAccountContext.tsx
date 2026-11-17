import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../../../utils/Api";
import { set } from "lodash";

interface loadingObj {
  fetchPatient: boolean;
}
interface PatientAccountContextProps {
  deliveryData: any[];
  invoicesFirstTab: any[];
  patient: any;
  selectedDeliveryFirstTab: any;
  selectedCoverage: any;
  priceList: any[];
  selectedInvoiceFirstTab: any;
  selectedPatientPolicy: any;
  policyThirdTap: any;
  selectedPatient: any;
  loading: loadingObj;
  ItemPrice: any;
  formData: { patientId: string; episodeNo: string };
  setFormData: (v: any) => void;
  setItemPrice: (data: any) => void;
  getItemPriceData: (
    itemId: string,
    date: string,
    patientId: string,
    episodeNo: string,
    query?: {
      payer_id: string;
      policy_id: string;
      price_list_id: string;
    },
  ) => Promise<void>;

  invoicesSecTab: any[];
  selectedInvoiceSecTab: any;
  deliveryDataSecTab: any[];
  patientPolicyData: any[];
  patientPolicyDataBySelectedEpisodePolicy: any[];

  coverageData: any[];
  benefits: any[];
  selectedDeliverySecTab: any;
  //
  setPatient: (patient: any) => void;
  setSelectedDeliveryFirstTab: (data: any) => void;
  // setPolicyThirdTap: (data: any) => void;
  setSelectedInvoiceFirstTab: (data: any) => void;
  setSelectedDeliverySecTab: (data: any) => void;
  setSelectedInvoiceSecTab: (data: any) => void;
  setSelectedPatient: (data: any) => void;
  setInvoicesFirstTab: (data: any) => void;
  setInvoicesSecTab: (data: any) => void;
  setDeliveryDataSecTab: (data: any) => void;
  setSelectedCoverage: (data: any) => void;
  setSelectedPatientPolicy: (data: any) => void;
  //
  fetchPatient: (patientId: string, ep: string) => Promise<void>;
  getEpisodePolicy: (patientId: string, ep: string) => Promise<void>;
  getInvoiceTabData: (patientId: string, ep: string) => Promise<void>;
  getDeliveryTabData: (patientId: string, episodeNo: string) => Promise<void>;
  getInvoiceDetails: (deliveryId: string) => Promise<void>;
  getDeliveryDetails: (deliveryId: string) => Promise<void>;
  getPatientPolicyData: (deliveryId: string) => Promise<void>;
  getCoverageData: (deliveryId: string) => Promise<void>;
  getBenefits: (coverageId: string) => Promise<void>;
  getPolicyThirdTap: (patient_id: string, episode_no: string) => Promise<void>;

  episodePolicyData: any[];
  selectedEpisodePolicy: any;
  setSelectedEpisodePolicy: (data: any) => void;
  params: any;
  setParams: (params: { patient_id: string; episode: string }) => void;
  getEpisodePolicyData: (
    patientId: string,
    episodeNo?: string,
  ) => Promise<void>;
}

const SinglePatientContext = createContext<
  PatientAccountContextProps | undefined
>(undefined);

export const PatientAccountProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [patient, setPatient] = useState<any>(null);
  const [params, setParams] = useState({
    patient_id: "",
    episode: "",
  });

  const [loading, setLoading] = useState<loadingObj>({
    fetchPatient: false,
  });
  //! patientForm (patientID , episode no)
  const [formData, setFormData] = useState<{
    patientId: string;
    episodeNo: string;
  }>({ patientId: "", episodeNo: "" });

  // first tap
  const [deliveryData, setDeliveryData] = useState<any[]>([]);
  const [invoicesFirstTab, setInvoicesFirstTab] = useState<any[]>([]);
  const [selectedDeliveryFirstTab, setSelectedDeliveryFirstTab] =
    useState<any>(null);
  const [selectedInvoiceFirstTab, setSelectedInvoiceFirstTab] =
    useState<any>(null);

  //sec tab
  const [invoicesSecTab, setInvoicesSecTab] = useState<any[]>([]);
  const [selectedInvoiceSecTab, setSelectedInvoiceSecTab] = useState<any>(null);
  const [deliveryDataSecTab, setDeliveryDataSecTab] = useState<any[]>([]);
  const [selectedDeliverySecTab, setSelectedDeliverySecTab] =
    useState<any>(null);

  // third tab
  const [benefits, setBenefits] = useState<any[]>([]);
  const [selectedPatientPolicy, setSelectedPatientPolicy] = useState<any>(null);
  const [selectedCoverage, setSelectedCoverage] = useState<any>(null);
  const [patientPolicyData, setPatientPolicyData] = useState<any[]>([]);
  const [
    patientPolicyDataBySelectedEpisodePolicy,
    setPatientPolicyDataBySelectedEpisodePolicy,
  ] = useState<any[]>([]);
  const [coverageData, setCoverageData] = useState<any[]>([]);

  const [episodePolicyData, setEpisodePolicyData] = useState<any[]>([]);
  const [selectedEpisodePolicy, setSelectedEpisodePolicy] = useState<any>(null);
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [ItemPrice, setItemPrice] = useState<any>(null);

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  const fetchPatient = async (patientId: string, ep: string) => {
    try {
      setLoading((prev) => {
        return {
          ...prev,
          fetchPatient: true,
        };
      });
      const { data } = await api.get(`/api/patientEpisode/search`, {
        params: {
          episode_no: ep,
          patient_id: patientId,
        },
      });
      setPatient(data?.data?.[0]);
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      setPatient(null);
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          fetchPatient: false,
        };
      });
    }
  };

  //! /api/patientAccount/deliveryTab/:patientId
  const getDeliveryTabData = async (patientId: string, episodeNo: string) => {
    try {
      setLoading((prev) => {
        return {
          ...prev,
          getDeliveryTabData: true,
        };
      });
      const { data } = await api.get(
        `/api/patientAccount/deliveryTab/${patientId}/${episodeNo}`,
      );
      setDeliveryData(data?.data);
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      setDeliveryData([]);
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          getDeliveryTabData: false,
        };
      });
    }
  };
  // /itemPrice/:item_id/:start_date/:patient_id/:episode_no
  const getItemPriceData = async (
    itemId: string,
    date: string,
    patientId: string,
    episodeNo: string,
    query?: {
      payer_id: string;
      policy_id: string;
      price_list_id: string;
    },
  ) => {
    console.log("query queryquery", query);

    try {
      setLoading((prev) => {
        return {
          ...prev,
          getItemPriceData: true,
        };
      });

      const { data } = await api.get(
        // `/api/patientAccount/itemPrice/${itemId}/${'2025-12-31T21:00:00.000Z'}/${patientId}/${episodeNo}`,
        `/api/patientAccount/itemPrice/${itemId}/${date}/${patientId}/${episodeNo}`,
        {
          params: {
            test: "test",
            ...query,
          },
        },
      );
      setItemPrice(data?.data);

      return data?.data;
    } catch (error) {
      console.error("Failed to fetch item price data:", error);
      setItemPrice(null);
      return null;
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          getItemPriceData: false,
        };
      });
    }
  };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const getInvoiceTabData = async (patientId: string, ep: string) => {
    try {
      setLoading((prev) => {
        return {
          ...prev,
          getInvoiceTabData: true,
        };
      });
      const { data } = await api.get(
        `/api/patientAccount/invoiceTab/${patientId}/${ep}`,
      );
      setInvoicesSecTab(data?.data);
    } catch (error) {
      console.error("Failed to fetch getInvoiceTabData:", error);
      setInvoicesSecTab([]);
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          getInvoiceTabData: false,
        };
      });
    }
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  const [policyThirdTap, setPolicyThirdTap] = useState<any[]>([]);
  const getPolicyThirdTap = async (patient_id: string, episode_no: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getPolicyThirdTap: true,
      }));

      const params: any = { patient_id };
      if (episode_no) {
        params.episode_no = episode_no;
      }
      console.log("params", params);

      setParams(params);

      const { data } = await api.get(
        `/api/patientAccount/policy/${patient_id}/${episode_no}`,
      );
      // set it as array for data grid
      setPolicyThirdTap(data?.data);
    } catch (error) {
      console.error("Failed to fetch getPolicyThirdTap data:", error);
      setPolicyThirdTap([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getPolicyThirdTap: false,
      }));
    }
  };

  const getCoverageData = async (episode_policy_id: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getCoverageData: true,
      }));

      const { data } = await api.get(
        `/api/patientAccount/coverage/${episode_policy_id}`,
      );
      // set it as array for data grid
      setCoverageData(data?.data);
    } catch (error) {
      console.error("Failed to fetch coverage data:", error);
      setCoverageData([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getCoverageData: false,
      }));
    }
  };

  ///! get benefits
  const getBenefits = async (coverageId: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getBenefits: true,
      }));

      const { data } = await api.get(
        `/api/patientAccount/benefits/${coverageId}`,
      );
      setBenefits(data?.data || null);
    } catch (error) {
      console.error("Failed to fetch coverage data:", error);
      setBenefits([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getBenefits: false,
      }));
    }
  };
  const [priceList, setPriceList] = useState<any[]>([]);
  const getPriceList = async (priceListId: string, payerId: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getPriceList: true,
      }));

      // http://localhost:3001/item_prices?selectedType=Standard&payer_id=null&price_list_id=null&category_code=null&sub_category_code=null&price_option=All&filter_date=2025-07-22&search=&item_bk=&item_desc=&item_curr_price=&item_cat_code=&item_status=&item_leg_code=&page=1&limit=14
      const { data } = await api.get(
        `/item_prices?price_list_id=${priceListId}&payer_id=${payerId}`,
        // `/item_prices?price_list_id=${priceListId}&item_status=${'D'}`
      );
      setPriceList(data?.data || null);
    } catch (error) {
      console.error("Failed to fetch coverage data:", error);
      setPriceList([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getPriceList: false,
      }));
    }
  };

  //! at third tab to choose an policy so can add episodePolicy
  const getPatientPolicyData = async (patientId: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getPatientPolicyData: true,
      }));

      const { data } = await api.get(
        "/api/patientAccount/search/patientPolicy",
        {
          params: {
            patient_id: patientId,
          },
        },
      );
      setPatientPolicyData(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch patient policy data:", error);
      setPatientPolicyData([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getPatientPolicyData: false,
      }));
    }
  };
  const getEpisodePolicy = async (patientId: string, episodeNo: string) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getEpisodePolicy: true,
      }));

      const { data } = await api.get(
        `/api/patientAccount/policy/${patientId}/${episodeNo}`,
      );
      if (data?.data?.[0]) {
        setSelectedEpisodePolicy(data?.data?.[0]);
      }
    } catch (error) {
      console.error("Failed to fetch patient policy data:", error);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getEpisodePolicy: false,
      }));
    }
  };

  const getPatientPolicyDataBySelectedEpisodePolicy = async (
    patientId: string,
    patientPolicyId: string,
  ) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getPatientPolicyDataBySelectedEpisodePolicy: true,
      }));

      const { data } = await api.get(
        "/api/patientAccount/search/patientPolicy",
        {
          params: {
            patient_id: patientId,
            patient_policy_id: patientPolicyId,
          },
        },
      );
      setPatientPolicyDataBySelectedEpisodePolicy(data?.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch getsetPatientPolicyDataBySelectedEpisodePolicy:",
        error,
      );
      setPatientPolicyDataBySelectedEpisodePolicy([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getPatientPolicyDataBySelectedEpisodePolicy: false,
      }));
    }
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const getInvoiceDetails = async (deliveryId: string) => {
    try {
      setLoading((prev) => {
        return {
          ...prev,
          getInvoiceDetails: true,
        };
      });
      const { data } = await api.get(`/api/invoiceDetail/search`, {
        params: {
          delivery_id: deliveryId,
        },
      });
      setInvoicesFirstTab(data?.data);
    } catch (error) {
      console.error("Failed to fetch patient:", error);
      setInvoicesFirstTab([]);
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          getInvoiceDetails: false,
        };
      });
    }
  };
  const getDeliveryDetails = async (deliveryId: string) => {
    try {
      setLoading((prev) => {
        return {
          ...prev,
          getDeliveryDetails: true,
        };
      });
      const { data } = await api.get(
        `/api/patientAccount/deliverySecTab/${deliveryId}`,
      );
      setDeliveryDataSecTab(data?.data);
    } catch (error) {
      console.error("Failed to getDeliveryDetails:", error);
      setDeliveryDataSecTab([]);
    } finally {
      setLoading((prev) => {
        return {
          ...prev,
          getDeliveryDetails: false,
        };
      });
    }
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  const getEpisodePolicyData = async (
    patientId: string,
    episodeNo?: string,
  ) => {
    try {
      setLoading((prev) => ({
        ...prev,
        getEpisodePolicyData: true,
      }));

      const params: any = { patient_id: patientId };
      if (episodeNo) {
        params.episode_no = episodeNo;
      }
      console.log("params", params);

      //! to store patient_id and episode to add  episodePolicy
      setParams(params);

      const { data } = await api.get(`/api/episodePolicies/search`, {
        params,
      });
      setEpisodePolicyData(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch episode policy data:", error);
      setEpisodePolicyData([]);
    } finally {
      setLoading((prev) => ({
        ...prev,
        getEpisodePolicyData: false,
      }));
    }
  };
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // useEffect(() => {
  //   console.log(
  //     selectedDeliveryFirstTab,
  //     "get invoice details selectedDeliveryFirstTab"
  //   );
  //   selectedDeliveryFirstTab
  //     ? getInvoiceDetails(selectedDeliveryFirstTab.delivery_id)
  //     : setInvoicesFirstTab([]);

  //   // selectedDeliveryFirstTab && getItemPriceData(
  //   //   selectedDeliveryFirstTab.item_id,
  //   //   selectedDeliveryFirstTab.delivery_date,
  //   //   selectedDeliveryFirstTab.patient_id,
  //   //   selectedDeliveryFirstTab.episode_no,
  //   //   {
  //   //     payer_id: selectedDeliveryFirstTab.payer_id,
  //   //     policy_id: selectedDeliveryFirstTab.policy_id,
  //   //     price_list_id: selectedDeliveryFirstTab.price_list_id,

  //   //   }
  //   // );
  // }, [selectedDeliveryFirstTab]);
  // useEffect(() => {
  //   console.log(selectedInvoiceSecTab, "get getDeliveryDetails ");
  //   selectedInvoiceSecTab
  //     ? getDeliveryDetails(selectedInvoiceSecTab.delivery_id)
  //     : setDeliveryDataSecTab([]);
  // }, [selectedInvoiceSecTab]);
  // useEffect(() => {
  //   console.log(selectedDeliveryFirstTab, "get getCoverageData");
  //   selectedPatientPolicy
  //     ? getCoverageData(selectedPatientPolicy.coverage_id)
  //     : setCoverageData([]);
  // }, [selectedPatientPolicy]);

  // useEffect(() => {
  //   console.log(selectedCoverage, "get benefits details");
  //   selectedCoverage
  //     ? getBenefits(selectedCoverage.coverage_id)
  //     : setBenefits([]);
  // }, [selectedCoverage]);

  // useEffect(() => {
  //   console.log(
  //     selectedEpisodePolicy,
  //     "get patient policy by patient_policy_id  patient_id"
  //   );
  //   // selectedEpisodePolicy
  //   //   ? getPatientPolicyDataBySelectedEpisodePolicy(
  //   //       selectedEpisodePolicy.patient_id,
  //   //       selectedEpisodePolicy.patient_policy_id
  //   //     )
  //   //   : setPatientPolicyDataBySelectedEpisodePolicy([]);

  //   selectedEpisodePolicy
  //     ? getCoverageData(selectedEpisodePolicy.id)
  //     : setCoverageData([]);

  //   selectedEpisodePolicy?.price_list_id
  //     ? getPriceList(
  //         selectedEpisodePolicy?.price_list_id,
  //         selectedEpisodePolicy?.payer_id
  //       )
  //     : setPriceList([]);
  // }, [selectedEpisodePolicy]);

  return (
    <SinglePatientContext.Provider
      value={{
        ItemPrice,
        setItemPrice,
        getItemPriceData,
        patient,
        setPatient,
        loading,
        fetchPatient,
        getDeliveryTabData,
        deliveryData,
        selectedDeliveryFirstTab,
        setSelectedDeliveryFirstTab,
        getInvoiceDetails,
        invoicesFirstTab,
        setInvoicesFirstTab,
        selectedInvoiceFirstTab,
        setSelectedInvoiceFirstTab,
        patientPolicyData,
        coverageData,
        episodePolicyData,
        selectedEpisodePolicy,
        setSelectedEpisodePolicy,
        getEpisodePolicyData,

        getDeliveryDetails,
        selectedPatient,
        setSelectedPatient,
        benefits,
        getBenefits,
        selectedPatientPolicy,

        invoicesSecTab,
        setInvoicesSecTab,
        selectedInvoiceSecTab,
        setSelectedInvoiceSecTab,
        deliveryDataSecTab,
        setDeliveryDataSecTab,
        selectedDeliverySecTab,
        setSelectedDeliverySecTab,

        getInvoiceTabData,
        getCoverageData,
        getPatientPolicyData,
        setSelectedPatientPolicy,
        setSelectedCoverage,
        selectedCoverage,
        patientPolicyDataBySelectedEpisodePolicy,
        params,
        setParams,

        getEpisodePolicy,

        //
        getPolicyThirdTap,
        policyThirdTap,
        priceList,
        formData,
        setFormData,
      }}
    >
      {children}
    </SinglePatientContext.Provider>
  );
};

export const usePatientAccount = () => {
  const context = useContext(SinglePatientContext);
  if (!context) {
    throw new Error(
      "usePatientAccount must be used within a SinglePatientProvider",
    );
  }
  return context;
};
