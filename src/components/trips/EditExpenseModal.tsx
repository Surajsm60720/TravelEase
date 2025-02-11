import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (expense: {
    id: string;
    payee: string;
    description: string;
    amount: number;
    currency: string;
    expenseType: string;
    splitCount: number;
  }) => void;
  onDelete: (id: string) => void;
  expense: {
    id: string;
    payee: string;
    description: string;
    amount: number;
    currency: string;
    expense_type: string;
    split_count: number;
  };
}

const expenseTypes = [
  { value: "food", label: "Food" },
  { value: "accommodation", label: "Accommodation" },
  { value: "transport", label: "Transport" },
  { value: "activities", label: "Activities" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
];

export default function EditExpenseModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  expense,
}: EditExpenseModalProps) {
  const [payee, setPayee] = useState(expense.payee);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [currency, setCurrency] = useState(expense.currency);
  const [expenseType, setExpenseType] = useState(expense.expense_type);
  const [splitCount, setSplitCount] = useState(expense.split_count.toString());

  useEffect(() => {
    setPayee(expense.payee);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCurrency(expense.currency);
    setExpenseType(expense.expense_type);
    setSplitCount(expense.split_count.toString());
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: expense.id,
      payee,
      description,
      amount: parseFloat(amount),
      currency,
      expenseType,
      splitCount: parseInt(splitCount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payee">Payee</Label>
            <Input
              id="payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="Who paid?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was it for?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={expenseType} onValueChange={setExpenseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="splitCount">Split Between</Label>
            <Input
              id="splitCount"
              type="number"
              min="1"
              value={splitCount}
              onChange={(e) => setSplitCount(e.target.value)}
              placeholder="Number of people"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(expense.id)}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
