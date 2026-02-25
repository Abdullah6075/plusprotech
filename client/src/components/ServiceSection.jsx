import { useGetCategoriesQuery } from '@/services/categoryApi'
import { useGetServicesQuery } from '@/services/serviceApi'
import React from 'react'
import { Link } from 'react-router-dom'

const ServiceSection = () => {
    const { data, isLoading, error } = useGetCategoriesQuery()
    const categories = data?.data?.categories || []
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        const baseUrl = BASE_URL.endsWith('/api')
          ? BASE_URL.slice(0, -4)
          : BASE_URL;
        return `${baseUrl}${imagePath}`;
      };
    return (
        <section id="services" className='container flex flex-col gap-10 pt-36'>
            <div className="flex flex-col md:flex-row justify-between md:items-center items-start gap-2">
                <p className='md:text-5xl text-3xl tracking-tight'>Services</p>
                <p className='text-xs font-light tracking-tight max-w-sm'>We fix all kinds of tech products including smartphones, tablets, laptops, desktops, and more. Whether it’s a cracked screen or a software issue, we’re here to help you get your devices running smoothly again.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    categories?.map((category, index) => {
                        return (
                            <Link to={`/category/${category?._id}`} className="w-full">
                                <div className="w-full sm:h-98 h-64 overflow-hidden rounded-2xl">
                                    <img 
                                        src={getImageUrl(category?.image)} 
                                        loading="lazy" 
                                        decoding="async"
                                        alt={category?.name || "Service category"}
                                        width="400"
                                        height="400"
                                        className='w-full h-full object-cover hover:scale-105 transition-all duration-500' 
                                    />
                                </div>
                                <p className='text-lg tracking-tight py-2'>{category?.name|| "Name not found"}</p>
                            </Link>
                        )
                    })
                }
            </div>
        </section>
    )
}

export default ServiceSection