// Steadfast Courier Limited — Full API V1 Integration
// Base URL: https://portal.packzy.com/api/v1
// Note: In production, API calls should go through a backend/proxy to protect keys.

const STEADFAST_API_URL = import.meta.env.DEV
  ? "/api-steadfast/api/v1"
  : "https://portal.packzy.com/api/v1";

const STEADFAST_API_KEY = import.meta.env.VITE_STEADFAST_API_KEY || "";
const STEADFAST_SECRET_KEY = import.meta.env.VITE_STEADFAST_SECRET_KEY || "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SteadfastConsignment {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SteadfastResponse {
  status: number;
  message?: string;
  consignment?: SteadfastConsignment;
  current_balance?: number;
  delivery_status?: string;
  errors?: any;
  data?: any;
}

export interface BulkOrderItem {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
}

export interface BulkOrderResult {
  invoice: string;
  recipient_name: string;
  recipient_address: string;
  recipient_phone: string;
  cod_amount: string;
  note: string | null;
  consignment_id: number | null;
  tracking_code: string | null;
  status: "success" | "error";
}

export interface ReturnRequest {
  id: number;
  user_id: number;
  consignment_id: number;
  reason: string | null;
  status: "pending" | "approved" | "processing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  [key: string]: any;
}

export interface PoliceStation {
  id: number;
  [key: string]: any;
}

// ─── Headers ──────────────────────────────────────────────────────────────────

// ─── Headers ──────────────────────────────────────────────────────────────────

interface SteadfastHeaders {
  apiKey?: string;
  secretKey?: string;
}

const getHeaders = (config?: SteadfastHeaders) => ({
  "Api-Key": config?.apiKey || STEADFAST_API_KEY,
  "Secret-Key": config?.secretKey || STEADFAST_SECRET_KEY,
  "Content-Type": "application/json",
  "Accept": "application/json",
});

// ─── Response Parser ──────────────────────────────────────────────────────────
// Steadfast sometimes returns plain text on errors (e.g. "Account is suspended")
// instead of JSON. This helper handles both cases gracefully.

