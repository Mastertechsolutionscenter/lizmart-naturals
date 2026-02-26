"use client";

import { use } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

// 🧩 Define a minimal chart config (required by ChartContainer)
const chartConfig: ChartConfig = {
  sold: { label: "Sold" },
  collection1: { label: "Collection 1", color: "var(--chart-1)" },
  collection2: { label: "Collection 2", color: "var(--chart-2)" },
  collection3: { label: "Collection 3", color: "var(--chart-3)" },
};

export default function AppPieChart({
  dataPromise,
}: {
  dataPromise: Promise<{ title: string; sold: number }[]>;
}) {
  const data = use(dataPromise);
  const totalSold = data.reduce((acc, curr) => acc + curr.sold, 0);

  return (
    <div className="w-full">
      {/* ✅ Pass config prop here */}
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data.map((d, i) => ({
              name: d.title,
              sold: d.sold,
              fill: `var(--chart-${(i % 5) + 1})`,
            }))}
            dataKey="sold"
            nameKey="name"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalSold.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Sold
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="mt-4 flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month{" "}
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total sold per collection
        </div>
      </div>
    </div>
  );
}
