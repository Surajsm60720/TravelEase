import React from "react";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

interface Trip {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface CalendarViewProps {
  trips?: Trip[];
  onTripMove?: (tripId: string, newStartDate: Date, newEndDate: Date) => void;
}

const CalendarView = ({
  trips = [
    {
      id: "1",
      title: "Paris Trip",
      startDate: new Date(2024, 5, 15),
      endDate: new Date(2024, 5, 22),
      color: "bg-blue-200",
    },
    {
      id: "2",
      title: "Tokyo Adventure",
      startDate: new Date(2024, 6, 1),
      endDate: new Date(2024, 6, 10),
      color: "bg-green-200",
    },
    {
      id: "3",
      title: "New York City",
      startDate: new Date(2024, 7, 5),
      endDate: new Date(2024, 7, 12),
      color: "bg-purple-200",
    },
  ],
  onTripMove = () => {},
}: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );

  return (
    <Card className="p-6 bg-white h-[600px] overflow-y-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Trip Calendar</h2>
          <div className="flex space-x-2">
            {trips.map((trip) => (
              <Badge key={trip.id} className={`${trip.color} text-gray-700`}>
                {trip.title}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />

          {/* Trip blocks overlay */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className={`absolute ${trip.color} p-2 rounded-md shadow-sm 
                  flex items-center justify-between cursor-move pointer-events-auto
                  hover:shadow-md transition-shadow`}
                style={{
                  top: "100px", // This would be calculated based on the date
                  left: "50px", // This would be calculated based on the date
                  width: "200px", // This would be calculated based on duration
                }}
              >
                <span className="text-sm font-medium">{trip.title}</span>
                <DragHandleDots2Icon className="h-4 w-4 text-gray-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarView;
