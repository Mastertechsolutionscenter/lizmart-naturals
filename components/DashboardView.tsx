'use client';

import React, { useMemo, useState } from 'react';
import { DollarSign, Package, ShoppingCart, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * DATA SCHEMA & DUMMY STORE
 */

type StoreKpi = {
  title: string;
  icon_name: string;
  current_value: number;
  change_percentage: number; // positive -> up, negative -> down
  change_period: string;
};

const DATA_STORE = {
  user_name: 'Noah',
  // values are illustrative. Replace with real data sources as needed.
  periods: {
    day: {
      // current day (today)
      revenue: 125430.5,
      revenueChange: 3.2,
      orders: 54,
      ordersChange: -1.5,
      products: 423,
      productsChange: 0.5,
    },
    month: {
      // current month (this month)
      revenue: 10845329.0,
      revenueChange: 17.8,
      orders: 6238,
      ordersChange: 1.63,
      products: 1832,
      productsChange: 4.1,
    },
    year: {
      // current year (this year)
      revenue: 98234567.25,
      revenueChange: 12.4,
      orders: 74231,
      ordersChange: 6.2,
      products: 12410,
      productsChange: 8.9,
    },
  },
};

/**
 * Helpers
 */

const formatCurrencyKES = (value: number) => {
  // KES formatting — we use en-KE locale where available
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(value);
  } catch (e) {
    // fallback
    return `KSh ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

const formatInteger = (v: number) => v.toLocaleString();

/**
 * Small presentational StatCard component
 */
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

/**
 * DashboardView component
 */
export default function DashboardView() {
  // period: 'day' | 'month' | 'year'
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');

  const kpiData = useMemo(() => {
    const p = DATA_STORE.periods[period];

    return [
      {
        title: 'Total Revenue',
        icon_name: 'DollarSignIcon',
        current_value: p.revenue,
        change_percentage: p.revenueChange,
        change_period: 'vs. prior ' + (period === 'day' ? 'day' : period === 'month' ? 'month' : 'year'),
      } as StoreKpi,
      {
        title: 'Total Orders',
        icon_name: 'ShoppingCartIcon',
        current_value: p.orders,
        change_percentage: p.ordersChange,
        change_period: 'vs. prior ' + (period === 'day' ? 'day' : period === 'month' ? 'month' : 'year'),
      } as StoreKpi,
      {
        title: 'Total Products',
        icon_name: 'PackageIcon',
        current_value: p.products,
        change_percentage: p.productsChange,
        change_period: 'vs. prior ' + (period === 'day' ? 'day' : period === 'month' ? 'month' : 'year'),
      } as StoreKpi,
    ];
  }, [period]);

  // friendly label for the selected period
  const periodLabel = useMemo(() => {
    const now = new Date();
    if (period === 'day') return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (period === 'month') return now.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    return now.getFullYear().toString();
  }, [period]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Good {getGreeting()}, {DATA_STORE.user_name}!</h1>
          <p className="mt-1 text-sm text-gray-600">Here's what's happening with your store — <span className="font-medium text-gray-800">{periodLabel}</span>.</p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl value={period} onChange={(v) => setPeriod(v)} />
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiData.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            displayValue={kpi.title === 'Total Revenue' ? formatCurrencyKES(kpi.current_value) : formatInteger(kpi.current_value)}
            change={kpi.change_percentage}
            changePeriod={kpi.change_period}
            icon={kpi.title === 'Total Revenue' ? 'revenue' : kpi.title === 'Total Orders' ? 'orders' : 'products'}
          />
        ))}
      </section>

      <footer className="mt-6 text-sm text-gray-500">Data shown is sample/dummy data for the selected period. Replace <code>DATA_STORE</code> with a real API call to power this dashboard.</footer>
    </div>
  );
}

/**
 * Small helpful components
 */
function SegmentedControl({ value, onChange }: { value: 'day' | 'month' | 'year'; onChange: (v: 'day' | 'month' | 'year') => void }) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1 text-sm" role="tablist" aria-label="Select period">
      <button
        role="tab"
        aria-selected={value === 'day'}
        onClick={() => onChange('day')}
        className={`px-3 py-1 rounded-full transition ${value === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
      >
        Day
      </button>
      <button
        role="tab"
        aria-selected={value === 'month'}
        onClick={() => onChange('month')}
        className={`px-3 py-1 rounded-full transition ${value === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
      >
        Month
      </button>
      <button
        role="tab"
        aria-selected={value === 'year'}
        onClick={() => onChange('year')}
        className={`px-3 py-1 rounded-full transition ${value === 'year' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
      >
        Year
      </button>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}
