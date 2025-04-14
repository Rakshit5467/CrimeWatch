import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS

warnings.filterwarnings('ignore') # Suppress warnings

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes, allowing React frontend to call

# --- Define File Paths ---
# Use relative paths assuming models are in a 'models' subdirectory
model_dir = os.path.join(os.path.dirname(__file__), 'models')
rf_model_path = os.path.join(model_dir, 'random_forest_model.joblib')
xgb_model_path = os.path.join(model_dir, 'xgboost_model.joblib')
original_df_path = os.path.join(model_dir, 'original_df_with_label.joblib')
agg_df_path = os.path.join(model_dir, 'aggregated_district_data.joblib')

# Define features globally
features = ['MURDER', 'RAPE', 'THEFT', 'RIOTS']

# --- Load Models and Data ONCE at Startup ---
print("Loading models and data...")
try:
    if not os.path.exists(model_dir):
         raise FileNotFoundError(f"Model directory not found: {model_dir}")
    if not os.path.exists(rf_model_path):
         raise FileNotFoundError(f"RF Model file not found: {rf_model_path}")
    if not os.path.exists(xgb_model_path):
         raise FileNotFoundError(f"XGB Model file not found: {xgb_model_path}")
    if not os.path.exists(original_df_path):
         raise FileNotFoundError(f"Original DF file not found: {original_df_path}")
    if not os.path.exists(agg_df_path):
         raise FileNotFoundError(f"Aggregated DF file not found: {agg_df_path}")

    rf_model = joblib.load(rf_model_path)
    xgb_model = joblib.load(xgb_model_path)
    df_original = joblib.load(original_df_path)
    df_agg = joblib.load(agg_df_path)
    print("Models and data loaded successfully.")
    print(f"Original DF shape: {df_original.shape}")
    print(f"Aggregated DF shape: {df_agg.shape}")
    # Convert column names to uppercase for consistency if needed
    df_original.columns = df_original.columns.str.upper()
    df_agg.columns = df_agg.columns.str.upper()
    # Make sure 'features' are uppercase too (they already are)
    features = [f.upper() for f in features]

except FileNotFoundError as e:
    print(f"Error loading file: {e}")
    print("Ensure model/data files exist in the 'models' subdirectory.")
    # Exit if essential files are missing
    raise SystemExit("Required files not found during startup.")
except Exception as e:
    print(f"An unexpected error occurred during loading: {e}")
    raise SystemExit("Failed to load models/data.")


