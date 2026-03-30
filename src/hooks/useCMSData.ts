import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { toast } from "sonner";
import { useEffect } from "react";

// Blog Posts
export const useBlogPosts = (publishedOnly = false) => {
  return useQuery({
    queryKey: ["blog-posts", publishedOnly],
    queryFn: async () => {
      let q = query(collection(db, "blog_posts"), orderBy("created_at", "desc"));
      
      if (publishedOnly) {
        q = query(q, where("is_published", "==", true));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
};

export const useBlogPost = (idOrSlug: string | undefined) => {
  return useQuery({
    queryKey: ["blog-post", idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      
      // Attempt by ID first
      const docRef = doc(db, "blog_posts", idOrSlug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      
      // Attempt by Slug
      const q = query(collection(db, "blog_posts"), where("slug", "==", idOrSlug), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const d = querySnapshot.docs[0];
        return { id: d.id, ...d.data() };
      }
      
      return null;
    },
    enabled: !!idOrSlug,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: any) => {
      const docRef = await addDoc(collection(db, "blog_posts"), {
        ...post,
        created_at: new Date().toISOString()
      });
      return docRef;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("ব্লগ পোস্ট যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const docRef = doc(db, "blog_posts", id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
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
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("ব্লগ পোস্ট মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Page Contents
export const usePageContents = () => {
  return useQuery({
    queryKey: ["page-contents"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "page_contents"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
};

export const usePageContent = (pageKey: string) => {
  return useQuery({
    queryKey: ["page-content", pageKey],
    queryFn: async () => {
      const q = query(collection(db, "page_contents"), where("page_key", "==", pageKey), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const d = querySnapshot.docs[0];
      return { id: d.id, ...d.data() };
    },
    enabled: !!pageKey,
  });
};

export const useUpdatePageContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pageKey, ...updates }: { pageKey: string; [key: string]: any }) => {
      const q = query(collection(db, "page_contents"), where("page_key", "==", pageKey), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, "page_contents", querySnapshot.docs[0].id);
        await updateDoc(docRef, updates);
      } else {
        // Create if it doesn't exist
        await addDoc(collection(db, "page_contents"), { page_key: pageKey, ...updates });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-contents"] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("পেইজ কন্টেন্ট আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

// Homepage Sections
export const useHomepageSections = () => {
  return useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "homepage_sections"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
};

export const useHomepageSection = (sectionId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["homepage-section", sectionId];

  useEffect(() => {
    if (!sectionId) return;
    const docRef = doc(db, "homepage_sections", sectionId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        queryClient.setQueryData(queryKey, { id: docSnap.id, ...docSnap.data() });
      } else {
        queryClient.setQueryData(queryKey, null);
      }
    });
    return () => unsubscribe();
  }, [sectionId, queryClient]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!sectionId) return null;
      const docRef = doc(db, "homepage_sections", sectionId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    },
    enabled: !!sectionId,
    staleTime: Infinity,
  });
};

import { setDoc } from "firebase/firestore";

export const useUpdateHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, ...updates }: { sectionId: string; [key: string]: any }) => {
      const docRef = doc(db, "homepage_sections", sectionId);
      await setDoc(docRef, updates, { merge: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-section"] });
      toast.success("সেকশন আপডেট হয়েছে");
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });
};

export const useCreateHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const docRef = doc(db, "homepage_sections", id);
      await setDoc(docRef, { ...data, created_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
      toast.success("নতুন সেকশন যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useDeleteHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionId: string) => {
      const docRef = doc(db, "homepage_sections", sectionId);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
      toast.success("সেকশন মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

// Testimonials
export const useTestimonials = (activeOnly = false) => {
  const queryClient = useQueryClient();
  const queryKey = ["testimonials", activeOnly];

  useEffect(() => {
    let q = query(collection(db, "testimonials"), orderBy("sort_order", "asc"));
    if (activeOnly) {
      q = query(q, where("is_active", "==", true));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      queryClient.setQueryData(queryKey, data);
    });
    return () => unsubscribe();
  }, [activeOnly, queryClient]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      let q = query(collection(db, "testimonials"), orderBy("sort_order", "asc"));
      
      if (activeOnly) {
        q = query(q, where("is_active", "==", true));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    staleTime: Infinity,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (testimonial: any) => {
      await addDoc(collection(db, "testimonials"), {
        ...testimonial,
        created_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("রিভিউ যোগ হয়েছে");
    },
    onError: () => toast.error("যোগ করা যায়নি"),
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const docRef = doc(db, "testimonials", id);
      await updateDoc(docRef, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("রিভিউ আপডেট হয়েছে");
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
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast.success("রিভিউ মুছে ফেলা হয়েছে");
    },
    onError: () => toast.error("মুছে ফেলা যায়নি"),
  });
};

export const useUpdateHomepageOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orders: { id: string; order: number }[]) => {
      const batch = writeBatch(db);
      orders.forEach((item) => {
        const docRef = doc(db, "homepage_sections", item.id);
        batch.update(docRef, { order: item.order });
      });
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] });
    },
    onError: () => toast.error("অর্ডার আপডেট করা যায়নি"),
  });
};


