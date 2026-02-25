import React from 'react'
import processImage from "../assets/process-image.jpg"

const ProcessSection = () => {
  return (
    <div className='container flex flex-col justify-center items-center pt-36 gap-16'>
      <div className="flex flex-col justify-center items-center gap-2 text-center">
        <p className='md:text-5xl text-3xl tracking-tight'>Our Working Proccess</p>
        <p className='md:text-md text-sm font-light tracking-tight max-w-xl'>We follow clear steps to ensure everything gets done right. Our process is designed to keep you informed and satisfied throughout.</p>
      </div>
      <div className="flex flex-col-reverse sm:grid grid-cols-4 w-full min-h-128">
        <div className="w-full sm:border-r border-b p-4 flex flex-col gap-1 justify-start">
          <p className='text-xl tracking-tight'>Make an Appointment</p>
          <p className='text-sm font-light tracking-tight'>Your time is Precious! So Plus ProTech provide customers the facility to schedule their desired time for respairing services.</p>
        </div>
        <div className="w-full sm:border-r border-b p-4 flex flex-col gap-1 justify-center">
          <p className='text-xl tracking-tight'>Proficient Technitians</p>
          <p className='text-sm font-light tracking-tight'>Our capable experts can address any particular requests that you may have about your devices and can give exact information about any of our fix measures.</p>
        </div>
        <div className="w-full sm:border-r border-b p-4 flex flex-col gap-1 justify-end">
          <p className='text-xl tracking-tight'>Your Gadget Fixed</p>
          <p className='text-sm font-light tracking-tight'>Your mobile phone is prior to you We understand that! At Plus ProTech most fixes are done in under 30 minutes. We guarantee broken cellphones, tablets and PCs don’t keep you isolated for long</p>
        </div>
        <div className="w-full sm:h-full h-64 rounded-2xl overflow-hidden">
          <img
            src={processImage}
            loading="lazy"
            decoding="async"
            alt="Our working process"
            width="800"
            height="600"
            className='w-full h-full object-cover'
          />
        </div>
      </div>
    </div>
  )
}

export default ProcessSection