import { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService';

export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });

  const fetchReports = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const combinedFilters = { ...filters, ...newFilters };
      const result = await reportService.getReports(combinedFilters);
      
      setReports(result.reports);
      setPagination({
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshReports = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    loading,
    error,
    pagination,
    fetchReports,
    refreshReports,
  };
};

export const useMyReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });

  const fetchMyReports = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const combinedFilters = { ...filters, ...newFilters };
      const result = await reportService.getMyReports(combinedFilters);
      
      setReports(result.reports);
      setPagination({
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshMyReports = useCallback(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  return {
    reports,
    loading,
    error,
    pagination,
    fetchMyReports,
    refreshMyReports,
  };
};

export const useReport = (reportId) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await reportService.getReportById(reportId);
      setReport(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  const upvoteReport = useCallback(async () => {
    try {
      await reportService.upvoteReport(reportId);
      await fetchReport(); // Refresh report data
    } catch (err) {
      throw err;
    }
  }, [reportId, fetchReport]);

  const removeUpvote = useCallback(async () => {
    try {
      await reportService.removeUpvote(reportId);
      await fetchReport(); // Refresh report data
    } catch (err) {
      throw err;
    }
  }, [reportId, fetchReport]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId, fetchReport]);

  return {
    report,
    loading,
    error,
    fetchReport,
    upvoteReport,
    removeUpvote,
  };
};