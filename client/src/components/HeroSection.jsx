import React from 'react'
import isAuthenticated from "../store/authSlice"
import { useSelector } from 'react-redux'
import { Button } from './ui/button'
import brokenMobile from "../assets/broken-mobile.png"
import { Link } from 'react-router-dom'

const HeroSection = () => {
    const { user } = useSelector(state => state.auth)
    return (
        <div className='h-[89.5vh] overflow-hidden w-full relative bg-zinc-900'>
            <div className="">
                {/* <div className="w-[800px] rotate-10 absolute left-[50%] -translate-x-[50%] -bottom-40 right-0">
                    <img src={brokenMobile} className='w-full h-full object-contain opacity-50' alt="broken-mobile" />
                </div> */}
                <div className="w-full h-full absolute bottom-0 left-0 bg-linear-to-t from-zinc-900 to-transparent"></div>
            </div>
        </div>
    )
}

export default HeroSection