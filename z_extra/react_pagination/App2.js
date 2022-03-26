import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';  //https://www.npmjs.com/package/react-paginate
import "./App2.css";


function Items({ currentItems }) {
  return (
    <>
      {currentItems &&
        currentItems.map((item) => (
          <div key={item.id}>
            <h3>{item.name}</h3>
          </div>
        ))}
    </>
  );
}

function PaginatedItems({ itemsPerPage }) {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totallItems, setTotallItems] = useState(0);
  

  async function fetchData() {
    const url = `http://localhost:3500/field_of_studies/?page=${pageNumber}&limit=${itemsPerPage}`;
    const res = await fetch(url);
    const data = await res.json();
    setCurrentItems(data.result);
    setTotallItems(data.totallItems);
  }

  useEffect(() => {
    fetchData();
  }, [pageNumber, itemsPerPage]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    setPageNumber(event.selected + 1);
  };

  return (
    <>
      <Items currentItems={currentItems} />
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={Math.ceil(totallItems / itemsPerPage)}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />
    </>
  );
}

export default PaginatedItems;