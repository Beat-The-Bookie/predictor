import requests

class standings_collection:
    def __init__(self, supabase, foot_api, leagues):
        self.supabase = supabase
        self.foot_api = foot_api
        self.leagues = leagues
        self.attributes = ['standings', 'points', 'games_played', 'goal_difference']

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
        responses = []
        responses_2 = []
        for url in range(len(urls)):


            responses.append(requests.get(urls[url], headers=headers))

            # Check if the request was successful
            if responses[url].status_code == 200:
                data = responses[url].json()

                # Extract team names in the correct order
                standings = [team['team']['name'] for team in data['standings'][0]['table']]
                points = [team['points'] for team in data['standings'][0]['table']]
                games_played = [team['playedGames'] for team in data['standings'][0]['table']]
                goal_differences = [team['goalDifference'] for team in data['standings'][0]['table']]

                # Create a list for the column names
                # columns = []
                # for i in range(1,21):
                #     columns.append(str(i))

                attributes = [standings, points, games_played, goal_differences]
                for attribute in range(len(attributes)):
                    columns = []
                    for i in range(1, self.leagues[url].team_num + 1):
                        columns.append(str(i))
                    responses_r = self.supabase.table(self.leagues[url].shorthand+'_preds').update(dict(zip(columns, attributes[attribute]))).match({'username': self.attributes[attribute]}).execute()

            else:
                print(f"Error: {responses[url].status_code} - {responses[url].text}")

