const SkeletonCard = ({ height = "h-40" }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 flex flex-col w-full ${height}`}>
      <div className="flex items-center gap-4 animate-pulse w-full mb-6">
        <div className="h-10 w-10 bg-slate-200 rounded-full shrink-0"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-md w-1/2 animate-pulse mt-auto"></div>
    </div>
  );
};

export const SkeletonRow = () => {
  return (
    <div className="py-3 border-b flex justify-between animate-pulse items-center gap-4 w-full">
      <div className="flex items-center gap-3 w-1/2">
        <div className="h-5 w-16 bg-slate-200 rounded-full shrink-0"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
    </div>
  );
};

export default SkeletonCard;
