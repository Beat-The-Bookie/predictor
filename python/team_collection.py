import requests
import json
from leagues import league

class team_info_collector:
    def __init__(self, supabase, foot_api, odds_api, leagues):
        self.supabase = supabase
        self.foot_api = foot_api
        self.odds_api = odds_api
        self.leagues = leagues

    def update_teams(self):
      
        # Specify the ID of the row you want to update
        row_id = 'all_teams'

        # Set the URL for the Premier League teams endpoint
        urls = [f"https://api.football-data.org/v4/competitions/PL/teams",
                f"https://api.football-data.org/v4/competitions/PD/teams",
                f"https://api.football-data.org/v4/competitions/ELC/teams",
                f"https://api.football-data.org/v4/competitions/SA/teams",
                f"https://api.football-data.org/v4/competitions/BL1/teams",
                f"https://api.football-data.org/v4/competitions/FL1/teams"]


        # Set the headers with the API key
        headers = {
            "X-Auth-Token": self.foot_api
        }

        responses = [None] * 6
        team_name_list = [None] * 6
        response_responses = [None] * 6

        update_data = [None] * 6

        # Make the request to the API
        for link in range(len(urls)):

            # Create a list for the column names
            columns = []
            for i in range(1,self.leagues[link].team_num + 1):
                columns.append(str(i))

            responses[link] = requests.get(urls[link], headers=headers)

            # Check if the request was successful
            if responses[link].status_code == 200:
                data = responses[link].json()
                teams = data['teams']  # Get the list of teams

                team_name_list[link] = []

                # Print the names of the teams
                for team in teams:
                    team_name_list[link].append(team['name'])
                team_name_list[link].sort()
            else:
                print(f"Error: {responses[link].status_code} - {responses[link].text}")

            # Zip the columns to the team names
            update_data[link] = dict(zip(columns, team_name_list[link]))

            # Update the row in the table 'your_table_name'
            response_responses[link] = self.supabase.table(self.leagues[link].shorthand+'_preds').update(update_data[link]).match({'username': row_id}).execute()

    def last_season_results(self):

        urls = [f"https://api.football-data.org/v4/competitions/PL/standings?season=2023",
                f"https://api.football-data.org/v4/competitions/PD/standings?season=2023",
                f"https://api.football-data.org/v4/competitions/ELC/standings?season=2023",
                f"https://api.football-data.org/v4/competitions/SA/standings?season=2023",
                f"https://api.football-data.org/v4/competitions/BL1/standings?season=2023",
                f"https://api.football-data.org/v4/competitions/FL1/standings?season=2023"]
        
        current_season = f"https://api.football-data.org/v4/competitions/PL/teams"

        # Set the headers with the API key
        headers = {
            "X-Auth-Token": self.foot_api
        }

        # Rather than specific answers, use 'promoted'
        responses = []
        responses_2 = [None] * 6
        update_data = [None] * 6

        places = ['1st', '2nd', '3rd']
        for i in range(4,22):
            places.append(str(i)+'th')

        columns = []
        for i in range(1,25):
            columns.append(str(i))

        team_list = []
        standings = []
        all_teams = []
        last_finishes = []

        for league in range(len(self.leagues)):
            # Make the request to the API
            responses.append(requests.get(self.find_url(self.leagues[league].footkey), headers=headers))

            temp = (self.leagues[league].shorthand +'_preds')
            all_teams.append(self.supabase.table(temp).select('*').eq('username', 'all_teams').execute())
            all_teams[league] = all_teams[league].data
            all_teams[league] = [value for key, value in all_teams[league][0].items() if key != 'username']

            data = responses[league].json()
            standings.append(data['standings'])

            teams = []
                        # Extract team names from the data
            team_list.append([])            
            for stage_data in standings[league]:
                for team_entry in stage_data['table']:  # Iterate through the teams
                    if self.leagues[league].shorthand != 'prem':
                        if len(team_list[league]) < (self.leagues[league].team_num - self.leagues[league].relegated):
                            team_name = team_entry['team']['name']  # Extract the team name
                            team_list[league].append(team_name)
                    else:
                        if len(team_list[league]) < (self.leagues[league].team_num):
                            team_name = team_entry['team']['name']  # Extract the team name
                            teams.append(team_name)
                            team_list[league] = teams[:17]
                            relegated_teams = teams[-3:]

            if self.leagues[league].shorthand == "champ":
                current_season_response = requests.get(current_season, headers=headers)
                current_season_data = current_season_response.json()
                current_season_teams = [team['name'] for team in current_season_data['teams']]
                promoted_teams = [team for team in team_list[league] if team in current_season_teams]
            else:
                promoted_teams = team_list[league][:self.leagues[league].promoted]
                
            last_finishes.append([None] * (self.leagues[league].team_num))

            if self.leagues[league].shorthand != "champ":
                for team in range(self.leagues[league].team_num - self.leagues[league].relegated):
                    try:
                        found = all_teams[league].index(team_list[league][team])
                        if places[team] != None:
                            last_finishes[league][found] = places[(team)]
                    except ValueError:
                        last_finishes[league][found] = None
            else:
                for team in range(self.leagues[league].team_num - self.leagues[league].relegated):
                    if team_list[league][team] not in promoted_teams:
                        found = all_teams[league].index(team_list[league][team])
                        if places[team] != None:
                            last_finishes[league][found] = places[(team)]
                
                for rel in range(len(relegated_teams)):
                    found = all_teams[league].index(relegated_teams[rel])
                    last_finishes[league][found] = "Relegated"

            last_finishes[league] = ['Promoted' if item is None else item for item in last_finishes[league]]

            # Zip the columns to the team names
            update_data[league] = dict(zip(columns[:self.leagues[league].team_num], last_finishes[league]))

            responses_2[league] = self.supabase.table(self.leagues[league].shorthand+'_preds').update(update_data[league]).match({'username': 'last_season_finishes'}).execute()

    def get_odds(self):
        
        # Betfair API credentials
        username = 'email'
        password = 'password'
        app_key = self.odds_api

        # API endpoint for login
        login_url = 'https://identitysso.betfair.com/api/login'

        # Set the login data
        login_data = {
            "username": username,
            "password": password
        }

        # Make the login request
        response = requests.post(login_url, json=login_data, headers={'X-Application': app_key})
        # print("172", response.text)

        # Check if the login was successful
        if response.status_code == 200:
            print("HERE")
            # session_token = response.json()
            print("H2")
            # print(f"Session Token: {session_token}")
        else:
            print(f"Login failed: {response.status_code}, {response.text}")


        # Betfair endpoint to list competitions
        competitions_url = "https://api.betfair.com/exchange/betting/rest/v1.0/listCompetitions/"

        # Headers for the request
        headers = {
            'X-Application': app_key,
            'X-Authentication': 'x7Czq3i2RV0nLKrEQrEwRql/BncIuAoSiqJmeVUaxt8=',
            'Content-Type': 'application/json'
        }

        # Sending request to get football competitions
        payload = json.dumps({
            "filter": {"eventTypeIds": ["1"]}  # EventTypeId 1 represents football
        })

        response = requests.post(competitions_url, headers=headers, data=payload)

        if response.status_code == 200:
            competitions = response.json()
            for competition in competitions:
                if competition['competition']['name'] == "English Premier League":
                    premier_league_id = competition['competition']['id']
                    print(f"Premier League Competition ID: {premier_league_id}")
        else:
            print(f"Error: {response.status_code}, {response.text}")

        # Betfair endpoint to list market catalogue
        market_catalogue_url = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketCatalogue/"

        # Payload to get the outright winner market
        payload = json.dumps({
            "filter": {
                "competitionIds": [premier_league_id],  # Use the Premier League ID obtained previously
                "marketTypeCodes": ["OUTRIGHT"]          # Looking for the outright winner market
            },
            "maxResults": 1,                            # Limit results to one market
            "marketProjection": ["MARKET_START_TIME", "RUNNER_DESCRIPTION"]
        })

        response = requests.post(market_catalogue_url, headers=headers, data=payload)
        print(response.status_code)
        print(response.text)

        if response.status_code == 200:
            markets = response.json()
            print("MARKETS", markets)
            if markets:
                print("1", markets[0]['marketId'])
                outright_market_id = markets[0]['marketId']
                print(f"Outright Market ID: {outright_market_id}")
        else:
            print(f"Error: {response.status_code}, {response.text}")

        print("OMD", outright_market_id)
        # Betfair endpoint to list market book
        market_book_url = "https://api.betfair.com/exchange/betting/rest/v1.0/listMarketBook/"

        # Payload to get the market book for the outright winner
        payload = json.dumps({
            "marketIds": [outright_market_id],  # Use the market ID obtained previously
            "priceProjection": {
                "priceData": ["EX_BEST_OFFERS"]  # Get the best available odds
            }
        })

        response = requests.post(market_book_url, headers=headers, data=payload)

        if response.status_code == 200:
            market_book = response.json()
            if market_book:
                for runner in market_book[0]['runners']:
                    print(f"Team: {runner['description']['runnerName']}, Odds: {runner['ex']['availableToBack']}")
        else:
            print(f"Error: {response.status_code}, {response.text}")



    def find_url(self, code):
        return ("https://api.football-data.org/v4/competitions/" + code + "/standings?season=2023")