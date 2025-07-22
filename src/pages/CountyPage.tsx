
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CountyBasicsTemplate } from "@/components/CountyBasicsTemplate";
import { Skeleton } from "@/components/ui/skeleton";

const CountyPage = () => {
  const { countySlug } = useParams();
  
  const { data: county, isLoading: isLoadingCounty } = useQuery({
    queryKey: ['county', countySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('counties')
        .select('*')
        .eq('slug', countySlug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!countySlug,
  });

  if (isLoadingCounty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!county) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">County Not Found</h1>
        <p>The county page you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return <CountyBasicsTemplate county={county} />;
};

export default CountyPage;
