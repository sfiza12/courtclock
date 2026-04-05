import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, CalendarDays, Clock, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import PriorityBadge from '../components/PriorityBadge';
import SkeletonCard from '../components/SkeletonCard';
import { fetchPriorityCases } from '../api/api';
import { formatDate, formatDetention, formatScore } from '../utils';

const Queue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadCases = async () => {
      const data = await fetchPriorityCases();
      if (!isMounted) return;
      
      setTimeout(() => {
        setCases(data || []);
        setLoading(false);
      }, 300);
    };
    loadCases();
    return () => { isMounted = false; };
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesFilter = filter === 'ALL' || c.priority_level === filter;
    const matchesSearch = c.accused_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBarColor = (scoreStr) => {
    if (!scoreStr) return 'bg-slate-200';
    const num = parseFloat(scoreStr);
    if (num > 0.7) return 'bg-[#DC2626]'; // Red for high risk
    if (num > 0.4) return 'bg-[#D97706]'; // Amber for medium risk
    return 'bg-[#2563EB]';                // Blue for lower risk
  };

  const getBorderColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'border-l-[#DC2626]';
      case 'HIGH': return 'border-l-[#D97706]';
      case 'MEDIUM': return 'border-l-[#2563EB]';
      case 'LOW': return 'border-l-[#16A34A]';
      default: return 'border-l-slate-300';
    }
  };

  const filterColor = (level, isActive) => {
    if (!isActive) return 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50';
    switch (level) {
      case 'CRITICAL': return 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm';
      case 'HIGH': return 'bg-[#D97706] text-white border-[#D97706] shadow-sm';
      case 'MEDIUM': return 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm';
      case 'LOW': return 'bg-[#16A34A] text-white border-[#16A34A] shadow-sm';
      case 'ALL': return 'bg-slate-800 text-white border-slate-800 shadow-sm';
      default: return 'bg-slate-800 text-white font-medium';
    }
  };

  return (
    <div className="pb-12">
      <PageHeader title="Priority Queue" subtitle="AI-Generated Urgent Case Pipeline" />
      
      {/* FILTER BAR */}
      <div className="sticky top-0 bg-[#F1F5F9] pt-2 pb-5 z-10">
        <div className="flex justify-between items-end gap-6 mb-3">
          <div className="relative w-72">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or case number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="text-[13px] text-slate-400 font-medium">
            Showing {filteredCases.length} of {cases.length} cases
          </div>
        </div>
        
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide uppercase transition-all ${filterColor(level, filter === level)}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* CASE CARDS */}
      <div className="mt-2 flex flex-col gap-3">
        <AnimatePresence>
          {loading ? (
            <>
              <SkeletonCard height="h-48" />
              <SkeletonCard height="h-48" />
            </>
          ) : filteredCases.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500"
            >
              No cases found matching your filters.
            </motion.div>
          ) : (
            filteredCases.map((c, index) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: index < 10 ? index * 0.04 : 0, duration: 0.2 }}
                className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-px transition-all cursor-pointer border-l-[4px] ${getBorderColor(c.priority_level)}`}
                onClick={() => navigate(`/case/${c.id}`)}
              >
                {/* HEADER ROW */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <PriorityBadge level={c.priority_level} />
                    <span className="font-mono text-slate-500 text-[13px] ml-3">{c.case_number}</span>
                  </div>
                  <div className="bg-white border border-[#2563EB] text-[#2563EB] font-bold text-[15px] px-3 py-1 rounded-lg">
                    {formatScore(c.u_score)}
                  </div>
                </div>

                {/* NAME ROW */}
                <div className="mt-3">
                  <h3 className="text-[17px] font-semibold text-slate-900 leading-tight">{c.accused_name}</h3>
                  <div className="text-[14px] text-slate-500 mt-0.5">IPC {c.crime_section} — {c.crime_description || 'Pending'}</div>
                </div>

                {/* METADATA ROW */}
                <div className="mt-4 flex gap-6">
                  <div className="flexitems-start flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5 text-[11px] uppercase tracking-wide font-medium"><CalendarDays size={12}/> Filed</div>
                    <div className="text-slate-700 text-[13px] font-medium ml-5">{formatDate(c.filing_date)}</div>
                  </div>
                  <div className="flexitems-start flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5 text-[11px] uppercase tracking-wide font-medium"><Clock size={12}/> Detained</div>
                    <div className="text-slate-700 text-[13px] font-medium ml-5">{c.detention_start_date ? formatDetention(Math.floor((new Date() - new Date(c.detention_start_date)) / (1000 * 60 * 60 * 24))) : 'None'}</div>
                  </div>
                  <div className="flexitems-start flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5 text-[11px] uppercase tracking-wide font-medium"><FileText size={12}/> Max Sentence</div>
                    <div className="text-slate-700 text-[13px] font-medium ml-5">{c.max_sentence_years} years</div>
                  </div>
                  <div className="flexitems-start flex-col">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-0.5 text-[11px] uppercase tracking-wide font-medium"><User size={12}/> Vulnerable</div>
                    <div className={`text-[13px] font-medium ml-5 ${c.vulnerability_flag ? 'text-[#DC2626]' : 'text-slate-700'}`}>{c.vulnerability_flag ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* SCORE BARS ROW */}
                <div className="mt-5 grid grid-cols-6 gap-3">
                  {[
                    { label: 'DSR', val: c.dsr_score },
                    { label: 'AGE', val: c.age_score },
                    { label: 'VUL', val: c.vulnerability_score },
                    { label: 'RIGHTS', val: c.rights_score },
                    { label: 'SEV', val: c.severity_score },
                    { label: 'ADJ', val: c.adjournment_score }
                  ].map(score => (
                    <div key={score.label} className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-slate-400 font-medium">{score.label}</span>
                        <span className="text-[11px] text-slate-600 font-medium">{Math.round((score.val || 0) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getBarColor(score.val)}`} style={{ width: `${(score.val || 0) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER ROW */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    {c.rights_score > 0.8 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2]">
                        ⚠ 436A Risk
                      </span>
                    )}
                  </div>
                  <span className="text-[#2563EB] text-[13px] font-medium hover:underline flex items-center">
                    View Details <span className="ml-1">→</span>
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Queue;
