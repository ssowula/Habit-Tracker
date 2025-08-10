from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(20), unique=True, index=True)
    password = Column(String)

    habits = relationship("Habit", back_populates="owner")

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(30), index=True)
    frequency = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="habits")
    completions = relationship("HabitCompletion", back_populates="habit")

class HabitCompletion(Base):
    __tablename__ = "habit_completions"
    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    completion_date = Column(Date, default=date.today)

    habit = relationship("Habit", back_populates="completions")