import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PriorityBadge from './PriorityBadge';
import { formatDate, formatScore } from '../utils';

const BeforeAfterToggle = ({ dateCases, priorityCases }) => {
  const [isPriority, setIsPriority] = useState(false);

  // We show 5 cases. Get top 5 in each order
  const displayCases = isPriority ? priorityCases?.slice(0, 5) : dateCases?.slice(0, 5);

  const getBorderColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-[#DC2626]';
      case 'HIGH': return 'bg-[#D97706]';
      case 'MEDIUM': return 'bg-[#2563EB]';
      case 'LOW': return 'bg-[#16A34A]';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900 leading-none">CourtClock Impact</h2>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setIsPriority(false)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              !isPriority ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Filing Date Order
          </button>
          <button 
            onClick={() => setIsPriority(true)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
              isPriority ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Priority Order
          </button>
        </div>
      </div>

      {/* Case List animated by Framer Motion layoutId */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {displayCases?.map((c) => (
            <motion.div
              layoutId={c.id.toString()}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              key={c.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 relative overflow-hidden"
            >
              {/* Left Color Indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor(c.priority_level)}`} />
              
              <div className="pl-2 flex items-center gap-3">
                <span className="font-mono text-slate-500 text-[12px]">{c.case_number}</span>
                <span className="font-medium text-[14px] text-slate-900">{c.accused_name}</span>
              </div>
              
              <div className="text-right">
                {isPriority ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[12px]">U-Score</span>
                    <span className="font-bold text-slate-900 text-[15px]">{formatScore(c.u_score)}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[13px]">
                    Filed {formatDate(c.filing_date)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 text-[12px] text-slate-400 text-center uppercase tracking-wide font-medium">
        Showing how CourtClock reorders the same cases
      </div>
    </div>
  );
};

export default BeforeAfterToggle;
