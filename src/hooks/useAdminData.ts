import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch
} from "firebase/firestore";
import { toast } from "sonner";
import { Product, Coupon } from "@/types/firestore";

// Helper to convert Firestore timestamp to ISO string
const formatTimestamp = (timestamp: any) => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Products
export const useProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const q = query(collection(db, "products"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: formatTimestamp(doc.data().created_at)
      })) as Product[];

      return products;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      await addDoc(collection(db, "products"), {
        ...productData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("পণ্য যোগ করা হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Product>) => {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("পণ্য আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "products", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return data.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: { name: string; name_bn: string; slug: string }) => {
      await addDoc(collection(db, "categories"), {
        ...category,
        sort_order: 0,
        created_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("ক্যাটাগরি যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const categoryRef = doc(db, "categories", id);
      await updateDoc(categoryRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("ক্যাটাগরি আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "categories", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("ক্যাটাগরি মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Categories
export interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area?: string;
  total_amount: number;
  delivery_charge: number;
  order_status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  steadfast_consignment_id?: string;
  steadfast_tracking_code?: string;
  steadfast_status?: string;
  items: any[];
  items_count?: number;
  [key: string]: any;
}

// Orders
export const useOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: formatTimestamp(data.created_at)
          } as AdminOrder;
        })
        .filter(order => !order.is_deleted);
    },
  });
};

export const useTrashOrders = () => {
  return useQuery({
    queryKey: ["admin-trash-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: formatTimestamp(data.created_at)
          } as AdminOrder;
        })
        .filter(order => order.is_deleted);
    },
  });
};

export const useUserOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-orders", userId],
    queryFn: async (): Promise<AdminOrder[]> => {
      if (!userId) return [];
      const q = query(
        collection(db, "orders"), 
        where("user_id", "==", userId),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: formatTimestamp(data.created_at)
        } as AdminOrder;
      });
    },
    enabled: !!userId,
    staleTime: 30_000, // 30 seconds cache
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trash-orders"] });
      toast.success("অর্ডার আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useBulkUpdateOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: any }) => {
      const batch = writeBatch(db);
      ids.forEach(id => {
        const orderRef = doc(db, "orders", id);
        batch.update(orderRef, updates);
      });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("অর্ডারগুলো আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useSoftDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trash-orders"] });
      toast.success("ট্র্যাশে পাঠানো হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

export const useRestoreOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        is_deleted: false,
        deleted_at: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-trash-orders"] });
      toast.success("রিস্টোর করা হয়েছে");
    },
    onError: () => toast.error("রিস্টোর করা যায়নি"),
  });
};

export const usePermanentDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "orders", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-trash-orders"] });
      toast.success("স্থায়ীভাবে মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderData, items }: { orderData: any; items: any[] }) => {
      const batch = writeBatch(db);
      
      // Create order document
      const orderRef = doc(collection(db, "orders"));
      const orderId = orderRef.id;
      
      // Generate order number (simple version)
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      batch.set(orderRef, {
        ...orderData,
        order_number: orderNumber,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      
      // Add items as subcollection
      for (const item of items) {
        const itemRef = doc(collection(db, `orders/${orderId}/items`));
        batch.set(itemRef, {
          ...item,
          order_id: orderId,
        });
        
        // Decrement stock
        const productRef = doc(db, "products", item.product_id);
        batch.update(productRef, {
          stock_quantity: increment(-item.quantity)
        });
      }
      
      await batch.commit();
      return { id: orderId, order_number: orderNumber };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("অর্ডার তৈরি হয়েছে");
    },
    onError: (error: any) => {
      console.error("Order creation error:", error);
      toast.error("অর্ডার তৈরি করা যায়নি");
    },
  });
};

export const useOrderItems = (orderId: string | null) => {
  return useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const q = collection(db, `orders/${orderId}/items`);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    enabled: !!orderId,
  });
};

