-- Create runs table
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration TEXT NOT NULL,
    profit DECIMAL NOT NULL,
    average_frequency DECIMAL NOT NULL,
    renewable_percentage DECIMAL NOT NULL,
    total_emissions DECIMAL NOT NULL,
    user_id TEXT, -- For future auth integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 