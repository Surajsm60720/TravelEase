import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer,
  Autocomplete,
  Marker,
  InfoWindow,
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

      for (let i = 0; i < path.length; i += Math.floor(path.length / 5)) {
        const point = path[i];

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

            for (const place of results) {
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

      setPlaces(foundPlaces);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

          <div className="flex flex-wrap gap-2 mb-4">
            {placeTypes.map(({ type, label, icon }) => (
              <Badge
                key={type}
                variant={selectedTypes.includes(type) ? "secondary" : "outline"}
                className={`cursor-pointer hover:bg-primary/20 transition-colors ${selectedTypes.includes(type) ? "bg-primary/30" : ""}`}
                onClick={() => togglePlaceType(type)}
              >
                {icon}
                <span className="ml-1">{label}</span>
              </Badge>
            ))}
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
                onClick={() => setSelectedPlace(place)}
              />
            ))}
            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.location}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="max-w-sm bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                    <img
                      src={selectedPlace.photos[0].getUrl()}
                      alt={selectedPlace.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">
                      {selectedPlace.name}
                    </h3>

                    {selectedPlace.rating && (
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="dark:text-gray-200">
                          {selectedPlace.rating} / 5
                        </span>
                      </div>
                    )}

                    {selectedPlace.formatted_address && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {selectedPlace.formatted_address}
                      </p>
                    )}

                    {selectedPlace.formatted_phone_number && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        {selectedPlace.formatted_phone_number}
                      </p>
                    )}

                    {selectedPlace.opening_hours && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <Clock className="h-4 w-4 inline mr-1" />
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
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Visit Website
                      </a>
                    )}

                    {selectedPlace.reviews &&
                      selectedPlace.reviews.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2 dark:text-gray-200">
                            Latest Review
                          </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center mb-1">
                              <Star className="h-3 w-3 text-yellow-400 mr-1" />
                              <span>{selectedPlace.reviews[0].rating} / 5</span>
                            </div>
                            <p className="text-xs italic">
                              "{selectedPlace.reviews[0].text}"
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </Card>

        {places.length > 0 && (
          <Card className="p-4">
            <h3 className="text-xl font-semibold mb-4">Places Found</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    setSelectedPlace(place);
                    if (mapRef.current) {
                      mapRef.current.panTo(place.location);
                      mapRef.current.setZoom(15);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{place.name}</h4>
                    {place.rating && (
                      <span className="text-yellow-400">{place.rating}★</span>
                    )}
                  </div>
                  {place.vicinity && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {place.vicinity}
                    </p>
                  )}
                </div>
              ))}
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
