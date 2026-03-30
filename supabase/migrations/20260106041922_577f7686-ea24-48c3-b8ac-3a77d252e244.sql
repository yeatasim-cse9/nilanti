-- Insert Categories
INSERT INTO categories (name, name_bn, slug, description_bn, image_url, sort_order, is_active) VALUES
('Honey', 'মধু', 'honey', 'খাঁটি ও বিশুদ্ধ প্রাকৃতিক মধু', 'https://ghorerbazar.com/cdn/shop/files/Crystal_honey_webslider_1.png?v=1767270852&width=360', 1, true),
('Ghee', 'ঘি', 'ghee', 'খাঁটি গাওয়া ঘি - বাঙালির ঐতিহ্য', 'https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533', 2, true),
('Oil', 'তেল', 'oil', 'দেশি সরিষার তেল ও অন্যান্য স্বাস্থ্যকর তেল', 'https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533', 3, true),
('Dates', 'খেজুর', 'dates', 'প্রিমিয়াম মানের আরবি খেজুর', 'https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533', 4, true),
('Nuts & Dry Fruits', 'বাদাম ও শুকনো ফল', 'nuts-dry-fruits', 'পুষ্টিকর বাদাম ও শুকনো ফল', 'https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533', 5, true),
('Masala', 'মশলা', 'masala', 'বাছাইকৃত সেরা মশলা', 'https://ghorerbazar.com/cdn/shop/files/Premium-masala-combo.jpg?v=1754736848&width=533', 6, true);

-- Insert Products for Honey Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Sundarban Honey 1kg',
  'সুন্দরবনের মধু ১ কেজি',
  'sundarban-honey-1kg',
  'সুন্দরবন ফুলের মধু: পীতাভ বাদামী রঙের মতো দেখতে মধুই সুন্দরবনের খাঁটি ও বিশুদ্ধ মধু। এই মধু প্রাকৃতিকভাবে সংগ্রহ করা হয় এবং কোনো প্রকার ভেজাল ছাড়াই আপনার কাছে পৌঁছে দেওয়া হয়।',
  2500,
  2200,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/WhatsApp_Image_2025-11-04_at_18.51.14_1.jpg?v=1762261008&width=533'],
  true,
  true,
  id,
  50
FROM categories WHERE slug = 'honey';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Natural Honeycomb 1kg',
  'প্রাকৃতিক চাকের মধু ১ কেজি',
  'natural-honeycomb-1kg',
  'হলদে বাদামী রঙের চাক সহ প্রাকৃতিক মধু। এই মধু সরাসরি মৌচাক থেকে সংগ্রহ করা হয়। চাক সহ মধু খাওয়ার অভিজ্ঞতা সম্পূর্ণ আলাদা।',
  2500,
  2250,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Natural-Honey-Tiffin-box.jpg?v=1765633957&width=533'],
  true,
  true,
  id,
  30
FROM categories WHERE slug = 'honey';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Litchi Flower Honey 1kg',
  'লিচু ফুলের মধু ১ কেজি',
  'litchi-flower-honey-1kg',
  'লিচু ফুলের সুগন্ধি মধু। লিচু বাগান থেকে সংগৃহীত এই মধু স্বাদে অতুলনীয়। প্রাকৃতিক ও খাঁটি।',
  1800,
  1600,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Crystal_honey_webslider_1.png?v=1767270852&width=360'],
  false,
  true,
  id,
  40
FROM categories WHERE slug = 'honey';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Mustard Flower Honey 500g',
  'সরিষা ফুলের মধু ৫০০ গ্রাম',
  'mustard-flower-honey-500g',
  'সরিষা ফুলের বিশেষ মধু। শীতকালে সরিষা ক্ষেত থেকে সংগৃহীত। হালকা হলুদ রঙের এই মধু স্বাস্থ্যের জন্য অত্যন্ত উপকারী।',
  900,
  800,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Crystal_honey_webslider_1.png?v=1767270852&width=360'],
  false,
  true,
  id,
  60
