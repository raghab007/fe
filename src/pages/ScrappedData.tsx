import { useRef, useState } from "react";
import { usePaginatedFetchData } from "../hooks/user";
import { axiosInstance } from "../api/apis";
import { useToast } from "../components/Toast";
import { TableSkeleton, LoadingOverlay } from "../components/LoadingStates";

function ScrappedData() {
    const { 
        data, 
        currentPage, 
        count, 
        loading, 
        error, 
        refetch,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        changePageSize
    } = usePaginatedFetchData('/web', 10);

    const searchRef = useRef<HTMLInputElement>(null)
    const [webLoading, setWebLoading] = useState(false);
    const { showToast } = useToast();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-6"></div>
                        <div className="h-12 bg-gray-200 rounded-full animate-pulse max-w-md mx-auto mb-6"></div>
                    </div>
                    <TableSkeleton rows={6} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow border border-gray-200 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-4">Unable to load scraped data. Please try again later.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }


    async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && searchRef.current) {
            const query = searchRef.current.value.trim();
            if (!query) {
                showToast('Please enter a search query', 'warning');
                return;
            }
            
            setWebLoading(true);
            try {
                const response = await axiosInstance.post("/web/" + encodeURIComponent(query));
                console.log(response);
                showToast('Data scraped successfully!', 'success');
                refetch();
            } catch (error: any) {
                console.error('Scraping error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to scrape data. Please try again.';
                showToast(errorMessage, 'error');
            } finally {
                setWebLoading(false);
            }
        }
    };

    const handleSearchClick = async () => {
        if (searchRef.current) {
            const query = searchRef.current.value.trim();
            if (!query) {
                showToast('Please enter a search query', 'warning');
                return;
            }
            
            setWebLoading(true);
            try {
                const response = await axiosInstance.post("/web/" + encodeURIComponent(query));
                console.log(response);
                showToast('Data scraped successfully!', 'success');
                refetch();
            } catch (error: any) {
                console.error('Scraping error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to scrape data. Please try again.';
                showToast(errorMessage, 'error');
            } finally {
                setWebLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Web Scraper</h1>
                    <p className="text-gray-600">Search and scrape data from the web</p>
                </div>

                {/* Loading Overlay */}
                {webLoading && (
                    <LoadingOverlay message="Scraping Data" />
                )}

                {/* Search Interface */}
                <div className="mb-8">
                    <div className="relative flex items-center w-full max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder={webLoading ? "Loading..." : "What do you want to scrape and add to the database?"}
                            className="flex-grow py-4 px-6 pr-16 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            ref={searchRef}
                            onKeyDown={handleKeyDown}
                            disabled={webLoading}
                        />
                        <button
                            onClick={handleSearchClick}
                            disabled={webLoading}
                            className="absolute right-0 top-0 h-full px-6 flex items-center justify-center bg-blue-600 text-white rounded-r-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                        >
                            {webLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-3">
                        Press Enter or click the search button to start scraping
                    </p>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover-lift">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">
                                Scraped Data Results
                            </h2>
                            {data && data.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {count} results found
                                </span>
                            )}
                        </div>
                    </div>


                    {data && data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Link
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data?.map((d: any) => (
                                        <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <span className="text-white font-medium text-sm">
                                                                {d.title.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {d.title}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    {d.price || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a 
                                                    href={"https://www.amazon.in"+d.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900 mb-2">No Data Found</h3>
                            <p className="text-gray-500 mb-4">Start by searching for data to scrape from the web.</p>
                            <p className="text-sm text-gray-400">Enter your search query above and press Enter or click the search button.</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination */}
        {data && data.length > 0 && (
            <div className="mt-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 px-6 py-4">
                    {/* Page Size Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="pageSize" className="text-sm text-gray-700">Show:</label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(e) => changePageSize(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-700">per page</span>
                        </div>
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * pageSize, count)}</span> of{' '}
                            <span className="font-medium">{count}</span> results
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Mobile View */}
                        <div className="flex justify-between items-center sm:hidden">
                            <button
                                onClick={previousPage}
                                disabled={!hasPreviousPage}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                                    !hasPreviousPage 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                            <div className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                            </div>
                            <button
                                onClick={nextPage}
                                disabled={!hasNextPage}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md transition-colors ${
                                    !hasNextPage 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                Next
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
                            {/* Go to Page Input */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Go to page:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const page = Number(e.target.value);
                                        if (page >= 1 && page <= totalPages) {
                                            goToPage(page);
                                        }
                                    }}
                                    className="border border-gray-300 rounded-md px-2 py-1 text-sm w-16 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">of {totalPages}</span>
                            </div>

                            {/* Navigation Buttons */}
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium transition-colors ${
                                        currentPage === 1 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={previousPage}
                                    disabled={!hasPreviousPage}
                                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                                        !hasPreviousPage 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={nextPage}
                                    disabled={!hasNextPage}
                                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium transition-colors ${
                                        !hasNextPage 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium transition-colors ${
                                        currentPage === totalPages 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
                )}
            </div>
        </div>
    );
}

export { ScrappedData }