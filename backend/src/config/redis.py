import json
import redis as redis_lib
from src.config.env import env

redis_cfg = env['redis']

# Create main cache client and subscription client
# Setting decode_responses=True automatically converts bytes to strings for us
redis = redis_lib.Redis(
    host=redis_cfg['host'],
    port=redis_cfg['port'],
    password=redis_cfg['password'],
    decode_responses=True
)

redis_sub = redis_lib.Redis(
    host=redis_cfg['host'],
    port=redis_cfg['port'],
    password=redis_cfg['password'],
    decode_responses=True
)

# Verify connection availability at server startup
try:
    redis.ping()
    print('✅ Redis main client connected')
except Exception as err:
    print(f'❌ Redis main client error: {str(err)}')

try:
    redis_sub.ping()
    print('✅ Redis sub client connected')
except Exception as err:
    print(f'❌ Redis sub client error: {str(err)}')

def set_cache(key, value, ttl_seconds=300):
    """
    Save data to Redis with an expiration time.
    """
    try:
        # setex (Set with Expiration) does exactly what 'EX' did in your Node code
        redis.setex(key, ttl_seconds, json.dumps(value))
    except Exception as err:
        print(f"Redis set cache error for key {key}: {str(err)}")

def get_cache(key):
    """
    Retrieve and parse data from Redis.
    """
    try:
        data = redis.get(key)
        return json.loads(data) if data else None
    except Exception as err:
        print(f"Redis get cache error for key {key}: {str(err)}")
        return None

def delete_cache(*keys):
    """
    Delete one or multiple keys from Redis.
    """
    try:
        if keys:
            redis.delete(*keys)
    except Exception as err:
        print(f"Redis delete cache error for keys [{', '.join(keys)}]: {str(err)}")