import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from './providers/StoreProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CarRental Pro - Your Trusted Car Rental Platform",
  description: "Professional car rental management system with multi-role authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
