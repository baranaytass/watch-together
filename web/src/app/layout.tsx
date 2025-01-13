import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Together',
    description: 'Watch videos together with friends',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
} 