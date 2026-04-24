import fitz  # PyMuPDF
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os

FAISS_PATH = os.getenv("CHROMADB_PATH", "./faiss_data")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_vector_db():
    if os.path.exists(FAISS_PATH) and os.path.exists(os.path.join(FAISS_PATH, "index.faiss")):
        return FAISS.load_local(FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    return None

def parse_and_store_pdf(file_path: str, policy_id: str, metadata: dict):
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    
    for chunk in chunks:
        chunk.metadata.update({
            "policy_id": policy_id,
            "policy_name": metadata.get("name", "Unknown Policy"),
            "insurer": metadata.get("insurer", "Unknown Insurer")
        })
        
    vector_db = get_vector_db()
    if vector_db is None:
        vector_db = FAISS.from_documents(chunks, embeddings)
    else:
        vector_db.add_documents(chunks)
        
    vector_db.save_local(FAISS_PATH)
    return len(chunks)

def delete_policy_from_vector_db(policy_id: str):
    vector_db = get_vector_db()
    if vector_db is None:
        return False
        
    ids_to_delete = []
    for doc_id, doc in vector_db.docstore._dict.items():
        if doc.metadata.get("policy_id") == policy_id:
            ids_to_delete.append(doc_id)
            
    if ids_to_delete:
        vector_db.delete(ids_to_delete)
        vector_db.save_local(FAISS_PATH)
        return True
    return False
