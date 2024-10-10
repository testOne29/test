import { Button } from "./components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { DatePicker } from "./components/ui/datePicker";
import { Input } from "./components/ui/input";
import { useState, useRef, useEffect } from "react";
import { dateObj } from "./components/ui/datePicker";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction, addBank } from "./redux/slice";
import { nanoid } from "@reduxjs/toolkit";
import { Plus } from "lucide-react";
import TransactionList from "./components/ui/transactionList";
import { addAccount } from "./redux/slice";
import { add } from "date-fns";

function App() {
  const { user, loginWithRedirect, isAuthenticated, logout } = useAuth0();

  //states
  const [TransactionType, setTransactionType] = useState("");
  const [isAddBoxOpen, setIsAddBoxOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [reload, setReload] = useState(false);
  const [isAddBankDivOpen, setIsAddBankDivOpen] = useState(false);
  const [isAddAccountDivOpen, setIsAddAccountDivOpen] = useState(false);
  const [openTab, setOpenTab] = useState("Income"); // for small and medium devices, default tab is income.
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [paidVia, setPaidVia] = useState("cash");
  const [bankName, setBankName] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  //datalist
  const datalistOption = [];

  //amount variables and setters
  let incomeAmount = 0;
  let setIncomeAmount = (amount) => {
    incomeAmount += amount;
  };
  let expenseAmount = 0;
  let setExpenseAmount = (amount) => {
    expenseAmount += amount;
  };

  // bank variables and setters

  // adding a new bank to redux store
  function AddNewBank() {
    dispatch(
      addBank({
        name: String(newBankName),
        balance: 0,
      })
    );
    setNewBankName("");
    setIsAddBankDivOpen(false);
  }

  function AddNewAccount() {
    dispatch(
      addAccount({
        name: String(newAccountName),
        balance: 0,
      })
    );
    setNewAccountName("");
    setIsAddAccountDivOpen(false);
  }

  //ref
  const amountInputRef = useRef(null);

  //redux
  const dispatch = useDispatch();
  const transactions = useSelector((state) => state.transactions);
  const banks = useSelector((state) => state.bank);
  const accounts = useSelector((state) => state.account);

  // functions to add income and expense
  const AddIncome = () => {
    setIsAddBoxOpen(true);
    setTransactionType("Income");
  };

  const AddExpense = () => {
    setIsAddBoxOpen(true);
    setTransactionType("Expense");
  };

  // function to add transaction to redux store
  const AddTransaction = () => {
    if (dateObj.date) {
      if (amount.trim() && title.trim() !== "") {
        if (paidVia === "Cash") {
          dispatch(
            addTransaction({
              id: nanoid(),
              title,
              type: TransactionType,
              amount: Number(amount),
              date: String(dateObj.date),
              paidVia: paidVia,
            })
          );
          setAmount("");
          setTitle("");
          setIsAddBoxOpen(false);
        } else if (paidVia === "Bank") {
          if (bankName.trim() !== "" && bankName !== "SELECT") {
            dispatch(
              addTransaction({
                id: nanoid(),
                title,
                type: TransactionType,
                amount: Number(amount),
                date: String(dateObj.date),
                paidVia: paidVia,
              })
            );
            dispatch(
              addBank({
                name: bankName,
                balance: Number(amount),
                transactionType: TransactionType,
              })
            );
            totalBankBalance();
            setAmount("");
            setTitle("");
            setIsAddBoxOpen(false);
          }
        } else if (paidVia === "Account") {
          if (accountName.trim() !== "" && accountName !== "SELECT") {
            dispatch(
              addTransaction({
                id: nanoid(),
                title,
                type: TransactionType,
                amount: Number(amount),
                date: String(dateObj.date),
                paidVia: paidVia,
              })
            );
            dispatch(
              addAccount({
                name: accountName,
                balance: Number(amount),
                transactionType: TransactionType,
              })
            );
            totalAccountBalance();
            console.log("amount", amount);

            setAmount("");
            setTitle("");
            setIsAddBoxOpen(false);
          }
        }
      }
    }
  };

  //function to calculate total balance.
  const calculateTotalBalance = () => {
    let totalBalance = 0;
    transactions.map((transaction) => {
      if (transaction.type === "Income") {
        totalBalance += transaction.amount;
      } else if (transaction.type === "Expense") {
        totalBalance -= transaction.amount;
      }
    });
    setBalanceAmount(totalBalance);
  };

  //function to calculate total bank balance
  function totalBankBalance() {
    const total = banks.reduce((sum, bank) => {
      if (bank.transactionType === "Expense") {
        return sum - bank.balance;
      } else {
        return sum + bank.balance;
      }
    }, 0);
    setBankBalance(total);
  }

  // total account balance
  function totalAccountBalance() {
    const total = accounts.reduce((sum, account) => {
      if (account.transactionType === "Expense") {
        return sum - account.balance;
      } else {
        return sum + account.balance;
      }
    }, 0);
    setAccountBalance(total);
  }

  // utility functions
  const closeAddBox = () => {
    setIsAddBoxOpen(false);
    setAmount("");
    setTitle("");
  };

  //login
  async function login() {
    loginWithRedirect();
  }

  // Tab handlers
  const incomeTabHandler = () => {
    setOpenTab("Income");
    setTransactionType("Income");
  };
  const expenseTabHandler = () => {
    setOpenTab("Expense");
    setTransactionType("Expense");
  };

  const handleTabAddTrnsaction = () => {
    if (openTab === "Income") {
      AddIncome();
    } else {
      AddExpense();
    }
  };

  useEffect(() => {
    calculateTotalBalance();  
    totalBankBalance();
    totalAccountBalance();
  }, [transactions, banks, accounts]);

  return (
    <>
      <div className="bg-black text-white h-full w-screen ">
        {isAuthenticated ? (
          <>
            {/*  add transaction div */}
            <div
              className={`bg-slate-800/40 transition-all duration-50  z-50 absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 py-4  px-4 w-full h-full md:w-[40%] md:max-h-[30%] md:rounded-lg lg:w-[30%] backdrop-blur-lg  lg:max-h-[40%] ${
                isAddBoxOpen ? "block" : "hidden"
              }`}
            >
              <div className="flex">
                <h1 className="text-center text-2xl  text-white">
                  Add an {TransactionType}
                </h1>
                <span
                  onClick={() => closeAddBox()}
                  className="text-white ml-auto text-3xl cursor-pointer"
                >
                  &times;
                </span>
              </div>

              <div className="flex flex-col mt-6 gap-4 ">
                <Input
                  type="text"
                  value={title}
                  className="text-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      amountInputRef.current.focus();
                    }
                  }}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the Title..."
                  list="title"
                />

                <datalist className="text-black" id="title">
                  {transactions.map((transaction) => {
                    if (datalistOption.indexOf(transaction.title) === -1) {
                      datalistOption.push(transaction.title);
                    }
                  })}
                  {datalistOption.map((option) => {
                    return <option key={nanoid()} value={option} />;
                  })}
                </datalist>

                <Input
                  type="number"
                  ref={amountInputRef}
                  value={amount}
                  className="text-black"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      AddTransaction();
                    }
                  }}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter the Amount..."
                />

                <div className=" items-center flex-col md:items-start gap-4 lg:flex ">
                  <div className="w-full">
                    <label className="text-white" htmlFor="paidVia">
                      {TransactionType === "Income" ? "Received" : "Paid"} Via :
                    </label>
                    <select
                      className="p-2 w-[25%] ml-2 bg-slate-800 rounded-md text-white"
                      name="paidVia"
                      id="paidVia"
                      value={paidVia}
                      onChange={(e) => setPaidVia(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank</option>
                      <option value="Account">Account</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="w-full mt-2 lg:mt-0">
                    {paidVia === "Bank" && (
                      <div className="flex items-center lg:w-[50%] gap-4">
                        <label className="text-white" htmlFor="bankName">
                          Bank Name :
                        </label>
                        <select
                          className="p-2 bg-slate-800 rounded-md text-white"
                          name="bankName"
                          id="bankName"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        >
                          {banks.map((bank) => {
                            return (
                              <option key={nanoid()} value={bank.name}>
                                {bank.name}
                              </option>
                            );
                          })}
                        </select>
                        <div className="bg-slate-800 p-1 flex rounded-sm">
                          <Plus
                            onClick={() => setIsAddBankDivOpen((prev) => !prev)}
                            size={20}
                          />
                        </div>
                      </div>
                    )}
                    {paidVia === "Account" && (
                      <div className="flex items-center lg:w-[50%] gap-4">
                        <label className="text-white" htmlFor="accountName">
                          Account Name :
                        </label>
                        <select
                          className="p-2 bg-slate-800 rounded-md text-white"
                          name="accountName"
                          id="accountName"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                        >
                          {accounts.map((account) => {
                            return (
                              <option key={nanoid()} value={account.name}>
                                {account.name}
                              </option>
                            );
                          })}
                        </select>
                        <div className="bg-slate-800 p-1 flex rounded-sm">
                          <Plus
                            onClick={() =>
                              setIsAddAccountDivOpen((prev) => !prev)
                            }
                            size={20}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* add account Input Div */}
                <div
                  className={`w-full  lg:w-[50%] transition-all duration-150 flex ${
                    isAddAccountDivOpen ? "block" : "hidden"
                  }`}
                >
                  <Input
                    className="rounded-r-none text-black rounded-l-xl"
                    placeholder="Enter the name of the Bank..."
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                  <Button
                    onClick={() => AddNewAccount()}
                    className="rounded-r-xl rounded-l-none"
                  >
                    Add
                  </Button>
                </div>

                {/* add bank input div */}
                <div
                  className={`w-full  lg:w-[50%] transition-all duration-150 flex ${
                    isAddBankDivOpen ? "block" : "hidden"
                  }`}
                >
                  <Input
                    className="rounded-r-none text-black rounded-l-xl"
                    placeholder="Enter the name of the Bank..."
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                  />
                  <Button
                    onClick={() => AddNewBank()}
                    className="rounded-r-xl rounded-l-none"
                  >
                    Add
                  </Button>
                </div>
                <Button
                  className="transition-all duration-150"
                  onClick={() => AddTransaction()}
                >
                  Add {TransactionType}
                </Button>
              </div>
            </div>

            {/* header div */}
            <div className="px-2 py-2 w-full border flex items-center border-white/10 bg-black/20 rounded-l-lg outline-none duration-150">
              <div className="flex items-center">
                <img
                  className="rounded-full size-10"
                  src={user.picture.toString()}
                  alt="profile"
                />

                <h1 className="px-4">{user.email}</h1>
              </div>
              <div className="ml-auto">
                <Button className="z-10" size="lg" onClick={() => logout()}>
                  logout
                </Button>
              </div>
            </div>
            {/* main container */}
            <div className="mt-10 px-4 h-full lg:mx-10">
              <div className="flex items-center gap-3">
                <DatePicker />
                <Button
                  className="text-xl p-4 cursor-pointer"
                  onClick={() => setReload((prev) => !prev)}
                >
                  Get
                </Button>
                <div className="ml-auto mr-3">
                  <div className="hidden md:flex bg-slate-900 p-3  rounded-lg text-white text-center text-xl  cursor-pointer">
                    <h1>Bank Balance : </h1>
                    <h1 className="text-xl ml-2 bg-white font-bold text-black px-2 rounded-lg">
                      {bankBalance}
                    </h1>
                  </div>
                </div>
                <div className="hidden md:flex bg-slate-900 p-3  rounded-lg text-white text-center text-xl  cursor-pointer">
                  <h1>Account Balance : </h1>
                  <h1 className="text-xl ml-2 bg-white font-bold text-black px-2 rounded-lg ">
                    {accountBalance}
                  </h1>
                </div>
                <div className="hidden md:flex bg-slate-900 p-3  rounded-lg text-white text-center text-xl  cursor-pointer">
                  <h1>Total Balance : </h1>
                  <h1 className="text-xl ml-2 bg-white font-bold text-black px-2 rounded-lg ">
                    {balanceAmount}
                  </h1>
                </div>
              </div>

              {/* balance amount for sm devices */}
              <div className="bg-slate-900 p-3  rounded-lg text-white text-center text-xl  mt-4  cursor-pointer flex md:hidden">
                <h1>Total Balance : </h1>
                <h1 className="text-xl ml-2 bg-white font-bold text-black px-2 rounded-lg ">
                  {balanceAmount}
                </h1>
              </div>

              {/* income and expense ui div */}
              <div>
                {/* // tab div for small devices */}
                <div className="flex mt-10 items-center justify-between ">
                  <div
                    className={`text-center p-2 cursor-pointer rounded-l-sm w-full bg-green-600 transition-all duration-100 lg:hidden ${
                      openTab === "Income" ? " border-b-2 border-white" : null
                    }`}
                    onClick={() => incomeTabHandler()}
                  >
                    <h1>INCOME</h1>
                  </div>

                  <div
                    className={`text-center p-2 rounded-r-sm cursor-pointer w-full bg-red-600 transition-all  duration-100 lg:hidden ${
                      openTab === "Expense" ? "border-b-2 border-white" : null
                    }`}
                    onClick={() => expenseTabHandler()}
                  >
                    <h1>EXPENSE</h1>
                  </div>
                </div>
              </div>
              {/* //total amount div */}
              <div className="flex mt-3 transition-opacity duration-100">
                <h1 className="text-xl lg:hidden">
                  {openTab === "Income"
                    ? "Total Income : "
                    : "Total Expense : "}
                </h1>

                {transactions.map((transaction) =>
                  transaction.type === "Income"
                    ? transaction.date === String(dateObj.date)
                      ? setIncomeAmount(transaction.amount)
                      : null
                    : null
                )}

                {transactions.map((transaction) =>
                  transaction.type === "Expense"
                    ? transaction.date === String(dateObj.date)
                      ? setExpenseAmount(transaction.amount)
                      : null
                    : null
                )}
                <h1 className="text-xl ml-2 bg-white font-bold text-black px-2 rounded-lg lg:hidden">
                  {openTab === "Income" ? incomeAmount : expenseAmount}
                </h1>
              </div>

              {/* // listing transaction div */}
              <div
                className="bg-slate-900 p-3  rounded-lg text-white text-center text-xl  mt-4  cursor-pointer lg:hidden"
                onClick={() => handleTabAddTrnsaction()}
              >
                Add {openTab === "Income" ? "Income" : "Expense"}
              </div>

              {openTab === "Income" ? (
                <div className="lg:hidden transition-all duration-100">
                  {transactions.map((transaction) =>
                    transaction.type === "Income" ? (
                      transaction.date === String(dateObj.date) ? (
                        <TransactionList
                          key={transaction.id}
                          title={String(transaction.title)}
                          amount={Number(transaction.amount)}
                          id={transaction.id}
                        />
                      ) : null
                    ) : null
                  )}
                </div>
              ) : (
                <div className="lg:hidden transition-all duration-100">
                  {transactions.map((transaction) =>
                    transaction.type === "Expense" ? (
                      transaction.date === String(dateObj.date) ? (
                        <TransactionList
                          key={transaction.id}
                          title={String(transaction.title)}
                          amount={Number(transaction.amount)}
                          id={transaction.id}
                        />
                      ) : null
                    ) : null
                  )}
                </div>
              )}

              {/* UI  for large devices */}
              <div className="hidden lg:block w-full h-full">
                <div className="flex  justify-around rounded-lg">
                  <div className="w-[40%]">
                    <div className="w-full py-2 px-4 items-center bg-green-600 flex rounded-md">
                      <h1 className=" text-2xl text-center">INCOME</h1>
                      <h1 className="text-xl ml-auto py-2 px-4 bg-white font-bold text-black rounded-lg">
                        {incomeAmount}
                      </h1>
                    </div>
                    <div
                      className="bg-slate-900 p-3  rounded-lg text-white text-center text-xl  mt-4  cursor-pointer"
                      onClick={() => AddIncome()}
                    >
                      Add Income
                    </div>
                    <div className=" transition-all duration-100">
                      {transactions.map((transaction) =>
                        transaction.type === "Income" ? (
                          transaction.date === String(dateObj.date) ? (
                            <TransactionList
                              key={transaction.id}
                              title={String(transaction.title)}
                              amount={Number(transaction.amount)}
                              id={transaction.id}
                            />
                          ) : null
                        ) : null
                      )}
                    </div>
                  </div>
                  <div className="w-[40%]">
                    <div className="w-full py-2 px-4 items-center bg-red-600 flex rounded-md">
                      <h1 className=" text-2xl text-center">EXPENSE</h1>
                      <h1 className="text-xl ml-auto py-2 px-4 bg-white font-bold text-black rounded-lg">
                        {expenseAmount}
                      </h1>
                    </div>
                    <div
                      className="bg-slate-900 p-3  rounded-lg text-white text-center text-xl  mt-4  cursor-pointer"
                      onClick={() => AddExpense()}
                    >
                      Add Expense
                    </div>
                    <div className="transition-all duration-100">
                      {transactions.map((transaction) =>
                        transaction.type === "Expense" ? (
                          transaction.date === String(dateObj.date) ? (
                            <TransactionList
                              key={transaction.id}
                              title={String(transaction.title)}
                              amount={Number(transaction.amount)}
                              id={transaction.id}
                            />
                          ) : null
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center justify-center h-screen ">
            <div className="flex flex-col gap-2">
              <h1>Please login to continue</h1>
              <Button size="lg" onClick={() => login()}>
                login
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default App;
