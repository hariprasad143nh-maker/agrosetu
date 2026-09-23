import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY is missing from environment variables.")
    # Initialize with dummy values just so the app doesn't crash on boot if env is missing
    # In production, this should raise an exception
    supabase: Client = create_client("https://dummy.supabase.co", "dummy-key")
else:
    supabase: Client = create_client(url, key)
