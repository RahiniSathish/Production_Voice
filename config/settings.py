"""
Application settings
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration"""
    
    # API Keys
    openai_api_key: str
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    deepgram_api_key: Optional[str] = None
    
    # Flight APIs
    aviationstack_api_key: Optional[str] = None
    flightapi_key: Optional[str] = None
    
    # Database
    database_url: str = "sqlite:///db/customers.db"
    
    # Application
    secret_key: str = "change-me-in-production"
    debug: bool = False
    log_level: str = "INFO"
    
    # Ports
    api_port: int = 8000
    frontend_port: int = 8506
    mcp_port: int = 8080
    
    class Config:
        env_file = ".env"
        case_sensitive = False