# --- API Endpoint for Prediction ---
@app.route('/api/predict', methods=['POST'])
def predict_route():
    """API endpoint to predict safety for a specific region."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        state_ut = data.get('stateUt')
        district = data.get('district')

        if not state_ut or not district:
            return jsonify({"error": "Missing 'stateUt' or 'district' in request"}), 400

        # Convert to uppercase for matching
        state_ut = state_ut.strip().upper()
        district = district.strip().upper()

        # Filter the original dataset
        # Ensure column names used for filtering are uppercase
        region_data = df_original[(df_original['STATE/UT'] == state_ut) & (df_original['DISTRICT'] == district)]

        if region_data.empty:
            return jsonify({"error": f"Region '{district}, {state_ut}' not found"}), 404

        # Calculate average stats
        aggregated_data = region_data[features].mean().to_frame().T
        input_df = aggregated_data[features] # Ensure column order

        # Make prediction
        prediction_code = rf_model.predict(input_df)[0]
        prediction_label = "SAFE" if prediction_code == 0 else "UNSAFE"

        # Prepare stats for response
        stats_response = aggregated_data.iloc[0].round(2).to_dict()

        response = {
            "prediction": prediction_label,
            "stats": stats_response,
            "region": {
                "stateUt": state_ut, # Return the processed names
                "district": district
            }
        }
        return jsonify(response), 200

    except Exception as e:
        print(f"Error in /api/predict: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


# --- API Endpoint for Recommendation ---
@app.route('/api/recommend', methods=['POST'])
def recommend_route():
    """API endpoint to recommend safest districts."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        state_filter = data.get('state') # Optional state filter
        top_n = int(data.get('topN', 5)) # Default to 5 recommendations
        crime_weights = data.get('weights', {}) # Optional weights dictionary

        # --- Core Recommendation Logic (adapted from get_safety_recommendations) ---
        df_rec = df_agg.copy()
        X_all = df_rec[features]
        # Check if X_all is empty before creating DMatrix
        if X_all.empty:
             return jsonify({"error": "Aggregated data is empty, cannot proceed."}), 500

        try:
            dmatrix_all = xgb.DMatrix(X_all, feature_names=features) # Pass feature names for clarity
        except Exception as matrix_err:
             print(f"Error creating DMatrix: {matrix_err}")
             return jsonify({"error": f"Internal error during data preparation: {matrix_err}"}), 500


        df_rec['UNSAFE_PROB'] = xgb_model.predict(dmatrix_all)
        df_rec['SAFETY_SCORE'] = (1 - df_rec['UNSAFE_PROB']) * 100
        initial_safety_score = df_rec['SAFETY_SCORE'].copy()

        # Apply state filter
        if state_filter:
            state_upper = state_filter.strip().upper()
            df_rec = df_rec[df_rec['STATE/UT'] == state_upper]
            if df_rec.empty:
                # Return empty list, frontend handles "not found" message
                return jsonify([]), 200 # Success, but no results for this state


        # Apply crime weights
        if crime_weights:
            total_weight_penalty = pd.Series(0.0, index=df_rec.index)
            active_weights_applied = False
            processed_weights = {} # Store processed weights for logging/debugging

            for crime, weight_val in crime_weights.items():
                 crime_upper = crime.upper()
                 try:
                     weight = float(weight_val) # Ensure weight is a float
                     processed_weights[crime_upper] = weight # Store processed weight
                 except (ValueError, TypeError):
                     print(f"Warning: Invalid weight type for {crime_upper}: {weight_val}. Ignoring.")
                     continue # Skip this weight if it's not a number

                 if crime_upper in features and weight > 0:
                    active_weights_applied = True
                    current_selection_crime = df_rec[crime_upper]
                    max_val = current_selection_crime.max()
                    min_val = current_selection_crime.min()

                    if max_val > min_val:
                        normalized_crime = (current_selection_crime - min_val) / (max_val - min_val)
                    elif max_val > 0:
                        normalized_crime = (current_selection_crime > 0).astype(float)
                    else:
                        normalized_crime = 0.0

                    penalty = normalized_crime * weight
                    total_weight_penalty += penalty


            if active_weights_applied:
                df_rec['SAFETY_SCORE'] = (initial_safety_score.loc[df_rec.index] - total_weight_penalty).clip(lower=0)
                print("Safety scores adjusted based on weights:", processed_weights) # Log applied weights
            else:
                print("No active crime weights applied.")


        # Sort and select top N
        recommendations_df = df_rec.sort_values('SAFETY_SCORE', ascending=False).head(top_n)

        # Format results into list of dictionaries expected by frontend
        results = []
        rank = 1
        for _, row in recommendations_df.iterrows():
            # Ensure keys match the React frontend expectation
            rec_info = {
                'Rank': rank,
                'State': row['STATE/UT'],
                'District': row['DISTRICT'],
                'Safety_Score': round(row['SAFETY_SCORE'], 1),
                # Match keys like 'Avg_Murder' from React's api.js simulation
                'Avg_Murder': round(row['MURDER'], 2),
                'Avg_Rape': round(row['RAPE'], 2),
                'Avg_Theft': round(row['THEFT'], 2),
                'Avg_Riots': round(row['RIOTS'], 2)
            }
            results.append(rec_info)
            rank += 1

        return jsonify(results), 200

    except Exception as e:
        print(f"Error in /api/recommend: {e}")
        import traceback
        traceback.print_exc() # Print detailed traceback for debugging
        return jsonify({"error": "An internal server error occurred"}), 500

# --- Run the Flask App ---
if __name__ == '__main__':
    # Use port 5001 to avoid conflict with React's default 3000
    # host='0.0.0.0' makes it accessible on your network (optional)
    print("Starting Flask server...")
    app.run(debug=True, port=5001, host='0.0.0.0')