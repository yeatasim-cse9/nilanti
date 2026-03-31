import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useAdminData";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const MetaPixel = () => {
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const pixelId = settings?.fb_pixel_id || import.meta.env.VITE_FB_PIXEL_ID;

  useEffect(() => {
    if (!pixelId) return;

    // Initialize Pixel if not already done
    if (!window.fbq) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;

        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      window.fbq("init", pixelId);
    }
  }, [pixelId]);

  useEffect(() => {
    if (window.fbq && pixelId) {
      window.fbq("track", "PageView");
    }
  }, [location, pixelId]);

  return null;
};

export default MetaPixel;
