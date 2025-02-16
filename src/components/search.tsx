import React, { useState } from "react";
import { MapPin, Loader2, Ruler, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useLoadScript } from "@react-google-maps/api";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Place {
  id: string;
  name: string;
  description: string;
  rating: number;
  imageUrl: string;
  address: string;
  types: string[];
  openNow?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchRadius, setSearchRadius] = useState("5000"); // Default 5km in meters

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
        radius: parseInt(searchRadius),
        type: "tourist_attraction",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData: Place[] = results.map((place) => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || "",
            location: place.geometry?.location?.toJSON(),
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

  const handlePlaceClick = (place: Place) => {
    // Store both name and address for better accuracy
    const destination = place.address || place.name;
    sessionStorage.setItem("selectedDestination", destination);
    navigate("/directions");
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

        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
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
            </div>

            <div className="flex items-center gap-3 justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4" />
                <span>Within:</span>
              </div>
              <Select value={searchRadius} onValueChange={setSearchRadius}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) =>
                    ((i + 1) * 5000).toString(),
                  ).map((radius) => (
                    <SelectItem key={radius} value={radius}>
                      {parseInt(radius) / 1000}km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <Card className="group overflow-hidden h-full relative transition-all duration-500 hover:shadow-none bg-card before:absolute before:-inset-1.5 before:bg-gradient-to-r before:from-primary/0 before:via-primary/10 before:to-primary/0 dark:before:from-primary/0 dark:before:via-primary/20 dark:before:to-primary/0 before:rounded-xl before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 before:-z-10">
                    <div className="relative h-48 z-10">
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
                    <CardContent className="p-6 relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <button
                          onClick={() => handlePlaceClick(place)}
                          className="group/btn text-xl font-semibold text-left hover:text-primary flex items-center gap-2"
                        >
                          {place.name}
                          <Navigation className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
                        </button>
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
                              className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium"
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
