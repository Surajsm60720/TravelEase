import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AddTripModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, startLocation: string, destination: string) => void;
}

export default function AddTripModal({
  open,
  onClose,
  onSubmit,
}: AddTripModalProps) {
  const [title, setTitle] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, startLocation, destination);
    setTitle("");
    setStartLocation("");
    setDestination("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Vacation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startLocation">Start Location</Label>
            <Input
              id="startLocation"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="New York, NY"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Los Angeles, CA"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Trip</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
