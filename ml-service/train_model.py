import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
import lightgbm as lgb
import joblib
import warnings
import os

warnings.filterwarnings('ignore')

# Team Aliases for Consistency
TEAM_ALIASES = {
    'Delhi Daredevils': 'Delhi Capitals',
    'Kings XI Punjab': 'Punjab Kings',
    'Deccan Chargers': 'Sunrisers Hyderabad',
    'Rising Pune Supergiants': 'Rising Pune Supergiant',
    'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
}

# Standardized Teams
ALL_TEAMS = [
    'Chennai Super Kings', 'Delhi Capitals', 'Gujarat Titans',
    'Kolkata Knight Riders', 'Lucknow Super Giants', 'Mumbai Indians',
    'Punjab Kings', 'Rajasthan Royals', 'Royal Challengers Bengaluru',
    'Sunrisers Hyderabad',
]

def normalize_venue(v):
    if not isinstance(v, str): return "Unknown"
    return v.split(',')[0].strip()

def process_matches(csv_path):
    print(f"--- Loading Dataset: {csv_path} ---")
    df = pd.read_csv(csv_path)
    
    # Cleaning
    df['team1'] = df['team1'].replace(TEAM_ALIASES)
    df['team2'] = df['team2'].replace(TEAM_ALIASES)
    df['toss_winner'] = df['toss_winner'].replace(TEAM_ALIASES)
    df['winner'] = df['winner'].replace(TEAM_ALIASES)
    df['venue'] = df['venue'].apply(normalize_venue)
    
    # Filter for modern teams
    df = df[df['team1'].isin(ALL_TEAMS) & df['team2'].isin(ALL_TEAMS)].copy()
    
    synthetic_rows = []
    print("Generating strategic match states for training...")
    
    for idx, row in df.iterrows():
        # Logic to identify chasing team
        if row['toss_decision'] == 'field':
            batting_team = row['toss_winner']
            bowling_team = row['team1'] if row['team2'] == batting_team else row['team2']
        else:
            bowling_team = row['toss_winner']
            batting_team = row['team1'] if row['team2'] == bowling_team else row['team2']
            
        target = row['target_runs']
        if pd.isna(target) or target <= 0: continue
        
        winner = row['winner']
        match_result = 1 if batting_team == winner else 0
        
        # Determine final score/wickets
        if match_result == 1:
            final_score = target
            margin = int(row['result_margin']) if row['result'] == 'wickets' else 0
            final_wickets = 10 - margin if margin > 0 else 7 # approximation
        else:
            margin = int(row['result_margin']) if row['result'] == 'runs' else 5
            final_score = target - margin
            final_wickets = 10
            
        # Generate varied states (10 per match)
        for over in range(1, 21):
            if over % 2 != 0 and over != 20: continue # every 2nd over for efficiency
            
            progress = over / 20.0
            # Add some randomness to simulate match dynamics
            current_score = int(final_score * progress * np.random.uniform(0.85, 1.15))
            current_score = min(current_score, final_score)
            
            wickets_out = int(final_wickets * progress * np.random.uniform(0.7, 1.3))
            wickets_out = min(wickets_out, 9)
            
            balls_left = (20 - over) * 6
            runs_left = target - current_score
            
            crr = (current_score * 6) / (over * 6)
            rrr = (runs_left * 6) / max(balls_left, 1)
            
            synthetic_rows.append({
                'batting_team': batting_team,
                'bowling_team': bowling_team,
                'venue': row['venue'],
                'toss_winner': row['toss_winner'],
                'toss_decision': row['toss_decision'],
                'runs_left': runs_left,
                'balls_left': balls_left,
                'wickets_left': 10 - wickets_out,
                'crr': crr,
                'rrr': rrr,
                'result': match_result
            })
            
    return pd.DataFrame(synthetic_rows)

def train_full_suite():
    csv_path = '../matches.csv'
    if not os.path.exists(csv_path):
        print("CSV not found.")
        return

    df_model = process_matches(csv_path)
    features = ['batting_team', 'bowling_team', 'venue', 'toss_winner', 'toss_decision',
                'runs_left', 'balls_left', 'wickets_left', 'crr', 'rrr']
    
    # Encoders
    categorical = ['batting_team', 'bowling_team', 'venue', 'toss_winner', 'toss_decision']
    encoders = {}
    for col in categorical:
        le = LabelEncoder()
        df_model[col] = le.fit_transform(df_model[col].astype(str))
        encoders[col] = le
        
    X = df_model[features]
    y = df_model['result']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"--- Training Suite Initialized ({len(X_train)} samples) ---")
    
    models = {
        'lgbm': lgb.LGBMClassifier(n_estimators=150, learning_rate=0.07, random_state=42, verbose=-1),
        'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'logistic_regression': LogisticRegression(max_iter=1000),
        'decision_tree': DecisionTreeClassifier(random_state=42),
        'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'adaboost': AdaBoostClassifier(n_estimators=100, random_state=42),
        'knn': KNeighborsClassifier(n_neighbors=5),
        'naive_bayes': GaussianNB()
    }
    
    results = {}
    trained_models = {}
    
    for name, model in models.items():
        print(f"  Training {name}...", end=" ", flush=True)
        model.fit(X_train, y_train)
        acc = model.score(X_test, y_test)
        results[name] = acc
        trained_models[name] = model
        print(f"Done (Acc: {acc:.4f})")
        
    best_model = max(results, key=results.get)
    print(f"\nBest Performer: {best_model} ({results[best_model]:.4f})")
    
    payload = {
        'models': trained_models,
        'encoders': encoders,
        'features': features,
        'teams': ALL_TEAMS,
        'venues': sorted(list(encoders['venue'].classes_)),
        'model_accuracies': results,
        'best_model': best_model
    }
    
    joblib.dump(payload, 'ipl_models.pkl')
    print("--- Model Portfolio Saved: ipl_models.pkl ---")

if __name__ == "__main__":
    train_full_suite()
