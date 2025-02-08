import React from "react";
import TripCard from "./TripCard";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  activities: Array<{ name: string; type: string }>;
  temperature: number;
  weatherCondition: "sunny" | "cloudy" | "rainy";
  imageUrl: string;
}

interface TripGridProps {
  trips?: Trip[];
}

const TripGrid = ({
  trips = [
    {
      id: "1",
      destination: "Paris, France",
      startDate: "2024-06-15",
      endDate: "2024-06-22",
      activities: [
        { name: "Eiffel Tower Visit", type: "sightseeing" },
        { name: "Louvre Museum", type: "culture" },
      ],
      temperature: 24,
      weatherCondition: "sunny",
      imageUrl:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    },
    {
      id: "2",
      destination: "Tokyo, Japan",
      startDate: "2024-07-10",
      endDate: "2024-07-20",
      activities: [
        { name: "Shibuya Crossing", type: "sightseeing" },
        { name: "Sushi Workshop", type: "food" },
      ],
      temperature: 28,
      weatherCondition: "cloudy",
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    },
    {
      id: "3",
      destination: "New York, USA",
      startDate: "2024-08-05",
      endDate: "2024-08-12",
      activities: [
        { name: "Central Park", type: "leisure" },
        { name: "Broadway Show", type: "entertainment" },
      ],
      temperature: 26,
      weatherCondition: "sunny",
      imageUrl:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    },
  ],
}: TripGridProps) => {
  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
            activities={trip.activities}
            temperature={trip.temperature}
            weatherCondition={trip.weatherCondition}
            imageUrl={trip.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default TripGrid;
