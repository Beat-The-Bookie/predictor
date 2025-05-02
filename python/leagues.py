class league:

    # A class to store the league information
    def __init__(self, team_num, relegated, footkey, shorthand, play_off_succeed="False", promoted=0):
        self.team_num = team_num
        self.relegated = relegated
        self.footkey = footkey
        self.shorthand = shorthand
        if play_off_succeed == True:
            self.relegated += 1
        self.promoted = promoted