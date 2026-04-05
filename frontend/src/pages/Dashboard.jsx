import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, AlertOctagon, ShieldAlert, Activity } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import BeforeAfterToggle from '../components/BeforeAfterToggle';
import SkeletonCard, { SkeletonRow } from '../components/SkeletonCard';
import { fetchStats, fetchPriorityCases, fetchDateCases, fetchAlerts } from '../api/api';
import { formatScore } from '../utils';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [priorityCases, setPriorityCases] = useState([]);
  const [dateCases, setDateCases] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    // Simulate slight delay for skeleton presentation as requested
    const loadData = async () => {
      const [statsData, priorityData, dateData, alertsData] = await Promise.all([
        fetchStats(),
        fetchPriorityCases(),
        fetchDateCases(),
        fetchAlerts()
      ]);
      
      if (!isMounted) return;

      setTimeout(() => {
        setStats(statsData);
        setPriorityCases(priorityData || []);
        setDateCases(dateData || []);
        setAlerts(alertsData?.cases || []);
        setLoading(false);
      }, 400); // 400ms min display
    };
    
    loadData();
    return () => { isMounted = false; };
  }, []);

  const chartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats?.critical_count || 0,
          stats?.high_count || 0,
          stats?.medium_count || 0,
          stats?.low_count || 0,
        ],
        backgroundColor: ['#DC2626', '#D97706', '#2563EB', '#16A34A'],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} cases`
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader title="Dashboard" subtitle="Overview of Judicial Queue & Priorities" />
      
      {/* Stat Cards ROW */}
      <div className="grid grid-cols-4 gap-5">
        {loading ? (
          <>
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
            <SkeletonCard height="h-32" />
          </>
        ) : (
          <>
             <StatCard 
               title="Total Cases" 
               value={stats?.total} 
               icon={Scale} 
               iconColor="blue"
             />
             <StatCard 
               title="Critical Cases" 
               value={stats?.critical_count} 
               icon={AlertOctagon} 
               iconColor="red"
               trend="↑ 12 this week"
             />
             <StatCard 
               title="436A Violations" 
               value={stats?.violations_436a} 
               icon={ShieldAlert} 
               iconColor="red"
             />
             <StatCard 
               title="Avg U-Score" 
               value={stats?.avg_u_score} 
               icon={Activity} 
               iconColor="green"
               isDecimal={true}
               suffix="/100"
             />
          </>
        )}
      </div>

      {/* MIDDLE ROW */}
      <div className="flex gap-5 mt-7">
        
        {/* Left: Top Priority Cases */}
        <div className="flex-[3] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-[16px] font-semibold text-slate-900">Top Priority Cases</h2>
            <button onClick={() => navigate('/queue')} className="text-[#2563EB] text-[13px] hover:underline font-medium">
              View all →
            </button>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="p-6">
                {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : priorityCases.length === 0 ? (
               <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                 <ListOrdered size={32} className="mb-2" />
                 <span className="text-[14px]">No priority cases found</span>
                 <button className="text-[#2563EB] text-[13px] mt-2 font-medium" onClick={() => window.location.reload()}>Refresh</button>
               </div>
            ) : (
              <div>
                {priorityCases.slice(0, 5).map(c => {
                   const getBorder = (lvl) => {
                     if(lvl==='CRITICAL') return 'border-l-[#DC2626]';
                     if(lvl==='HIGH') return 'border-l-[#D97706]';
                     if(lvl==='MEDIUM') return 'border-l-[#2563EB]';
                     return 'border-l-[#16A34A]';
                   };
                   
                   return (
                    <div 
                      key={c.id} 
                      onClick={() => navigate(`/case/${c.id}`)}
                      className={`px-6 py-3 border-b border-slate-100 last:border-0 border-l-[4px] ${getBorder(c.priority_level)} flex items-center justify-between hover:bg-slate-50 cursor-pointer group`}
                    >
                      <div className="flex items-center gap-3">
                        <PriorityBadge level={c.priority_level} />
                        <span className="font-mono text-[13px] text-slate-500">{c.case_number}</span>
                        <span className="font-medium text-[14px] text-slate-900">{c.accused_name}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-medium ml-2">IPC {c.crime_section}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">{formatScore(c.u_score)}</div>
                        <div className="text-[12px] text-slate-400">Score</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Distribution */}
        <div className="flex-[2] bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h2 className="text-[16px] font-semibold text-slate-900 mb-6">Case Distribution</h2>
           
           {loading ? (
             <div className="flex justify-center items-center h-[200px]"><div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-slate-300 animate-spin"></div></div>
           ) : (
             <>
               <div className="relative h-[200px]">
                 <Doughnut data={chartData} options={donutOptions} />
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[24px] font-bold text-slate-900">{stats?.total}</span>
                    <span className="text-[12px] text-slate-400 uppercase tracking-wide">Cases</span>
                 </div>
               </div>
               
               <div className="mt-6 flex flex-col gap-2">
                 {[
                   { label: 'Critical', count: stats?.critical_count, color: 'bg-[#DC2626]' },
                   { label: 'High', count: stats?.high_count, color: 'bg-[#D97706]' },
                   { label: 'Medium', count: stats?.medium_count, color: 'bg-[#2563EB]' },
                   { label: 'Low', count: stats?.low_count, color: 'bg-[#16A34A]' }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center text-[13px]">
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                       <span className="text-slate-600 font-medium">{item.label}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-bold text-slate-900">{item.count || 0}</span>
                       <span className="text-slate-400 w-8 text-right border-l border-slate-200 pl-2">
                          {stats?.total ? Math.round(((item.count || 0) / stats.total) * 100) : 0}%
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </>
           )}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex gap-5 mt-5 pb-10">
        
        {/* Alerts Mini */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-[#DC2626]" size={18} />
              <h2 className="text-[16px] font-semibold text-slate-900">Active Violations</h2>
              {!loading && (
                <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  {alerts.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-2">
            {loading ? (
               <div className="p-4"><SkeletonRow /><SkeletonRow /></div>
            ) : alerts.length === 0 ? (
               <div className="p-8 text-center text-slate-500 text-[13px]">No 436A violations found.</div>
            ) : (
              alerts.slice(0, 3).map(a => (
                <div key={a.id} className="p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/case/${a.id}`)}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="font-mono text-slate-500 text-[11px] mr-2">{a.case_number}</span>
                      <span className="font-medium text-[13px] text-slate-900">{a.accused_name}</span>
                    </div>
                  </div>
                  <div className="text-[#991B1B] text-[12px] font-medium mb-1.5">
                    Detained {a.detention_days} days (Max allowed: {a.half_sentence_days} days)
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                       className="bg-[#DC2626] h-full rounded-full" 
                       style={{ width: `${Math.min((a.detention_days / a.half_sentence_days) * 50, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-5 py-3 border-t border-slate-100 mt-auto">
            <button onClick={() => navigate('/alerts')} className="text-[#DC2626] text-[13px] font-medium hover:underline flex items-center gap-1">
              View all {alerts.length} violations →
            </button>
          </div>
        </div>

        {/* Before / After Toggle Component */}
        <div className="flex-[1.5]">
          {loading ? (
             <SkeletonCard height="h-[300px]" />
          ) : (
            <BeforeAfterToggle priorityCases={priorityCases} dateCases={dateCases} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
