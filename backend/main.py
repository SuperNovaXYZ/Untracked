from fastapi import FastAPI,Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
import models 
import anthropic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Entry(BaseModel):
    activity: str
    category: str
    duration: int


@app.get("/")
def read_root(): 
    return {"message" : "Untracked API is running."}

@app.get("/entries")
def get_entries(db: Session= Depends(get_db)):
    entries=db.query(models.Entry).all()
    return entries

@app.post("/entries")
def create_entry(entry: Entry, db:Session=Depends(get_db)):
    db_entry= models.Entry(
        activity=entry.activity,
        category=entry.category,
        duration=entry.duration
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/summaries")
def get_summary(db:Session=Depends(get_db)):
    db.query(models.Entry).all()
    client=anthropic.Anthropic()
    client.messages.build()

    return insight



    