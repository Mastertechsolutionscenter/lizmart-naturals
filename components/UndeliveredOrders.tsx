// components/TodoList.tsx
"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import OrdersList, { OrderDTO } from "./OrdersList";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export default function TodoList() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const isoDate = date ? date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/admin/orders-list?date=${isoDate}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = (await res.json()) as OrderDTO[];
        setOrders(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Error fetching orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [date]);

  return (
    <div>
      <h1 className="text-lg font-medium mb-6">Undelivered Orders</h1>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
             {date ? (
    <>
      {format(date, "PPP")} <span className="text-sm text-gray-500">(Click To Tick a Date)</span>
    </>
  ) : (
    <span>(Click to Pick a Date)</span>
  )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <div className="mt-4">
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <OrdersList orders={orders} />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
