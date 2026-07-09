from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

# Initialize the global database instance
# SQLAlchemy automatically manages the connection pool (similar to Node's 'Pool')
db = SQLAlchemy()

def test_connection():
    """
    Verify connection availability at server startup.
    This replaces your testConnection() from the Node.js setup.
    """
    try:
        # We use 'text' to execute raw SQL safely
        result = db.session.execute(text('SELECT NOW()')).fetchone()
        print(f"📡 Database connected successfully! Server time: {result[0]}")
    except Exception as err:
        print(f"❌ Database connection failure: {str(err)}")
        raise err