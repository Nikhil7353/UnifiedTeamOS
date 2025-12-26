from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # For PostgreSQL, use information_schema
    result = conn.execute(text("""
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users'
    """))
    print("Users table structure:")
    for row in result:
        print(f"  {row[0]} - {row[1]} (nullable: {row[2]})")
    
    # Check if profile_pic column exists
    result = conn.execute(text("""
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_pic'
    """))
    count = result.fetchone()[0]
    print(f"\nProfile pic column exists: {'Yes' if count > 0 else 'No'}")
