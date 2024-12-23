import requests
import supabase

class calc_scores:

    def __init__(self, supabase, leagues):
        self.supabase = supabase
        self.leagues = leagues

    def calculate_scores(self, uname):

        preds = [None] * 6
        data = [None] * 6
        standings = [None] * 6
        team_standings = [None] * 6
        self.points = [None] * 6

        for league in range(len(self.leagues)):
            data[league] = self.supabase.table(self.leagues[league].shorthand + "_preds").select('*').eq('username', uname).execute()
            preds[league] = [value for key, value in data[league].data[0].items() if key!= 'username']

            standings[league] = self.supabase.table(self.leagues[league].shorthand + '_preds').select('*').eq('username', 'standings').execute()
            team_standings[league] = [value for key, value in standings[league].data[0].items() if key!= 'username']


        ### Series of example teams for testing purposes - comment out for loop above
        # preds[0] = ['MCI','MUN','ARS','LIV','NEW','CHE','AVL','TOT','BRE','BRI','CRY','WHU','EVE','NOT','LUT','WOL','BUR','BOU','FUL','SHU']
        # team_standings[0] = ['MCI','ARS','LIV','AVL','TOT','CHE','NEW','MUN','WHU','CRY','BRI','BOU','FUL','WOL','EVE','BRE','NOT','LUT','BUR','SHU',]

        # preds[1] = ['Athletic Club', 'CA Osasuna', 'CD Leganés', 'Club Atlético de Madrid', 'Deportivo Alavés', 'FC Barcelona', 'Getafe CF', 'Girona FC', 'RC Celta de Vigo', 'RCD Espanyol de Barcelona', 'RCD Mallorca', 'Rayo Vallecano de Madrid', 'Real Betis Balompié', 'Real Madrid CF', 'Real Sociedad de Fútbol', 'Real Valladolid CF', 'Sevilla FC', 'UD Las Palmas', 'Valencia CF', 'Villarreal CF']
        # team_standings[1] = ['FC Barcelona', 'Real Madrid CF', 'Club Atlético de Madrid', 'Athletic Club', 'Villarreal CF', 'Real Sociedad de Fútbol', 'CA Osasuna', 'RCD Mallorca', 'Girona FC', 'RC Celta de Vigo', 'Real Betis Balompié', 'Rayo Vallecano de Madrid', 'Sevilla FC', 'UD Las Palmas', 'Deportivo Alavés', 'CD Leganés', 'Getafe CF', 'RCD Espanyol de Barcelona', 'Valencia CF', 'Real Valladolid CF']

        # preds[2] = ['Blackburn Rovers FC', 'Bristol City FC', 'Burnley FC', 'Cardiff City FC', 'Coventry City FC', 'Derby County FC', 'Hull City AFC', 'Leeds United FC', 'Luton Town FC', 'Middlesbrough FC', 'Millwall FC', 'Norwich City FC', 'Oxford United FC', 'Plymouth Argyle FC', 'Portsmouth FC', 'Preston North End FC', 'Queens Park Rangers FC', 'Sheffield United FC', 'Sheffield Wednesday FC', 'Stoke City FC', 'Sunderland AFC', 'Swansea City AFC', 'Watford FC', 'West Bromwich Albion FC']
        # team_standings[2] = ['Sheffield United FC', 'Leeds United FC', 'Burnley FC', 'Sunderland AFC', 'Middlesbrough FC', 'Blackburn Rovers FC', 'Watford FC', 'West Bromwich Albion FC', 'Sheffield Wednesday FC', 'Norwich City FC', 'Millwall FC', 'Bristol City FC', 'Swansea City AFC', 'Coventry City FC', 'Stoke City FC', 'Derby County FC', 'Preston North End FC', 'Luton Town FC', 'Oxford United FC', 'Queens Park Rangers FC', 'Cardiff City FC', 'Plymouth Argyle FC', 'Portsmouth FC', 'Hull City AFC']

        # preds[3] = ['AC Milan', 'AC Monza', 'ACF Fiorentina', 'AS Roma', 'Atalanta BC', 'Bologna FC 1909', 'Cagliari Calcio', 'Como 1907', 'Empoli FC', 'FC Internazionale Milano', 'Genoa CFC', 'Hellas Verona FC', 'Juventus FC', 'Parma Calcio 1913', 'SS Lazio', 'SSC Napoli', 'Torino FC', 'US Lecce', 'Udinese Calcio', 'Venezia FC']
        # team_standings[3] = ['Atalanta BC', 'SSC Napoli', 'FC Internazionale Milano', 'ACF Fiorentina', 'SS Lazio', 'Juventus FC', 'AC Milan', 'Bologna FC 1909', 'Empoli FC', 'Udinese Calcio', 'AS Roma', 'Torino FC', 'Parma Calcio 1913', 'Genoa CFC', 'Cagliari Calcio', 'US Lecce', 'Como 1907', 'Hellas Verona FC', 'AC Monza', 'Venezia FC']

        # preds[4] = ['1. FC Heidenheim 1846', '1. FC Union Berlin', '1. FSV Mainz 05', 'Bayer 04 Leverkusen', 'Borussia Dortmund', 'Borussia Mönchengladbach', 'Eintracht Frankfurt', 'FC Augsburg', 'FC Bayern München', 'FC St. Pauli 1910', 'Holstein Kiel', 'RB Leipzig', 'SC Freiburg', 'SV Werder Bremen', 'TSG 1899 Hoffenheim', 'VfB Stuttgart', 'VfL Bochum 1848', 'VfL Wolfsburg']
        # team_standings[5] = ['FC Bayern München', 'Eintracht Frankfurt', 'Bayer 04 Leverkusen', 'RB Leipzig', 'VfL Wolfsburg', 'Borussia Dortmund', 'SC Freiburg', 'VfB Stuttgart', '1. FSV Mainz 05', 'SV Werder Bremen', 'Borussia Mönchengladbach', '1. FC Union Berlin', 'FC Augsburg', 'TSG 1899 Hoffenheim', 'FC St. Pauli 1910', '1. FC Heidenheim 1846', 'Holstein Kiel', 'VfL Bochum 1848']

        # preds[5] = ['AJ Auxerre', 'AS Monaco FC', 'AS Saint-Étienne', 'Angers SCO', 'FC Nantes', 'Le Havre AC', 'Lille OSC', 'Montpellier HSC', 'OGC Nice', 'Olympique Lyonnais', 'Olympique de Marseille', 'Paris Saint-Germain FC', 'RC Strasbourg Alsace', 'Racing Club de Lens', 'Stade Brestois 29', 'Stade Rennais FC 1901', 'Stade de Reims', 'Toulouse FC']
        # team_standings[5] = ['Paris Saint-Germain FC', 'Olympique de Marseille', 'AS Monaco FC', 'Lille OSC', 'Olympique Lyonnais', 'OGC Nice', 'Racing Club de Lens', 'AJ Auxerre', 'Stade de Reims', 'Toulouse FC', 'Stade Brestois 29', 'Stade Rennais FC 1901', 'FC Nantes', 'RC Strasbourg Alsace', 'Angers SCO', 'AS Saint-Étienne', 'Le Havre AC', 'Montpellier HSC']


        # add the points for each league
        self.points[0] = self.premier_league_scoring(preds[0], team_standings[0])
        self.points[1] = self.la_liga_scoring(preds[1], team_standings[1])
        self.points[2] = self.championship_scoring(preds[2], team_standings[2])
        self.points[3] = self.serie_a_scoring(preds[3], team_standings[3])
        self.points[4] = self.bundesliga_scoring(preds[4], team_standings[4])
        self.points[5] = self.ligue_1_scoring(preds[5], team_standings[5])

        # We have three lists: 
        # preds, the user's predictions
        # team_standings, the actual prem standings
        # points, which is a list of lists: each indiviudal list is for a different league, which each contain
        #     the relevant points for each team, equal to the column in the spreadsheet

        ##### Stuff below is to be completed - submits scores back to database
        # columns = []
        # for i in range(1,21):
        #     columns.append(str(i))

        # update_data = dict(zip(columns, points))

        # # Submit the scores into a new 
        # submit = self.supabase.table('scores').update(update_data).match({'username': uname})


    def premier_league_scoring(self, preds, team_standings):
        # 20 teams
        # top 4 correct points = 8,6,5,5
        # relegation (18,19,20) correct points = 5,5,5
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
        # relegation (18,19,20) correct points = 5,5,5
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
        # playoffs (3,4,5,6) correct points = 5,5,5,5
        # relegation (22,23,24) correct points = 5,5,5
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
            points[3] = 2

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

        # seventh to sixteenth place
        for i in range(6, 16):
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

    def serie_a_scoring(self, preds, team_standings):
        # top 4 correct points = 8,6,5,5
        # relegation (18,19,20) correct points = 5,5,5
        # everywhere else correct points= 3

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
        # top 4 correct points = 8,6,5,5
        # relegation (18,19,20) correct points = 5,5,5
        # everywhere else correct points= 3

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

    def ligue_1_scoring(self, preds, team_standings):
        # top 4 correct points = 8,6,5,5
        # relegation (18,19,20) correct points = 5,5,5
        # everywhere else correct points= 3

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