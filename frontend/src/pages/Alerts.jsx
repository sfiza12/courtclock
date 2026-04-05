import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import SkeletonCard from '../components/SkeletonCard';
import { fetchAlerts } from '../api/api';
import { formatDate } from '../utils';

const Alerts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadAlerts = async () => {
      const data = await fetchAlerts();
      if (!isMounted) return;
      setTimeout(() => {
        setAlerts(data?.cases || []);
        setLoading(false);
      }, 400);
    };
    loadAlerts();
    return () => { isMounted = false; };
  }, []);

  const nowString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pb-12">
      <PageHeader title="436A Alerts" subtitle="Rights Violation Monitoring System" />

      {/* RED BANNER */}
      <div className="rounded-xl bg-[#FEF2F2] border border-red-200 p-5 mb-7 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} className="text-[#DC2626]" />
          </div>
          <div>
            <div className="text-[15px] font-medium text-red-900 leading-tight">
              <span className="font-bold">{alerts.length} cases</span> have exceeded legal detention limits under Section 436A CrPC.
            </div>
            <div className="text-[13px] text-red-700 mt-0.5">
              Immediate judicial review required.
            </div>
          </div>
        </div>
        <div className="text-[12px] font-medium text-slate-400 bg-white px-3 py-1 rounded-lg border border-red-100 self-start">
          Last checked: Today, {nowString}
        </div>
      </div>

      {/* ALERT CARDS */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {loading ? (
            <>
              <SkeletonCard height="h-40" />
              <SkeletonCard height="h-40" />
            </>
          ) : alerts.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500">
                <AlertCircle size={32} className="mb-3 text-green-500" />
                <h3 className="text-[16px] font-semibold text-slate-900 mb-1">Clear Queue</h3>
                <p className="text-[14px]">No 436A violations currently detected.</p>
             </div>
          ) : (
            alerts.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border-l-[4px] border-l-[#DC2626] border-y border-r border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-center mb-3">
                  <span className="inline-flex py-0.5 px-2.5 bg-red-100 text-[#991B1B] text-[11px] font-bold rounded-full tracking-wide uppercase">
                    Section 436A Violation
                  </span>
                  <span className="font-mono text-slate-500 text-[13px]">{a.case_number}</span>
                </div>

                {/* NAME ROW */}
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[18px] font-semibold text-slate-900">{a.accused_name}</h3>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[13px] font-medium border border-slate-200">
                    IPC {a.crime_section}
                  </span>
                </div>

                {/* DETENTION TIMELINE */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="text-[12px] font-medium text-slate-500 mb-3 tracking-wide uppercase">Detention Progress vs Legal Limit</div>
                  
                  {/* Visual Bar */}
                  <div className="relative pt-6 pb-2">
                    {/* Small 436A label centered above */}
                    <div className="absolute top-0 left-[50%] -translate-x-1/2 text-[10px] font-bold text-red-600">
                      436A Threshold
                    </div>
                    {/* Marker line */}
                    <div className="absolute top-4 bottom-2 left-[50%] w-px bg-red-300 border-l border-dashed border-red-500 z-10"></div>
                    
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full rounded-full bg-[#DC2626]" 
                        style={{ width: `${Math.min((a.detention_days / ((a.max_sentence_years * 365))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-3">
                    <div>Start: {formatDate(a.detention_start_date)}</div>
                    <div>Max Sentence</div>
                  </div>
                  
                  <div className="text-[13px] font-semibold text-[#991B1B]">
                    ⚠ Exceeded legal limit by {Math.max(0, Math.floor(a.detention_days - a.half_sentence_days))} days
                  </div>
                </div>

                {/* ACTIONS ROW */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    onClick={() => navigate(`/case/${a.id}`)}
                    className="text-[13px] font-medium text-[#2563EB] border border-[#2563EB]/30 bg-blue-50/50 hover:bg-blue-50 px-4 py-1.5 rounded-lg transition-colors"
                  >
                    View Full Case
                  </button>
                  <button className="text-[13px] font-medium text-[#DC2626] border border-[#DC2626]/30 bg-red-50/50 hover:bg-red-50 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                    <ShieldAlert size={14} /> Flag for Bail Review
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Alerts;
