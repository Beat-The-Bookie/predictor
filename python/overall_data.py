from supabase import create_client, Client
from team_collection import team_info_collector
from standings_collection import standings_collection
from create_database import create_db
from leagues import league
from add_scores import calc_scores

# Your Supabase credentials
SUPABASE_URL = "https://your-project-url.supabase.co"  # Replace with your project URL
SUPABASE_API_KEY = "your-api-key"  # Replace with your API key

# Your API key (replace with your actual API key)
API_KEY = "47fadf7cd3ca4b48a8f8272f3be8ed8b"

ODDS_API = "JDRWAcXgJANkPrwb"

# Create the Supabase client
supabase: Client = create_client('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

leagues = [
    league(20, 3, 'PL', 'prem'), league(20, 3, 'PD', 'la_liga'),
    league(24, 3, 'ELC', 'champ', promoted=3),league(20, 3, 'SA', 'seriea'),
    league(18, 2, 'BL1', 'bundes', False), league(18, 2, 'FL1', 'ligue1', True)
]

# Functions to populate DB
# db_creation = create_db(supabase=supabase, leagues=leagues)
# db_creation.create_tables()
# db_creation.create_users()

# Functions to be done once long before season start
collect = team_info_collector(supabase=supabase, foot_api=API_KEY, odds_api=ODDS_API, leagues=leagues)
# collect.update_teams()
collect.last_season_results()

# The get_odds function cannot currently be completed, suspicious at that is happening as the season has already started
# collect.get_odds()

# Collecting the current standings
# standings = standings_collection(supabase=supabase, foot_api=API_KEY, leagues=leagues)
# standings.collect_info()

# score_calc = calc_scores(supabase, leagues)
# score_calc.run_scorer()
