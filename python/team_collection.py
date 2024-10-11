import requests

class team_info_collector:
    def __init__(self, supabase, foot_api):
        self.supabase = supabase
        self.foot_api = foot_api

    def update_teams(self):
      
        # Set the URL for the Premier League teams endpoint
        url = f"https://api.football-data.org/v4/competitions/PL/teams"

        # Set the headers with the API key
        headers = {
            "X-Auth-Token": self.foot_api
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
        response = self.supabase.table('Predictions').update(update_data).match({'username': row_id}).execute()

    def last_season_results(self):

        url = f"https://api.football-data.org/v4/competitions/PL/standings?season=2023"

        # Set the headers with the API key
        headers = {
            "X-Auth-Token": self.foot_api
        }

        # Make the request to the API
        response = requests.get(url, headers=headers)

        url = f"https://api.football-data.org/v4/competitions/ELC/standings?season=2023"

        response_2 = requests.get(url, headers=headers)

        places = ['1st', '2nd', '3rd']
        for i in range(4,18):
            places.append(str(i)+'th')

        columns = []
        for i in range(1,21):
            columns.append(str(i))

        data = self.supabase.table('Predictions').select('*').eq('username', 'all_teams_prem').execute()

        mid = data.data

        all_teams = [value for key, value in mid[0].items() if key != 'username']

        # Check if the request was successful
        if response.status_code == 200:
            data = response.json()
            standings = data['standings']

            # Extract team names from the data
            team_list = []            
            for stage_data in standings:
                for team_entry in stage_data['table']:  # Iterate through the teams
                    if len(team_list) < 17:
                        team_name = team_entry['team']['name']  # Extract the team name
                        team_list.append(team_name)
            

            last_finishes = [None] * 20
            for team in range(len(team_list)):
                found = all_teams.index(team_list[team])
                last_finishes[found] = places[(team)]
            
            # Identifies the places where the promoted teams are in the list
            something = [index for index, element in enumerate(last_finishes) if element == None]
            print("SOMETHING", something)

            data_2 = response_2.json()
            standings_2 = data_2['standings']

            champ_team_list = []            
            for a in standings_2:
                for team_entry in a['table']:  # Iterate through the teams
                    if len(champ_team_list) < 6:
                        team_name = team_entry['team']['name']  # Extract the team name
                        champ_team_list.append(team_name)
            print("CHAMP", champ_team_list)
            champ_places = ['1st (Championship)', '2nd (Championship)']

            for team in range(len(champ_places)):
                found = all_teams.index(champ_team_list[team])
                last_finishes[found] = champ_places[team]
                print("FOUND", found)

            champ_places = ['3rd (Championship)']
            for i in range(3):
                champ_places.append(str(i+4)+'th (Championship)')
            print("CHAMP PLACES", champ_places)
            champ_team_list = champ_team_list[2:]
            print("CTL", champ_team_list)
            for place in range(len(champ_places)):
                try:
                    found = all_teams.index(champ_team_list[place])
                    last_finishes[found] = champ_places[place]
                except ValueError:
                    print(f"Value not found in the list")

            # Create a list for the column names
            columns = []
            for i in range(1,21):
                columns.append(str(i))

            # Zip the columns to the team names
            update_data = dict(zip(columns, last_finishes))




            row_id = 'all_teams_prem_last_finish'
            response = self.supabase.table('Predictions').update(update_data).match({'username': row_id}).execute()


            # Call the football API for the champonship and identify where they finished
            # Update the list accordingly, i.e '1st (Championship)
            # Upload to SupaBase
            # Display on the website



        else:
            print(f"Error: {response.status_code} - {response.text}")








