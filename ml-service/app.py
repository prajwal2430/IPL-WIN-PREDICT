from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ipl_models.pkl')
payload = None

def load_models():
    global payload
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Model file not found at {MODEL_PATH}. Run train_model.py first.")
        sys.exit(1)
    payload = joblib.load(MODEL_PATH)
    print(f"[INFO] Loaded models: {list(payload['models'].keys())}")
    print(f"[INFO] Best model: {payload['best_model']}")

def encode_input(data: dict, encoders: dict):
    """Safely label-encode a single input. Unknown labels → unknown class."""
    def safe_encode(le, value):
        if value in le.classes_:
            return le.transform([value])[0]
        else:
            return len(le.classes_)   # fallback for unseen label

    return [
        safe_encode(encoders['batting_team'],   data['batting_team']),
        safe_encode(encoders['bowling_team'],   data['bowling_team']),
        safe_encode(encoders['venue'],          data['venue']),
        safe_encode(encoders['toss_winner'],    data['toss_winner']),
        safe_encode(encoders['toss_decision'],  data['toss_decision']),
        float(data['runs_left']),
        float(data['balls_left']),
        float(data['wickets_left']),
        float(data['crr']),
        float(data['rrr']),
    ]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'models': list(payload['models'].keys())})

@app.route('/teams', methods=['GET'])
def get_teams():
    return jsonify({'teams': payload['teams']})

@app.route('/venues', methods=['GET'])
def get_venues():
    return jsonify({'venues': payload['venues']})

@app.route('/model-accuracies', methods=['GET'])
def model_accuracies():
    return jsonify(payload['model_accuracies'])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        # Required fields
        required = ['batting_team', 'bowling_team', 'venue', 'toss_winner',
                    'toss_decision', 'runs_left', 'balls_left', 'wickets_left', 'crr', 'rrr']
        for field in required:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        chosen_model = data.get('model', payload['best_model'])
        if chosen_model not in payload['models']:
            chosen_model = payload['best_model']

        X = [encode_input(data, payload['encoders'])]

        model = payload['models'][chosen_model]

        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(X)[0]
            batting_win_prob = float(proba[1])
        else:
            pred = model.predict(X)[0]
            batting_win_prob = float(pred)

        bowling_win_prob = 1.0 - batting_win_prob

        # Build all-model probabilities for comparison chart
        all_probs = {}
        for mname, m in payload['models'].items():
            if hasattr(m, 'predict_proba'):
                p = m.predict_proba(X)[0]
                all_probs[mname] = round(float(p[1]) * 100, 1)
            else:
                all_probs[mname] = round(float(m.predict(X)[0]) * 100, 1)

        runs_left  = float(data['runs_left'])
        balls_left = float(data['balls_left'])
        overs_left = balls_left / 6

        return jsonify({
            'batting_team': data['batting_team'],
            'bowling_team': data['bowling_team'],
            'batting_win_prob':  round(batting_win_prob  * 100, 1),
            'bowling_win_prob':  round(bowling_win_prob  * 100, 1),
            'predicted_winner':  data['batting_team'] if batting_win_prob >= 0.5 else data['bowling_team'],
            'model_used': chosen_model,
            'all_model_probs': all_probs,
            'match_summary': {
                'runs_needed': int(runs_left),
                'balls_left':  int(balls_left),
                'overs_left':  round(overs_left, 1),
                'wickets_left': int(data['wickets_left']),
                'rrr': round(float(data['rrr']), 2),
                'crr': round(float(data['crr']), 2),
            },
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/commentary', methods=['POST'])
def generate_commentary():
    """AI-style match commentary generator."""
    try:
        data = request.get_json(force=True)
        batting  = data.get('batting_team', 'Team A')
        bowling  = data.get('bowling_team', 'Team B')
        bat_prob = float(data.get('batting_win_prob', 50))
        runs_left = int(data.get('runs_left', 20))
        balls_left = int(data.get('balls_left', 12))
        wickets   = int(data.get('wickets_left', 5))

        commentary = build_commentary(batting, bowling, bat_prob, runs_left, balls_left, wickets)
        return jsonify({'commentary': commentary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def build_commentary(batting, bowling, bat_prob, runs_left, balls_left, wickets):
    rrr = (runs_left * 6) / max(balls_left, 1)
    pressure = "high" if rrr > 12 else ("moderate" if rrr > 8 else "low")
    momentum = batting if bat_prob >= 60 else (bowling if bat_prob <= 40 else None)

    lines = []

    if bat_prob >= 75:
        lines.append(f"🔥 {batting} are absolutely cruising here! With {wickets} wickets in hand and needing just {runs_left} off {balls_left} balls, the match looks firmly in their control.")
    elif bat_prob >= 55:
        lines.append(f"⚡ {batting} hold the upper hand. They need {runs_left} runs off {balls_left} balls with {wickets} wickets remaining — a very achievable target.")
    elif bat_prob <= 25:
        lines.append(f"💥 {bowling} are on the verge of a sensational win! {batting} need a miracle — {runs_left} runs off {balls_left} balls with only {wickets} wickets left.")
    elif bat_prob <= 45:
        lines.append(f"🎯 The pressure is firmly on {batting}. {bowling}'s bowlers have strangled the run flow, requiring {runs_left} runs off {balls_left} balls — a required rate of {rrr:.1f}!")
    else:
        lines.append(f"⚖️ What a nail-biting contest! {batting} vs {bowling} — the match could go either way. {runs_left} needed off {balls_left} balls at RRR of {rrr:.1f}.")

    if pressure == "high":
        lines.append(f"The required run rate of {rrr:.1f} is astronomical — only a special innings can save {batting} now!")
    elif pressure == "moderate":
        lines.append(f"The required rate sits at {rrr:.1f} — {batting} need boundaries to keep up with the asking rate.")

    if wickets <= 2:
        lines.append(f"With just {wickets} wicket(s) left, {batting}'s tail is exposed. Any wicket now could seal the game!")
    elif wickets >= 7:
        lines.append(f"{batting} have plenty of batting firepower with {wickets} wickets in hand.")

    if momentum:
        lines.append(f"Momentum firmly with {momentum}! 📊 Win probability: {batting} {bat_prob:.0f}% | {100 - bat_prob:.0f}%")

    return " ".join(lines)


if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5001, debug=True)
