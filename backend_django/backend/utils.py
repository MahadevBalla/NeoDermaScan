import requests, os
from math import radians, cos, sin, asin, sqrt

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def get_nearby_hospitals(lat, lon, radius=5000):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lon}",
        "radius": radius,
        "type": "hospital",
        "key": GOOGLE_API_KEY,
    }
    resp = requests.get(url, params=params).json()
    return resp.get("results", [])


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    return 2 * R * asin(sqrt(a))
