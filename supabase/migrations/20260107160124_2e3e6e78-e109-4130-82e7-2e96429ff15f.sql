-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  author TEXT DEFAULT 'অর্গানিক স্টোর',
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create page_contents table for policy pages
CREATE TABLE public.page_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_bn TEXT,
  content JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create homepage_sections table
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  title_bn TEXT,
  subtitle TEXT,
  subtitle_bn TEXT,
  content JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create testimonials table for customer reviews
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  product_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Page contents policies
CREATE POLICY "Page contents are viewable by everyone" ON public.page_contents
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage page contents" ON public.page_contents
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Homepage sections policies
CREATE POLICY "Active homepage sections are viewable by everyone" ON public.homepage_sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage homepage sections" ON public.homepage_sections
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Testimonials policies
CREATE POLICY "Active testimonials are viewable by everyone" ON public.testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert default page contents
INSERT INTO public.page_contents (page_key, title, title_bn, content) VALUES
('return_policy', 'Return Policy', 'রিটার্ন পলিসি', '{"sections": [{"title": "রিটার্ন শর্তাবলী", "content": "পণ্য রিসিভ করার ২৪ ঘন্টার মধ্যে রিটার্ন রিকোয়েস্ট করতে হবে।"}, {"title": "রিটার্ন প্রক্রিয়া", "content": "আমাদের কাস্টমার সার্ভিসে কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ করুন।"}]}'),
('shipping_policy', 'Shipping Policy', 'শিপিং পলিসি', '{"sections": [{"title": "ডেলিভারি সময়", "content": "ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।"}, {"title": "ডেলিভারি চার্জ", "content": "ঢাকার ভিতরে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।"}]}'),
('terms', 'Terms & Conditions', 'টার্মস & কন্ডিশন', '{"sections": [{"title": "সাধারণ শর্তাবলী", "content": "আমাদের ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন।"}]}'),
('privacy_policy', 'Privacy Policy', 'প্রাইভেসি পলিসি', '{"sections": [{"title": "তথ্য সংগ্রহ", "content": "আমরা শুধুমাত্র অর্ডার প্রসেস করার জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি।"}]}'),
('faq', 'FAQ', 'সাধারণ জিজ্ঞাসা', '{"questions": [{"question": "অর্ডার করার পর কতদিনে পণ্য পাব?", "answer": "ঢাকার ভিতরে ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে পণ্য পৌঁছে যাবে।"}, {"question": "ক্যাশ অন ডেলিভারি সুবিধা আছে?", "answer": "হ্যাঁ, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা পাবেন।"}]}'),
('contact', 'Contact Information', 'যোগাযোগ তথ্য', '{"phone": "০১৭০০-০০০০০০", "email": "info@organicstore.com", "address": "ঢাকা, বাংলাদেশ", "whatsapp": "০১৭০০-০০০০০০"}');

-- Insert default homepage sections
INSERT INTO public.homepage_sections (section_key, title, title_bn, subtitle, subtitle_bn, content) VALUES
('why_choose_us', 'Why Choose Us', 'কেন আমাদের বেছে নেবেন?', 'See the difference', 'পার্থক্যটা দেখুন', '[{"feature": "পণ্যের মান", "others": "মিশ্রিত বা ভেজাল পণ্য", "us": "১০০% খাঁটি ও প্রাকৃতিক"}, {"feature": "দাম", "others": "অতিরিক্ত দাম", "us": "ন্যায্য ও সাশ্রয়ী মূল্য"}, {"feature": "ডেলিভারি", "others": "দেরিতে ডেলিভারি", "us": "দ্রুত ও নিরাপদ ডেলিভারি"}, {"feature": "কাস্টমার সার্ভিস", "others": "দুর্বল সাপোর্ট", "us": "২৪/৭ কাস্টমার সাপোর্ট"}]'),
('money_back_guarantee', 'Money Back Guarantee', '১০০% মানি ব্যাক গ্যারান্টি', 'Your satisfaction is our priority', 'আপনার সন্তুষ্টি আমাদের প্রাধান্য', '{"description": "আমরা আমাদের পণ্যের গুণমান নিয়ে এতটাই আত্মবিশ্বাসী যে, যদি আপনি সন্তুষ্ট না হন, আমরা আপনার পুরো টাকা ফেরত দেব।", "cta_text": "এখনই কেনাকাটা করুন", "cta_link": "/products"}'),
('order_confirmation', 'Order Confirmation', 'অর্ডার নিশ্চিতকরণ', '', '', '{"note": "আপনার অর্ডারের জন্য ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।", "thank_you_message": "অর্ডার সফলভাবে সম্পন্ন হয়েছে!"}'),
('company_info', 'Company Info', 'কোম্পানি তথ্য', '', '', '{"short_description": "অর্গানিক স্টোর বাংলাদেশের অন্যতম বিশ্বস্ত অনলাইন শপ। আমরা ১০০% খাঁটি ও প্রাকৃতিক পণ্য সরবরাহ করি।", "about_us": "আমরা ২০২০ সাল থেকে গ্রাহকদের সেবা দিয়ে আসছি।"}');

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, rating, comment, product_name, sort_order) VALUES
('রহিম উদ্দিন', 5, 'অসাধারণ পণ্য! সত্যিই খাঁটি মধু পেয়েছি। আবার অর্ডার করব।', 'সুন্দরবনের খাঁটি মধু', 1),
('করিম সাহেব', 5, 'দ্রুত ডেলিভারি এবং পণ্যের মান চমৎকার। ধন্যবাদ অর্গানিক স্টোর!', 'খেজুরের গুড়', 2),
('ফাতেমা বেগম', 4, 'ঘিয়ের স্বাদ অসাধারণ। পরিবারের সবাই পছন্দ করেছে।', 'দেশি গাওয়া ঘি', 3);

-- Add trigger for updated_at on blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on page_contents
CREATE TRIGGER update_page_contents_updated_at
  BEFORE UPDATE ON public.page_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on homepage_sections
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON public.homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();