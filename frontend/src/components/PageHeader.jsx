import { CalendarDays, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const PageHeader = ({ title, subtitle }) => {
  const today = format(new Date(), 'MMM d, yyyy');

  return (
    <div className="mb-7 pb-5 border-b border-slate-200 flex justify-between items-end">
      <div>
        <div className="text-[12px] font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
          CourtClock / {title}
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-[14px] text-slate-500 mt-1">
            {subtitle}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
          <CalendarDays size={14} className="text-slate-500" />
          <span className="text-[13px] font-medium">{today}</span>
        </div>
        
        <button className="flex items-center gap-2 text-[#2563EB] border border-[#2563EB]/30 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer group">
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[13px] font-medium">Refresh Scores</span>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
