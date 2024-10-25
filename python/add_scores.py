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

        preds = ['MCI','MUN','ARS','LIV','NEW','CHE','AVL','TOT','BRE','BRI','CRY','WHU','EVE','NOT','LUT','WOL','BUR','BOU','FUL','SHU']
        team_standings = ['MCI','ARS','LIV','AVL','TOT','CHE','NEW','MUN','WHU','CRY','BRI','BOU','FUL','WOL','EVE','BRE','NOT','LUT','BUR','SHU',]

        # create points list, using the premier league scoring function
        points = self.premier_league_scoring(preds, team_standings)

        # We have three lists: 
        # preds, the user's predictions
        # team_standings, the actual prem standings
        # points, the relevant points for each team, equal to the column in the spreadsheet

        columns = []
        for i in range(1,21):
            columns.append(str(i))

        update_data = dict(zip(columns, points))

        # Submit the scores into a new 
        submit = self.supabase.table('scores').update(update_data).match({'username': uname})


    def premier_league_scoring(self, preds, team_standings):
        # define points as a list of 20 zeroes
        points = [0] * 20

        # first place
        if preds[0] == team_standings[0]:
            points[0] = 8
        elif preds[0] == team_standings[1]:
            points[0] = 4

        # second place
        if preds[1] == team_standings[1]:
            points[1] = 6
        elif preds[1] == team_standings[0]:
            points[1] = 4
        elif preds[1] == team_standings[2]:
            points[1] = 3

        # third place
        if preds[2] == team_standings[2]:
            points[2] = 5
        elif preds[2] == team_standings[1]:
            points[2] = 3
        elif preds[2] == team_standings[3]:
            points[2] = 3

        # fourth place
        if preds[3] == team_standings[3]:
            points[3] = 5
        elif preds[3] == team_standings[2]:
            points[3] = 3
        elif preds[3] == team_standings[4]:
            points[3] = 2

        # fifth place
        if preds[4] == team_standings[4]:
            points[4] = 3
        elif preds[4] == team_standings[3]:
            points[4] = 2
        elif preds[4] == team_standings[5]:
            points[4] = 1

        # sixth to sixteenth place
        i = 5
        while i < 16:
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1
            i += 1

        # seventeenth place
        if preds[16] == team_standings[16]:
            points[16] = 3
        elif preds[16] == team_standings[15]:
            points[16] = 1
        elif preds[16] == team_standings[17]:
            points[16] = 2

        # eighteenth place
        if preds[17] == team_standings[17]:
            points[17] = 5
        elif preds[17] == team_standings[16]:
            points[17] = 2
        elif preds[17] == team_standings[18]:
            points[17] = 3

        # nineteenth place
        if preds[18] == team_standings[18]:
            points[18] = 5
        elif preds[18] == team_standings[17]:
            points[18] = 3
        elif preds[18] == team_standings[19]:
            points[18] = 3

        # twentieth place
        if preds[19] == team_standings[19]:
            points[19] = 5
        elif preds[19] == team_standings[18]:
            points[19] = 3

        # return points list
        return points
