import { useEffect, useState } from "react";
import { axiosInstance } from "../api/apis";

function usePaginatedFetchData(url: string, initialPageSize: number = 5) {
    const [data, setData] = useState<any[] | null>(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [nextData, setNextData] = useState<any[] | null>(null)
    const [previousData, setPreviousData] = useState<any[] | null>(null)
    const [count, setCount] = useState<number>(0)
    const [pageSize, setPageSize] = useState(initialPageSize);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${url}/${currentPage}/${pageSize}`);
            console.log(response.data)
            const nextPage = currentPage + 1
            const previousPage = currentPage - 1
            if (previousPage < 1) {
                setPreviousData(null)
            } else {
                const previousResponse = await axiosInstance.get(`${url}/${previousPage}/${pageSize}`)
                setPreviousData(previousResponse.data.data)
            }
            const nextResponse = await axiosInstance.get(`${url}/${nextPage}/${pageSize}`)
            setData(response.data.data);
            setCount(response.data.count)
            setNextData(nextResponse.data.data)
            setError(false);
        } catch (error) {
            setError(true);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced pagination functions
    const goToPage = (page: number) => {
        if (page >= 1 && page <= Math.ceil(count / pageSize)) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        if (nextData && nextData.length > 0) {
            setCurrentPage(current => current + 1);
        }
    };

    const previousPage = () => {
        if (previousData && previousData.length > 0) {
            setCurrentPage(current => current - 1);
        }
    };

    const changePageSize = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize]);

    const totalPages = Math.ceil(count / pageSize);
    const hasNextPage = nextData && nextData.length > 0;
    const hasPreviousPage = previousData && previousData.length > 0;

    return { 
        data, 
        currentPage, 
        setCurrentPage, 
        nextData, 
        previousData, 
        count, 
        loading, 
        error, 
        refetch: fetchData,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        changePageSize
    };
}

export { usePaginatedFetchData };