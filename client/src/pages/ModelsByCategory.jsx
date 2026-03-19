import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetCategoryByIdQuery } from '../services/categoryApi';
import { useGetBrandByIdQuery } from '../services/brandApi';
import { useGetModelsQuery } from '../services/modelApi';
import { ChevronRight, ArrowLeft, Smartphone, Calendar } from 'lucide-react';
import PaginationControls from '../components/PaginationControls';
import { getImageUrl } from '../lib/utils';

const ITEMS_PER_PAGE = 12;

const ModelsByCategory = () => {
    const { categoryId, brandId } = useParams();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const { data: categoryData, isLoading: categoryLoading } = useGetCategoryByIdQuery(categoryId);
    const { data: brandData, isLoading: brandLoading } = useGetBrandByIdQuery(brandId);
    const { data: modelsData, isLoading: modelsLoading } = useGetModelsQuery({
        categoryId,
        brandId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const category = categoryData?.data?.category;
    const brand = brandData?.data?.brand;
    const models = modelsData?.data?.models || [];
    const pagination = modelsData?.data?.pagination || {};
    const isLoading = categoryLoading || brandLoading || modelsLoading;

    const categoryImageUrl = getImageUrl(category?.image);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header banner */}
            <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-900">
                {categoryImageUrl && (
                    <img
                        src={categoryImageUrl}
                        alt={category?.name}
                        className="w-full h-full object-cover opacity-35"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 to-gray-900/40" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EC4421]" />

                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-white/55 text-xs flex-wrap">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <Link to={`/category/${categoryId}`} className="hover:text-white transition-colors">
                            {isLoading ? '...' : category?.name}
                        </Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white">{isLoading ? '...' : brand?.name}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Select Your Model</span>
                        <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">
                            {isLoading ? 'Loading...' : `${brand?.name} ${category?.name}`}
                        </h1>
                        <p className="text-white/55 text-sm">Choose your device model to view available repair services</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#EC4421] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to brands
                </button>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-44 bg-gray-100" />
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                                    <div className="h-9 bg-gray-100 rounded-full mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : models.length === 0 && currentPage === 1 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 bg-[#EC4421]/10 rounded-2xl flex items-center justify-center text-[#EC4421]">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No models found</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            No models available for <strong>{brand?.name}</strong> in <strong>{category?.name}</strong> yet.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-2 bg-[#EC4421] hover:bg-[#c93519] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                        >
                            Back to Brands
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-6">
                            {pagination.totalItems ?? models.length} model{(pagination.totalItems ?? models.length) !== 1 ? 's' : ''} found for <span className="font-semibold text-gray-700">{brand?.name} {category?.name}</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {models.map((model) => (
                                <div key={model._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                                    <div className="h-44 bg-white overflow-hidden relative flex items-center justify-center">
                                        <Smartphone className="w-12 h-12 text-gray-200" />
                                        {getImageUrl(model.image) && (
                                            <img
                                                src={getImageUrl(model.image)}
                                                alt={model.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col gap-3">
                                        <p className="font-semibold text-gray-800 tracking-tight">{model.name}</p>
                                        <button
                                            onClick={() => navigate(`/model/${model._id}/services?categoryId=${categoryId}`)}
                                            className="w-full bg-[#EC4421] hover:bg-[#c93519] text-white py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#EC4421]/20"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Schedule Service
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="mt-10">
                                <PaginationControls
                                    currentPage={pagination.currentPage || currentPage}
                                    totalPages={pagination.totalPages || 1}
                                    totalItems={pagination.totalItems || 0}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ModelsByCategory;
