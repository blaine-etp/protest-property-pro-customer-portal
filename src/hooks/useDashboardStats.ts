import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  placeholder1: number;
  placeholder2: number;
  usersChange: string;
  propertiesChange: string;
  placeholder1Change: string;
  placeholder2Change: string;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date ranges
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch current month data
      const [usersResult, propertiesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
      ]);

      // Fetch previous month data for comparison
      const [
        prevUsersResult,
        prevPropertiesResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
      ]);

      // Check for errors
      const errors = [
        usersResult.error,
        propertiesResult.error,
        prevUsersResult.error,
        prevPropertiesResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Database query failed: ${errors[0]?.message}`);
      }

      // Calculate current counts
      const totalUsers = usersResult.count || 0;
      const totalProperties = propertiesResult.count || 0;
      const placeholder1 = 0; // Placeholder for future metric
      const placeholder2 = 0; // Placeholder for future metric

      // Calculate previous month counts
      const prevUsers = prevUsersResult.count || 0;
      const prevProperties = prevPropertiesResult.count || 0;

      // Calculate percentage changes
      const usersChange = calculatePercentageChange(totalUsers, prevUsers);
      const propertiesChange = calculatePercentageChange(totalProperties, prevProperties);
      const placeholder1Change = "0%"; // Placeholder
      const placeholder2Change = "0%"; // Placeholder

      setStats({
        totalUsers,
        totalProperties,
        placeholder1,
        placeholder2,
        usersChange,
        propertiesChange,
        placeholder1Change,
        placeholder2Change,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh when component becomes visible (page focus)
  useEffect(() => {
    const handleFocus = () => {
      if (!loading) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loading]);

  return { stats, loading, error, refetch: fetchStats };
}