FROM categories WHERE slug = 'honey';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Black Seed Honey 500g',
  'কালোজিরা ফুলের মধু ৫০০ গ্রাম',
  'black-seed-honey-500g',
  'কালোজিরা ফুলের মধু। কালোজিরার ঔষধি গুণাগুণ সমৃদ্ধ এই মধু রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।',
  1200,
  1050,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Crystal_honey_webslider_1.png?v=1767270852&width=360'],
  false,
  true,
  id,
  45
FROM categories WHERE slug = 'honey';

-- Insert Products for Ghee Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Gawa Ghee 1kg',
  'গাওয়া ঘি ১ কেজি',
  'gawa-ghee-1kg',
  'খাঁটি গাওয়া ঘি দুধের একটি প্রক্রিয়াজাত খাদ্য উপাদান। হাজার বছর আগে বাঙালির খাবারে ঘি-এর উৎপত্তি। রান্নায় অতুলনীয় স্বাদ এবং সুগন্ধ যোগ করে।',
  1800,
  NULL,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533'],
  true,
  true,
  id,
  35
FROM categories WHERE slug = 'ghee';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Gawa Ghee 500g',
  'গাওয়া ঘি ৫০০ গ্রাম',
  'gawa-ghee-500g',
  'খাঁটি গাওয়া ঘি। দুধের সর থেকে তৈরি। ছোট পরিবারের জন্য উপযুক্ত প্যাকেজ।',
  950,
  900,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533'],
  false,
  true,
  id,
  50
FROM categories WHERE slug = 'ghee';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Gawa Ghee 250g',
  'গাওয়া ঘি ২৫০ গ্রাম',
  'gawa-ghee-250g',
  'খাঁটি গাওয়া ঘি। ট্রায়াল প্যাকেজ। প্রথমবার ব্যবহারকারীদের জন্য উপযুক্ত।',
  500,
  450,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533'],
  false,
  true,
  id,
  70
FROM categories WHERE slug = 'ghee';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Buffalo Ghee 1kg',
  'মহিষের ঘি ১ কেজি',
  'buffalo-ghee-1kg',
  'খাঁটি মহিষের দুধের ঘি। গরুর ঘি থেকে বেশি ফ্যাট সমৃদ্ধ। বিশেষ রান্নার জন্য উপযুক্ত।',
  2200,
  2000,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533'],
  false,
  true,
  id,
  25
FROM categories WHERE slug = 'ghee';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Premium Ghee 2kg',
  'প্রিমিয়াম ঘি ২ কেজি',
  'premium-ghee-2kg',
  'উচ্চমানের প্রিমিয়াম ঘি। বড় পরিবার বা ব্যবসায়িক ব্যবহারের জন্য সাশ্রয়ী প্যাকেজ।',
  3400,
  3200,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shosti-Ghee-1kg.jpg?v=1762321237&width=533'],
  false,
  true,
  id,
  20
FROM categories WHERE slug = 'ghee';

-- Insert Products for Oil Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Deshi Mustard Oil 5L',
  'দেশি সরিষার তেল ৫ লিটার',
  'deshi-mustard-oil-5l',
  'সয়াবিন তেল বাজারে আসার পর থেকে আমরা অনেকেই সরিষার তেলের উপকারিতা ভুলে গেছি। অথচ সরিষার তেল স্বাস্থ্যের জন্য অত্যন্ত উপকারী।',
  1550,
  NULL,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  true,
  true,
  id,
  40
FROM categories WHERE slug = 'oil';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Deshi Mustard Oil 2L',
  'দেশি সরিষার তেল ২ লিটার',
  'deshi-mustard-oil-2l',
  'খাঁটি দেশি সরিষার তেল। ছোট পরিবারের জন্য উপযুক্ত প্যাকেজ।',
  650,
  600,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  55
