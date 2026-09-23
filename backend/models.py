from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime

# Users
class UserCreate(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Produce Batches
class ProduceCreate(BaseModel):
    farmer_id: str
    produce_type: str
    variety: Optional[str] = None
    quantity: float
    unit: str
    harvest_date: Optional[date] = None
    harvest_time: Optional[time] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    transport_time: Optional[float] = None
    storage_type: Optional[str] = None
    storage_temperature: Optional[float] = None
    storage_humidity: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FreshnessRequest(BaseModel):
    produce_type: str
    temperature: float
    humidity: float
    transport_time: float
    storage_type: str

class FreshnessResponse(BaseModel):
    risk_level: str
    estimated_days: str
    recommended_action: str
    factors: Optional[List[str]] = None

# Residues
class ResidueCreate(BaseModel):
    farmer_id: str
    residue_type: str
    quantity: float
    unit: str
    quality: Optional[str] = None
    moisture: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    available_from: Optional[date] = None
    available_until: Optional[date] = None
    expected_price: Optional[float] = None

# Industry Demands
class DemandCreate(BaseModel):
    industry_id: str
    material_type: str
    required_quantity: float
    quality_requirement: Optional[str] = None
    moisture_requirement: Optional[float] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    required_from: Optional[date] = None
    required_until: Optional[date] = None