// Coupons
export const useCoupons = () => {
  return useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const q = query(collection(db, "coupons"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: formatTimestamp(doc.data().created_at)
      }));
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      await addDoc(collection(db, "coupons"), {
        ...coupon,
        usage_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("কুপন যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Coupon>) => {
      const couponRef = doc(db, "coupons", id);
      await updateDoc(couponRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("কুপন আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "coupons", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("কুপন মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Delivery Zones
export const useDeliveryZones = () => {
  return useQuery({
    queryKey: ["admin-delivery-zones"],
    queryFn: async () => {
      const q = query(collection(db, "delivery_zones"), orderBy("charge", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
  });
};

export const useCreateDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zone: any) => {
      await addDoc(collection(db, "delivery_zones"), zone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("জোন যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const zoneRef = doc(db, "delivery_zones", id);
      await updateDoc(zoneRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("জোন আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteDeliveryZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "delivery_zones", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
      toast.success("জোন মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Banners
export const useBanners = () => {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const q = query(collection(db, "banners"), orderBy("sort_order", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — banners rarely change
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (banner: any) => {
      await addDoc(collection(db, "banners"), {
        ...banner,
        created_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("ব্যানার যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const bannerRef = doc(db, "banners", id);
      await updateDoc(bannerRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("ব্যানার আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "banners", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("ব্যানার মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Customers (Profiles)
export const useCustomers = () => {
  return useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      // Trying both common field names
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: formatTimestamp(data.created_at || data.createdAt)
        };
      });
    },
  });
};

// Site Settings — simple getDocs, cached aggressively
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const q = collection(db, "site_settings");
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.reduce((acc: any, d) => {
        acc[d.id] = d.data().value;
        return acc;
      }, {});
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — settings rarely change
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: { key: string; value: any }[]) => {
      const batch = writeBatch(db);
      for (const setting of settings) {
        const settingRef = doc(db, "site_settings", setting.key);
        batch.set(settingRef, { value: setting.value }, { merge: true });
      }
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("সেটিংস সংরক্ষিত হয়েছে");
    },
    onError: () => toast.error("সংরক্ষণ করা যায়নি"),
  });
};

// Dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersSnapshot = await getDocs(query(collection(db, "orders"), where("created_at", ">=", today)));
      const productsSnapshot = await getDocs(collection(db, "products"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      
      const todaySales = ordersSnapshot.docs.reduce((sum, doc) => sum + Number(doc.data().total_amount), 0);
      
      const recentOrdersSnapshot = await getDocs(query(collection(db, "orders"), orderBy("created_at", "desc"), limit(5)));
      const recentOrders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const lowStockSnapshot = await getDocs(query(collection(db, "products"), where("stock_quantity", "<", 10), limit(5)));
      const lowStock = lowStockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        todayOrders: ordersSnapshot.size,
        totalProducts: productsSnapshot.size,
        totalCustomers: usersSnapshot.size,
        todaySales: todaySales,
        recentOrders: recentOrders,
        lowStock: lowStock,
      };
    },
  });
};

// Chat
export const useChatSessions = () => {
  return useQuery({
    queryKey: ["admin-chat-sessions"],
    queryFn: async () => {
      const q = query(collection(db, "chat_sessions"), orderBy("last_message_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        last_message_at: formatTimestamp(doc.data().last_message_at)
      }));
    },
  });
};

export const useChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["chat-messages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const q = query(collection(db, `chat_sessions/${sessionId}/messages`), orderBy("created_at", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: formatTimestamp(doc.data().created_at)
      }));
    },
    enabled: !!sessionId,
  });
};

// Blog Posts
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const q = query(collection(db, "blog_posts"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: formatTimestamp(doc.data().created_at)
      }));
    },
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: any) => {
      await addDoc(collection(db, "blog_posts"), {
        ...post,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("ব্লগ পোস্ট যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const postRef = doc(db, "blog_posts", id);
      await updateDoc(postRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("ব্লগ পোস্ট আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "blog_posts", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("ব্লগ পোস্ট মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Testimonials
export const useTestimonials = () => {
  return useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const q = query(collection(db, "testimonials"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: formatTimestamp(doc.data().created_at)
      }));
    },
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testimonial: any) => {
      await addDoc(collection(db, "testimonials"), {
        ...testimonial,
        created_at: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("টেস্টিমোনিয়াল যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const ref = doc(db, "testimonials", id);
      await updateDoc(ref, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("টেস্টিমোনিয়াল আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "testimonials", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast.success("টেস্টিমোনিয়াল মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

