"use client"
import React, { useState } from 'react'
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils.user';
import { userLogout } from '@/api/userLogin';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAppDispatch, useAppSelector } from '@/redux/hooks/redux.hooks';
import { clearAuth } from '@/redux/actions/authSlice';


const Logout = () => {
    const userName = useAppSelector((state) => state.auth.name);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const handleLogout = () => {
        userLogout()
            .then((res) => {
                router.replace('/login');
                dispatch(clearAuth());
            })
            .catch((err) => { console.log(err) })
    }
    return (
        <div className=' flex flex-row items-center gap-2'>
            <div className=" flex flex-row items-center gap-2">
                <div className="font-semibold bg-gray-400 px-1.5 py-1 rounded-full text-white">{getInitials(userName??'')}</div>
                <span className="font-medium">{userName}</span>
            </div>
            <Button className="bg-gray-200 rounded-xl hover:bg-gray-300" onClick={handleLogout}>
                <LogOut size={20} className='text-black' />
            </Button>
        </div>
    )
}

export default Logout