async function parseSteadfastResponse<T = SteadfastResponse>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || json.error || `Steadfast API error (${response.status})`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`Steadfast API error (${response.status}): ${text}`);
      }
      throw e;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Steadfast returned invalid response: ${text.slice(0, 200)}`);
  }
}

// ─── 1. Place a Single Order ──────────────────────────────────────────────────
// POST /create_order

export interface CreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  alternative_phone?: string;
  recipient_email?: string;
  note?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: 0 | 1; // 0 = home delivery, 1 = point delivery / hub pickup
}

export async function createSteadfastOrder(
  payload: CreateOrderPayload,
  config?: SteadfastHeaders
): Promise<SteadfastResponse> {
  const response = await fetch(`${STEADFAST_API_URL}/create_order`, {
    method: "POST",
    headers: getHeaders(config),
    body: JSON.stringify(payload),
  });
  return parseSteadfastResponse(response);
}

// ─── 2. Bulk Order Create ─────────────────────────────────────────────────────
// POST /create_order/bulk-order  (max 500 items)

export async function createBulkSteadfastOrders(
  orders: BulkOrderItem[],
  config?: SteadfastHeaders
): Promise<BulkOrderResult[]> {
  if (orders.length > 500) {
    throw new Error("Maximum 500 items allowed per bulk order request.");
  }

  const response = await fetch(`${STEADFAST_API_URL}/create_order/bulk-order`, {
    method: "POST",
    headers: getHeaders(config),
    body: JSON.stringify({ data: JSON.stringify(orders) }),
  });
  return parseSteadfastResponse<BulkOrderResult[]>(response);
}

// ─── 3. Check Delivery Status ─────────────────────────────────────────────────
// GET /status_by_cid/{id}
// GET /status_by_invoice/{invoice}
// GET /status_by_trackingcode/{trackingCode}

export type StatusLookupType = "cid" | "invoice" | "trackingcode";

export async function checkSteadfastStatus(
  value: string,
  type: StatusLookupType = "cid",
  config?: SteadfastHeaders
): Promise<SteadfastResponse> {
  const endpointMap: Record<StatusLookupType, string> = {
    cid: `status_by_cid/${value}`,
    invoice: `status_by_invoice/${value}`,
    trackingcode: `status_by_trackingcode/${value}`,
  };

  const response = await fetch(`${STEADFAST_API_URL}/${endpointMap[type]}`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse(response);
}

// Convenience wrappers
export const checkStatusByCID = (id: string, config?: SteadfastHeaders) => 
  checkSteadfastStatus(id, "cid", config);
export const checkStatusByInvoice = (invoice: string, config?: SteadfastHeaders) => 
  checkSteadfastStatus(invoice, "invoice", config);
export const checkStatusByTrackingCode = (code: string, config?: SteadfastHeaders) => 
  checkSteadfastStatus(code, "trackingcode", config);

// ─── 4. Check Current Balance ─────────────────────────────────────────────────
// GET /get_balance

export async function getSteadfastBalance(config?: SteadfastHeaders): Promise<SteadfastResponse> {
  const response = await fetch(`${STEADFAST_API_URL}/get_balance`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse(response);
}

// ─── 5. Create Return Request ─────────────────────────────────────────────────
// POST /create_return_request

export interface CreateReturnPayload {
  consignment_id?: number;
  invoice?: string;
  tracking_code?: string;
  reason?: string;
}

export async function createReturnRequest(
  payload: CreateReturnPayload,
  config?: SteadfastHeaders
): Promise<ReturnRequest> {
  const response = await fetch(`${STEADFAST_API_URL}/create_return_request`, {
    method: "POST",
    headers: getHeaders(config),
    body: JSON.stringify(payload),
  });
  return parseSteadfastResponse<ReturnRequest>(response);
}

// ─── 6. Single Return Request View ────────────────────────────────────────────
// GET /get_return_request/{id}

export async function getReturnRequest(id: number, config?: SteadfastHeaders): Promise<ReturnRequest> {
  const response = await fetch(`${STEADFAST_API_URL}/get_return_request/${id}`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse<ReturnRequest>(response);
}

// ─── 7. Get All Return Requests ───────────────────────────────────────────────
// GET /get_return_requests

export async function getReturnRequests(config?: SteadfastHeaders): Promise<ReturnRequest[]> {
  const response = await fetch(`${STEADFAST_API_URL}/get_return_requests`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse<ReturnRequest[]>(response);
}

// ─── 8. Get Payments ──────────────────────────────────────────────────────────
// GET /payments

export async function getPayments(config?: SteadfastHeaders): Promise<Payment[]> {
  const response = await fetch(`${STEADFAST_API_URL}/payments`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse<Payment[]>(response);
}

// ─── 9. Get Single Payment with Consignments ──────────────────────────────────
// GET /payments/{payment_id}

export async function getPaymentById(paymentId: number, config?: SteadfastHeaders): Promise<Payment> {
  const response = await fetch(`${STEADFAST_API_URL}/payments/${paymentId}`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse<Payment>(response);
}

// ─── 10. Get Police Stations ──────────────────────────────────────────────────
// GET /police_stations

export async function getPoliceStations(config?: SteadfastHeaders): Promise<PoliceStation[]> {
  const response = await fetch(`${STEADFAST_API_URL}/police_stations`, {
    headers: getHeaders(config),
  });
  return parseSteadfastResponse<PoliceStation[]>(response);
}

// ─── Delivery Status Constants ────────────────────────────────────────────────

export const DELIVERY_STATUSES = {
  pending: "Consignment is not delivered or cancelled yet.",
  delivered_approval_pending: "Delivered but waiting for admin approval.",
  partial_delivered_approval_pending: "Partially delivered, waiting for admin approval.",
  cancelled_approval_pending: "Cancelled, waiting for admin approval.",
  unknown_approval_pending: "Unknown pending status. Contact support.",
  delivered: "Delivered and balance added.",
  partial_delivered: "Partially delivered and balance added.",
  cancelled: "Cancelled and balance updated.",
  hold: "Consignment is held.",
  in_review: "Order placed, waiting to be reviewed.",
  unknown: "Unknown status. Contact support.",
} as const;

export type DeliveryStatus = keyof typeof DELIVERY_STATUSES;
