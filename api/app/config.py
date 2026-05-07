"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All runtime configuration for the Propagate API.

    Values are read from environment variables or an `.env` file in the
    ``api/`` directory.  Every attribute has a default so the app can start
    in development without a fully populated .env.
    """

    database_url: str = "postgresql+psycopg://propogate:propogate@localhost:5432/propogate_dev"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
