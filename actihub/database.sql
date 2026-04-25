-- 1. Create Activities Table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    place TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Registrations Table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    hn TEXT NOT NULL,
    tel TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Tags Table (for autocomplete)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Activities
CREATE POLICY "Public Activities Read" ON activities FOR SELECT USING (true);
CREATE POLICY "Officers Activities All" ON activities FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Policies for Tags
CREATE POLICY "Public Tags Read" ON tags FOR SELECT USING (true);
CREATE POLICY "Officers Tags Insert" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Privacy-Hardened Policies for Registrations
-- Allow public to INSERT (register)
CREATE POLICY "Public Insert Registration" ON registrations FOR INSERT WITH CHECK (true);

-- SECURE VIEW: Exposes ONLY Name, Activity ID, and Time (No HN, No Tel)
CREATE OR REPLACE VIEW guest_registration_list AS
SELECT name, activity_id, created_at
FROM registrations;

-- Grant access to the view so guests can see who else is joining
GRANT SELECT ON guest_registration_list TO anon, authenticated;

-- OFFICERS ONLY: Full access to the raw registrations table (HN and Phone numbers)
CREATE POLICY "Officers Registrations All" ON registrations FOR ALL USING (auth.uid() IS NOT NULL);

-- Final Check: Ensure NO public select exists on the raw registrations table
DROP POLICY IF EXISTS "Public Registration Select Name" ON registrations;
