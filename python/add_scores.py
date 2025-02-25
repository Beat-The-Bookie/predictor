import requests
import supabase

class calc_scores:

    def __init__(self, supabase, leagues):
        self.supabase = supabase
        self.leagues = leagues
        self.funcs = [self.premier_league_scoring, self.la_liga_scoring, self.championship_scoring,
                 self.serie_a_scoring, self.bundesliga_scoring, self.ligue_1_scoring]
        self.points = [None] * 6

        
    def run_scorer(self):

        users = self.supabase.table('leaderboard').select('username').execute()
        for user in range(len(users.data)):
            self.calculate_scores(users.data[user]['username'])
            mini_leagues = self.supabase.table('mini_league_members').select('mini_league_id').eq('username', users.data[user]['username']).execute()

            for mini_league in mini_leagues.data:
                response = self.supabase.table('mini_leagues').select('prem_limit, champ_limit, la_liga_limit, seriea_limit, bundes_limit, ligue1_limit').eq('id', mini_league['mini_league_id']).execute()

                scores = {}
                for league in range(len(self.leagues)):
                    scores[self.names[league]] = sum(self.points[league][:(response.data[0][self.names[league]+'_limit'] - 1)])
                scores['total'] = sum(scores.values())

                response = self.supabase.table("mini_league_members").update({
                "score_per_league": scores
                }).eq("username", users.data[user]['username']).eq("mini_league_id", mini_league['mini_league_id']).execute()

    def calculate_scores(self, uname):

        preds = [None] * 6
        data = [None] * 6
        standings = [None] * 6
        team_standings = [None] * 6
        self.points = [None] * 6
        self.totals = [None] * 7
        self.names = [None] * 7

        for league in range(len(self.leagues)):
            data[league] = self.supabase.table(self.leagues[league].shorthand + "_preds").select('*').eq('username', uname).execute()
            preds[league] = [value for key, value in data[league].data[0].items() if key!= 'username']

            standings[league] = self.supabase.table(self.leagues[league].shorthand + '_preds').select('*').eq('username', 'standings').execute()
            team_standings[league] = [value for key, value in standings[league].data[0].items() if key!= 'username']



        for league in range(len(self.points)):
            self.points[league] = self.funcs[league](preds[league], team_standings[league])

            columns = []
            for i in range(1,self.leagues[league].team_num + 1):
                columns.append(str(i))
            update_data = dict(zip(columns, self.points[league]))

            # Submit the scores into database 
            submit = self.supabase.table(self.leagues[league].shorthand + '_scores').update(update_data).match({'username': uname}).execute()

            self.totals[league] = sum(self.points[league])
            self.names[league] = self.leagues[league].shorthand
    
        self.totals[6] = sum(self.totals[:6])
        self.names[6] = 'total'
        leaderboard = self.supabase.table('leaderboard').update(dict(zip(self.names, self.totals))).match({'username':uname}).execute()

    def premier_league_scoring(self, preds, team_standings):
        # 20 teams
        # top 4 correct points = 8,6,5,5
        # relegation (18th,19th,20th) correct points = 5,5,5
        # everywhere else correct points = 3

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
        for i in range(5, 16):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

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

    def la_liga_scoring(self, preds, team_standings):
        # 20 teams
        # top 4 correct points = 8,6,5,5
        # relegation (18th,19th,20th) correct points = 5,5,5
        # everywhere else correct points = 3

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
        for i in range(5, 16):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

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

    def championship_scoring(self, preds, team_standings):
        # 24 teams
        # automatic promotion correct points = 8,6
        # playoffs (3rd,4th,5th,6th) correct points = 5,5,5,5
        # relegation (22nd,23rd,24th) correct points = 5,5,5
        # everywhere else correct points = 3

        # define points as a list of 24 zeroes
        points = [0] * 24

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

        # third place (playoffs)
        if preds[2] == team_standings[2]:
            points[2] = 5
        elif preds[2] == team_standings[1]:
            points[2] = 3
        elif preds[2] == team_standings[3]:
            points[2] = 3

        # fourth place (playoffs)
        if preds[3] == team_standings[3]:
            points[3] = 5
        elif preds[3] == team_standings[2]:
            points[3] = 3
        elif preds[3] == team_standings[4]:
            points[3] = 3

        # fifth place (playoffs)
        if preds[4] == team_standings[4]:
            points[4] = 5
        elif preds[4] == team_standings[3]:
            points[4] = 3
        elif preds[4] == team_standings[5]:
            points[4] = 3

        # sixth place (playoffs)
        if preds[5] == team_standings[5]:
            points[5] = 5
        elif preds[5] == team_standings[4]:
            points[5] = 3
        elif preds[5] == team_standings[6]:
            points[5] = 2
        
        # seventh place
        if preds[6] == team_standings[6]:
            points[6] = 3
        elif preds[6] == team_standings[5]:
            points[6] = 2
        elif preds[6] == team_standings[7]:
            points[6] = 1

        # eighth to twentieth place
        for i in range(7, 20):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

        # twenty-first place
        if preds[20] == team_standings[20]:
            points[20] = 3
        elif preds[20] == team_standings[19]:
            points[20] = 1
        elif preds[20] == team_standings[21]:
            points[20] = 2

        # twenty-second place
        if preds[21] == team_standings[21]:
            points[21] = 5
        elif preds[21] == team_standings[20]:
            points[21] = 2
        elif preds[21] == team_standings[22]:
            points[21] = 3

        # twenty-third place
        if preds[22] == team_standings[22]:
            points[22] = 5
        elif preds[22] == team_standings[21]:
            points[22] = 3
        elif preds[22] == team_standings[23]:
            points[22] = 3

        # twenty-fourth place
        if preds[23] == team_standings[23]:
            points[23] = 5
        elif preds[23] == team_standings[22]:
            points[23] = 3

        # return points list
        return points

    def serie_a_scoring(self, preds, team_standings):
        # 20 teams
        # top 4 correct points = 8,6,5,5
        # relegation (18th,19th,20th) correct points = 5,5,5
        # everywhere else correct points = 3

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
        for i in range(5, 16):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

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

    def bundesliga_scoring(self, preds, team_standings):
        # 18 teams
        # top 4 correct points = 8,6,5,5
        # relegation playoff (16th) correct points = 4
        # relegation (17th,18th) correct points = 5,5
        # everywhere else correct points = 3

        # define points as a list of 18 zeroes
        points = [0] * 18

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

        # sixth to fourteenth place
        for i in range(5, 14):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

        # fifteenth place
        if preds[14] == team_standings[14]:
            points[14] = 3
        elif preds[14] == team_standings[13]:
            points[14] = 1
        elif preds[14] == team_standings[15]:
            points[14] = 2

        # sixteenth place
        if preds[15] == team_standings[15]:
            points[15] = 4
        elif preds[15] == team_standings[14]:
            points[15] = 2
        elif preds[15] == team_standings[16]:
            points[15] = 3

        # seventeenth place
        if preds[16] == team_standings[16]:
            points[16] = 5
        elif preds[16] == team_standings[15]:
            points[16] = 3
        elif preds[16] == team_standings[17]:
            points[16] = 3

        # eighteenth place
        if preds[17] == team_standings[17]:
            points[17] = 5
        elif preds[17] == team_standings[16]:
            points[17] = 3

        # return points list
        return points

    def ligue_1_scoring(self, preds, team_standings):
        # 18 teams
        # top 3 correct points = 8,6,5
        # UCL playoff (4th) correct points = 4
        # relegation playoff (16th) correct points = 4
        # relegation (17th,18th) correct points = 5,5
        # everywhere else correct points = 3

        # define points as a list of 18 zeroes
        points = [0] * 18

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
            points[2] = 2

        # fourth place
        if preds[3] == team_standings[3]:
            points[3] = 4
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

        # sixth to fourteenth place
        for i in range(5, 14):
            if preds[i] == team_standings[i]:
                points[i] = 3
            elif preds[i] == team_standings[i-1]:
                points[i] = 1
            elif preds[i] == team_standings[i+1]:
                points[i] = 1

        # fifteenth place
        if preds[14] == team_standings[14]:
            points[14] = 3
        elif preds[14] == team_standings[13]:
            points[14] = 1
        elif preds[14] == team_standings[15]:
            points[14] = 2

        # sixteenth place
        if preds[15] == team_standings[15]:
            points[15] = 4
        elif preds[15] == team_standings[14]:
            points[15] = 2
        elif preds[15] == team_standings[16]:
            points[15] = 3

        # seventeenth place
        if preds[16] == team_standings[16]:
            points[16] = 5
        elif preds[16] == team_standings[15]:
            points[16] = 3
        elif preds[16] == team_standings[17]:
            points[16] = 3

        # eighteenth place
        if preds[17] == team_standings[17]:
            points[17] = 5
        elif preds[17] == team_standings[16]:
            points[17] = 3

        # return points list
        return points
