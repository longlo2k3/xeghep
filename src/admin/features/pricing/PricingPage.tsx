import { useState } from 'react';
import { Receipt, Plane, Route } from 'lucide-react';
import { AirportPricingTable } from './AirportPricingTable';
import { DistanceRatesTable } from './DistanceRatesTable';
import { cn } from '@/admin/lib/utils';

export type PricingTab = 'airport' | 'distance';

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<PricingTab>('airport');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-slate-900">Bảng giá phụ & Cước mở rộng</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị bảng giá đưa đón Sân bay Nội Bài cho 12 quận Hà Nội và đơn giá cước đường dài theo dải cự ly km.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('airport')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'airport'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Plane className="w-4 h-4" />
          Bảng giá Sân bay Nội Bài (12 quận)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distance')}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition cursor-pointer',
            activeTab === 'distance'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          )}
        >
          <Route className="w-4 h-4" />
          Bảng giá Đường dài theo km & Chính sách
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === 'airport' ? <AirportPricingTable /> : <DistanceRatesTable />}
      </div>
    </div>
  );
}

export default PricingPage;
