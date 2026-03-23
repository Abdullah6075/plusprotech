import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetCategoryByIdQuery } from '../services/categoryApi';
import { useGetBrandsByCategoryQuery } from '../services/brandApi';
import { ChevronRight, ArrowLeft, Tag } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

const BrandCard = ({ brand, categoryId }) => {
    const initial = brand.name.charAt(0).toUpperCase();
    const imageUrl = getImageUrl(brand.image);

    return (
        <Link
            to={`/category/${categoryId}/brand/${brand._id}`}
            className="group bg-white border border-gray-100 hover:border-[#EC4421]/30 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
            {/* Brand image or initial placeholder */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 shrink-0 relative">
                <span className="text-4xl font-bold text-[#EC4421]">{initial}</span>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={brand.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                )}
            </div>

            {/* Brand name */}
            <div className="text-center">
                <p className="text-base font-bold tracking-tight text-gray-800">{brand.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">View models →</p>
            </div>

            {/* Hover indicator */}
            <div className="flex items-center gap-1 text-[#EC4421] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Select</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </div>
        </Link>
    );
};

const BrandsByCategory = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { data: categoryData, isLoading: isCategoryLoading } = useGetCategoryByIdQuery(categoryId);
    const { data: brandsData, isLoading: isBrandsLoading } = useGetBrandsByCategoryQuery(categoryId);

    const category = categoryData?.data?.category;
    const brands = brandsData?.data?.brands || [];
    const isLoading = isCategoryLoading || isBrandsLoading;
    const categoryImageUrl = getImageUrl(category?.image);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header banner */}
            <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-900">
                {categoryImageUrl && (
                    <img
                        src={categoryImageUrl}
                        alt={category?.name}
                        className="w-full h-full object-cover opacity-40"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-gray-900/40" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EC4421]" />

                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-white">{isLoading ? '...' : category?.name}</span>
                    </div>

                    {/* Heading */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Select Brand</span>
                        <h1 className="text-white text-3xl sm:text-4xl font-bold tracking-tight">
                            {isLoading ? 'Loading...' : category?.name}
                        </h1>
                        <p className="text-white/55 text-sm">Choose the brand of your device to see available models</p>
                    </div>
                </div>
            </div>

            {/* Back button + content */}
            <div className="container py-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#EC4421] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
                                <div className="w-24 h-24 rounded-2xl bg-gray-100" />
                                <div className="w-20 h-4 rounded bg-gray-100" />
                            </div>
                        ))}
                    </div>
                ) : brands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 bg-[#EC4421]/10 rounded-2xl flex items-center justify-center text-[#EC4421]">
                            <Tag className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No brands available yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            No brands have been added for this category yet. Please check back later or contact us.
                        </p>
                        <Link
                            to="/"
                            className="mt-2 bg-[#EC4421] hover:bg-[#c93519] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 mb-6">
                            {brands.length} brand{brands.length !== 1 ? 's' : ''} available in <span className="font-semibold text-gray-700">{category?.name}</span>
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {brands.map((brand) => (
                                <BrandCard key={brand._id} brand={brand} categoryId={categoryId} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BrandsByCategory;
