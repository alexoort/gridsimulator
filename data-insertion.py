import os
import pandas as pd
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection parameters from environment variables
DB_URL = os.getenv('POSTGRES_URL')

# Solar generation capacity in MW
SOLAR_CAPACITY = 7345.4

def connect_to_db():
    """Establish database connection"""
    try:
        conn = psycopg2.connect(DB_URL)
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
                    hour INTEGER,
                    load_mw DECIMAL,
                    PRIMARY KEY (date, hour)
                )
            """)
            
            # Solar generation table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS solar_generation (
                    date DATE,
                    hour INTEGER,
                    generation_factor DECIMAL,
                    PRIMARY KEY (date, hour)
                )
            """)
            
            # Wind generation table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS wind_generation (
                    date DATE,
                    hour INTEGER,
                    generation_factor DECIMAL,
                    PRIMARY KEY (date, hour)
                )
            """)
            
        conn.commit()
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()

def process_load_data(file_path):
    """Process load curve data"""
    try:
        df = pd.read_csv(file_path)  # Adjust reading based on actual file format
        # Process data according to file structure
        return df
    except Exception as e:
        print(f"Error processing load data: {e}")
        return None

def process_solar_data(file_path):
    """Process solar generation data and normalize by capacity"""
    try:
        df = pd.read_csv(file_path)  # Adjust reading based on actual file format
        # Normalize by solar capacity
        df['generation_factor'] = df['generation_mw'] / SOLAR_CAPACITY
        return df
    except Exception as e:
        print(f"Error processing solar data: {e}")
        return None

def process_wind_data(file_path):
    """Process wind generation data"""
    try:
        df = pd.read_csv(file_path)  # Adjust reading based on actual file format
        # Process data according to file structure
        return df
    except Exception as e:
        print(f"Error processing wind data: {e}")
        return None

def insert_data(conn, table_name, data):
    """Insert processed data into specified table"""
    try:
        with conn.cursor() as cur:
            for _, row in data.iterrows():
                if table_name == 'load_curves':
                    cur.execute("""
                        INSERT INTO load_curves (date, hour, load_mw)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (date, hour) 
                        DO UPDATE SET load_mw = EXCLUDED.load_mw
                    """, (row['date'], row['hour'], row['load_mw']))
                
                elif table_name == 'solar_generation':
                    cur.execute("""
                        INSERT INTO solar_generation (date, hour, generation_factor)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (date, hour) 
                        DO UPDATE SET generation_factor = EXCLUDED.generation_factor
                    """, (row['date'], row['hour'], row['generation_factor']))
                
                elif table_name == 'wind_generation':
                    cur.execute("""
                        INSERT INTO wind_generation (date, hour, generation_factor)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (date, hour) 
                        DO UPDATE SET generation_factor = EXCLUDED.generation_factor
                    """, (row['date'], row['hour'], row['generation_factor']))
            
        conn.commit()
        print(f"Successfully inserted data into {table_name}")
    except Exception as e:
        print(f"Error inserting data into {table_name}: {e}")
        conn.rollback()

def main():
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return
    
    # Create tables
    create_tables(conn)
    
    # Process and insert load data
    load_data = process_load_data('path_to_load_data.csv')
    if load_data is not None:
        insert_data(conn, 'load_curves', load_data)
    
    # Process and insert solar data
    solar_data = process_solar_data('path_to_solar_data.csv')
    if solar_data is not None:
        insert_data(conn, 'solar_generation', solar_data)
    
    # Process and insert wind data
    wind_data = process_wind_data('path_to_wind_data.csv')
    if wind_data is not None:
        insert_data(conn, 'wind_generation', wind_data)
    
    # Close database connection
    conn.close()

if __name__ == "__main__":
    main()
