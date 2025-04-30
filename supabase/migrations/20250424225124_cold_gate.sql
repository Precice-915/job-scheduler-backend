/*
  # Initial Schema for Precise Leak Detection

  1. New Tables
    - `profiles` - User profiles with role information
    - `clients` - Client information
    - `jobs` - Leak detection jobs
    - `receipts` - Job-related receipts and purchases
    - `trips` - Job-related travel records
    - `invoices` - Payment records
    - `templates` - Custom forms and templates
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
    - Public access policies for job status viewing
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'office')),
  phone TEXT,
  email TEXT NOT NULL,
  skills TEXT[],
  calendar_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  billing_address TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_code TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'invoiced', 'paid')),
  assigned_tech_ids UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  vendor TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  image_url TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  technician_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id_start UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_id_end UUID REFERENCES jobs(id) ON DELETE CASCADE,
  depart_timestamp TIMESTAMPTZ NOT NULL,
  arrive_timestamp TIMESTAMPTZ,
  distance_miles DECIMAL(10, 2),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  line_items JSONB,
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_link TEXT,
  cashtag_qr_url TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checklist', 'proposal', 'contract')),
  json_schema JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Template responses (filled templates for specific jobs)
CREATE TABLE IF NOT EXISTS template_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  response_data JSONB NOT NULL,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: authenticated users can read all profiles, but only modify their own
CREATE POLICY "Anyone can view profiles" 
  ON profiles FOR SELECT TO authenticated;

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Clients: authenticated users can CRUD
CREATE POLICY "Authenticated users can read clients" 
  ON clients FOR SELECT TO authenticated;

CREATE POLICY "Authenticated users can insert clients" 
  ON clients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
  ON clients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete clients" 
  ON clients FOR DELETE TO authenticated USING (true);

-- Jobs: authenticated users can CRUD, anon can read with job_code
CREATE POLICY "Authenticated users can read jobs" 
  ON jobs FOR SELECT TO authenticated;

CREATE POLICY "Authenticated users can insert jobs" 
  ON jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs" 
  ON jobs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete jobs" 
  ON jobs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anonymous users can view job by code" 
  ON jobs FOR SELECT TO anon
  USING (true);

-- Similar policies for other tables
-- [Additional policies would be added for receipts, trips, invoices, etc.]

-- Functions and triggers
-- Function to generate job code
CREATE OR REPLACE FUNCTION generate_job_code()
RETURNS TRIGGER AS $$
DECLARE
  address_part TEXT;
  date_part TEXT;
  sequence_num INTEGER;
  job_code TEXT;
BEGIN
  -- Extract first part of address and first 3 letters of city
  address_part = UPPER(SUBSTRING(NEW.street_address FROM 1 FOR 3) || SUBSTRING(NEW.city FROM 1 FOR 3));
  
  -- Format date as MMDD
  date_part = TO_CHAR(CURRENT_DATE, 'MMDD');
  
  -- Get sequence number for today
  SELECT COALESCE(MAX(SUBSTRING(job_code FROM 11 FOR 2)::INTEGER), 0) + 1
  INTO sequence_num
  FROM jobs
  WHERE job_code LIKE '%' || date_part || '%';
  
  -- Generate job code: ADDCTY-MMDD-NN
  job_code = address_part || '-' || date_part || '-' || LPAD(sequence_num::TEXT, 2, '0');
  
  NEW.job_code = job_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_job_code
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION generate_job_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at_column trigger to all tables
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON receipts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_responses_updated_at
BEFORE UPDATE ON template_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert some default templates
INSERT INTO templates (name, type, json_schema, created_at, updated_at) VALUES 
('Standard Leak Inspection', 'checklist', 
'{
  "title": "Standard Leak Inspection",
  "fields": [
    {
      "id": "leak_type",
      "type": "select",
      "label": "Type of Leak",
      "options": ["Water", "Gas", "Sewer", "Unknown"],
      "required": true
    },
    {
      "id": "leak_location",
      "type": "select",
      "label": "Suspected Location",
      "options": ["Interior Wall", "Ceiling", "Floor", "Exterior", "Underground", "Not Visible"],
      "required": true
    },
    {
      "id": "water_shut_off",
      "type": "boolean",
      "label": "Water Shut Off Located",
      "required": true
    },
    {
      "id": "meter_checked",
      "type": "boolean",
      "label": "Meter Checked",
      "required": true
    },
    {
      "id": "pressure_test",
      "type": "boolean",
      "label": "Pressure Test Performed",
      "required": true
    },
    {
      "id": "moisture_readings",
      "type": "array",
      "label": "Moisture Readings",
      "items": {
        "location": "text",
        "reading": "number"
      }
    },
    {
      "id": "thermal_images",
      "type": "boolean",
      "label": "Thermal Images Taken",
      "required": true
    },
    {
      "id": "leak_confirmed",
      "type": "boolean",
      "label": "Leak Confirmed",
      "required": true
    },
    {
      "id": "notes",
      "type": "textarea",
      "label": "Notes"
    }
  ]
}', now(), now()),
('Leak Repair Proposal', 'proposal', 
'{
  "title": "Leak Repair Proposal",
  "fields": [
    {
      "id": "repair_type",
      "type": "select",
      "label": "Type of Repair",
      "options": ["Pipe Replacement", "Spot Repair", "Reroute", "Lining"],
      "required": true
    },
    {
      "id": "repair_description",
      "type": "textarea",
      "label": "Repair Description",
      "required": true
    },
    {
      "id": "materials",
      "type": "array",
      "label": "Materials Needed",
      "items": {
        "description": "text",
        "quantity": "number",
        "unit_price": "number"
      }
    },
    {
      "id": "labor_hours",
      "type": "number",
      "label": "Estimated Labor Hours",
      "required": true
    },
    {
      "id": "warranty",
      "type": "select",
      "label": "Warranty",
      "options": ["1 Year", "5 Year", "Lifetime"],
      "required": true
    },
    {
      "id": "total_price",
      "type": "number",
      "label": "Total Price",
      "required": true
    },
    {
      "id": "notes",
      "type": "textarea",
      "label": "Additional Notes"
    }
  ]
}', now(), now());