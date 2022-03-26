import "./App.css";
import Header from "./components/Header";
import Balance from "./components/Balance";
import Incomeexpenses from "./components/IncomeExpenses";
import Transactionlist from "./components/TransactionList";
import Addtransaction from "./components/AddTransaction";
import { GlobalProvider } from "./context/GlobalState";

/* function App() {
  return (
    <GlobalProvider>
      <Header />
      <div className="container">
        <Balance />
        <Incomeexpenses />
        <Transactionlist />
        <Addtransaction />
      </div>
    </GlobalProvider>
  );
} */

import { useState, useEffect } from "react";
import Link from "./components/Link";

function App() {
  const [data, setData] = useState([]);
  const [totall, settotall] = useState({});

  useEffect(() => {
    async function fff() {
      const res = await fetch(
        "http://localhost:3500/field_of_studies/?page=1&limit=10"
      );
      const dt = await res.json();
      setData(dt.result);
      settotall(dt);
    }
    fff();
  }, []);

  let pages = [];
  if (totall.totallPage > 4) {
    if (!(totall.currentPage + 2 >= totall.totallPage)) {
      for (let i = totall.currentPage; i < totall.currentPage + 3; i++) {
        pages.push(i);
      }
      if (pages[pages.length - 1] + 1 < totall.totallPage) {
        pages.push("...");
      }
      pages.push(totall.totallPage);
    } else {
      if (totall.totallPage - totall.currentPage === 2) {
        for (let i = totall.currentPage - 1; i < totall.currentPage + 3; i++) {
          pages.push(i);
        }
      } else if (totall.totallPage - totall.currentPage === 1) {
        for (let i = totall.currentPage - 2; i < totall.currentPage + 2; i++) {
          pages.push(i);
        }
      } else {
        for (let i = totall.currentPage - 3; i < totall.currentPage + 1; i++) {
          pages.push(i);
        }
      }
    }

  } else {
    for (let i = 1; i < totall.totallPage + 1; i++) {
      pages.push(i);
    }
  }

  return (
    <div style={{ direction: "rtl" }}>
      <ul>
        {data.map((row) => {
          return <li key={row.id}>{row.name}</li>;
        })}
      </ul>
      <Link
        key={0}
        number={"<"}
        currentPage={totall.currentPage}
        hasNext={false}
        hasPrev={totall.previous ? false : true}
        setData={setData}
        settotall={settotall}
        totallPage={totall.totallPage}
      />
      {/* if Link has true (hasPrev or hasNext), the cursor will be changed*/}

      {pages.map((page) => {
        return (
          <Link
            key={page}
            number={page}
            currentPage={totall.currentPage}
            hasNext={false}
            hasPrev={false}
            setData={setData}
            settotall={settotall}
            totallPage={totall.totallPage}
          />
        );
      })}

      <Link
        key={-1}
        number={">"}
        currentPage={totall.currentPage}
        hasNext={totall.next ? false : true}
        hasPrev={false}
        setData={setData}
        settotall={settotall}
        totallPage={totall.totallPage}
      />
    </div>
  );
}

export default App;
