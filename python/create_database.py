class create_db:
    def __init__(self, supabase, leagues):
        self.supabase = supabase
        self.leagues = leagues

    def create_tables(self):
        # Query to create credentials table
        create_table_query = """
            CREATE TABLE IF NOT EXISTS public.credentials (
                username TEXT NOT NULL,
                passcode TEXT NOT NULL,
                email TEXT NULL,
                CONSTRAINT credentials_pkey PRIMARY KEY (username)
            );
            """
        self.supabase.rpc("execute_sql", {"query": create_table_query}).execute()

        # Create and execute SQL queries for each league
        for league in self.leagues:
            self.supabase.rpc("execute_sql", {"query": self.pred_query_creator(league)}).execute()
            self.supabase.rpc("execute_sql", {"query": self.score_query_creator(league)}).execute()

        # Query to create the leaderboard table
        leaderboard_query = """
            CREATE TABLE IF NOT EXISTS public.leaderboard (
                username TEXT NOT NULL,
                prem INTEGER NULL,
                la_liga INTEGER NULL,
                champ INTEGER NULL,
                seriea INTEGER NULL,
                bundes INTEGER NULL,
                ligue1 INTEGER NULL,
                total INTEGER NULL,
                CONSTRAINT leaderboard_pkey PRIMARY KEY (username)
            );
            """
        self.supabase.rpc("execute_sql", {"query": leaderboard_query}).execute()

        # Query to create a table for mini-leagues
        mini_league_query = """
            CREATE TABLE IF NOT EXISTS public.mini_leagues (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL,
                admin_username TEXT NOT NULL REFERENCES credentials(username) ON DELETE CASCADE,
                join_code TEXT UNIQUE NOT NULL,
                prem_limit INTEGER DEFAULT 20,
                champ_limit INTEGER DEFAULT 10,
                la_liga_limit INTEGER DEFAULT 6,
                seriea_limit INTEGER DEFAULT 6,
                bundes_limit INTEGER DEFAULT 6,
                ligue1_limit INTEGER DEFAULT 6
            );
        """
        self.supabase.rpc("execute_sql", {"query": mini_league_query}).execute()

        # Query to create the mini league member table - needs to be updated to split league scores
        mini_league_members_query = """
            CREATE TABLE IF NOT EXISTS public.mini_league_members (
                mini_league_id UUID NOT NULL REFERENCES mini_leagues(id) ON DELETE CASCADE,
                username TEXT NOT NULL REFERENCES credentials(username) ON DELETE CASCADE,
                total_score integer null default 0, 
                score_per_league JSONB DEFAULT '{}'::JSONB,
                PRIMARY KEY (mini_league_id, username)
            );
        """
        
        self.supabase.rpc("execute_sql", {"query": mini_league_members_query}).execute()

    def create_users(self):
        # Create rows in the database for default values
        self.supabase.table('credentials').insert({'username': 'all_teams', 'passcode':'admin_acc'}).execute()
        self.supabase.table('credentials').insert({'username': 'standings', 'passcode':'admin_acc'}).execute()
        self.supabase.table('credentials').insert({'username': 'points', 'passcode':'admin_acc'}).execute()
        self.supabase.table('credentials').insert({'username': 'games_played', 'passcode':'admin_acc'}).execute()
        self.supabase.table('credentials').insert({'username': 'goal_difference', 'passcode':'admin_acc'}).execute()
        self.supabase.table('credentials').insert({'username': 'last_season_finishes', 'passcode':'admin_acc'}).execute()

        # Cycle through league tables to create default value rows
        for i in range(len(self.leagues)):
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'all_teams'}).execute()
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'standings'}).execute()
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'points'}).execute()
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'games_played'}).execute()
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'goal_difference'}).execute()
            self.supabase.table(self.leagues[i].shorthand+'_preds').insert({'username': 'last_season_finishes'}).execute()

    def pred_query_creator(self, league):
        # Creates the predictions table for the league passed as a param
        query = f"""
                CREATE TABLE IF NOT EXISTS public.{league.shorthand}_preds (
                    username TEXT PRIMARY KEY,
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
        # Creates the scores table for the league passed as a param
        query = f"""
                CREATE TABLE IF NOT EXISTS public.{league.shorthand}_scores (
                    username TEXT PRIMARY KEY,
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