import requests
import json

class standings_collection:
    def __init__(self, supabase, foot_api):
        self.supabase = supabase
        self.foot_api = foot_api
    
    def collect_info(self):

        # Set the URL for the Premier League teams endpoint
        urls = [f"https://api.football-data.org/v4/competitions/PL/standings",
                f"https://api.football-data.org/v4/competitions/PD/standings",
                f"https://api.football-data.org/v4/competitions/ELC/standings",
                f"https://api.football-data.org/v4/competitions/SA/standings",
                f"https://api.football-data.org/v4/competitions/BL1/standings",
                f"https://api.football-data.org/v4/competitions/FL1/standings"]

        # Set the headers with the API key
        headers = {
            "X-Auth-Token": self.foot_api
        }

        standings = []
        response = requests.get(urls[0], headers=headers)
        print("RESPONSE", response.json())

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()

            # Extract team names in the correct order
            standings = [team['team']['name'] for team in data['standings'][0]['table']]
            points = [team['points'] for team in data['standings'][0]['table']]
            games_played = [team['playedGames'] for team in data['standings'][0]['table']]
            goal_differences = [team['goalDifference'] for team in data['standings'][0]['table']]

            # Display the list of team names
            print("STANDINGS", standings)
            print("POINTS", points)
            print("GP", games_played)
            print("GD", goal_differences)
        else:
            print(f"Error: {response.status_code} - {response.text}")

