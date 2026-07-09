import requests

url = "http://127.0.0.1:5000/api/reports"
payload = {
    "report_type": "oil_spill",
    "description": "Large slick near the harbor",
    "lat": 28.5,
    "lng": -80.5
}

# Send the data to your Flask backend
print("Sending test report...")
response = requests.post(url, json=payload)

print(f"Status Code: {response.status_code}")
print(f"Server Reply: {response.json()}")