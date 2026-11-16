from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from . import models
    Base.metadata.create_all(bind=engine)
    
    # Safely migrate existing SQLite database tables
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE videos ADD COLUMN game_title VARCHAR(100)"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE clips ADD COLUMN game_title VARCHAR(100)"))
            conn.commit()
        except Exception:
            pass
