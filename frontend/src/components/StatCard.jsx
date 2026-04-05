import { useCountUp } from '../hooks/useCountUp';

const StatCard = ({ title, value, icon: Icon, iconColor, trend, isDecimal = false, suffix = '' }) => {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0, 1000);
  
  const displayValue = isDecimal 
    ? (animatedValue || 0).toFixed(1) 
    : Math.round(animatedValue || 0).toLocaleString('en-IN');

  const bgColors = {
    blue: 'bg-blue-100 text-[#2563EB]',
    red: 'bg-red-100 text-[#DC2626]',
    green: 'bg-green-100 text-[#16A34A]',
    orange: 'bg-orange-100 text-[#D97706]'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start w-full">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColors[iconColor]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${
            trend.startsWith('↑') ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'
          }`}>
            {trend}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-baseline relative">
        <div className="text-[48px] font-bold tabular-nums text-slate-900 leading-none tracking-tight">
          {displayValue}
        </div>
        {suffix && <span className="text-[16px] font-medium text-slate-400 ml-1">{suffix}</span>}
        {title === 'Critical Cases' && (
          <div className="absolute -right-3 top-2 w-2 h-2 rounded-full bg-[#DC2626] pulse-ring"></div>
        )}
      </div>
      
      <div className="text-[13px] font-medium text-slate-500 mt-2">
        {title}
      </div>
    </div>
  );
};

export default StatCard;