FROM categories WHERE slug = 'oil';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Deshi Mustard Oil 1L',
  'দেশি সরিষার তেল ১ লিটার',
  'deshi-mustard-oil-1l',
  'খাঁটি দেশি সরিষার তেল। ট্রায়াল প্যাকেজ।',
  350,
  320,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  80
FROM categories WHERE slug = 'oil';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Coconut Oil 500ml',
  'নারকেল তেল ৫০০ মিলি',
  'coconut-oil-500ml',
  'খাঁটি নারকেল তেল। চুল ও ত্বকের যত্নে এবং রান্নায় ব্যবহার করা যায়।',
  450,
  400,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  60
FROM categories WHERE slug = 'oil';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Olive Oil Extra Virgin 500ml',
  'অলিভ অয়েল এক্সট্রা ভার্জিন ৫০০ মিলি',
  'olive-oil-extra-virgin-500ml',
  'আমদানিকৃত এক্সট্রা ভার্জিন অলিভ অয়েল। সালাদ ড্রেসিং ও হালকা রান্নায় ব্যবহার উপযোগী।',
  850,
  800,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  35
FROM categories WHERE slug = 'oil';

-- Insert Products for Dates Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Sukkari Mufattal Malaki Dates 1kg',
  'সুক্কারি মুফাত্তাল মালাকি খেজুর ১ কেজি',
  'sukkari-dates-1kg',
  'সৌদি আরবের ঐতিহ্যবাহী ও প্রিমিয়াম মানের সুক্কারি মুফাত্তাল মালাকি খেজুর স্বাদ ও গুণে অনন্য। প্রাকৃতিকভাবে মিষ্টি।',
  1500,
  1350,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533'],
  true,
  true,
  id,
  45
FROM categories WHERE slug = 'dates';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Ajwa Premium Dates 1kg',
  'আজওয়া প্রিমিয়াম খেজুর ১ কেজি',
  'ajwa-premium-dates-1kg',
  'মদিনা থেকে সংগৃহীত সর্বোচ্চ মানের আজওয়া খেজুর। স্বাস্থ্য সুরক্ষায় অতুলনীয়।',
  2500,
  2100,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533'],
  true,
  true,
  id,
  30
FROM categories WHERE slug = 'dates';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Medjool Dates 500g',
  'মেডজুল খেজুর ৫০০ গ্রাম',
  'medjool-dates-500g',
  'বড় আকারের প্রিমিয়াম মেডজুল খেজুর। নরম ও মিষ্টি স্বাদ।',
  1800,
  1600,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533'],
  false,
  true,
  id,
  25
FROM categories WHERE slug = 'dates';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Maryam Dates 1kg',
  'মরিয়ম খেজুর ১ কেজি',
  'maryam-dates-1kg',
  'ইরানি মরিয়ম খেজুর। শুকনো ও মিষ্টি। দীর্ঘদিন সংরক্ষণ করা যায়।',
  900,
  800,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533'],
  false,
  true,
  id,
  55
FROM categories WHERE slug = 'dates';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Safawi Dates 1kg',
  'সাফাওয়ি খেজুর ১ কেজি',
  'safawi-dates-1kg',
  'মদিনার সাফাওয়ি খেজুর। কালো রঙের এই খেজুর স্বাদে অনন্য।',
  1200,
  1050,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Sukkari-Dates_1kg_V1_1.jpg?v=1767444935&width=533'],
  false,
  true,
  id,
  40
FROM categories WHERE slug = 'dates';

-- Insert Products for Nuts Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Honey Nuts 800g',
  'হানিনাট ৮০০ গ্রাম',
  'honey-nuts-800g',
  'বাদাম এবং মধুর মধ্যে সম্পর্ক নতুন বলে মনে হতে পারে, কিন্তু বাদাম এবং মধুর ইতিহাস অনেক পুরনো। পুষ্টিকর ও সুস্বাদু।',
  1500,
  NULL,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533'],
  true,
  true,
  id,
  35
