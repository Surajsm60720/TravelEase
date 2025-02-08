import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { CalendarDays, MapPin, Sun, Cloud, ThermometerSun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Activity {
  name: string;
  type: string;
}

interface TripCardProps {
  destination?: string;
  startDate?: string;
  endDate?: string;
  activities?: Activity[];
  temperature?: number;
  weatherCondition?: "sunny" | "cloudy" | "rainy";
  imageUrl?: string;
}

const TripCard = ({
  destination = "Paris, France",
  startDate = "2024-06-15",
  endDate = "2024-06-22",
  activities = [
    { name: "Eiffel Tower Visit", type: "sightseeing" },
    { name: "Louvre Museum", type: "culture" },
    { name: "Seine River Cruise", type: "leisure" },
  ],
  temperature = 24,
  weatherCondition = "sunny",
  imageUrl = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
}: TripCardProps) => {
  const WeatherIcon = weatherCondition === "sunny" ? Sun : Cloud;

  return (
    <Card className="w-[360px] bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <img
            src={imageUrl}
            alt={destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-white/90 text-black hover:bg-white/75">
                    <WeatherIcon className="h-4 w-4 mr-1" />
                    <ThermometerSun className="h-4 w-4 mr-1" />
                    {temperature}°C
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current weather</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              {destination}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <CalendarDays className="h-4 w-4" />
              {new Date(startDate).toLocaleDateString()} -{" "}
              {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {activities.map((activity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {activity.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: "60%" }}
            title="Planning progress"
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default TripCard;
