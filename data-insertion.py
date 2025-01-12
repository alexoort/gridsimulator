import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Use the pooled connection URL for better performance
DB_URL = os.getenv('DATABASE_URL')

if not DB_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Solar generation capacity in MW: https://www.iso-ne.com/static-assets/documents/100010/2024_pv_forecast_final_updated.pdf
SOLAR_CAPACITY = 7345.4
# Wind generation capacity in MW: https://www.iso-ne.com/static-assets/documents/100010/new-england-power-grid-regional-profile.pdf
WIND_CAPACITY = 1400

def connect_to_db():
    """Establish database connection"""
    try:
        conn = psycopg2.connect(DB_URL)
        print("Successfully connected to Neon database")
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def create_tables(conn):
    """Create necessary tables if they don't exist"""
    try:
        with conn.cursor() as cur:
            # Load curves table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS load_curves (
                    date DATE,
                    hour INTEGER CHECK (hour >= 0 AND hour <= 24),
                    load_mw DECIMAL CHECK (load_mw >= 0),
                    PRIMARY KEY (date, hour)
                )
            """)
            
            # Solar generation table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS solar_generation (
                    date DATE,
                    hour INTEGER CHECK (hour >= 0 AND hour <= 24),
                    generation_factor DECIMAL CHECK (generation_factor >= 0 AND generation_factor <= 1),
                    PRIMARY KEY (date, hour)
                )
            """)
            
            # Wind generation table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS wind_generation (
                    date DATE,
                    hour INTEGER CHECK (hour >= 0 AND hour <= 24),
                    generation_factor DECIMAL CHECK (generation_factor >= 0 AND generation_factor <= 1),
                    PRIMARY KEY (date, hour)
                )
            """)
            
        conn.commit()
        print("Successfully created/verified tables")
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()

def process_load_data(file_path):
    """Process load curve data"""
    try:
        df = pd.read_excel(file_path, sheet_name="ISO NE CA")
        required_columns = ['Date', 'Hr_End', 'RT_Demand']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"Excel must contain columns: {required_columns}")
        
        # Convert date strings to datetime and format correctly
        df['date'] = pd.to_datetime(df['Date']).dt.date
        
        # Convert hour to integer and then adjust to 0-23 format
        df['hour'] = df['Hr_End'].astype(str).str.replace('X', '').astype(int)
        df['hour'] = df['hour'].apply(lambda x: x - 1)
        
        # Rename RT_Demand to load_mw and handle NaN values
        df['load_mw'] = df['RT_Demand'].fillna(0)
        
        # Select only the columns we need
        df = df[['date', 'hour', 'load_mw']]
        
        # Handle duplicates by keeping the last value for each date-hour combination
        df = df.drop_duplicates(subset=['date', 'hour'], keep='first')
        
        print(f"Processed {len(df)} unique load data entries")
        
        return df
    except Exception as e:
        print(f"Error processing load data: {e}")
        return None

def process_solar_data(file_path):
    """Process solar generation data and normalize by capacity"""
    try:
        df = pd.read_excel(file_path, sheet_name="HourlyData")
        required_columns = ['local_day', 'LOCAL_HOUR_END', 'tot_solar_mwh']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"Excel must contain columns: {required_columns}")
        
        # Convert date strings to datetime and format correctly
        df['date'] = pd.to_datetime(df['local_day']).dt.date
        
        # Convert hour to integer and then adjust to 0-23 format
        df['hour'] = pd.to_numeric(df['LOCAL_HOUR_END'], errors='coerce').fillna(0).astype(int)
        df['hour'] = df['hour'].apply(lambda x: x - 1)
        
        # Normalize by solar capacity and handle NaN values
        df['tot_solar_mwh'] = df['tot_solar_mwh'].fillna(0)
        df['generation_factor'] = df['tot_solar_mwh'] / SOLAR_CAPACITY
        # Ensure factor is between 0 and 1
        df['generation_factor'] = df['generation_factor'].clip(0, 1)
        
        # Select only the columns we need
        df = df[['date', 'hour', 'generation_factor']]
        
        return df
    except Exception as e:
        print(f"Error processing solar data: {e}")
        return None

def process_wind_data(file_path):
    """Process wind generation data and normalize by capacity"""
    try:
        df = pd.read_excel(file_path, sheet_name="HourlyData")
        required_columns = ['local_day', 'local_hour_end', 'tot_wind_mwh']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"Excel must contain columns: {required_columns}")
        
        # Convert date strings to datetime and format correctly
        df['date'] = pd.to_datetime(df['local_day']).dt.date
        
        # Convert hour to integer and then adjust to 0-23 format
        df['hour'] = pd.to_numeric(df['local_hour_end'], errors='coerce').fillna(0).astype(int)
        df['hour'] = df['hour'].apply(lambda x: x - 1)
        
        # Normalize by wind capacity and handle NaN values
        df['tot_wind_mwh'] = df['tot_wind_mwh'].fillna(0)
        df['generation_factor'] = df['tot_wind_mwh'] / WIND_CAPACITY
        # Ensure factor is between 0 and 1
        df['generation_factor'] = df['generation_factor'].clip(0, 1)
        
        # Select only the columns we need
        df = df[['date', 'hour', 'generation_factor']]
        
        return df
    except Exception as e:
        print(f"Error processing wind data: {e}")
        return None

def insert_data(conn, table_name, data):
    """Insert processed data into specified table using batch operations"""
    try:
        with conn.cursor() as cur:
            if table_name == 'load_curves':
                # Convert DataFrame to list of tuples
                values = [tuple(x) for x in data[['date', 'hour', 'load_mw']].values]
                # Batch insert
                execute_values(
                    cur,
                    """
                    INSERT INTO load_curves (date, hour, load_mw)
                    VALUES %s
                    ON CONFLICT (date, hour) 
                    DO UPDATE SET load_mw = EXCLUDED.load_mw
                    """,
                    values,
                    template=None,
                    page_size=1000
                )
            
            elif table_name == 'solar_generation':
                values = [tuple(x) for x in data[['date', 'hour', 'generation_factor']].values]
                execute_values(
                    cur,
                    """
                    INSERT INTO solar_generation (date, hour, generation_factor)
                    VALUES %s
                    ON CONFLICT (date, hour) 
                    DO UPDATE SET generation_factor = EXCLUDED.generation_factor
                    """,
                    values,
                    template=None,
                    page_size=1000
                )
            
            elif table_name == 'wind_generation':
                values = [tuple(x) for x in data[['date', 'hour', 'generation_factor']].values]
                execute_values(
                    cur,
                    """
                    INSERT INTO wind_generation (date, hour, generation_factor)
                    VALUES %s
                    ON CONFLICT (date, hour) 
                    DO UPDATE SET generation_factor = EXCLUDED.generation_factor
                    """,
                    values,
                    template=None,
                    page_size=1000
                )
            
            conn.commit()
            print(f"Successfully inserted {len(values)} rows into {table_name}")
    except Exception as e:
        print(f"Error inserting data into {table_name}: {e}")
        conn.rollback()

def main():
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        # Create tables
        create_tables(conn)
        
        # Process and insert load data
        load_file = 'data/2024_smd_hourly.xlsx'  # Update with your file path
        if os.path.exists(load_file):
            load_data = process_load_data(load_file)
            if load_data is not None:
                insert_data(conn, 'load_curves', load_data)
        
        # Process and insert solar data
        solar_file = 'data/hourly_solar_gen_2024.xlsx'  # Update with your file path
        if os.path.exists(solar_file):
            solar_data = process_solar_data(solar_file)
            if solar_data is not None:
                insert_data(conn, 'solar_generation', solar_data)
        
        # Process and insert wind data
        wind_file = 'data/hourly_wind_gen_2024.xlsx'  # Update with your file path
        if os.path.exists(wind_file):
            wind_data = process_wind_data(wind_file)
            if wind_data is not None:
                insert_data(conn, 'wind_generation', wind_data)
        
    finally:
        # Close database connection
        conn.close()
        print("Database connection closed")

if __name__ == "__main__":
    main()
