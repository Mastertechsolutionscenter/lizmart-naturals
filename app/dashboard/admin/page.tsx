
import AppBarChart from "@/components/AppBarChart";
import AppPieChart from "@/components/AppPieChart";
import CartVsOrdersChart from "@/components/CartVsOrder";
import TodoList from "@/components/UndeliveredOrders";

import { getOrderChartData } from "@/actions/getOrderChartData";
import { getStoreKpis } from '@/actions/getStoreKpis';
import { getCollectionSales } from "@/app/api/admin/metrics/getCollectionSales";
import DashboardViewClient from '@/components/DashboardViewClient';
import TransactionsList from "@/components/transactions-list";
import { currentRole, currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


type Props = {
  searchParams: Promise<{ period?: string }>
};


export default async function DashboardPage({ searchParams }: Props) {
   const user = await currentUser();
   const role = await currentRole();
  
    
    if (!user) {
      redirect("dashboard/login"); 
    }
  
    
    if (role !== "ADMIN") {
      redirect("/"); 
    }
  const orderChartData = getOrderChartData();
  const collectionSalesData = getCollectionSales();

  const params = await searchParams;
  const period = (params?.period as 'day' | 'month' | 'year') || 'month';
  const kpiRaw = await getStoreKpis(period);

  // adapt to client payload shape (convert dates to ISO for safe serialization)
  const kpiPayload = {
    period: kpiRaw.period,
    totalProducts: kpiRaw.totalProducts,
    productsInPeriod: kpiRaw.productsInPeriod,
    productsPrevPeriod: kpiRaw.productsPrevPeriod,
    productsChange: Number(kpiRaw.productsChange),
    ordersInPeriod: kpiRaw.ordersInPeriod,
    ordersPrevPeriod: kpiRaw.ordersPrevPeriod,
    ordersChange: Number(kpiRaw.ordersChange),
    revenue: Number(kpiRaw.revenue),
    revenuePrev: Number(kpiRaw.revenuePrev),
    revenueChange: Number(kpiRaw.revenueChange),
    start: kpiRaw.start.toISOString(),
    end: kpiRaw.end.toISOString(),
  };

  return (
     <section className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500">Summary of key metrics and recent activity</p>
      </header>

      {/* Top: Full-width KPI summary */}
      <article
        className="bg-primary-foreground p-6 rounded-2xl shadow-sm w-full mb-6 flex flex-col gap-4"
        aria-label="KPI summary - full width"
      >
        <h3 className="text-sm font-medium text-gray-700">Performance</h3>
        <div className="flex-1">
          <DashboardViewClient kpi={kpiPayload} userName={user?.name || "Admin"} />
        </div>
      </article>

      {/* Grid: other widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
        {/* Orders bar chart (large) */}
        <article
          className="bg-primary-foreground p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[220px] overflow-hidden col-span-1 lg:col-span-1 2xl:col-span-2"
          aria-label="Orders chart"
        >
          <h4 className="text-sm font-medium text-gray-700">Orders (last 30 days)</h4>
          <div className="flex-1">
            <AppBarChart dataPromise={orderChartData} />
          </div>
        </article>

        {/* Latest Transactions */}
        <article className="bg-primary-foreground p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[160px]">
          <h4 className="text-sm font-medium text-gray-700">View Transactions</h4>
          <div className="flex-1 overflow-auto">
            <TransactionsList />
          </div>
        </article>

        {/* Sales distribution */}
        <article className="bg-primary-foreground p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[160px]">
          <h4 className="text-sm font-medium text-gray-700">Sales Distribution</h4>
          <div className="flex-1">
           <AppPieChart dataPromise={collectionSalesData} />
          </div>
        </article>

        {/* To-do */}
        <article className="bg-primary-foreground p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[160px]">
          <h4 className="text-sm font-medium text-gray-700">To-do</h4>
          <div className="flex-1">
            <TodoList />
          </div>
        </article>

        {/* Popular Products */}
        {/* <article className="bg-primary-foreground p-6 rounded-2xl shadow-sm flex flex-col gap-4 min-h-[160px]">
          <h4 className="text-sm font-medium text-gray-700">Trending Products</h4>
          <div className="flex-1 overflow-auto">
            <CardList title="Popular Products" />
          </div>
        </article> */}

        {/* Large area chart spanning two columns on 2xl */}
        <article
          className="bg-primary-foreground p-6 rounded-2xl shadow-sm col-span-1 lg:col-span-2 2xl:col-span-4 flex flex-col gap-4 min-h-[260px] overflow-hidden"
          aria-label="Revenue area chart"
        >
          <h4 className="text-sm font-medium text-gray-700">Cart Vs Orders</h4>
          <div className="flex-1">
            <CartVsOrdersChart />
          </div>
        </article>
      </div>
    </section>
  );
};

