// UddoktaPay Client-Side Integration
const UDDOKTAPAY_BASE_URL = "https://vibeable.paymently.io/api";
const UDDOKTAPAY_API_KEY = "hdbo1VK8NZQ5kMysnui5e3wOEDBTqWLFZgpEGQsM";

export interface CreateChargeParams {
  fullName: string;
  email: string;
  amount: number;
  orderId: string;
  userId?: string;
  redirectUrl: string;
  cancelUrl: string;
}

export interface CreateChargeResponse {
  success: boolean;
  payment_url?: string;
  message?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data?: {
    full_name: string;
    email: string;
    amount: string;
    fee: string;
    charged_amount: string;
    invoice_id: string;
    metadata: Record<string, string>;
    payment_method: string;
    sender_number: string;
    transaction_id: string;
    date: string;
    status: "COMPLETED" | "PENDING" | "ERROR";
  };
  message?: string;
}

// Client-side payment creation (directly calling UddoktaPay API)
export async function createChargeClientSide(params: CreateChargeParams): Promise<CreateChargeResponse> {
  try {
    const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify({
        full_name: params.fullName,
        email: params.email || "customer@example.com",
        amount: params.amount.toString(),
        metadata: {
          order_id: params.orderId,
          user_id: params.userId || "guest",
        },
        redirect_url: params.redirectUrl,
        return_type: "GET",
        cancel_url: params.cancelUrl,
      }),
    });

    const result = await response.json();
    
    if (result.status === true || result.status === "true") {
      return { 
        success: true, 
        payment_url: result.payment_url 
      };
    } else {
      return { 
        success: false, 
        message: result.message || "Failed to create payment" 
      };
    }
  } catch (error) {
    console.error("UddoktaPay Client Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Network error" 
    };
  }
}

// Client-side payment verification
export async function verifyPaymentClientSide(invoiceId: string): Promise<VerifyPaymentResponse> {
  try {
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
    
    return { 
      success: result.status === "COMPLETED",
      data: result 
    };
  } catch (error) {
    console.error("UddoktaPay Verify Error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Network error" 
    };
  }
}
