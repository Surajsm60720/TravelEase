import React, { useState, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useLoadScript } from "@react-google-maps/api";

interface Place {
  id: string;
  name: string;
  description: string;
  rating: number;
  imageUrl: string;
  address: string;
  types: string[];
  openNow?: boolean;
}

const Home = () => {
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const searchNearbyPlaces = async (location: string) => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      // First, get the location coordinates using the Geocoding service
      const geocoder = new google.maps.Geocoder();
      const geocodeResult = await new Promise((resolve, reject) => {
        geocoder.geocode({ address: location }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            resolve(results[0].geometry.location);
          } else {
            reject(new Error("Location not found"));
          }
        });
      });

      const service = new google.maps.places.PlacesService(
        document.createElement("div"),
      );

      // Then search for tourist attractions near that location
      const request = {
        location: geocodeResult as google.maps.LatLng,
        radius: 100000, // 100km radius
        type: "tourist_attraction",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData: Place[] = results.map((place) => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || "",
            description: place.vicinity || "",
            rating: place.rating || 0,
            imageUrl:
              place.photos?.[0]?.getUrl() ||
              `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80`,
            address: place.vicinity || "",
            types: place.types || [],
            openNow: place.opening_hours?.isOpen(),
          }));
          setPlaces(placesData);
        } else {
          setError("No tourist attractions found nearby");
          setPlaces([]);
        }
        setLoading(false);
      });
    } catch (err) {
      setError("Error finding location");
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      searchNearbyPlaces(location);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-black">
        <img
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80"
          alt="Hero background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-center">
            Discover Tourist Attractions Near You
          </h1>
          <form onSubmit={handleSearch} className="w-full max-w-xl relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter a location (e.g., 'Paris, France')..."
              className="w-full h-12 pl-12 pr-4 rounded-lg text-lg"
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Places Grid */}
      <div className="container mx-auto px-4 py-12">
        {error ? (
          <div className="text-center text-red-500 mb-8">{error}</div>
        ) : (
          places.length > 0 && (
            <h2 className="text-3xl font-bold text-white mb-8">
              Tourist Attractions in {location}
            </h2>
          )
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <Card
              key={place.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                {place.openNow !== undefined && (
                  <div
                    className={`absolute top-4 right-4 px-2 py-1 rounded-full text-sm font-medium ${place.openNow ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {place.openNow ? "Open Now" : "Closed"}
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {place.name}
                  </h3>
                  {place.rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-white">{place.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{place.address}</p>
                <div className="flex flex-wrap gap-2">
                  {place.types
                    .filter(
                      (type) =>
                        ![
                          "point_of_interest",
                          "establishment",
                          "tourist_attraction",
                        ].includes(type),
                    )
                    .slice(0, 3)
                    .map((type) => (
                      <span
                        key={type}
                        className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full"
                      >
                        {type.replace(/_/g, " ")}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
