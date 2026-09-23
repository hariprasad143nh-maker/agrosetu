-- AgroSetu Supabase Schema

-- Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL, -- farmer, vendor, industry, collection, cooling
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms Table
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.users(id),
  farm_name TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  area DECIMAL,
  crop_types TEXT[]
);

-- Produce Batches Table
CREATE TABLE public.produce_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.users(id),
  produce_type TEXT NOT NULL,
  variety TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  harvest_date DATE,
  harvest_time TIME,
  temperature DECIMAL,
  humidity DECIMAL,
  transport_time DECIMAL, -- in hours
  storage_type TEXT,
  storage_temperature DECIMAL,
  storage_humidity DECIMAL,
  latitude DECIMAL,
  longitude DECIMAL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Freshness Predictions
CREATE TABLE public.freshness_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES public.produce_batches(id),
  freshness_status TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  estimated_min_days INTEGER,
  estimated_max_days INTEGER,
  recommended_action TEXT,
  prediction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cooling Hubs
CREATE TABLE public.cooling_hubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  operator_id UUID REFERENCES public.users(id),
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  capacity DECIMAL,
  available_capacity DECIMAL,
  supported_produce TEXT[],
  cooling_type TEXT,
  status TEXT DEFAULT 'active',
  contact TEXT
);

-- Residue Listings
CREATE TABLE public.residue_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES public.users(id),
  residue_type TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  quality TEXT,
  moisture DECIMAL,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  available_from DATE,
  available_until DATE,
  expected_price DECIMAL,
  status TEXT DEFAULT 'active'
);

-- Industry Demands
CREATE TABLE public.industry_demands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID REFERENCES public.users(id),
  material_type TEXT NOT NULL,
  required_quantity DECIMAL NOT NULL,
  quality_requirement TEXT,
  moisture_requirement DECIMAL,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  required_from DATE,
  required_until DATE,
  status TEXT DEFAULT 'active'
);

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  residue_listing_id UUID REFERENCES public.residue_listings(id),
  industry_demand_id UUID REFERENCES public.industry_demands(id),
  material_score DECIMAL,
  quantity_score DECIMAL,
  quality_score DECIMAL,
  distance_score DECIMAL,
  availability_score DECIMAL,
  overall_score DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- Collection Centres
CREATE TABLE public.collection_centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  capacity DECIMAL,
  accepted_materials TEXT[],
  status TEXT DEFAULT 'active'
);

-- Collection Clusters
CREATE TABLE public.collection_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  total_quantity DECIMAL,
  centre_id UUID REFERENCES public.collection_centres(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport Routes
CREATE TABLE public.transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cluster_id UUID REFERENCES public.collection_clusters(id),
  origin TEXT,
  destination TEXT,
  distance DECIMAL,
  estimated_time DECIMAL,
  vehicle_capacity DECIMAL,
  estimated_cost DECIMAL
);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
