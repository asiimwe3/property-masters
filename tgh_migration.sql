-- ============================================
-- TROPICAL GARDENS HOTEL — Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================

-- ── MENU ITEMS ──
CREATE TABLE IF NOT EXISTS public.menu_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'Lunch',
  price        INTEGER NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'UGX',
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured  BOOLEAN NOT NULL DEFAULT false,
  image_url    TEXT,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── ROOMS ──
CREATE TABLE IF NOT EXISTS public.rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'Standard',
  price_per_night INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'UGX',
  capacity        INTEGER DEFAULT 2,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  amenities       TEXT[],
  image_url       TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── BOOKINGS ──
CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name   TEXT NOT NULL,
  guest_email  TEXT NOT NULL,
  guest_phone  TEXT,
  room_id      UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  check_in     DATE NOT NULL,
  check_out    DATE NOT NULL,
  adults       INTEGER DEFAULT 1,
  children     INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  currency     TEXT DEFAULT 'UGX',
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes        TEXT,
  source       TEXT DEFAULT 'website',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- ── NOTIFICATIONS ──
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info'
             CHECK (type IN ('info','promo','alert','event')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── AUTO-UPDATE updated_at ──
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_menu_items_updated_at    ON public.menu_items;
DROP TRIGGER IF EXISTS trg_rooms_updated_at          ON public.rooms;
DROP TRIGGER IF EXISTS trg_bookings_updated_at       ON public.bookings;
DROP TRIGGER IF EXISTS trg_notifications_updated_at  ON public.notifications;

CREATE TRIGGER trg_menu_items_updated_at    BEFORE UPDATE ON public.menu_items    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rooms_updated_at          BEFORE UPDATE ON public.rooms          FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_bookings_updated_at       BEFORE UPDATE ON public.bookings       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_notifications_updated_at  BEFORE UPDATE ON public.notifications  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ROW LEVEL SECURITY ──
ALTER TABLE public.menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_menu          ON public.menu_items;
DROP POLICY IF EXISTS public_read_rooms         ON public.rooms;
DROP POLICY IF EXISTS public_read_notifications ON public.notifications;
DROP POLICY IF EXISTS public_insert_bookings    ON public.bookings;

CREATE POLICY public_read_menu          ON public.menu_items    FOR SELECT USING (true);
CREATE POLICY public_read_rooms         ON public.rooms          FOR SELECT USING (true);
CREATE POLICY public_read_notifications ON public.notifications  FOR SELECT USING (is_active = true);
CREATE POLICY public_insert_bookings    ON public.bookings       FOR INSERT WITH CHECK (true);

-- ── SEED: MENU ITEMS ──
INSERT INTO public.menu_items (name, description, category, price, is_available, is_featured) VALUES
('Rolex (Egg Roll)',        'Fresh chapati rolled with fried eggs, veggies and spices.',       'Breakfast', 8000,  true, true),
('Katogo (Offals & Matooke)','Traditional Ugandan morning stew with banana and offals.',        'Breakfast', 12000, true, false),
('Omelette & Toast',        'Fluffy omelette with toasted bread, butter and fresh juice.',     'Breakfast', 15000, true, false),
('Matooke & Groundnut Stew','Steamed green bananas served with rich groundnut sauce.',          'Lunch',     18000, true, true),
('Rice & Beans',            'Soft white rice with well-seasoned beans.',                        'Lunch',     12000, true, false),
('Chicken Stew & Posho',    'Tender chicken in tomato sauce with white maize porridge.',        'Lunch',     25000, true, true),
('Grilled Tilapia',         'Fresh Lake tilapia, grilled with lemon, herbs and chips.',         'Lunch',     35000, true, true),
('Beef Stew & Rice',        'Slow-cooked beef in rich tomato and onion gravy.',                 'Dinner',    28000, true, false),
('Roast Chicken',           'Quarter roast chicken with roasted vegetables and chips.',         'Dinner',    32000, true, true),
('BBQ Pork Ribs',           'Slow-smoked pork ribs glazed with house BBQ sauce.',              'Dinner',    45000, true, true),
('Passion Fruit Juice',     'Fresh-squeezed passion fruit, chilled.',                          'Drinks',     6000, true, true),
('Mango Smoothie',          'Blended fresh mangoes with milk and a hint of vanilla.',           'Drinks',     8000, true, false),
('Nile Special Beer',       'Uganda''s iconic lager, served ice cold.',                         'Drinks',     7000, true, false),
('Waragi Cocktail',         'Uganda Waragi gin mixed with fresh lime and tonic water.',         'Drinks',    12000, true, true),
('Chocolate Lava Cake',     'Warm chocolate cake with a molten centre, served with ice cream.', 'Desserts',  15000, true, true),
('Fresh Fruit Salad',       'Seasonal tropical fruits — mango, pineapple, banana, pawpaw.',     'Desserts',   8000, true, false)
ON CONFLICT DO NOTHING;

-- ── SEED: ROOMS ──
INSERT INTO public.rooms (name, description, category, price_per_night, capacity, is_available, is_featured, amenities) VALUES
('Garden View Standard', 'Cosy room overlooking our tropical garden gardens.', 'Standard', 120000, 2, true, false, ARRAY['WiFi','Hot Shower','AC','TV']),
('Deluxe Garden Suite',  'Spacious suite with private balcony and garden views.', 'Deluxe', 200000, 2, true, true,  ARRAY['WiFi','Hot Shower','AC','TV','Mini Bar','Balcony']),
('Family Cottage',       'Two-bedroom cottage perfect for families, with kitchenette.', 'Cottage', 280000, 4, true, true, ARRAY['WiFi','Hot Shower','AC','TV','Kitchenette','Garden Access']),
('Presidential Suite',   'Our finest suite with panoramic views, jacuzzi and butler service.', 'Suite', 500000, 2, true, true, ARRAY['WiFi','Jacuzzi','AC','Smart TV','Mini Bar','Butler Service','Balcony'])
ON CONFLICT DO NOTHING;

-- ── SEED: NOTIFICATIONS ──
INSERT INTO public.notifications (title, message, type, is_active) VALUES
('Welcome to Tropical Gardens Hotel', 'Experience nature and luxury in the heart of Kyenjojo, Uganda.', 'info', true),
('Weekend Special', 'Book 2 nights and get breakfast included — this weekend only!', 'promo', true)
ON CONFLICT DO NOTHING;

SELECT 'Migration complete ✅' AS status;
