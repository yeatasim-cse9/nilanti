import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSiteSettings } from "./useAdminData";

const BASE_URL = "/api-bdcourier";

interface CourierData {
  name: string;
  logo: string;
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

interface SummaryData {
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

interface CourierCheckResponse {
  status: string;
  data?: {
    [key: string]: CourierData | SummaryData;
  };
  reports?: unknown[];
  error?: string;
}

export interface ParsedCourierResult {
  status: string;
  couriers: CourierData[];
  summary: SummaryData | null;
  error?: string;
}

export const useCourierCheck = () => {
  const { data: settings } = useSiteSettings();

  return useMutation({
    mutationFn: async (phone: string): Promise<ParsedCourierResult> => {
      const apiKey = settings?.bdcourier_api_key || import.meta.env.VITE_BD_COURIER_API_KEY || "";
      
      const response = await fetch(`${BASE_URL}/courier-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Ignore parse errors and use default message
        }
        throw new Error(errorMsg);
      }

      const data = await response.json() as CourierCheckResponse;
      
      if (data?.status === "error") throw new Error(data.error || "Unknown error");

      const couriers: CourierData[] = [];
      let summary: SummaryData | null = null;

      if (data.status === "success" && data.data) {
        Object.entries(data.data).forEach(([key, value]) => {
          if (key === "summary") {
            summary = value as SummaryData;
          } else {
            const courier = value as CourierData;
            // Only include couriers that have actual parcels
            if (courier.total_parcel > 0) {
              couriers.push(courier);
            }
          }
        });
      }

      return {
        status: data.status,
        couriers,
        summary,
      };
    },
    onError: (error: Error) => {
      console.error("BD Courier check error:", error);
      toast.error(`ফ্রড চেক করতে সমস্যা: ${error.message}`);
    },
  });
};

export const useCheckBDCourierConnection = () => {
  const { data: settings } = useSiteSettings();

  return useMutation({
    mutationFn: async () => {
      const apiKey = settings?.bdcourier_api_key || import.meta.env.VITE_BD_COURIER_API_KEY || "";

      const response = await fetch(`${BASE_URL}/check-connection`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Ignore parse errors and use default message
        }
        throw new Error(errorMsg);
      }
      
      return response.json();
    },
  });
};

