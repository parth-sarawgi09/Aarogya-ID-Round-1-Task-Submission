from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from database import get_database
from ai.document_processor import parse_and_store_pdf, delete_policy_from_vector_db
import uuid
import os
import aiofiles

router = APIRouter()

# Simple dependency for admin auth check (could be improved in prod)
def verify_admin(username: str = Form(...), password: str = Form(...)):
    if username != os.getenv("ADMIN_USERNAME", "admin") or password != os.getenv("ADMIN_PASSWORD", "admin123"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return True

@router.post("/policies")
async def upload_policy(
    name: str = Form(...),
    insurer: str = Form(...),
    premium: int = Form(...),
    coverage_amount: int = Form(...),
    waiting_period_months: int = Form(...),
    copay_percentage: int = Form(...),
    file: UploadFile = File(...),
    # is_admin: bool = Depends(verify_admin) # Simplified for MVP without complex auth flows
):
    db = get_database()
    policy_id = str(uuid.uuid4())
    
    # Save file temporarily
    temp_file_path = f"/tmp/{policy_id}_{file.filename}"
    os.makedirs("/tmp", exist_ok=True)
    
    async with aiofiles.open(temp_file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    metadata = {
        "policy_id": policy_id,
        "name": name,
        "insurer": insurer,
        "premium": premium,
        "coverage_amount": coverage_amount,
        "waiting_period_months": waiting_period_months,
        "copay_percentage": copay_percentage,
        "exclusions": [], # To be populated by admin or LLM in full version
        "inclusions": []
    }
    
    try:
        # Process and store in Vector DB
        chunks_count = parse_and_store_pdf(temp_file_path, policy_id, metadata)
        
        # Store metadata in MongoDB
        metadata["chunks_count"] = chunks_count
        await db["policies"].insert_one(metadata)
        
        return {"message": "Policy uploaded and processed successfully", "policy_id": policy_id, "chunks": chunks_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/policies")
async def list_policies():
    db = get_database()
    policies = await db["policies"].find().to_list(length=100)
    for p in policies:
        p["_id"] = str(p["_id"])
    return policies

@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str):
    db = get_database()
    
    # 1. Delete from Vector DB FIRST (CRITICAL REQUIREMENT)
    deleted_from_vector = delete_policy_from_vector_db(policy_id)
    
    # 2. Delete from MongoDB
    result = await db["policies"].delete_one({"policy_id": policy_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found in DB")
        
    return {"message": "Policy deleted successfully from both Vector DB and MongoDB", "vector_db_cleared": deleted_from_vector}
