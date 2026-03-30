import { useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, limit } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

interface CheckoutFormData {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  area?: string;
  notes?: string;
}

export const useIncompleteOrder = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const sessionIdRef = useRef<string | null>(null);
  const incompleteOrderIdRef = useRef<string | null>(null);

  // Get or create session ID
  useEffect(() => {
    let sessionId = localStorage.getItem("checkout_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("checkout_session_id", sessionId);
    }
    sessionIdRef.current = sessionId;
  }, []);

  const saveIncompleteOrder = useCallback(async (formData: CheckoutFormData, deliveryZoneId?: string) => {
    if (!sessionIdRef.current) return;
    
    // Only save if there's meaningful data
    const hasData = formData.fullName || formData.phone || formData.address;
    if (!hasData && items.length === 0) return;

    const incompleteOrderData = {
      session_id: sessionIdRef.current,
      user_id: user?.uid || null,
      customer_name: formData.fullName || null,
      customer_phone: formData.phone || null,
      customer_email: formData.email || null,
      shipping_address: formData.address || null,
      shipping_city: formData.city || null,
      shipping_area: formData.area || null,
      delivery_zone_id: deliveryZoneId || null,
      notes: formData.notes || null,
      cart_data: (items.length > 0 ? JSON.parse(JSON.stringify(items)) : null),
      last_updated_at: new Date().toISOString(),
    };

    try {
      if (incompleteOrderIdRef.current) {
        // Update existing
        const orderRef = doc(db, "incomplete_orders", incompleteOrderIdRef.current);
        await updateDoc(orderRef, incompleteOrderData);
      } else {
        // Check if exists for this session
        const q = query(
          collection(db, "incomplete_orders"),
          where("session_id", "==", sessionIdRef.current),
          where("is_converted", "==", false),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const existingDoc = querySnapshot.docs[0];
          incompleteOrderIdRef.current = existingDoc.id;
          await updateDoc(doc(db, "incomplete_orders", existingDoc.id), incompleteOrderData);
        } else {
          // Create new
          const docRef = await addDoc(collection(db, "incomplete_orders"), {
            ...incompleteOrderData,
            is_converted: false,
          });
          incompleteOrderIdRef.current = docRef.id;
        }
      }
    } catch (error) {
      console.error("Error saving incomplete order:", error);
    }
  }, [user, items]);

  const debouncedSave = useDebouncedCallback(saveIncompleteOrder, 1000);

  const markAsConverted = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      const q = query(
        collection(db, "incomplete_orders"),
        where("session_id", "==", sessionIdRef.current),
        where("is_converted", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      for (const docSnap of querySnapshot.docs) {
        await updateDoc(doc(db, "incomplete_orders", docSnap.id), { is_converted: true });
      }
      
      // Clear session for new checkout
      localStorage.removeItem("checkout_session_id");
      sessionIdRef.current = null;
      incompleteOrderIdRef.current = null;
    } catch (error) {
      console.error("Error marking order as converted:", error);
    }
  }, []);

  return {
    saveIncompleteOrder: debouncedSave,
    markAsConverted,
  };
};
