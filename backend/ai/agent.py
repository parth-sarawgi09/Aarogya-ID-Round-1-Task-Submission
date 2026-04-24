from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate
from ai.document_processor import get_vector_db
from database import get_database
import os
import asyncio

# Initialize LLM
llm = ChatGroq(
    temperature=0.1,
    model_name="llama-3.1-8b-instant", # Updated to a supported Groq model
    api_key=os.getenv("GROQ_API_KEY")
)

@tool
def retrieve_policy_chunks(query: str, user_profile: str) -> str:
    """Queries vector DB for policy text chunks relevant to the user query and profile."""
    vector_db = get_vector_db()
    if vector_db is None:
        return "Not found in uploaded documents"
        
    # Combine query and profile for context-aware retrieval
    full_query = f"{query}. User context: {user_profile}"
    docs = vector_db.similarity_search(full_query, k=5)
    
    if not docs:
        return "Not found in uploaded documents"
        
    return "\n\n".join([d.page_content for d in docs])

@tool
async def get_user_profile(session_id: str) -> dict:
    """Returns stored user data profile for the given session ID."""
    db = get_database()
    session = await db["sessions"].find_one({"session_id": session_id})
    if session and "user_profile" in session:
        return session["user_profile"]
    return {"error": "User profile not found"}

@tool
async def get_policy_metadata(policy_id: str) -> dict:
    """Returns metadata (premium, waiting period, copay, coverage, inclusions, exclusions) for a policy ID."""
    db = get_database()
    policy = await db["policies"].find_one({"policy_id": policy_id})
    if policy:
        policy["_id"] = str(policy["_id"])
        return policy
    return {"error": "Policy not found"}

# Agent Prompt
system_prompt = """You are AarogyaAid AI Insurance Advisor.
You are a highly empathetic, grounded, and explainable AI assistant.
You MUST NOT hallucinate. If information is missing from documents, explicitly state: "Not found in uploaded documents".
You MUST decline to provide medical advice, stating that you are an insurance advisor only.

When the user asks for a policy recommendation, you MUST provide exactly 3 sections in Markdown format:

A. Peer Comparison Table:
| Policy Name | Insurer | Premium (Rs/year) | Coverage Amount | Waiting Period | Key Benefit | Suitability Score |
|---|---|---|---|---|---|---|

B. Coverage Details Table:
| Inclusions | Exclusions | Sub-limits | Co-pay % | Claim type |
|---|---|---|---|---|

C. Why This Policy:
(150-250 words explaining why this policy is suitable. You MUST reference at least 3 fields from the user profile. Be empathetic and avoid jargon, or explain it if used.)

Use the `get_user_profile`, `get_policy_metadata`, and `retrieve_policy_chunks` tools to gather factual data before answering.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

tools = [retrieve_policy_chunks, get_user_profile, get_policy_metadata]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

async def process_chat(session_id: str, message: str, chat_history: list):
    response = await agent_executor.ainvoke({
        "input": f"Session ID: {session_id}. Query: {message}",
        "chat_history": chat_history
    })
    return response["output"]
