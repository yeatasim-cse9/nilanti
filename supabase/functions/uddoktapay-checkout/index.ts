import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UDDOKTAPAY_BASE_URL = "https://vibeable.paymently.io/api";
const UDDOKTAPAY_API_KEY = Deno.env.get("UDDOKTAPAY_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    if (action === "create-charge") {
      // Create a new payment charge
      const { 
        fullName, 
        email, 
        amount, 
        orderId, 
        userId,
        redirectUrl,
        cancelUrl 
      } = data;

      const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email || "customer@example.com",
          amount: amount.toString(),
          metadata: {
            order_id: orderId,
            user_id: userId || "guest",
          },
          redirect_url: redirectUrl,
          return_type: "GET",
          cancel_url: cancelUrl,
        }),
      });

      const result = await response.json();
      
      if (result.status === true || result.status === "true") {
        return new Response(
          JSON.stringify({ 
            success: true, 
            payment_url: result.payment_url 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: result.message || "Failed to create payment" 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
    } else if (action === "verify-payment") {
      // Verify a payment
      const { invoiceId } = data;

      const response = await fetch(`${UDDOKTAPAY_BASE_URL}/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
        }),
      });

      const result = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: result.status === "COMPLETED",
          data: result 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid action" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
  } catch (error) {
    console.error("UddoktaPay Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
