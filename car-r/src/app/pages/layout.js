"use client"
import React from "react";
import { useRouter } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css";     // theme
import "primereact/resources/primereact.css";                       // core css
import "primeicons/primeicons.css";                                // icons
import "primeflex/primeflex.css";                                 // primeflex
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";

// ...existing code...


const Header = () => {
  const router = useRouter();

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-fw pi-home',
      command: () => router.push('/pages/cars')
    },
    {
      label: 'Users',
      icon: 'pi pi-fw pi-users',
      command: () => router.push('/pages/users')
    },
    {
      label: 'Bookings',
      icon: 'pi pi-fw pi-calendar',
      command: () => router.push('/pages/bookings')
    }
  ];

  const start = (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-car text-3xl" />
      <span className="text-xl font-bold">Car Rental</span>
    </div>
  );

  const end = (
    <Button 
      label="Logout" 
      icon="pi pi-power-off" 
      severity="danger" 
      onClick={() => router.push('/')}
    />
  );

  return (
    <div className="card">
      <Menubar 
        model={items} 
        start={start} 
        end={end}
        className="surface-card shadow-2 border-none"
      />
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-column">
      <Header />
      <main className="flex-grow-1 p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;