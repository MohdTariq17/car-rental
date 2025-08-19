// Example Header component using PrimeFlex and PrimeReact
import React from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';

export default function Header() {
    return (
        <header className="surface-0 shadow-2 p-3 flex align-items-center justify-content-between">
            {/* Left: Logo & Title */}
            <div className="flex align-items-center">
                <Avatar icon="pi pi-car" shape="circle" className="mr-2" />
                <span className="font-bold text-xl">Car Rental</span>
            </div>
            {/* Right: User Avatar & Logout Button */}
            <div className="flex align-items-center gap-2">
                <Avatar label="U" shape="circle" className="bg-primary text-white" />
                <Button label="Logout" icon="pi pi-sign-out" className="p-button-text" />
            </div>
        </header>
    );
}