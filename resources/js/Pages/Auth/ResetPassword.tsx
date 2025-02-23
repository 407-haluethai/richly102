import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-amber-100 p-10">
            <Head title="สมัครสมาชิก" />

            {/* ส่วนต้อนรับ */}
            <div className="md:w-1/2 text-center md:text-left pr-10 border-r border-brown-500">
                <h1 className="text-5xl font-extrabold text-brown-800 drop-shadow-lg">
                    ยินดีต้อนรับสู่ <span className="text-amber-700">Richly!</span>
                </h1>
                <p className="text-2xl text-gray-800 mt-4 leading-relaxed">
                    ระบบบันทึกรายรับ-รายจ่ายของคุณ <br />ง่ายและสะดวก
                </p>
                <p className="text-xl text-gray-700 mt-6">
                    มีบัญชีแล้วใช่ไหม?{" "}
                    <Link
                        href="/login"
                        className="text-amber-700 font-semibold hover:text-brown-800"
                    >
                        ล็อกอินที่นี่
                    </Link>
                </p>
            </div>

            {/* ส่วนสมัครสมาชิก */}
            <div className="md:w-1/2 bg-white p-12 rounded-2xl shadow-2xl max-w-xl border border-brown-500 mt-10 md:mt-0">
                {/* โลโก้ */}
                <div className="flex justify-center mb-6">
                    <img src="/images/dino.webp" alt="Richly Logo" className="w-44 h-44 shadow-lg rounded-full" />
                </div>

                <h2 className="text-3xl font-bold text-center text-brown-800 mb-6">
                    สมัครสมาชิก
                </h2>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-900 text-xl">
                            ชื่อ
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full p-3 border border-gray-400 rounded-lg text-lg focus:ring-2 focus:ring-amber-600"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block font-medium text-gray-900 text-xl">
                            อีเมล
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="w-full p-3 border border-gray-400 rounded-lg text-lg focus:ring-2 focus:ring-amber-600"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block font-medium text-gray-900 text-xl">
                            รหัสผ่าน
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            className="w-full p-3 border border-gray-400 rounded-lg text-lg focus:ring-2 focus:ring-amber-600"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block font-medium text-gray-900 text-xl">
                            ยืนยันรหัสผ่าน
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData("password_confirmation", e.target.value)}
                            className="w-full p-3 border border-gray-400 rounded-lg text-lg focus:ring-2 focus:ring-amber-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-amber-500 text-white font-semibold text-xl py-3 rounded-lg shadow-md ring-2 ring-amber-300 hover:bg-amber-600 transition"
                        disabled={processing}
                    >
                        สมัครสมาชิก
                    </button>
                </form>
            </div>
        </div>
    );
}
