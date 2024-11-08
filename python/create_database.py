class create_db:
    def __init__(self, supabase):
        self.supabase = supabase
        self.leagues = ['prem', 'la_liga', 'champ', 'bundes', 'seriea', 'ligue1']

    def create_tables(self):
        create_table_query = """
            CREATE TABLE IF NOT EXISTS public.credentials (
                username TEXT NOT NULL,
                passcode TEXT NOT NULL,
                email TEXT NULL,
                CONSTRAINT credentials_pkey PRIMARY KEY (username)
            );
            """

        # Execute the SQL query
        response = self.supabase.rpc("execute_sql", {"query": create_table_query}).execute()
        responses = [None] * 6
        responses_2 = [None] * 6
        for i in range(len(self.leagues)):
            responses[i] = self.supabase.rpc("execute_sql", {"query": self.pred_query_creator(self.leagues[i])}).execute()
            responses_2[i] = self.supabase.rpc("execute_sql", {"query": self.score_query_creator(self.leagues[i])}).execute()

    def create_users(self):

        response = self.supabase.table('credentials').insert({'username': 'all_teams', 'passcode':'admin_acc'}).execute()
        response = self.supabase.table('credentials').insert({'username': 'standings', 'passcode':'admin_acc'}).execute()
        response = self.supabase.table('credentials').insert({'username': 'points', 'passcode':'admin_acc'}).execute()
        response = self.supabase.table('credentials').insert({'username': 'games_played', 'passcode':'admin_acc'}).execute()
        response = self.supabase.table('credentials').insert({'username': 'goal_difference', 'passcode':'admin_acc'}).execute()
        response = self.supabase.table('credentials').insert({'username': 'last_season_finishes', 'passcode':'admin_acc'}).execute()

        for i in range(len(self.leagues)):
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'all_teams'}).execute()
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'standings'}).execute()
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'points'}).execute()
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'games_played'}).execute()
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'goal_difference'}).execute()
            response = self.supabase.table(self.leagues[i]+'_preds').insert({'username': 'last_season_finishes'}).execute()


    def pred_query_creator(self, league):
        return """
            CREATE TABLE IF NOT EXISTS public.""" + league + """_preds (
                username TEXT NOT NULL,
                "1" TEXT NULL,
                "2" TEXT NULL,
                "3" TEXT NULL,
                "4" TEXT NULL,
                "5" TEXT NULL,
                "6" TEXT NULL,
                "7" TEXT NULL,
                "8" TEXT NULL,
                "9" TEXT NULL,
                "10" TEXT NULL,
                "11" TEXT NULL,
                "12" TEXT NULL,
                "13" TEXT NULL,
                "14" TEXT NULL,
                "15" TEXT NULL,
                "16" TEXT NULL,
                "17" TEXT NULL,
                "18" TEXT NULL,
                "19" TEXT NULL,
                "20" TEXT NULL
            );
        """

    def score_query_creator(self, league):
        return """
            CREATE TABLE IF NOT EXISTS public.""" + league + """_scores (
                username TEXT NOT NULL,
                "1" TEXT NULL,
                "2" TEXT NULL,
                "3" TEXT NULL,
                "4" TEXT NULL,
                "5" TEXT NULL,
                "6" TEXT NULL,
                "7" TEXT NULL,
                "8" TEXT NULL,
                "9" TEXT NULL,
                "10" TEXT NULL,
                "11" TEXT NULL,
                "12" TEXT NULL,
                "13" TEXT NULL,
                "14" TEXT NULL,
                "15" TEXT NULL,
                "16" TEXT NULL,
                "17" TEXT NULL,
                "18" TEXT NULL,
                "19" TEXT NULL,
                "20" TEXT NULL
            );
        """
