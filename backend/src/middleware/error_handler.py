import traceback
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from src.config.env import env

class AppError(Exception):
    """Custom exception class for operational errors"""
    def __init__(self, message, status_code=500, errors=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.status = 'error' if 400 <= status_code < 500 else 'fail'
        self.errors = errors

def register_error_handlers(app):
    """Attach error handlers to the Flask app"""
    
    @app.errorhandler(AppError)
    def handle_app_error(err):
        response = {
            "success": False,
            "status": err.status,
            "message": err.message,
            "errors": err.errors
        }
        if env['server']['env'] == 'development':
            response['stack'] = traceback.format_exc()
            
        return jsonify(response), err.status_code

    @app.errorhandler(IntegrityError)
    def handle_db_integrity_error(err):
        """Handle PostgreSQL Unique/Foreign Key/Not Null violations"""
        error_info = str(err.orig)
        
        if 'UniqueViolation' in error_info or '23505' in error_info:
            message = "A record with this information already exists."
            status_code = 409
        elif 'NotNullViolation' in error_info or '23502' in error_info:
            message = "A required field is missing."
            status_code = 400
        elif 'ForeignKeyViolation' in error_info or '23503' in error_info:
            message = "Referenced record does not exist."
            status_code = 400
        else:
            message = "Database integrity error."
            status_code = 400

        response = {
            "success": False,
            "status": "error",
            "message": message
        }
        return jsonify(response), status_code

    @app.errorhandler(Exception)
    def handle_generic_error(err):
        """Fallback for unhandled errors"""
        print(f"💥 UNHANDLED ERROR: {err}")
        response = {
            "success": False,
            "status": "error",
            "message": "Something went wrong. Please try again later."
        }
        if env['server']['env'] == 'development':
            response['message'] = str(err)
            response['stack'] = traceback.format_exc()
            
        return jsonify(response), 500