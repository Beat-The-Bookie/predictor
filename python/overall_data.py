from supabase import create_client, Client
from team_collection import team_info_collector

# Your Supabase credentials
SUPABASE_URL = "https://your-project-url.supabase.co"  # Replace with your project URL
SUPABASE_API_KEY = "your-api-key"  # Replace with your API key

# Your API key (replace with your actual API key)
API_KEY = "47fadf7cd3ca4b48a8f8272f3be8ed8b"

# Create the Supabase client
supabase: Client = create_client('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

collect = team_info_collector(supabase=supabase, foot_api=API_KEY)
collect.update_teams()