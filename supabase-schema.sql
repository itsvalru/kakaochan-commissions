-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table already exists, so we'll skip creation
-- Just ensure the trigger function exists for new user creation

-- Commission Offers table (for admin to manage)
CREATE TABLE public.commission_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_name TEXT NOT NULL,
  type_name TEXT NOT NULL,
  subtype_name TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  character_count_max INTEGER,
  character_count_price_per_extra DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combinations
  UNIQUE(category_name, type_name, subtype_name)
);

-- Commission Offer Fields table (for dynamic inputs)
CREATE TABLE public.commission_offer_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id UUID REFERENCES public.commission_offers(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('input', 'boolean', 'list')),
  field_name TEXT NOT NULL,
  field_price DECIMAL(10,2),
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Offer Addons table
CREATE TABLE public.commission_offer_addons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id UUID REFERENCES public.commission_offers(id) ON DELETE CASCADE,
  addon_name TEXT NOT NULL,
  addon_type TEXT NOT NULL CHECK (addon_type IN ('input', 'boolean', 'list')),
  addon_price DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions table (submitted commissions)
CREATE TABLE public.commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.commission_offers(id),
  
  -- Commission details
  category_name TEXT NOT NULL,
  type_name TEXT NOT NULL,
  subtype_name TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2), -- Set by KakaoChan after review
  
  -- Commission configuration
  character_count INTEGER DEFAULT 1,
  extra_character_price DECIMAL(10,2) DEFAULT 0,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('personal', 'commercial', 'content')),
  allow_streaming BOOLEAN DEFAULT TRUE,
  
  -- Commission data
  comm_specific_data JSONB, -- Store field values
  addons_data JSONB, -- Store addon selections
  reference_urls TEXT[], -- Store reference URLs
  extra_info TEXT,
  
  -- Status and workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'waitlist', 'payment', 'wip', 'finished')),
  total_price DECIMAL(10,2), -- Calculated total price
  form_snapshot JSONB, -- Store complete form state for drafts
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  waitlisted_at TIMESTAMP WITH TIME ZONE,
  payment_requested_at TIMESTAMP WITH TIME ZONE,
  work_started_at TIMESTAMP WITH TIME ZONE
);

-- Commission Messages table (for ticket communication)
CREATE TABLE public.commission_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  commission_id UUID REFERENCES public.commissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'status_update')),
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.commission_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_offer_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_offer_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_messages ENABLE ROW LEVEL SECURITY;

-- Commission offers policies (public read, admin write)
CREATE POLICY "Anyone can view active commission offers" ON public.commission_offers
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage commission offers" ON public.commission_offers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Commission offer fields policies
CREATE POLICY "Anyone can view commission offer fields" ON public.commission_offer_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commission_offers 
      WHERE commission_offers.id = commission_offer_fields.offer_id 
      AND commission_offers.is_active = TRUE
    )
  );

CREATE POLICY "Admins can manage commission offer fields" ON public.commission_offer_fields
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Commission offer addons policies
CREATE POLICY "Anyone can view commission offer addons" ON public.commission_offer_addons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commission_offers 
      WHERE commission_offers.id = commission_offer_addons.offer_id 
      AND commission_offers.is_active = TRUE
    )
  );

CREATE POLICY "Admins can manage commission offer addons" ON public.commission_offer_addons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Commissions policies
CREATE POLICY "Users can view their own commissions" ON public.commissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own commissions" ON public.commissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own draft commissions" ON public.commissions
  FOR UPDATE USING (user_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can view all commissions" ON public.commissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all commissions" ON public.commissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Commission messages policies
CREATE POLICY "Users can view messages for their commissions" ON public.commission_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE commissions.id = commission_messages.commission_id 
      AND commissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their commissions" ON public.commission_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE commissions.id = commission_messages.commission_id 
      AND commissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages" ON public.commission_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can create messages for any commission" ON public.commission_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.is_admin = TRUE
    )
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_commission_offers_updated_at BEFORE UPDATE ON public.commission_offers
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column(); 