-- Add real_date column to runs table
ALTER TABLE runs 
ADD COLUMN real_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL; 