def filter_policies(policies: list, user_profile: dict) -> list:
    filtered = []
    user_conditions = [c.lower() for c in user_profile.get("pre_existing_conditions", [])]
    user_income = user_profile.get("income_band", "")
    
    for policy in policies:
        # Check conditions
        exclusions = [e.lower() for e in policy.get("exclusions", [])]
        condition_excluded = any(cond in exclusions for cond in user_conditions if cond != "none")
        if condition_excluded:
            continue
            
        # Check affordability (simplified logic based on income band)
        premium = policy.get("premium", 0)
        affordable = True
        if user_income == "under 3L" and premium > 15000:
            affordable = False
        elif user_income == "3-8L" and premium > 30000:
            affordable = False
            
        if affordable:
            filtered.append(policy)
            
    return filtered

def rank_policies(policies: list) -> list:
    for policy in policies:
        score = 0
        
        # Lower waiting period = higher score
        waiting_period = policy.get("waiting_period_months", 48)
        score += max(0, 100 - (waiting_period * 2))
        
        # Lower co-pay = higher score
        copay = policy.get("copay_percentage", 20)
        score += max(0, 50 - copay)
        
        # Higher coverage = higher score
        coverage = policy.get("coverage_amount", 0)
        score += min(50, coverage / 100000) 
        
        policy["suitability_score"] = score
        
    # Sort descending by score
    return sorted(policies, key=lambda x: x["suitability_score"], reverse=True)

def adjust_recommendations(ranked_policies: list, user_profile: dict) -> list:
    age = user_profile.get("age", 30)
    city_tier = user_profile.get("city_tier", "metro")
    
    for policy in ranked_policies:
        # Age adjustment: older users need better coverage, penalty if coverage is low
        if age > 50 and policy.get("coverage_amount", 0) < 500000:
            policy["suitability_score"] -= 20
            
        # City tier adjustment: Metro cities have higher medical costs
        if city_tier == "metro" and policy.get("coverage_amount", 0) < 1000000:
            policy["suitability_score"] -= 10
            
    # Re-sort after adjustments
    return sorted(ranked_policies, key=lambda x: x["suitability_score"], reverse=True)

def get_best_policies(all_policies: list, user_profile: dict) -> list:
    filtered = filter_policies(all_policies, user_profile)
    if not filtered:
        # If no policies match after strict filtering, we might return best available with a flag
        ranked = rank_policies(all_policies)
        adjusted = adjust_recommendations(ranked, user_profile)
        for p in adjusted:
            p["warning"] = "Does not fully meet your affordability or condition criteria."
        return adjusted[:3]
        
    ranked = rank_policies(filtered)
    adjusted = adjust_recommendations(ranked, user_profile)
    return adjusted[:3]