FROM categories WHERE slug = 'nuts-dry-fruits';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Cashew Nuts 500g',
  'কাজু বাদাম ৫০০ গ্রাম',
  'cashew-nuts-500g',
  'প্রিমিয়াম মানের কাজু বাদাম। রান্না ও স্ন্যাকস হিসেবে উপযুক্ত।',
  850,
  800,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533'],
  false,
  true,
  id,
  50
FROM categories WHERE slug = 'nuts-dry-fruits';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Almonds 500g',
  'আমন্ড বাদাম ৫০০ গ্রাম',
  'almonds-500g',
  'ক্যালিফোর্নিয়া আমন্ড। ব্রেইন ফুড হিসেবে পরিচিত।',
  750,
  700,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533'],
  false,
  true,
  id,
  45
FROM categories WHERE slug = 'nuts-dry-fruits';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Walnuts 250g',
  'আখরোট ২৫০ গ্রাম',
  'walnuts-250g',
  'খাঁটি আখরোট। ওমেগা-৩ সমৃদ্ধ। মস্তিষ্কের জন্য উপকারী।',
  550,
  500,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533'],
  false,
  true,
  id,
  40
FROM categories WHERE slug = 'nuts-dry-fruits';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Mixed Dry Fruits 1kg',
  'মিক্সড ড্রাই ফ্রুটস ১ কেজি',
  'mixed-dry-fruits-1kg',
  'বিভিন্ন ধরনের বাদাম ও শুকনো ফলের মিশ্রণ। স্বাস্থ্যকর স্ন্যাকস।',
  1800,
  1650,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Honey_nuts_800g.jpg?v=1754736848&width=533'],
  false,
  true,
  id,
  30
FROM categories WHERE slug = 'nuts-dry-fruits';

-- Insert Products for Masala Category
INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Premium Masala Combo',
  'প্রিমিয়াম মশলা কম্বো',
  'premium-masala-combo',
  'বাছাইকৃত সেরা মশলার মিশ্রণ। রান্নায় অতুলনীয় স্বাদ আনতে এই মশলা ব্যবহার করুন।',
  1785,
  1600,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  true,
  true,
  id,
  40
FROM categories WHERE slug = 'masala';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Turmeric Powder 500g',
  'হলুদ গুঁড়া ৫০০ গ্রাম',
  'turmeric-powder-500g',
  'খাঁটি হলুদ গুঁড়া। রান্না ও স্বাস্থ্য রক্ষায় অপরিহার্য।',
  250,
  220,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  80
FROM categories WHERE slug = 'masala';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Chili Powder 500g',
  'মরিচ গুঁড়া ৫০০ গ্রাম',
  'chili-powder-500g',
  'ঝাল মরিচ গুঁড়া। রান্নায় ঝাল স্বাদ আনতে ব্যবহার করুন।',
  300,
  270,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  75
FROM categories WHERE slug = 'masala';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Cumin Powder 250g',
  'জিরা গুঁড়া ২৫০ গ্রাম',
  'cumin-powder-250g',
  'খাঁটি জিরা গুঁড়া। রান্নায় সুগন্ধ যোগ করে।',
  180,
  160,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  90
FROM categories WHERE slug = 'masala';

INSERT INTO products (name, name_bn, slug, description_bn, base_price, sale_price, images, is_featured, is_active, category_id, stock_quantity)
SELECT 
  'Coriander Powder 250g',
  'ধনিয়া গুঁড়া ২৫০ গ্রাম',
  'coriander-powder-250g',
  'খাঁটি ধনিয়া গুঁড়া। বাঙালি রান্নার অপরিহার্য উপকরণ।',
  150,
  130,
  ARRAY['https://ghorerbazar.com/cdn/shop/files/Shsoti-Mastraid-oil5lt.jpg?v=1767012506&width=533'],
  false,
  true,
  id,
  85
FROM categories WHERE slug = 'masala';