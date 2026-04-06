import { useState, useEffect } from 'react';
import { SearchIcon, CalendarDays, FileText, User, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import SkeletonCard from '../components/SkeletonCard';
import CaseCard from '../components/CaseCard';
import { fetchPriorityCases } from '../api/api';

const Search = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Optional toggles for specific filters
  const [onlyVulnerable, setOnlyVulnerable] = useState(false);
  const [onlyUndertrial, setOnlyUndertrial] = useState(false);

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
    // 1. Text Search constraints
    const q = searchTerm.toLowerCase().trim();
    let matchesSearch = true;

    if (q.length > 0) {
      matchesSearch = 
        (c.accused_name && c.accused_name.toLowerCase().includes(q)) ||
        (c.case_number && c.case_number.toLowerCase().includes(q)) ||
        (c.crime_section && c.crime_section.toLowerCase().includes(q)) ||
        (c.crime_description && c.crime_description.toLowerCase().includes(q)) ||
        (c.case_type && c.case_type.toLowerCase().includes(q)) ||
        (c.filing_date && c.filing_date.includes(q)) ||
        (c.priority_level && c.priority_level.toLowerCase().includes(q));
    }

    // 2. Toggle constraints
    const matchesVulnerable = onlyVulnerable ? c.vulnerability_flag === 1 : true;
    const matchesUndertrial = onlyUndertrial ? c.is_undertrial === true : true;

    // 3. Date constraint
    let matchesDate = true;
    if (searchDate) {
      matchesDate = c.filing_date && c.filing_date.startsWith(searchDate);
    }

    return matchesSearch && matchesVulnerable && matchesUndertrial && matchesDate;
  });

  return (
    <div className="pb-12 h-full flex flex-col">
      <PageHeader title="Case Search" subtitle="Search across all case details, dates, history, and rulings" />
      
      {/* SEARCH BAR & FILTERS */}
      <div className="sticky top-0 bg-[#F1F5F9] pt-2 pb-5 z-10">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-4">
          <div className="relative mb-4">
            <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, case number, crime (e.g. theft), year, priority..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-12 pr-4 py-3.5 rounded-lg border-2 border-slate-200 text-[15px] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-medium text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[13px]">
            <div className="flex items-center text-slate-500 font-medium tracking-wide font-mono uppercase text-[11px]">
              <Filter size={14} className="mr-1.5" /> Quick Filters:
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={onlyVulnerable} 
                onChange={(e) => setOnlyVulnerable(e.target.checked)} 
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer"
              />
              <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors flex items-center gap-1">
                <User size={14} className="text-[#DC2626]" /> Vulnerable Individuals
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={onlyUndertrial} 
                onChange={(e) => setOnlyUndertrial(e.target.checked)} 
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 cursor-pointer"
              />
              <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors flex items-center gap-1">
                <FileText size={14} className="text-[#D97706]" /> Undertrial Cases
              </span>
            </label>
            <div className="flex items-center ml-2 border-l border-slate-200 pl-5">
              <div className={`relative flex items-center transition-all duration-200 overflow-hidden ${searchDate ? 'bg-blue-50 border-blue-300 text-blue-800 rounded-md shadow-sm border ring-2 ring-blue-500/20' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white rounded-md shadow-sm border'}`}>
                <div className="relative flex items-center pl-2.5">
                  <CalendarDays size={14} className={searchDate ? 'text-blue-600' : 'text-slate-400'} />
                  
                  {/* The actual date input, styled to look invisible except for the text */}
                  <input 
                    type="date" 
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 outline-none text-[13px] font-semibold text-slate-700 cursor-pointer w-[125px] pl-2 pr-6 py-1.5 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer z-10"
                  />

                  {/* Decorative dropdown arrow */}
                  <div className="pointer-events-none absolute right-2.5 text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>

                {/* Clear button */}
                {searchDate && (
                  <div className="flex items-center pr-1.5 border-l border-blue-200/60 pl-1.5 ml-0.5 bg-blue-50 z-20">
                    <button 
                      onClick={(e) => { e.preventDefault(); setSearchDate(''); }}
                      className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-blue-200 text-blue-500 hover:text-blue-700 transition-colors font-bold text-[14px]"
                      title="Clear Date Filter"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[13px] text-slate-400 font-medium px-1">
          {searchTerm || searchDate || onlyVulnerable || onlyUndertrial ? (
            <span>Found <strong className="text-slate-700">{filteredCases.length}</strong> matching cases</span>
          ) : (
            <span>Type to search <strong className="text-slate-700">{cases.length}</strong> total cases database</span>
          )}
        </div>
      </div>

      {/* SEARCH RESULTS */}
      <div className="mt-2 flex flex-col gap-3 flex-1">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <>
              <SkeletonCard height="h-48" />
              <SkeletonCard height="h-48" />
              <SkeletonCard height="h-48" />
            </>
          ) : filteredCases.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border text-balance border-slate-200 border-dashed rounded-xl p-16 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={32} />
              </div>
              <h3 className="text-[17px] font-bold text-slate-800 mb-1">No matches found</h3>
              <p className="text-slate-500 text-[14px]">
                We couldn't find any cases matching "{searchTerm}". Try checking for typos or using different keywords like crime types or years.
              </p>
            </motion.div>
          ) : (
            filteredCases.map((c, index) => (
              <CaseCard key={c.id} c={c} index={Math.min(index, 10)} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;
