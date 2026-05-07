from sqlalchemy import Column,Integer,String, DateTime
from sqlalchemy.sql import func
from database import Base

class Entry(Base):
    __tablename__="entries"
    id=Column(Integer,primary_key=True, index=True)
    activity=Column(String,nullable=False)
    category=Column(String,nullable=False)
    duration=Column(Integer,nullable=False)
    created_at= Column(DateTime, server_default=func.now())




