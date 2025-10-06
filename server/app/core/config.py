from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ai-jobs-backend"
    API_PREFIX: str = "/api"
    JWT_SECRET: str = "change-me"
    JWT_EXPIRES_MIN: int = 60 * 24 * 30  # 30 days
    DATABASE_URL: str   # <-- add this
    class Config:
        env_file = ".env"

settings = Settings()
