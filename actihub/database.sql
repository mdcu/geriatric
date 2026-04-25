-- Activities Table
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  place TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Registrations Table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hn TEXT NOT NULL,
  tel TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)

-- Activities: Public can read, authenticated can CRUD
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public activities are viewable by everyone" 
ON activities FOR SELECT USING (true);

CREATE POLICY "Officers can insert activities" 
ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Officers can update their own activities" 
ON activities FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Officers can delete their own activities" 
ON activities FOR DELETE USING (auth.role() = 'authenticated');

-- Registrations: Public can insert, authenticated can read/delete
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for an activity" 
ON registrations FOR INSERT WITH CHECK (true);

CREATE POLICY "Officers can view registrations" 
ON registrations FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Officers can delete registrations" 
ON registrations FOR DELETE USING (auth.role() = 'authenticated');
