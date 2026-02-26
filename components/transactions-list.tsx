import Image from "next/image";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import prisma from "@/lib/prisma";

type TransactionItem = {
  id: string;
  amount: string | null;
  mpesaReceiptNumber: string | null;
  phoneNumber: string | null;
  transactionDate: Date | null;
  resultDesc: string | null;
};

async function getLatestTransactions(): Promise<TransactionItem[]> {
  const txns = await prisma.callbackMetadata.findMany({
    take: 5,
    orderBy: { transactionDate: "desc" },
    select: {
      id: true,
      amount: true,
      mpesaReceiptNumber: true,
      phoneNumber: true,
      transactionDate: true,
      resultDesc: true,
    },
  });
  return txns;
}

const TransactionsList = async () => {
  const transactions = await getLatestTransactions();

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Latest Transactions</h1>
      <div className="flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent transactions found.</p>
        ) : (
          transactions.map((txn) => (
            <Card
              key={txn.id}
              className="flex-row items-center justify-between gap-4 p-4"
            >
              {/* Left — icon or placeholder */}
              <div className="w-12 h-12 rounded-sm relative overflow-hidden">
                <Image
                  src="/mpesa-logo.svg"
                  alt="M-PESA"
                  fill
                  className="object-contain bg-gray-100 p-1"
                />
              </div>

              {/* Middle — transaction info */}
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">
                  {txn.mpesaReceiptNumber || "No Receipt"}
                </CardTitle>
                <Badge variant="secondary">
                  {txn.phoneNumber || "Unknown"}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {txn.resultDesc || "Transaction"}
                </p>
              </CardContent>

              {/* Right — amount */}
              <CardFooter className="p-0 font-medium text-sm">
                Ksh {txn.amount || "0.00"}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
