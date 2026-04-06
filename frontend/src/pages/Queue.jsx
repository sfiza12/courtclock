import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import SkeletonCard from '../components/SkeletonCard';
import CaseCard from '../components/CaseCard';
import { fetchPriorityCases } from '../api/api';

const Queue = () => {
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
              <CaseCard key={c.id} c={c} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Queue;
