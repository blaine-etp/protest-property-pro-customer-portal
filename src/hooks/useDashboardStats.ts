import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalContacts: number;
  activeProperties: number;
  openProtests: number;
  generatedDocuments: number;
  contactsChange: string;
  propertiesChange: string;
  protestsChange: string;
  documentsChange: string;
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
      const [contactsResult, propertiesResult, protestsResult, documentsResult] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase
          .from("protests")
          .select("id", { count: "exact", head: true })
          .in("appeal_status", ["pending", "in_progress", "submitted"]),
        supabase.from("customer_documents").select("id", { count: "exact", head: true }),
      ]);

      // Fetch previous month data for comparison
      const [
        prevContactsResult,
        prevPropertiesResult,
        prevProtestsResult,
        prevDocumentsResult,
      ] = await Promise.all([
        supabase
          .from("contacts")
          .select("id", { count: "exact", head: true })
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
        supabase
          .from("protests")
          .select("id", { count: "exact", head: true })
          .in("appeal_status", ["pending", "in_progress", "submitted"])
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
        supabase
          .from("customer_documents")
          .select("id", { count: "exact", head: true })
          .lt("created_at", firstDayCurrentMonth.toISOString())
          .gte("created_at", firstDayPreviousMonth.toISOString()),
      ]);

      // Check for errors
      const errors = [
        contactsResult.error,
        propertiesResult.error,
        protestsResult.error,
        documentsResult.error,
        prevContactsResult.error,
        prevPropertiesResult.error,
        prevProtestsResult.error,
        prevDocumentsResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`Database query failed: ${errors[0]?.message}`);
      }

      // Calculate current counts
      const totalContacts = contactsResult.count || 0;
      const activeProperties = propertiesResult.count || 0;
      const openProtests = protestsResult.count || 0;
      const generatedDocuments = documentsResult.count || 0;

      // Calculate previous month counts
      const prevContacts = prevContactsResult.count || 0;
      const prevProperties = prevPropertiesResult.count || 0;
      const prevProtests = prevProtestsResult.count || 0;
      const prevDocuments = prevDocumentsResult.count || 0;

      // Calculate percentage changes
      const contactsChange = calculatePercentageChange(totalContacts, prevContacts);
      const propertiesChange = calculatePercentageChange(activeProperties, prevProperties);
      const protestsChange = calculatePercentageChange(openProtests, prevProtests);
      const documentsChange = calculatePercentageChange(generatedDocuments, prevDocuments);

      setStats({
        totalContacts,
        activeProperties,
        openProtests,
        generatedDocuments,
        contactsChange,
        propertiesChange,
        protestsChange,
        documentsChange,
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

  return { stats, loading, error, refetch: fetchStats };
}