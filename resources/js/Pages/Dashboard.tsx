import { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown";
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
    const { auth } = usePage().props;
    const userId = auth.user.id;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);

    //ป๊อบอัพยืนยันลบ
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTransactionId, setDeleteTransactionId] = useState<
        number | null
    >(null);

    // เพิ่มPopup
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    const openPopup = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const closePopup = () => {
        setSelectedTransaction(null);
    };
    // ✅ แสดงป๊อบอัพยืนยันการลบ
    const confirmDelete = (id: number) => {
        setDeleteTransactionId(id);
        setShowDeleteConfirm(true);
    };

    // State สำหรับแก้ไขรายการ
    const [isEditing, setIsEditing] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(
        null
    );

    const startEditing = () => {
        setIsEditing(true);
        setEditTransaction(selectedTransaction);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditTransaction(null);
    };

    // ✅ ลบธุรกรรม
    const handleDelete = async () => {
        if (!deleteTransactionId) return;

        try {
            console.log("🔄 กำลังลบธุรกรรม ID:", deleteTransactionId);

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(
                `/transactions/${deleteTransactionId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken || "",
                    },
                    credentials: "same-origin",
                }
            );

            if (response.ok) {
                console.log("✅ ลบธุรกรรมสำเร็จ");
                closePopup();
                fetchTransactions();
            } else {
                console.error("❌ ลบไม่สำเร็จ", await response.text());
            }
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการลบธุรกรรม:", error);
        }

        setShowDeleteConfirm(false); // ปิดป๊อบอัพหลังจากลบ
    };

    // ✅ อัปเดตรายการ
    const handleUpdate = async () => {
        if (!editTransaction) return;

        try {
            console.log("🔄 กำลังอัปเดตรายการ:", editTransaction);

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(
                `/transactions/${editTransaction.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken || "",
                    },
                    credentials: "same-origin",
                    body: JSON.stringify(editTransaction),
                }
            );

            if (response.ok) {
                console.log("✅ อัปเดตรายการสำเร็จ");
                closePopup();
                fetchTransactions();
            } else {
                console.error("❌ อัปเดตไม่สำเร็จ", await response.text());
            }
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาดในการอัปเดตรายการ:", error);
        }

        setIsEditing(false);
    };

    // ✅ โหลดข้อมูลธุรกรรม
    const fetchTransactions = async () => {
        console.log("🔄 กำลังโหลดข้อมูลธุรกรรม...");
        try {
            const response = await fetch(`/transactions?user_id=${userId}`);
            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            console.log("✅ รายการธุรกรรมที่โหลดมา:", data);

            const transactions = (data.transactions || [])
                .map((t: Transaction) => {
                    let transactionDate =
                        t.created_at && !isNaN(Date.parse(t.created_at))
                            ? new Date(t.created_at)
                            : t.date && !isNaN(Date.parse(t.date))
                            ? new Date(t.date)
                            : null;

                    return {
                        ...t,
                        amount: Number(t.amount) || 0,
                        date: transactionDate
                            ? transactionDate.toISOString().split("T")[0]
                            : "Invalid Date",
                        timestamp: transactionDate
                            ? transactionDate.getTime()
                            : 0,
                        category: t.category || "ไม่ระบุหมวดหมู่",
                        icon: t.icon || "❓", // ✅ ใช้ `icon` จาก API
                    };
                })
                .sort(
                    (a: Transaction, b: Transaction) =>
                        b.timestamp - a.timestamp
                );

            console.log("🔢 Transactions (หลังจากแปลงค่า):", transactions); // ✅ Debug ดูค่า

            setTransactions(transactions);

            // ✅ คำนวณรายรับ
            const income = transactions
                .filter((t: Transaction) => t.amount > 0)
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            // ✅ คำนวณรายจ่าย
            const expense = transactions
                .filter((t: Transaction) => t.amount < 0)
                .reduce(
                    (sum: number, t: Transaction) => sum + Math.abs(t.amount),
                    0
                );

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
        if (userId) {
            // ✅ โหลดเมื่อ userId มีค่า
            fetchTransactions();
            window.addEventListener("transactionAdded", fetchTransactions);
            return () =>
                window.removeEventListener(
                    "transactionAdded",
                    fetchTransactions
                );
        }
    }, [userId]); // ✅ โหลดใหม่เมื่อ userId เปลี่ยน

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

        {/* 🔹 ส่วนหัวของหน้า */}
        <div className="bg-amber-500 text-white p-4 flex justify-between items-center shadow-md">
            <button className="text-white text-xl">🔍</button>
            <h2 className="text-lg font-semibold">บัญชีของฉัน</h2>

            {/* 🔹 ปุ่ม "รายละเอียด" + Dropdown Profile */}
            <div className="flex items-center space-x-4">
                {/* ปุ่ม รายละเอียด */}
                <Link
                    href="/details"
                    className="bg-white text-amber-500 px-3 py-1 rounded-lg shadow"
                >
                    รายละเอียด
                </Link>

                {/*{/* Dropdown Profile */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                            <button
                                type="button"
                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-1 text-sm font-medium text-amber-500 transition duration-150 ease-in-out hover:text-amber-700 focus:outline-none"
                            >
                                {auth.user.name} {/* ✅ ใช้ user.name */}
                                <svg
                                    className="-me-0.5 ms-2 h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </span>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        {/* ✅ แก้ href ให้เป็นพาธตรง ถ้าฟังก์ชัน route() ใช้งานไม่ได้ */}
                        <Dropdown.Link href="/profile/edit">
                            Profile
                        </Dropdown.Link>
                        <Dropdown.Link href="/logout" method="post" as="button">
                            Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </div>


            {/* 🔹 เปลี่ยนสีพื้นหลังของหน้า */}
            <div className="min-h-screen bg-amber-100 p-4">
                <div className="flex flex-col items-center justify-center text-lg font-semibold">
                    {/* ✅ ฝั่งขวา: รายได้ + ค่าใช้จ่าย */}
                    <div className="bg-white rounded-lg shadow-lg p-4 w-full mx-4">
                        <div className="flex justify-between w-full px-8">
                            <div className="text-left">
                                <p className="text-gray-500 text-sm">รายได้</p>
                                <p className="text-green-500 font-bold text-xl">
                                    +฿{totalIncome.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 text-sm">
                                    ค่าใช้จ่าย
                                </p>
                                <p className="text-red-500 font-bold text-xl">
                                    -฿{Math.abs(totalExpense).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* ✅ ยอดรวมปัจจุบัน ให้อยู่ตรงกลาง */}
                        <div className="mt-4 text-center w-full">
                            <p className="text-gray-700 text-sm">
                                ยอดรวมปัจจุบัน
                            </p>
                            <p
                                className={
                                    totalBalance >= 0
                                        ? "text-green-500 text-3xl font-bold"
                                        : "text-red-500 text-3xl font-bold"
                                }
                            >
                                {totalBalance >= 0
                                    ? `+฿${totalBalance.toLocaleString()}`
                                    : `-฿${Math.abs(
                                          totalBalance
                                      ).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🔹 รายการธุรกรรมล่าสุด */}
                <div className="bg-white mx-4 my-4 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">
                        รายการธุรกรรมล่าสุด
                    </h3>
                    <div className="mt-2">
                        {transactions.length > 0 ? (
                            transactions.reduce(
                                (acc: JSX.Element[], transaction, index) => {
                                    // 🟡 แปลงวันที่ให้เป็นรูปแบบไทย
                                    const transactionDate = new Date(
                                        transaction.date
                                    ).toLocaleDateString("th-TH", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    });

                                    // 🟡 เช็คว่าต้องเพิ่มหัวข้อวันใหม่หรือไม่
                                    if (
                                        index === 0 ||
                                        transactions[index - 1].date !==
                                            transaction.date
                                    ) {
                                        acc.push(
                                            <h4
                                                key={`date-${transaction.date}`}
                                                className="text-md font-bold text-gray-600 mt-4"
                                            >
                                                {transactionDate}
                                            </h4>
                                        );
                                    }

                                    // 🟡 แสดงรายการธุรกรรม
                                    acc.push(
                                        <div
                                            key={transaction.id}
                                            className="flex justify-between items-center py-2 border-b cursor-pointer"
                                            onClick={() =>
                                                openPopup(transaction)
                                            } // ✅ ใส่ถูกที่
                                        >
                                            <div className="flex items-center">
                                                {/* ✅ แสดงไอคอนของหมวดหมู่ ถ้าไม่มีให้ใช้ค่าเริ่มต้น */}
                                                <span className="text-2xl">
                                                    {transaction.icon
                                                        ? transaction.icon
                                                        : "❓"}
                                                </span>

                                                <div className="ml-3">
                                                    {/* ✅ แสดงชื่อหมวดหมู่ ถ้าไม่มีให้ใช้ค่าเริ่มต้น */}
                                                    <p className="font-semibold text-gray-800">
                                                        {transaction.category
                                                            ? transaction.category
                                                            : "ไม่ระบุหมวดหมู่"}
                                                    </p>
                                                    {/* ✅ แสดงรายละเอียด ถ้าไม่มีให้ใช้ค่าเริ่มต้น */}
                                                    <p className="text-gray-500 text-sm">
                                                        {transaction.description
                                                            ? transaction.description
                                                            : "ไม่มีรายละเอียด"}
                                                    </p>
                                                    <p className="text-gray-400 text-xs">
                                                        🕒{" "}
                                                        {transaction.created_at
                                                            ? new Date(
                                                                  transaction.created_at
                                                              ).toLocaleTimeString(
                                                                  "th-TH",
                                                                  {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : "ไม่ระบุเวลา"}
                                                    </p>{" "}
                                                    {/* ✅ เพิ่มเวลา */}
                                                </div>
                                            </div>

                                            {/* ✅ แสดงจำนวนเงินเป็นสีแดงถ้าเป็นรายจ่าย และสีเขียวถ้าเป็นรายรับ */}
                                            <span
                                                className={`font-bold ${
                                                    transaction.amount > 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {transaction.amount > 0
                                                    ? `+฿${Number(
                                                          transaction.amount
                                                      ).toFixed(2)}`
                                                    : `-฿${Math.abs(
                                                          Number(
                                                              transaction.amount
                                                          )
                                                      ).toFixed(2)}`}
                                            </span>
                                        </div>
                                    );
                                    return acc;
                                },
                                []
                            )
                        ) : (
                            <p className="text-center text-gray-500">
                                ไม่มีธุรกรรมที่แสดง
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Floating Button (ปุ่มลอย) สำหรับเพิ่มธุรกรรม */}
            <Link
                href="/transactions/add"
                className="fixed bottom-16 right-4 bg-amber-400 p-4 rounded-full shadow-lg"
            >
                ➕
            </Link>

            {/* 🔹 Popup รายละเอียดธุรกรรม */}
            {selectedTransaction && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? "แก้ไขธุรกรรม" : "รายละเอียดธุรกรรม"}
                        </h2>

                        {/* 🔹 แสดงฟอร์มแก้ไขถ้า isEditing เป็น true */}
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded mb-2"
                                    value={editTransaction?.description || ""}
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction!,
                                            description: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    className="w-full border p-2 rounded mb-2"
                                    value={editTransaction?.amount || ""}
                                    onChange={(e) =>
                                        setEditTransaction({
                                            ...editTransaction!,
                                            amount: Number(e.target.value),
                                        })
                                    }
                                />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-2 bg-gray-300 rounded mr-2"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-4 py-2 bg-blue-500 text-white rounded"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-lg">
                                    <span className="text-2xl">
                                        {selectedTransaction.icon}
                                    </span>{" "}
                                    {selectedTransaction.category}
                                </p>
                                <p className="text-gray-600">
                                    {selectedTransaction.description ||
                                        "ไม่มีรายละเอียด"}
                                </p>
                                <p
                                    className={`font-bold text-lg ${
                                        selectedTransaction.amount > 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                    }`}
                                >
                                    {selectedTransaction.amount > 0
                                        ? `+฿${selectedTransaction.amount.toFixed(
                                              2
                                          )}`
                                        : `-฿${Math.abs(
                                              selectedTransaction.amount
                                          ).toFixed(2)}`}
                                </p>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={closePopup}
                                        className="px-4 py-2 bg-gray-300 rounded mr-2"
                                    >
                                        ปิด
                                    </button>
                                    {/*ให้หน้า /transactions/add รู้ว่าผู้ใช้กำลังแก้ไขธุรกรรมไหน โดยส่ง id ไปใน URL*/}
                                    <button
                                        onClick={() =>
                                            (window.location.href = `/transactions/add?id=${selectedTransaction?.id}`)
                                        }
                                        className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
                                    >
                                        แก้ไข
                                    </button>

                                    <button
                                        onClick={() =>
                                            confirmDelete(
                                                selectedTransaction.id
                                            )
                                        }
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 🔹 Popup ยืนยันการลบ */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-semibold mb-4 text-center">
                            ยืนยันการลบ
                        </h2>
                        <p className="text-gray-700 text-center">
                            คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
                        </p>
                        <div className="flex justify-center mt-4 space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => handleDelete()}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                ลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
