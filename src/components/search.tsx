import React, { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useLoadScript } from "@react-google-maps/api";
import { motion } from "framer-motion";

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

export default function SearchPage() {
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

      const request = {
        location: geocodeResult as google.maps.LatLng,
        radius: 100000,
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
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Places</h1>
          <p className="text-xl text-muted-foreground">
            Search for attractions and destinations worldwide
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where do you want to go?"
              className="w-full h-14 pl-12 pr-4 rounded-full text-lg"
            />
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Button
              type="submit"
              size="lg"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
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

        {error && <div className="text-center text-red-500 mb-8">{error}</div>}

        {places.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-12 text-center">
              Discover {location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48">
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      {place.openNow !== undefined && (
                        <div
                          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${place.openNow ? "bg-green-500" : "bg-red-500"} text-white`}
                        >
                          {place.openNow ? "Open Now" : "Closed"}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">{place.name}</h3>
                        {place.rating > 0 && (
                          <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-yellow-700 font-medium">
                              {place.rating}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {place.address}
                      </p>
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
                              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium"
                            >
                              {type.replace(/_/g, " ")}
                            </span>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
