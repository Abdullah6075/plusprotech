import React from 'react'

const AboutSection = () => {
    return (
        <section id="about" className='container'>
            <div className="flex flex-col md:grid grid-cols-12 pt-28 md:gap-6 gap-2">
                <div className="col-span-2 text-md text-gray-800 tracking-tight">
                    ● About Us
                </div>

                <div className="col-span-10 flex flex-col gap-6">
                    <p className='text-gray-700 md:text-2xl text-lg font-light tracking-tight'>
                    We promise customer satisfaction with our high-quality repairs and sales. Our prices are fair and competitive with others in the area. We ensure broken cellphones, tablets and PCs don’t keep you separated for long. Your device is valuable for you We know that! <br />Let us bring your device back to life.
                    </p>
                    <div className="grid sm:grid-cols-3 grid-cols-2 gap-6 py-10">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <p className='md:text-5xl text-3xl font-medium tracking-tight'>20+</p>
                            <p className='text-gray-700 text-center text-sm tracking-tight'>Years of Experience</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                            <p className='md:text-5xl text-3xl font-medium tracking-tight'>2,354+</p>
                            <p className='text-gray-700 text-center text-sm tracking-tight'>Gadgets Fixed</p>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                            <p className='md:text-5xl text-3xl font-medium tracking-tight'>1,689+</p>
                            <p className='text-gray-700 text-center text-sm tracking-tight'>Satisfied Customers</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection