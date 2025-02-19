import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-amber-100 p-10">
            <Head title="เข้าสู่ระบบ" />

            {/* ส่วนต้อนรับ */}
            <div className="md:w-1/2 text-center md:text-left pr-10 border-r border-brown-500">
                <h1 className="text-5xl font-extrabold text-brown-800 drop-shadow-lg">
                    ยินดีต้อนรับสู่ <span className="text-amber-700">Richly!</span>
                </h1>
                <p className="text-2xl text-gray-800 mt-4 leading-relaxed">
                    ระบบบันทึกรายรับ-รายจ่ายของคุณ <br />ง่ายและสะดวก
                </p>
                <p className="text-xl text-gray-700 mt-6">
                    ยังไม่มีบัญชีใช่ไหม?{" "}
                    <Link
                        href="/register"
                        className="text-amber-700 font-semibold hover:text-brown-800"
                    >
                        สมัครสมาชิกที่นี่
                    </Link>
                </p>
            </div>

            {/* ส่วนล็อกอิน */}
            <div className="md:w-1/2 bg-white p-12 rounded-2xl shadow-2xl max-w-xl border border-brown-500 mt-10 md:mt-0">
                {/* โลโก้ */}
                <div className="flex justify-center mb-6">
                    <img src="/images/dino.webp" alt="Richly Logo" className="w-44 h-44 shadow-lg rounded-full" />
                </div>

                <h2 className="text-3xl font-bold text-center text-brown-800 mb-6">
                    เข้าสู่ระบบ
                </h2>

                {status && (
                    <div className="mb-4 text-lg font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
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

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                                className="h-4 w-4 border-gray-400 rounded text-brown-700 focus:ring-amber-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">จดจำฉัน</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-sm text-gray-600 underline hover:text-brown-800"
                            >
                                ลืมรหัสผ่าน?
                            </Link>
                        )}
                    </div>

                        <button
                                type="submit"
                                className="w-full bg-amber-500 text-white font-semibold text-xl py-3 rounded-lg shadow-md ring-2 ring-amber-300 hover:bg-amber-600 transition"
                                disabled={processing}
                            >
                                เข้าสู่ระบบ
                        </button>

                </form>
            </div>
        </div>
    );
}
