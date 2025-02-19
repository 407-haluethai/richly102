import { Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { usePage } from "@inertiajs/react";

export default function Home() {
    useEffect(() => {
        window.location.href = "/register";
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-amber-50">
            <Head title="ยินดีต้อนรับ" />
            <p className="text-xl text-gray-700">กำลังนำทางไปยังหน้าสมัครสมาชิก...</p>
        </div>
    );
}
