import requests
import supabase

class calc_scores:

    def init(self, supabase, foot_api):
        self.supabase = supabase
        self.foot_api = foot_api

    def calculate_scores(self, uname):
        data = self.supabase.table('Predictions').select('*').eq('username', uname)
        preds = [value for key, value in data.data[0].items() if key != 'username']

        url = f"https://api.football-data.org/v4/competitions/PL/standings?season=2024"
        headers = {
            "X-Auth-Token": self.foot_api
        }
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            stands = response.json()
            standings = stands['standings']

            team_standings = []
            for team in standings:
                for individ_team in team['table']:
                    team_name = individ_team['team']['name']
                    team_standings.append(team_name)

        points = [0] * 20

        preds = ['MCI','MUN','ARS','LIV','NEW','CHE','AVL','TOT','BRE','BRI','CRY','WHU','EVE','NOT','LUT','WOL','BUR','BOU','FUL','SHU']
        team_standings = ['MCI','ARS','LIV','AVL','TOT','CHE','NEW','MUN','WHU','CRY','BRI','BOU','FUL','WOL','EVE','BRE','NOT','LUT','BUR','SHU',]

        # We have three lists: 
        # preds, the user's predictions
        # team_standings, the current prem standings
        # points, the relevant points for each team, equal to the column in the spreadsheet

        ###### The actual loop too calculate scores must go here ######





        columns = []
        for i in range(1,21):
            columns.append(str(i))

        update_data = dict(zip(columns, points))

        # Submit the scores into a new 
        submit = self.supabase.table('scores').update(update_data).match({'username': uname})


