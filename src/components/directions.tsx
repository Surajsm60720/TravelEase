import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  MapPin,
  Loader2,
  Coffee,
  Hotel,
  Utensils,
  Landmark,
  Star,
  Phone,
  Clock,
  Globe,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { useTheme } from "./theme-provider";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 20,
  lng: 0,
};

const placeTypes = [
  {
    type: "restaurant",
    label: "Restaurants",
    icon: <Utensils className="h-4 w-4" />,
  },
  { type: "hotel", label: "Hotels", icon: <Hotel className="h-4 w-4" /> },
  { type: "cafe", label: "Cafes", icon: <Coffee className="h-4 w-4" /> },
  {
    type: "tourist_attraction",
    label: "Attractions",
    icon: <Landmark className="h-4 w-4" />,
  },
];

interface Place {
  id: string;
  name: string;
  location: google.maps.LatLng;
  rating?: number;
  vicinity?: string;
  type: string;
  photos?: google.maps.places.PlacePhoto[];
  formatted_phone_number?: string;
  opening_hours?: google.maps.places.PlaceOpeningHours;
  website?: string;
  formatted_address?: string;
  reviews?: google.maps.places.PlaceReview[];
}

const DirectionsPage = () => {
  const { theme } = useTheme();
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000);

  const sourceRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Initialize destination from sessionStorage and trigger route calculation
  React.useEffect(() => {
    const storedDestination = sessionStorage.getItem("selectedDestination");
    if (storedDestination && destinationRef.current && isLoaded) {
      const input = destinationRef.current
        .getContainer()
        .querySelector("input");
      if (input) {
        input.value = storedDestination;
        // Create a geocoder instance
        const geocoder = new google.maps.Geocoder();
        // Geocode the stored destination
        geocoder.geocode({ address: storedDestination }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            // Set the place details
            destinationRef.current?.setPlace({
              formatted_address: results[0].formatted_address,
              geometry: results[0].geometry,
              name: storedDestination,
              place_id: results[0].place_id,
            });
          }
        });
      }
      sessionStorage.removeItem("selectedDestination");
    }
  }, [isLoaded]);

  const getPlaceDetails = useCallback(
    async (placeId: string, service: google.maps.places.PlacesService) => {
      return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: [
              "name",
              "rating",
              "formatted_phone_number",
              "opening_hours",
              "website",
              "formatted_address",
              "photos",
              "reviews",
            ],
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place);
            } else {
              reject(new Error("Failed to get place details"));
            }
          },
        );
      });
    },
    [],
  );

  const searchNearbyPlaces = useCallback(
    async (route: google.maps.DirectionsRoute) => {
      if (!mapRef.current) return;

      const service = new google.maps.places.PlacesService(mapRef.current);
      const path = route.overview_path;
      const foundPlaces: Place[] = [];
      const seenPlaceIds = new Set<string>();

      // Take points at intervals along the route
      const numPoints = 5;
      const interval = Math.max(1, Math.floor(path.length / numPoints));
      const searchPoints = [];

      for (let i = 0; i < path.length; i += interval) {
        searchPoints.push(path[i]);
      }
      // Always include the last point
      if (!searchPoints.includes(path[path.length - 1])) {
        searchPoints.push(path[path.length - 1]);
      }

      for (const point of searchPoints) {
        for (const type of selectedTypes) {
          const request = {
            location: point,
            radius: searchRadius,
            type: type as google.maps.places.PlaceType,
          };

          try {
            const results = await new Promise<google.maps.places.PlaceResult[]>(
              (resolve, reject) => {
                service.nearbySearch(request, (results, status) => {
                  if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    results
                  ) {
                    resolve(results);
                  } else {
                    reject(new Error("Places search failed"));
                  }
                });
              },
            );

            // Filter for high-rated places and remove duplicates
            const highRatedPlaces = results
              .filter((place) => {
                if (!place.place_id || seenPlaceIds.has(place.place_id))
                  return false;
                seenPlaceIds.add(place.place_id);
                return place.rating && place.rating >= 4.0;
              })
              .sort((a, b) => (b.rating || 0) - (a.rating || 0));

            for (const place of highRatedPlaces) {
              if (place.geometry?.location && place.place_id) {
                try {
                  const details = await getPlaceDetails(
                    place.place_id,
                    service,
                  );
                  foundPlaces.push({
                    id: place.place_id,
                    name: place.name || "Unknown Place",
                    location: place.geometry.location,
                    rating: details.rating,
                    vicinity: place.vicinity,
                    type: type,
                    photos: details.photos,
                    formatted_phone_number: details.formatted_phone_number,
                    opening_hours: details.opening_hours,
                    website: details.website,
                    formatted_address: details.formatted_address,
                    reviews: details.reviews,
                  });
                } catch (error) {
                  console.error(
                    `Error getting details for ${place.name}:`,
                    error,
                  );
                }
              }
            }
          } catch (error) {
            console.error(`Error searching for ${type}:`, error);
          }
        }
      }

      // Sort all places by rating and take top results
      const sortedPlaces = foundPlaces
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 15); // Limit total places to 15

      setPlaces(sortedPlaces);
    },
    [selectedTypes, searchRadius, getPlaceDetails],
  );

  const calculateRoute = useCallback(async () => {
    if (!sourceRef.current || !destinationRef.current) return;

    const sourcePlace = sourceRef.current.getPlace();
    const destinationPlace = destinationRef.current.getPlace();

    if (
      !sourcePlace?.formatted_address ||
      !destinationPlace?.formatted_address
    ) {
      setError("Please select locations from the suggestions");
      return;
    }

    setLoading(true);
    setError("");
    setPlaces([]);
    setSelectedPlace(null);

    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: sourcePlace.formatted_address,
        destination: destinationPlace.formatted_address,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
      if (selectedTypes.length > 0) {
        await searchNearbyPlaces(result.routes[0]);
      }
      setError("");
    } catch (error) {
      setError("Could not calculate route. Please try again.");
      console.error("Error calculating route:", error);
    } finally {
      setLoading(false);
    }
  }, [searchNearbyPlaces, selectedTypes]);

  const togglePlaceType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const mapThemeStyles =
    theme === "dark"
      ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
            <div className="relative">
              <Autocomplete
                onLoad={(auto) => (sourceRef.current = auto)}
                onPlaceChanged={calculateRoute}
              >
                <div className="relative">
                  <Input
                    placeholder="Enter source location"
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                </div>
              </Autocomplete>
            </div>
            <div className="relative">
              <Autocomplete
                onLoad={(auto) => (destinationRef.current = auto)}
                onPlaceChanged={calculateRoute}
              >
                <div className="relative">
                  <Input placeholder="Enter destination" className="pl-10" />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                </div>
              </Autocomplete>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex flex-wrap gap-2">
              {placeTypes.map(({ type, label, icon }) => (
                <Badge
                  key={type}
                  variant={
                    selectedTypes.includes(type) ? "secondary" : "outline"
                  }
                  className={`cursor-pointer hover:bg-primary/20 transition-colors ${selectedTypes.includes(type) ? "bg-primary/30" : ""}`}
                  onClick={() => togglePlaceType(type)}
                >
                  {icon}
                  <span className="ml-1">{label}</span>
                </Badge>
              ))}
            </div>

            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                <span className="font-medium">Map Legend:</span>
                {selectedTypes.map((type) => {
                  const placeType = placeTypes.find((t) => t.type === type);
                  return (
                    <div key={type} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            type === "restaurant"
                              ? "#ff0000"
                              : type === "hotel"
                                ? "#0000ff"
                                : type === "cafe"
                                  ? "#ffff00"
                                  : type === "tourist_attraction"
                                    ? "#00ff00"
                                    : "#800080",
                        }}
                      />
                      <span>{placeType?.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="text-destructive mb-4 text-sm">{error}</div>
          )}

          <Button
            onClick={calculateRoute}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Get Directions"
            )}
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={2}
            options={{
              styles: mapThemeStyles,
              mapTypeControl: true,
              streetViewControl: true,
              zoomControl: true,
              fullscreenControl: true,
            }}
            onLoad={(map) => (mapRef.current = map)}
          >
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: theme === "dark" ? "#4F46E5" : "#2563EB",
                    strokeWeight: 5,
                  },
                }}
              />
            )}
            {places.map((place) => (
              <Marker
                key={place.id}
                position={place.location}
                title={place.name}
                icon={{
                  url: `https://maps.google.com/mapfiles/ms/icons/${getMarkerColor(place.type)}-dot.png`,
                }}
                onClick={() => {
                  setSelectedPlace(place);
                  if (mapRef.current) {
                    mapRef.current.panTo(place.location);
                    mapRef.current.setZoom(15);
                  }
                }}
              />
            ))}
          </GoogleMap>
        </Card>

        {selectedPlace && selectedTypes.length > 0 && (
          <Card className="p-6 mt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                <div className="w-full md:w-1/3">
                  <img
                    src={selectedPlace.photos[0].getUrl()}
                    alt={selectedPlace.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4">
                  {selectedPlace.name}
                </h3>
                <div className="grid gap-4">
                  {selectedPlace.rating && (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-2" />
                      <span className="font-medium">
                        {selectedPlace.rating} / 5
                      </span>
                    </div>
                  )}
                  {selectedPlace.formatted_address && (
                    <p className="flex items-center text-muted-foreground">
                      <MapPin className="h-5 w-5 mr-2" />
                      {selectedPlace.formatted_address}
                    </p>
                  )}
                  {selectedPlace.formatted_phone_number && (
                    <p className="flex items-center text-muted-foreground">
                      <Phone className="h-5 w-5 mr-2" />
                      {selectedPlace.formatted_phone_number}
                    </p>
                  )}
                  {selectedPlace.opening_hours && (
                    <p className="flex items-center text-muted-foreground">
                      <Clock className="h-5 w-5 mr-2" />
                      {selectedPlace.opening_hours.isOpen()
                        ? "Open now"
                        : "Closed"}
                    </p>
                  )}
                  {selectedPlace.website && (
                    <a
                      href={selectedPlace.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      Visit Website
                    </a>
                  )}
                </div>
                {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Latest Review</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">
                          {selectedPlace.reviews[0].rating} / 5
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{selectedPlace.reviews[0].text}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const getMarkerColor = (type: string): string => {
  switch (type) {
    case "restaurant":
      return "red";
    case "hotel":
      return "blue";
    case "cafe":
      return "yellow";
    case "tourist_attraction":
      return "green";
    default:
      return "purple";
  }
};

export default DirectionsPage;
