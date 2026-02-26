// components/DashboardViewClient.tsx
'use client';

import React from 'react';
import { DollarSign, Package, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PeriodKey = 'day' | 'month' | 'year';

type KpiPayload = {
  period: PeriodKey;
  totalProducts: number;
  productsInPeriod: number;
  productsPrevPeriod: number;
  productsChange: number;
  ordersInPeriod: number;
  ordersPrevPeriod: number;
  ordersChange: number;
  revenue: number;
  revenuePrev: number;
  revenueChange: number;
  // additional metadata if needed
  start: string; // ISO
  end: string; // ISO
};

function formatCurrencyKES(value: number) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(value);
  } catch {
    return `KSh ${value.toFixed(2)}`;
  }
}

function formatInteger(v: number) {
  return v.toLocaleString();
}

function StatCard({
  title,
  displayValue,
  change,
  changePeriod,
  icon,
}: {
  title: string;
  displayValue: string;
  change: number;
  changePeriod: string;
  icon: 'revenue' | 'orders' | 'products';
}) {
  const isPositive = change >= 0;
  const Arrow = isPositive ? ArrowUp : ArrowDown;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';

  const Icon =
    icon === 'revenue' ? (
      <DollarSign className="w-5 h-5 text-teal-600" />
    ) : icon === 'orders' ? (
      <ShoppingCart className="w-5 h-5 text-amber-600" />
    ) : (
      <Package className="w-5 h-5 text-sky-600" />
    );

  return (
    <article className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">{Icon}</div>
          <div className="text-sm font-medium text-gray-600">{title}</div>
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold text-gray-900 truncate">{displayValue}</h3>

      <div className="mt-3 flex items-center text-sm">
        <span className={`inline-flex items-center gap-1 ${changeColor} font-semibold`}>
          <Arrow className="w-4 h-4" />
          {Math.abs(change).toFixed(2)}%
        </span>
        <span className="ml-2 text-gray-500">{changePeriod}</span>
      </div>
    </article>
  );
}

export default function DashboardViewClient({ kpi, userName }: { kpi: KpiPayload; userName?: string }) {
  const router = useRouter();
  const period = kpi.period;

  const onChangePeriod = (p: PeriodKey) => {
    // navigate to same page with ?period=p - server page will re-run and pass new data
    router.push(`?period=${p}`);
  };

  const periodLabel = React.useMemo(() => {
    const now = new Date();
    if (period === 'day') return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (period === 'month') return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    return now.getFullYear().toString();
  }, [period]);

  const cards = [
    {
      title: 'Total Revenue',
      displayValue: formatCurrencyKES(kpi.revenue),
      change: kpi.revenueChange,
      changePeriod: `vs. prior ${period}`,
      icon: 'revenue' as const,
    },
    {
      title: 'Total Orders',
      displayValue: formatInteger(kpi.ordersInPeriod),
      change: kpi.ordersChange,
      changePeriod: `vs. prior ${period}`,
      icon: 'orders' as const,
    },
    {
      title: 'Total Products',
      displayValue: formatInteger(kpi.totalProducts),
      change: kpi.productsChange,
      changePeriod: `new in ${period}`,
      icon: 'products' as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Good {getGreeting()}, {userName ?? 'User'}!</h1>
          <p className="mt-1 text-sm text-gray-600">Here's what's happening with your store — <span className="font-medium text-gray-800">{periodLabel}</span>.</p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl value={period} onChange={onChangePeriod} />
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </section>
    </div>
  );
}

/* small helpers */
function SegmentedControl({ value, onChange }: { value: PeriodKey; onChange: (v: PeriodKey) => void }) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1 text-sm" role="tablist" aria-label="Select period">
      <button role="tab" aria-selected={value === 'day'} onClick={() => onChange('day')} className={`px-3 py-1 rounded-full transition ${value === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>Day</button>
      <button role="tab" aria-selected={value === 'month'} onClick={() => onChange('month')} className={`px-3 py-1 rounded-full transition ${value === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>Month</button>
      <button role="tab" aria-selected={value === 'year'} onClick={() => onChange('year')} className={`px-3 py-1 rounded-full transition ${value === 'year' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>Year</button>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

