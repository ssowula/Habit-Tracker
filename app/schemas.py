from pydantic import BaseModel
from datetime import datetime
from typing import List

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    habits: List["Habit"] = []

    class Config:
        from_attributes = True

class HabitBase(BaseModel):
    name: str
    frequency: str

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

class HabitCompletionCreate(BaseModel):
    habit_id: int