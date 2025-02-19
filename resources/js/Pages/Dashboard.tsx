import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// 🟡 กำหนด Type ของ Transaction
interface Transaction {
    id: number;
    category: string;
    icon: string;
    description: string;
    amount: number;
    date: string;
    created_at?: string;
    timestamp: number;
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    // ✅ โหลดข้อมูลธุรกรรม
    const fetchTransactions = async () => {
        console.log("🔄 กำลังโหลดข้อมูลธุรกรรม...");
        try {
            const response = await fetch("/transactions");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log("✅ รายการธุรกรรมที่โหลดมา:", data);

            const transactions = (data.transactions || []).map((t: Transaction) => {
                let transactionDate = t.created_at && !isNaN(Date.parse(t.created_at))
                    ? new Date(t.created_at)
                    : (t.date && !isNaN(Date.parse(t.date)) ? new Date(t.date) : null);

                return {
                    ...t,
                    amount: Number(t.amount) || 0, // ✅ แปลงให้แน่ใจว่าเป็นตัวเลข
                    date: transactionDate ? transactionDate.toISOString().split("T")[0] : "Invalid Date",
                    timestamp: transactionDate ? transactionDate.getTime() : 0
                };
            }).sort((a: Transaction, b: Transaction) => b.timestamp - a.timestamp);

            console.log("🔢 Transactions (หลังจากแปลงค่า):", transactions); // ✅ Debug ดูค่า

            setTransactions(transactions);

            // ✅ คำนวณรายรับ
            const income = transactions
                .filter((t: Transaction) => t.amount > 0)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            // ✅ คำนวณรายจ่าย
            const expense = transactions
                .filter((t: Transaction) => t.amount < 0)
                .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

            console.log("💰 รายรับ:", income, "💸 รายจ่าย:", expense); // ✅ Debug ดูค่า

            // ✅ อัปเดตค่าตัวแปร
            setTotalIncome(income);
            setTotalExpense(expense);
            setTotalBalance(income - expense);

        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการโหลดธุรกรรม:", error);
        }
    };





    // ✅ โหลดข้อมูลเมื่อเปิดหน้า และอัปเดตเมื่อมีการเพิ่มธุรกรรม
    useEffect(() => {
        fetchTransactions();

        window.addEventListener("transactionAdded", fetchTransactions);
        return () => window.removeEventListener("transactionAdded", fetchTransactions);
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* 🔹 Navbar ด้านบน */}
            <div className="bg-amber-500 text-white p-4 flex justify-between items-center shadow-md">
                <button className="text-white text-xl">🔍</button>
                <h2 className="text-lg font-semibold">บัญชีของฉัน</h2>
                <Link href="/details" className="bg-white text-amber-500 px-3 py-1 rounded-lg shadow">
                    รายละเอียด
                </Link>
            </div>

            {/* 🔹 เปลี่ยนสีพื้นหลังของหน้า */}
            <div className="min-h-screen bg-amber-100 p-4">

            <div className="flex flex-col items-center justify-center text-lg font-semibold">
                {/* ✅ ฝั่งขวา: รายได้ + ค่าใช้จ่าย */}
                <div className="flex justify-between w-full px-8">
                    <div className="text-left">
                        <p className="text-gray-500 text-sm">รายได้</p>
                        <p className="text-green-500 font-bold text-xl">+฿{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-sm">ค่าใช้จ่าย</p>
                        <p className="text-red-500 font-bold text-xl">-฿{Math.abs(totalExpense).toLocaleString()}</p>
                    </div>
                </div>

                {/* ✅ ยอดรวมปัจจุบัน ให้อยู่ตรงกลาง */}
                <div className="mt-4 text-center w-full">
                    <p className="text-gray-700 text-sm">ยอดรวมปัจจุบัน</p>
                    <p className={totalBalance >= 0 ? "text-green-500 text-3xl font-bold" : "text-red-500 text-3xl font-bold"}>
                        {totalBalance >= 0 ? `+฿${totalBalance.toLocaleString()}` : `-฿${Math.abs(totalBalance).toLocaleString()}`}
                    </p>
                </div>
            </div>


                {/* 🔹 รายการธุรกรรมล่าสุด */}
                <div className="bg-white mx-4 my-4 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">รายการธุรกรรมล่าสุด</h3>
                    <div className="mt-2">
                        {transactions.length > 0 ? (
                            transactions.reduce((acc: JSX.Element[], transaction, index) => {
                                // 🟡 แปลงวันที่ให้เป็นรูปแบบไทย
                                const transactionDate = new Date(transaction.date).toLocaleDateString("th-TH", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                });

                                // 🟡 เช็คว่าต้องเพิ่มหัวข้อวันใหม่หรือไม่
                                if (index === 0 || transactions[index - 1].date !== transaction.date) {
                                    acc.push(
                                        <h4 key={`date-${transaction.date}`} className="text-md font-bold text-gray-600 mt-4">
                                            {transactionDate}
                                        </h4>
                                    );
                                }

                                // 🟡 แสดงรายการธุรกรรม
                                acc.push(
                                    <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                                        <div className="flex items-center">
                                            <span className="text-xl">{transaction.icon || "💰"}</span>
                                            <div className="ml-3">
                                                <p className="font-semibold text-gray-800">{transaction.category || "หมวดหมู่"}</p>
                                                <p className="text-gray-500 text-sm">{transaction.description || "ไม่มีรายละเอียด"}</p>
                                            </div>
                                        </div>
                                        <span className={`text-${transaction.amount > 0 ? "green" : "red"}-500`}>
                                            {transaction.amount > 0 ? `+฿${Number(transaction.amount).toFixed(2)}` : `-฿${Math.abs(Number(transaction.amount)).toFixed(2)}`}
                                        </span>
                                    </div>
                                );

                                return acc;
                            }, [])
                        ) : (
                            <p className="text-center text-gray-500">ไม่มีธุรกรรมที่แสดง</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Floating Button (ปุ่มลอย) สำหรับเพิ่มธุรกรรม */}
            <Link href="/transactions/add" className="fixed bottom-16 right-4 bg-amber-500 p-4 rounded-full shadow-lg">
                ✏️
            </Link>
        </AuthenticatedLayout>
    );
}
