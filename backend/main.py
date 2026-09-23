from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
import models
import logging

# Configure professional logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AgroSetuAPI")

app = FastAPI(title="AgroSetu API", description="Backend API for AI, GIS, and Optimization")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected server error occurred. Our engineers have been notified."},
    )

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AgroSetu API", "status": "active"}

# --- USERS ---
@app.post("/api/users")
def create_user(user: models.UserCreate):
    try:
        user_data = user.model_dump(mode='json', exclude_none=True)
        response = supabase.table("users").upsert(user_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]

# --- PRODUCE & FRESHNESS ---
@app.post("/api/produce")
def add_produce(produce: models.ProduceCreate):
    produce_data = produce.model_dump(mode='json', exclude_none=True)
    
    # Remove fields that might not exist in the database schema yet
    produce_data.pop('location', None)
    produce_data.pop('latitude', None)
    produce_data.pop('longitude', None)
    
    try:
        response = supabase.table("produce_batches").insert(produce_data).execute()
        return response.data[0]
    except Exception as e:
        logger.error(f"Error adding produce: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/produce")
def get_all_produce():
    response = supabase.table("produce_batches").select("*").execute()
    return response.data

@app.get("/api/produce/{produce_id}")
def get_produce_by_id(produce_id: str):
    response = supabase.table("produce_batches").select("*").eq("id", produce_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Produce batch not found")
    return response.data[0]

@app.delete("/api/produce/{produce_id}")
def delete_produce(produce_id: str):
    try:
        supabase.table("produce_batches").delete().eq("id", produce_id).execute()
        return {"status": "success", "message": "Produce deleted"}
    except Exception as e:
        logger.error(f"Error deleting produce: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

import json
import os
from google import genai
from google.genai import types

client = None
try:
    if os.environ.get("GEMINI_API_KEY"):
        client = genai.Client()
except Exception:
    pass

@app.post("/api/freshness/predict", response_model=models.FreshnessResponse)
def predict_freshness(data: models.FreshnessRequest):
    """
    AI-Assisted Shelf-Life Estimator using Gemini (with Rule-based fallback)
    """
    if client:
        prompt = f"""
        You are an agricultural AI assistant specializing in produce shelf-life.
        Analyze the freshness risk for a batch of {data.produce_type}.
        Current Conditions:
        - Temperature: {data.temperature}°C
        - Humidity: {data.humidity}%
        - Transportation Time: {data.transport_time} hours
        - Storage Type: {data.storage_type}

        Assess the spoilage risk and return a JSON object with exactly these fields:
        - risk_level: string (must be "Low", "Medium", or "High")
        - estimated_days: string (e.g., "1-2 days")
        - recommended_action: string (a short, clear action to take)
        - factors: array of strings (list 2-3 specific reasons for this estimate based on the conditions)
        """
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            parsed = json.loads(response.text)
            return parsed
        except Exception as e:
            logger.error(f"Gemini API error, falling back to rules: {e}")

    # Fallback Rule-based algorithm based on temp and transit
    risk_score = (data.temperature - 25) * 2 + (data.transport_time) * 1.5
    
    # Adjust for storage type
    if data.storage_type == "cold_room" or data.storage_type == "solar_hub":
        risk_score -= 15
    elif data.storage_type == "shade":
        risk_score -= 5
        
    factors = [
        f"Temperature exposure at {data.temperature}°C",
        f"Transportation time of {data.transport_time} hours",
        f"Storage type: {data.storage_type.replace('_', ' ')}"
    ]
        
    if risk_score > 20:
        return {
            "risk_level": "High",
            "estimated_days": "0-1 days",
            "recommended_action": "SELL NOW",
            "factors": factors
        }
    elif risk_score > 10:
        return {
            "risk_level": "Medium",
            "estimated_days": "1-2 days",
            "recommended_action": "Prioritize selling or move to cooling",
            "factors": factors
        }
    else:
        return {
            "risk_level": "Low",
            "estimated_days": "3-5 days",
            "recommended_action": "Safe for transport/storage",
            "factors": factors
        }

# --- COOLING HUBS ---
class CoolingHubCreate(BaseModel):
    name: str
    capacity: float
    latitude: float
    longitude: float
    status: Optional[str] = "active"
    operator_id: Optional[str] = None

@app.post("/api/cooling-hubs")
def add_cooling_hub(hub: CoolingHubCreate):
    try:
        response = supabase.table("cooling_hubs").insert(hub.dict()).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error adding cooling hub: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cooling-hubs")
def get_all_cooling_hubs():
    try:
        response = supabase.table("cooling_hubs").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching cooling hubs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/cooling-hubs/{hub_id}")
def delete_cooling_hub(hub_id: str):
    try:
        supabase.table("cooling_hubs").delete().eq("id", hub_id).execute()
        return {"status": "success", "message": "Cooling hub deleted"}
    except Exception as e:
        logger.error(f"Error deleting cooling hub: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

import math

def haversine_dist(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@app.get("/api/cooling-hubs/nearby")
def get_nearby_cooling_hubs(lat: float, lng: float, radius_km: float = 50.0):
    try:
        response = supabase.table("cooling_hubs").select("*").eq("status", "active").execute()
        hubs = response.data
        
        nearby_hubs = []
        for hub in hubs:
            hub_lat = hub.get("latitude")
            hub_lng = hub.get("longitude")
            if hub_lat and hub_lng:
                dist = haversine_dist(lat, lng, hub_lat, hub_lng)
                if dist <= radius_km:
                    hub["distance_km"] = round(dist, 1)
                    nearby_hubs.append(hub)
                    
        # Sort by distance
        nearby_hubs.sort(key=lambda x: x["distance_km"])
        
        return nearby_hubs
    except Exception as e:
        logger.error(f"Error fetching cooling hubs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- AGRICULTURAL RESIDUES ---
@app.post("/api/residues")
def add_residue(residue: models.ResidueCreate):
    res_data = residue.model_dump(mode='json', exclude_none=True)
    try:
        response = supabase.table("residue_listings").insert(res_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/residues")
def get_residues():
    response = supabase.table("residue_listings").select("*").eq("status", "active").execute()
    return response.data

@app.delete("/api/residues/{residue_id}")
def delete_residue(residue_id: str):
    try:
        supabase.table("residue_listings").delete().eq("id", residue_id).execute()
        return {"status": "success", "message": "Residue deleted"}
    except Exception as e:
        logger.error(f"Error deleting residue: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- INDUSTRY DEMANDS ---
@app.post("/api/demands")
def add_demand(demand: models.DemandCreate):
    dem_data = demand.model_dump(mode='json', exclude_none=True)
    try:
        response = supabase.table("industry_demands").insert(dem_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/demands")
def get_demands():
    try:
        response = supabase.table("industry_demands").select("*").eq("status", "active").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching demands: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/demands/{demand_id}")
def delete_demand(demand_id: str):
    try:
        supabase.table("industry_demands").delete().eq("id", demand_id).execute()
        return {"status": "success", "message": "Demand deleted"}
    except Exception as e:
        logger.error(f"Error deleting demand: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- MATCHING ENGINE ---
@app.get("/api/matches")
def generate_matches():
    """
    Smart Matching Engine
    Groups multiple farmer residues to fulfill a single industry demand if needed.
    """
    residues = supabase.table("residue_listings").select("*").eq("status", "active").execute().data
    demands = supabase.table("industry_demands").select("*").eq("status", "active").execute().data
    
    matches = []
    
    for d in demands:
        # 1. Filter compatible residues
        compatible_residues = []
        for r in residues:
            if r["residue_type"] == d["material_type"]:
                # Check moisture
                if r.get("moisture") and d.get("moisture_requirement"):
                    if r["moisture"] > d["moisture_requirement"]:
                        continue # Skip if too wet
                
                # Calculate distance
                d_lat = d.get("latitude")
                d_lng = d.get("longitude")
                r_lat = r.get("latitude")
                r_lng = r.get("longitude")
                dist = 0
                if d_lat and d_lng and r_lat and r_lng:
                    dist = haversine_dist(d_lat, d_lng, r_lat, r_lng)
                
                r_copy = dict(r)
                r_copy["distance_to_industry"] = dist
                
                # Composite Score: Combine Price + Distance Logistics
                # Assume fallback price of 10 if not set. Transport cost factor ~0.5 per km.
                price = float(r.get("expected_price") or 10.0)
                r_copy["expected_price"] = price
                r_copy["composite_cost"] = price + (dist * 0.5)
                
                compatible_residues.append(r_copy)
        
        # 2. Sort residues by composite cost (cheapest + closest first)
        compatible_residues.sort(key=lambda x: x["composite_cost"])
        
        # 3. Cluster greedily until demand is met
        required = d["required_quantity"]
        fulfilled = 0
        total_price_sum = 0
        selected_residues = []
        
        for r in compatible_residues:
            if fulfilled >= required:
                break
            selected_residues.append(r)
            fulfilled += r["quantity"]
            total_price_sum += (r["expected_price"] * r["quantity"])
            
        if selected_residues:
            # Score based on how much is fulfilled
            ratio = min(fulfilled / required, 1.0) if required > 0 else 0
            score = 50 + (ratio * 50)
            
            avg_price = total_price_sum / fulfilled if fulfilled > 0 else 0
            
            matches.append({
                "industry_demand": d,
                "residue_listings": selected_residues,
                "total_fulfilled": fulfilled,
                "avg_price_per_unit": round(avg_price, 2),
                "match_score": min(score, 100),
                "is_clustered": len(selected_residues) > 1
            })
            
    # Sort by highest score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches

# --- SUSTAINABILITY METRICS ---
@app.get("/api/sustainability")
def get_sustainability_metrics():
    # In a real app, this would aggregate data from the database
    return {
        "produce_saved_kg": 1240,
        "residue_recovered_tons": 18.5,
        "emissions_avoided_kg_co2": 420,
        "transport_optimized_km": 145,
        "potential_farmer_value_inr": 42500,
        "industry_demand_fulfilled_percent": 72
    }
