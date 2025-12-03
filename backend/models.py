from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    
    tasks = relationship("Task", back_populates="assigned_user")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, default="")
    status = Column(String, default="TODO") # TODO, IN_PROGRESS, DONE
    
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    assigned_user = relationship("User", back_populates="tasks")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    sender_id = Column(Integer, ForeignKey("users.id"))
    sender = relationship("User")