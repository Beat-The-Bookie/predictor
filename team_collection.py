from supabase import create_client, Client
import requests

# Your Supabase credentials
SUPABASE_URL = "https://your-project-url.supabase.co"  # Replace with your project URL
SUPABASE_API_KEY = "your-api-key"  # Replace with your API key

# Create the Supabase client
supabase: Client = create_client('https://srhywkedxssxlsjrholj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaHl3a2VkeHNzeGxzanJob2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzOTYxNjUsImV4cCI6MjA0MTk3MjE2NX0.lUZUAm20JIH3aoUxmyCAcr8l-A3_S3FpTaHuljrwm50')

# Your API key (replace with your actual API key)
API_KEY = "47fadf7cd3ca4b48a8f8272f3be8ed8b"
PREMIER_LEAGUE_ID = 2021

# Set the URL for the Premier League teams endpoint
url = f"https://api.football-data.org/v4/competitions/PL/teams"

# Set the headers with the API key
headers = {
    "X-Auth-Token": API_KEY
}

# Make the request to the API
response = requests.get(url, headers=headers)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()
    teams = data['teams']  # Get the list of teams

    team_name_list = []

    # Print the names of the teams
    for team in teams:
        team_name_list.append(team['name'])
    team_name_list.sort()
else:
    print(f"Error: {response.status_code} - {response.text}")

# Create a list for the column names
columns = []
for i in range(1,21):
    columns.append(str(i))

# Zip the columns to the team names
update_data = dict(zip(columns, team_name_list))

# Specify the ID of the row you want to update
row_id = 'all_teams_prem'

# Update the row in the table 'your_table_name'
response = supabase.table('Predictions').update(update_data).match({'username': row_id}).execute()
