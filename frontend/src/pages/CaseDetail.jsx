import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Info } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import PriorityBadge from '../components/PriorityBadge';
import SkeletonCard from '../components/SkeletonCard';
import { fetchCase, fetchExplanation } from '../api/api';
import { formatDate, formatDetention, formatScore } from '../utils';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const [data, aiData] = await Promise.all([
        fetchCase(id),
        fetchExplanation(id)
      ]);
      
      if (!isMounted) return;
      
      setTimeout(() => {
        if (data) {
          // merge AI explanation if present
          setCaseData({ 
            ...data, 
            ai_explanation: aiData?.ai_explanation || data.ai_explanation,
            ai_tags: aiData?.ai_tags ? aiData.ai_tags : (data.ai_tags ? JSON.parse(data.ai_tags) : [])
          });
        }
        setLoading(false);
      }, 400);
    };
    loadData();
    return () => { isMounted = false; };
  }, [id]);

  if (!loading && !caseData) {
    return <div className="p-10 text-center text-slate-500">Case not found.</div>;
  }

  const radarData = {
    labels: ['DSR', 'Case Age', 'Vulnerability', 'Rights', 'Severity', 'Adjournment'],
    datasets: [{
      label: 'Score Profile',
      data: caseData ? [
        caseData.dsr_score, 
        caseData.age_score, 
        caseData.vulnerability_score, 
        caseData.rights_score, 
        caseData.severity_score, 
        caseData.adjournment_score
      ] : [0,0,0,0,0,0],
      backgroundColor: 'rgba(59, 130, 246, 0.25)', // blue-500 + opacity
      borderColor: '#3b82f6', // blue-500
      borderWidth: 2,
      pointBackgroundColor: '#2563EB', // blue-600
      pointRadius: 4,
    }]
  };

  const radarOptions = {
    scales: { r: { min: 0, max: 1, ticks: { display: false } } },
    plugins: { legend: { display: false } },
    animation: { duration: 600, easing: 'easeInOutQuart' },
    maintainAspectRatio: false
  };

  const detentionDays = caseData?.detention_start_date 
    ? Math.max(0, Math.floor((new Date() - new Date(caseData.detention_start_date)) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const halfSentenceDays = caseData ? (caseData.max_sentence_years * 365) / 2 : 0;
  
  const isViolation = detentionDays >= halfSentenceDays;

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 text-[14px] font-medium"
      >
        <ArrowLeft size={16} /> Back to Queue
      </button>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="flex-[3] flex flex-col gap-6">
          {/* Card 1: Case Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[17px] font-semibold text-slate-900">Case Information</h2>
              {loading ? <div className="w-20 h-6 bg-slate-200 animate-pulse rounded-full"></div> : <PriorityBadge level={caseData.priority_level} />}
            </div>

            {loading ? (
               <div className="space-y-6"><div className="h-20 bg-slate-100 rounded-lg animate-pulse"></div></div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Case Number</div>
                    <div className="text-[14px] font-mono font-medium text-slate-900">{caseData.case_number}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Accused</div>
                    <div className="text-[14px] font-medium text-slate-900">{caseData.accused_name}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Crime Section</div>
                    <div className="text-[14px] font-medium text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md inline-block">
                      IPC {caseData.crime_section}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Case Type</div>
                    <div className="text-[14px] font-medium text-slate-900 capitalize">{caseData.case_type}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Filing Date</div>
                    <div className="text-[14px] font-medium text-slate-900">{formatDate(caseData.filing_date)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Hearings</div>
                    <div className="text-[14px] font-medium text-slate-900">{caseData.hearings_held} / {caseData.hearing_count}</div>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-6"></div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3">Crime Description</div>
                  <div className="text-[14px] text-slate-600 leading-relaxed border-l-[3px] border-slate-200 pl-4 py-1 italic bg-slate-50/50">
                    {caseData.crime_description || 'No description available for this case.'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Detention Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm">
            <h2 className="text-[16px] font-semibold text-slate-900 mb-6">Detention vs Sentence Timeline</h2>
            
            {loading ? (
              <div className="h-16 bg-slate-100 animate-pulse rounded-lg"></div>
            ) : !caseData.is_undertrial ? (
               <div className="text-center py-6 text-slate-500 font-medium bg-slate-50 rounded-lg">Not an active undertrial detention.</div>
            ) : (
              <div>
                {/* Visual Bar */}
                <div className="relative pt-6 pb-8">
                   <div className="absolute top-0 left-[50%] -translate-x-1/2 text-[10px] font-bold text-red-600">436A Threshold</div>
                   <div className="absolute top-4 bottom-5 left-[50%] w-px bg-red-300 border-l border-dashed border-red-500 z-10"></div>
                   
                   <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden relative border border-slate-200 shadow-inner">
                     {/* Safe Zone */}
                     <div className="absolute top-0 bottom-0 left-0 bg-[#16A34A] opacity-20" style={{width: '40%'}}></div>
                     {/* Warning Zone */}
                     <div className="absolute top-0 bottom-0 left-[40%] bg-[#D97706] opacity-20" style={{width: '10%'}}></div>
                     {/* Danger Zone */}
                     <div className="absolute top-0 bottom-0 left-[50%] right-0 bg-[#DC2626] opacity-20"></div>

                     {/* Actual Fill */}
                     <div 
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ${isViolation ? 'bg-[#DC2626]' : 'bg-[#2563EB]'}`}
                        style={{ width: `${Math.min((detentionDays / (caseData.max_sentence_years * 365)) * 100, 100)}%` }}
                     ></div>
                   </div>

                   {/* Today Marker */}
                   {detentionDays > 0 && (
                     <div 
                       className="absolute top-10 -ml-1 text-slate-900" 
                       style={{ left: `${Math.min((detentionDays / (caseData.max_sentence_years * 365)) * 100, 100)}%` }}
                     >
                       <span className="block w-2 text-[10px] font-bold">▲</span>
                       <span className="absolute -left-3 mt-1 text-[10px] font-semibold text-slate-600 whitespace-nowrap">Today</span>
                     </div>
                   )}
                </div>

                {/* Summary Chips */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[13px] text-slate-600 font-medium">
                    Detained: <span className="text-slate-900 font-bold">{detentionDays} days</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[13px] text-slate-600 font-medium">
                    Limit: <span className="text-slate-900 font-bold">{Math.floor(halfSentenceDays)} days</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border ${isViolation ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]' : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'}`}>
                    {isViolation ? '⚠ 436A Violation' : '✓ Within Limits'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: AI Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 shadow-sm">
             <div className="flex items-center gap-3 mb-5">
               <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Zap size={10}/> CourtClock AI</span>
               <h2 className="text-[16px] font-semibold text-slate-900">Case Analysis</h2>
             </div>
             
             {loading ? (
                <div className="space-y-2"><div className="h-4 bg-slate-100 rounded w-full"></div><div className="h-4 bg-slate-100 rounded w-[80%]"></div></div>
             ) : (
               <>
                 <div className="text-[14px] text-slate-700 leading-relaxed font-serif">
                   {caseData.ai_explanation ? (
                     caseData.ai_explanation.split('\n\n').map((paragraph, idx) => {
                       const boldMatch = paragraph.match(/^\*\*(.*?)\*\*:(.*)/);
                       if (boldMatch) {
                         return (
                           <p key={idx} className="mb-3 last:mb-0">
                             <span className="font-sans font-bold text-slate-900 tracking-wide text-[13px] uppercase">{boldMatch[1]}:</span>
                             <span className="ml-1">{boldMatch[2]}</span>
                           </p>
                         );
                       }
                       return <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>;
                     })
                   ) : "AI analysis not available for this case."}
                 </div>
                 
                 {caseData.ai_tags && caseData.ai_tags.length > 0 && (
                   <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                     {caseData.ai_tags.map(tag => (
                       <span key={tag} className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-[12px] font-medium">
                         {tag.replace(/_/g, ' ')}
                       </span>
                     ))}
                   </div>
                 )}
               </>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-[2] flex flex-col gap-6">
          
          {/* Card 1: Giant Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
             {loading ? (
                <div className="h-24 w-24 rounded-full bg-slate-100 animate-pulse"></div>
             ) : (
                <>
                  <div className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-2">Urgency Score</div>
                  <div className={`text-[72px] font-black leading-none tracking-tighter ${
                    caseData.priority_level === 'CRITICAL' ? 'text-[#DC2626]' :
                    caseData.priority_level === 'HIGH' ? 'text-[#D97706]' :
                    caseData.priority_level === 'MEDIUM' ? 'text-[#2563EB]' : 'text-[#16A34A]'
                  }`}>
                    {formatScore(caseData.u_score)}
                  </div>
                  <div className="text-[15px] font-medium text-slate-500 mt-2 capitalize">
                    {caseData.priority_level.toLowerCase()} Priority Queue
                  </div>
                  <div className="w-16 h-px bg-slate-200 my-4"></div>
                  <div className="text-[12px] text-slate-400 font-medium tracking-wide flex items-center justify-center gap-1">
                    <Info size={12} /> Out of 100 possible points
                  </div>
                </>
             )}
          </div>

          {/* Card 2: Radar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h2 className="text-[15px] font-semibold text-slate-900 mb-4 text-center">Scoring Dimensions</h2>
             {loading ? (
                <div className="h-[260px] bg-slate-50 animate-pulse rounded-full w-[260px] mx-auto"></div>
             ) : (
                <div className="h-[260px] w-full">
                  <Radar data={radarData} options={radarOptions} />
                </div>
             )}
          </div>

          {/* Card 3: Score Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-[15px] font-semibold text-slate-900 mb-4">Dimension Breakdown</h2>
            
            {loading ? (
              <div className="space-y-4">{[...Array(6)].map((_,i)=><div key={i} className="h-6 bg-slate-100 animate-pulse rounded"></div>)}</div>
            ) : (
              <div className="flex flex-col gap-0">
                {[
                  { label: "Detention / Sentence (DSR)", weight: "30%", val: caseData.dsr_score },
                  { label: "Case Age Index", weight: "20%", val: caseData.age_score },
                  { label: "Vulnerability Factor", weight: "15%", val: caseData.vulnerability_score },
                  { label: "Rights Violation (436A)", weight: "20%", val: caseData.rights_score },
                  { label: "Crime Severity", weight: "10%", val: caseData.severity_score },
                  { label: "Adjournment Abuse", weight: "5%", val: caseData.adjournment_score }
                ].map((row, i) => {
                  
                  const barColor = row.val > 0.7 ? 'bg-[#DC2626]' : row.val > 0.4 ? 'bg-[#D97706]' : 'bg-[#2563EB]';
                  
                  return (
                    <div key={i} className="py-3 border-b border-slate-100 last:border-0 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[13px] font-medium text-slate-800">{row.label}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{row.weight}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${(row.val || 0)*100}%`}}></div>
                        </div>
                      </div>
                      <div className="ml-4 font-mono text-[13px] font-semibold text-slate-600 w-10 text-right">
                        {Math.round((row.val || 0) * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
