from fastapi import APIRouter, Depends, HTTPException, status
from database import get_database
from schemas import SessionCreate
import uuid

router = APIRouter()

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(session_data: SessionCreate):
    db = get_database()
    session_id = str(uuid.uuid4())
    
    # Store session profile in MongoDB
    session_doc = {
        "session_id": session_id,
        "user_profile": session_data.user_profile.model_dump(),
        "chat_history": []
    }
    
    await db["sessions"].insert_one(session_doc)
    
    return {"session_id": session_id, "message": "Session created successfully"}

@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    db = get_database()
    session = await db["sessions"].find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session["_id"] = str(session["_id"])
    return session

from schemas import ChatMessage
from ai.agent import process_chat

@router.post("/sessions/{session_id}/chat")
async def chat(session_id: str, message: ChatMessage):
    db = get_database()
    session = await db["sessions"].find_one({"session_id": session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Append user message to history
    await db["sessions"].update_one(
        {"session_id": session_id},
        {"$push": {"chat_history": {"role": "user", "content": message.content}}}
    )
    
    # Process with Agent
    chat_history = [(msg["role"], msg["content"]) for msg in session.get("chat_history", [])]
    agent_response = await process_chat(session_id, message.content, chat_history)
    
    # Append agent response
    await db["sessions"].update_one(
        {"session_id": session_id},
        {"$push": {"chat_history": {"role": "assistant", "content": agent_response}}}
    )
    
    return {"role": "assistant", "content": agent_response}
