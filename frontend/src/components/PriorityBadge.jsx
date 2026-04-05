const PriorityBadge = ({ level, className = '' }) => {
  if (!level) return null;

  const normalized = level.toUpperCase();
  const display = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

  const colors = {
    CRITICAL: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    HIGH: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]',
    MEDIUM: 'text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]',
    LOW: 'text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]'
  };

  const style = colors[normalized] || colors['LOW'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style} ${className}`}>
      {display}
    </span>
  );
};

export default PriorityBadge;
