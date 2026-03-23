from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from smart_entry import parse_smart_entry

app = FastAPI(title="Smart Business Finance Manager AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SmartEntryRequest(BaseModel):
    text: str

@app.post("/smart-entry")
def smart_entry(req: SmartEntryRequest):
    return parse_smart_entry(req.text)
