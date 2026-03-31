import { useState } from "react";
import { 
  createChargeClientSide, 
  verifyPaymentClientSide, 
  type CreateChargeParams, 
  type UddoktaPayConfig 
} from "@/lib/uddoktapay";
import { useSiteSettings } from "./useAdminData";

export function useUddoktaPay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: settings } = useSiteSettings();

  const getUddoktaPayConfig = (): UddoktaPayConfig => {
    return {
      apiKey: settings?.uddoktapay_api_key,
      baseUrl: settings?.uddoktapay_base_url,
    };
  };

  const createCharge = async (params: CreateChargeParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const config = getUddoktaPayConfig();
      // Always use client-side API call as part of Supabase removal
      const result = await createChargeClientSide(params, config);
      
      if (result.success && result.payment_url) {
        return { success: true, payment_url: result.payment_url };
      } else {
        setError(result.message || "Failed to create payment");
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment error";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (invoiceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const config = getUddoktaPayConfig();
      // Client-side verification
      const result = await verifyPaymentClientSide(invoiceId, config);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification error";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };


  return {
    createCharge,
    verifyPayment,
    isLoading,
    error,
  };
}
