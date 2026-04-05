import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PageHeader from '../components/PageHeader';
import SkeletonCard from '../components/SkeletonCard';
import { fetchDateCases, fetchStats } from '../api/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const [allCases, statsData] = await Promise.all([
        fetchDateCases(),
        fetchStats()
      ]);
      if (isMounted) {
        setTimeout(() => {
           setCases(allCases || []);
           setStats(statsData);
           setLoading(false);
        }, 400);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Compute Crime Type Chart Data
  const sectionCounts = {};
  cases.forEach(c => {
    sectionCounts[c.crime_section] = (sectionCounts[c.crime_section] || 0) + 1;
  });
  const topSections = Object.entries(sectionCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);
  
  const crimeTypeData = {
    labels: topSections.map(t => `IPC ${t[0]}`),
    datasets: [{
      label: 'Number of Cases',
      data: topSections.map(t => t[1]),
      backgroundColor: '#2563EB',
      borderRadius: 4,
    }]
  };

  const crimeOptions = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: '#F1F5F9' } }, y: { grid: { display: false } } },
    maintainAspectRatio: false
  };

  // Compute Filing Year Chart Data
  const yearCounts = {};
  cases.forEach(c => {
    if (c.filing_date) {
      const year = new Date(c.filing_date).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  const years = Object.keys(yearCounts).sort();
  const currentYear = new Date().getFullYear();

  const yearData = {
    labels: years,
    datasets: [{
      label: 'Cases Filed',
      data: years.map(y => yearCounts[y]),
      backgroundColor: years.map(y => parseInt(y) === currentYear ? '#2563EB' : '#94A3B8'),
      borderRadius: 4,
    }]
  };

  const yearOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } },
    maintainAspectRatio: false
  };

  // Compute Score Distribution Data
  const buckets = Array(10).fill(0); // 0-10, 10-20 ... 90-100
  cases.forEach(c => {
    const bucketIdx = Math.min(Math.floor((c.u_score || 0) / 10), 9);
    buckets[bucketIdx]++;
  });

  const distData = {
    labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
    datasets: [{
      label: 'Cases in Bucket',
      data: buckets,
      backgroundColor: (ctx) => {
        const idx = ctx.dataIndex;
        if (idx >= 7) return '#DC2626'; // >= 70 (Critical/High)
        if (idx >= 4) return '#D97706'; // 40-70
        return '#2563EB'; // 0-40
      },
      borderRadius: 4,
    }]
  };
  
  const distOptions = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { grid: { color: '#F1F5F9' } }, y: { grid: { display: false } } },
    maintainAspectRatio: false
  };

  // Compute average detention
  const undertrials = cases.filter(c => c.detention_start_date);
  const avgDetention = undertrials.length > 0 
    ? undertrials.reduce((acc, c) => acc + Math.max(0, Math.floor((new Date() - new Date(c.detention_start_date)) / (1000 * 60 * 60 * 24))), 0) / undertrials.length
    : 0;

  return (
    <div className="pb-12 fade-in animate-in">
      <PageHeader title="Analytics" subtitle="Deep dive into queue metrics and judicial performance" />
      
      {/* ROW 1 */}
      <div className="flex gap-5 mb-5">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-6">Cases by Crime Type (Top 10)</h2>
          {loading ? <SkeletonCard height="h-[280px]" /> : <div className="h-[280px]"><Bar data={crimeTypeData} options={crimeOptions} /></div>}
        </div>
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-6">Cases by Filing Year</h2>
          {loading ? <SkeletonCard height="h-[280px]" /> : <div className="h-[280px]"><Bar data={yearData} options={yearOptions} /></div>}
        </div>
      </div>

      {/* ROW 2 */}
      <div className="flex gap-5">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-center">
             <div className="text-[12px] font-medium text-slate-400 uppercase tracking-wide mb-2">% Undertrials Past 436A Limit</div>
             {loading ? <div className="h-10 bg-slate-100 animate-pulse w-32 rounded"></div> : (
                <div className="text-[36px] font-bold text-[#DC2626] tabular-nums">
                  {cases.length > 0 ? Math.round(((stats?.violations_436a || 0) / cases.length) * 100) : 0}<span className="text-[20px] text-red-400 ml-1">%</span>
                </div>
             )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-center">
             <div className="text-[12px] font-medium text-slate-400 uppercase tracking-wide mb-2">Avg Detention Duration</div>
             {loading ? <div className="h-10 bg-slate-100 animate-pulse w-32 rounded"></div> : (
                <div className="text-[36px] font-bold text-slate-900 tabular-nums">
                  {Math.round(avgDetention)}<span className="text-[16px] text-slate-400 ml-2 font-medium">days</span>
                </div>
             )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex-1 flex flex-col justify-center">
             <div className="text-[12px] font-medium text-slate-400 uppercase tracking-wide mb-2">Average U-Score</div>
             {loading ? <div className="h-10 bg-slate-100 animate-pulse w-32 rounded"></div> : (
                <div className="text-[36px] font-bold text-[#D97706] tabular-nums">
                  {stats?.avg_u_score ? Number(stats.avg_u_score).toFixed(1) : '0.0'}
                </div>
             )}
          </div>
        </div>
        
        <div className="flex-[2] bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-[15px] font-semibold text-slate-900 mb-6">Score Distribution</h2>
          {loading ? <SkeletonCard height="h-[340px]" /> : <div className="h-[340px]"><Bar data={distData} options={distOptions} /></div>}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
