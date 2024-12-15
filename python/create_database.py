class create_db:
    def __init__(self, supabase, leagues):
        self.supabase = supabase
        self.leagues = leagues

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
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'all_teams'}).execute()
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'standings'}).execute()
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'points'}).execute()
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'games_played'}).execute()
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'goal_difference'}).execute()
            response = self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'last_season_finishes'}).execute()

    def pred_query_creator(self, league):

        query = f"""
                CREATE TABLE IF NOT EXISTS public.{league.shorthand}_preds (
                    username TEXT NOT NULL,
        """
        for i in range(league.team_num):
            if i != (league.team_num - 1):
                query += f"""
                    "{i+1}" TEXT NULL,
                """
            else:
                query += f"""
                    "{i+1}" TEXT NULL
                );
            """
        return query
    
    def score_query_creator(self, league):

        query = f"""
                CREATE TABLE IF NOT EXISTS public.{league.shorthand}_scores (
                    username TEXT NOT NULL,
        """
        for i in range(league.team_num):
            if i != (league.team_num - 1):
                query += f"""
                    "{i+1}" TEXT NULL,
                """
            else:
                query += f"""
                    "{i+1}" TEXT NULL
                );
            """
        return query