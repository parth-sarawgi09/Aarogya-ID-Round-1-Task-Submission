from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class LifestyleEnum(str, Enum):
    sedentary = "sedentary"
    moderate = "moderate"
    active = "active"
    athlete = "athlete"

class ConditionEnum(str, Enum):
    diabetes = "diabetes"
    hypertension = "hypertension"
    asthma = "asthma"
    cardiac = "cardiac"
    none = "none"

class IncomeBandEnum(str, Enum):
    under_3l = "under 3L"
    between_3_8l = "3-8L"
    between_8_15l = "8-15L"
    over_15l = "15L+"

class CityTierEnum(str, Enum):
    metro = "metro"
    tier_2 = "tier-2"
    tier_3 = "tier-3"

class UserProfile(BaseModel):
    full_name: str = Field(..., description="User's full name")
    age: int = Field(..., description="User's age in years")
    lifestyle: LifestyleEnum = Field(..., description="User's lifestyle category")
    pre_existing_conditions: List[ConditionEnum] = Field(..., description="List of pre-existing medical conditions")
    income_band: IncomeBandEnum = Field(..., description="User's annual income band")
    city_tier: CityTierEnum = Field(..., description="User's city tier category")

class SessionCreate(BaseModel):
    user_profile: UserProfile

class ChatMessage(BaseModel):
    role: str # "user" or "agent"
    content: str
