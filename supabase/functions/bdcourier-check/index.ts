import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BDCOURIER_API_URL = "https://api.bdcourier.com";
const BDCOURIER_API_KEY = Deno.env.get("BDCOURIER_API_KEY");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BDCOURIER_API_KEY) {
      console.error("BDCOURIER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "BD Courier API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, phone } = await req.json();
    console.log(`BD Courier action: ${action}, phone: ${phone}`);

    if (action === "check-connection") {
      const response = await fetch(`${BDCOURIER_API_URL}/check-connection`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${BDCOURIER_API_KEY}`,
          "Accept": "application/json",
        },
      });

      const data = await response.json();
      console.log("BD Courier connection check:", data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "courier-check") {
      if (!phone) {
        return new Response(
          JSON.stringify({ error: "Phone number is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Normalize phone number - remove non-digits and ensure proper format
      let normalizedPhone = phone.replace(/\D/g, "");
      if (normalizedPhone.startsWith("88") && normalizedPhone.length === 13) {
        normalizedPhone = normalizedPhone.slice(2);
      }
      if (normalizedPhone.length !== 11) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number. Must be 11 digits." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Checking fraud for phone: ${normalizedPhone}`);

      const response = await fetch(`${BDCOURIER_API_URL}/courier-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BDCOURIER_API_KEY}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const responseText = await response.text();
      console.log("BD Courier API response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        console.error("Failed to parse BD Courier response:", responseText);
        return new Response(
          JSON.stringify({ error: "Invalid response from BD Courier API" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("BD Courier edge function error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
