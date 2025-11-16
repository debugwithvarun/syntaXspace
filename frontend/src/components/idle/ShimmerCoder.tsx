const ShimmerLoader = () => {
    return (
      <div className="w-full h-[70vh] bg-background animate-pulse rounded-md overflow-hidden relative">
        {/* Shimmer overlay */}
        <div className="absolute inset-0  animate-shimmer" />
        
        {/* Fake line blocks */}
        <div className="p-4 space-y-3">
          <div className="h-4 w-1/3 bg-white/10 rounded"></div>
          <div className="h-4 w-1/2 bg-white/10 rounded"></div>
          <div className="h-4 w-2/3 bg-white/10 rounded"></div>
  
          <div className="h-4 w-full bg-white/10 rounded mt-6"></div>
          <div className="h-4 w-5/6 bg-white/10 rounded"></div>
          <div className="h-4 w-4/6 bg-white/10 rounded"></div>
  
          <div className="h-4 w-full bg-white/10 rounded mt-6"></div>
          <div className="h-4 w-3/4 bg-white/10 rounded"></div>
          <div className="h-4 w-2/3 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  };
  
  export default ShimmerLoader;
  