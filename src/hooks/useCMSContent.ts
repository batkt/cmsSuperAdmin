'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContentAPI, NewsItem, RentalAd, JobPosting } from '@/lib/cms-api'

// Hook for managing news content with backend API
export function useNews(projectName: string) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ContentAPI.getNews(projectName)
      setNews(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch news')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [projectName])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const createNews = async (item: NewsItem) => {
    try {
      await ContentAPI.createNews(projectName, item)
      await fetchNews()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const updateNews = async (id: string, item: NewsItem) => {
    try {
      await ContentAPI.updateNews(projectName, id, item)
      await fetchNews()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const deleteNews = async (id: string) => {
    try {
      await ContentAPI.deleteNews(projectName, id)
      await fetchNews()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return { news, loading, error, createNews, updateNews, deleteNews, refresh: fetchNews }
}

// Hook for managing rental ads with backend API
export function useRentals(projectName: string) {
  const [rentals, setRentals] = useState<RentalAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ContentAPI.getRentals(projectName)
      setRentals(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch rentals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [projectName])

  useEffect(() => {
    fetchRentals()
  }, [fetchRentals])

  const createRental = async (item: RentalAd) => {
    try {
      await ContentAPI.createRental(projectName, item)
      await fetchRentals()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const updateRental = async (id: string, item: RentalAd) => {
    try {
      await ContentAPI.updateRental(projectName, id, item)
      await fetchRentals()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const deleteRental = async (id: string) => {
    try {
      await ContentAPI.deleteRental(projectName, id)
      await fetchRentals()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return { rentals, loading, error, createRental, updateRental, deleteRental, refresh: fetchRentals }
}

// Hook for managing job postings with backend API
export function useJobs(projectName: string) {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ContentAPI.getJobs(projectName)
      setJobs(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch jobs')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [projectName])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const createJob = async (item: JobPosting) => {
    try {
      await ContentAPI.createJob(projectName, item)
      await fetchJobs()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const updateJob = async (id: string, item: JobPosting) => {
    try {
      await ContentAPI.updateJob(projectName, id, item)
      await fetchJobs()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await ContentAPI.deleteJob(projectName, id)
      await fetchJobs()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return { jobs, loading, error, createJob, updateJob, deleteJob, refresh: fetchJobs }
}
