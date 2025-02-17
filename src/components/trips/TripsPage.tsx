import { useState, useEffect } from "react";
import { Plus, Pencil, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import AddTripModal from "./AddTripModal";
import AddExpenseModal from "./AddExpenseModal";
import EditExpenseModal from "./EditExpenseModal";
import DeleteTripDialog from "./DeleteTripDialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

interface Trip {
  id: string;
  title: string;
  start_location: string;
  destination: string;
  created_at: string;
}

interface Expense {
  id: string;
  payee: string;
  description: string;
  amount: number;
  currency: string;
  expense_type: string;
  split_count: number;
  created_at: string;
}

interface TripWithExpenses extends Trip {
  expenses: Expense[];
}

export default function TripsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [trips, setTrips] = useState<TripWithExpenses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (tripsError) {
        console.error("Error loading trips:", tripsError);
        setError("Failed to load trips");
        return;
      }

      const tripsWithExpenses = await Promise.all(
        (tripsData || []).map(async (trip) => {
          const { data: expenses, error: expensesError } = await supabase
            .from("expenses")
            .select("*")
            .eq("trip_id", trip.id)
            .order("created_at", { ascending: false });

          if (expensesError) {
            console.error("Error loading expenses:", expensesError);
            return { ...trip, expenses: [] };
          }

          return { ...trip, expenses: expenses || [] };
        }),
      );

      setTrips(tripsWithExpenses);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrip = async (
    title: string,
    startLocation: string,
    destination: string,
  ) => {
    try {
      const { error } = await supabase.from("trips").insert([
        {
          user_id: user?.id,
          title,
          start_location: startLocation,
          destination,
        },
      ]);

      if (error) throw error;
      await loadTrips();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding trip:", error);
      setError("Failed to add trip");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      // First delete all expenses associated with the trip
      const { error: expensesError } = await supabase
        .from("expenses")
        .delete()
        .eq("trip_id", tripId);

      if (expensesError) throw expensesError;

      // Then delete the trip itself
      const { error: tripError } = await supabase
        .from("trips")
        .delete()
        .eq("id", tripId);

      if (tripError) throw tripError;

      await loadTrips();
      setTripToDelete(null);
    } catch (error) {
      console.error("Error deleting trip:", error);
      setError("Failed to delete trip");
    }
  };

  const handleAddExpense = async (expense: {
    payee: string;
    description: string;
    amount: number;
    currency: string;
    expenseType: string;
    splitCount: number;
  }) => {
    if (!selectedTripId) return;

    try {
      const { error } = await supabase.from("expenses").insert([
        {
          trip_id: selectedTripId,
          payee: expense.payee,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          expense_type: expense.expenseType,
          split_count: expense.splitCount,
        },
      ]);

      if (error) throw error;
      await loadTrips();
      setIsAddExpenseModalOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense");
    }
  };

  const handleEditExpense = async (expense: {
    id: string;
    payee: string;
    description: string;
    amount: number;
    currency: string;
    expenseType: string;
    splitCount: number;
  }) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          payee: expense.payee,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          expense_type: expense.expenseType,
          split_count: expense.splitCount,
        })
        .eq("id", expense.id);

      if (error) throw error;
      await loadTrips();
      setIsEditExpenseModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error updating expense:", error);
      setError("Failed to update expense");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
      await loadTrips();
      setIsEditExpenseModalOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error deleting expense:", error);
      setError("Failed to delete expense");
    }
  };

  const calculateTotalExpenses = (expenses: Expense[]) => {
    const totals = expenses.reduce(
      (acc, expense) => {
        acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(totals)
      .map(([currency, amount]) => `${currency} ${amount.toFixed(2)}`)
      .join(" + ");
  };

  const calculateSplitAmount = (expense: Expense) => {
    return `${expense.currency} ${(expense.amount / expense.split_count).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Trip
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      {trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">
              You haven't created any trips yet
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold">{trip.title}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setTripToDelete(trip)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">From:</span>{" "}
                    {trip.start_location}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">To:</span>{" "}
                    {trip.destination}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setIsAddExpenseModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                  <div className="text-sm font-medium">
                    Total: {calculateTotalExpenses(trip.expenses) || "0"}
                  </div>
                </div>

                {trip.expenses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-2">Expenses</h4>
                    {trip.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-2 bg-muted rounded-lg text-sm group relative"
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {expense.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Paid by {expense.payee}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {expense.currency} {expense.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {calculateSplitAmount(expense)} per person
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">
                              {expense.expense_type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setIsEditExpenseModalOpen(true);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddTripModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTrip}
      />

      <AddExpenseModal
        open={isAddExpenseModalOpen}
        onClose={() => {
          setIsAddExpenseModalOpen(false);
          setSelectedTripId(null);
        }}
        onSubmit={handleAddExpense}
      />

      {selectedExpense && (
        <EditExpenseModal
          open={isEditExpenseModalOpen}
          onClose={() => {
            setIsEditExpenseModalOpen(false);
            setSelectedExpense(null);
          }}
          onSubmit={handleEditExpense}
          onDelete={handleDeleteExpense}
          expense={selectedExpense}
        />
      )}

      {tripToDelete && (
        <DeleteTripDialog
          open={!!tripToDelete}
          onClose={() => setTripToDelete(null)}
          onConfirm={() => handleDeleteTrip(tripToDelete.id)}
          tripTitle={tripToDelete.title}
        />
      )}
    </div>
  );
}
