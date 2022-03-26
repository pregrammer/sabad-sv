function Link({ number, currentPage, hasNext, hasPrev, setData, settotall, totallPage }) {
  let styles = {
    backgroundColor: "aqua",
    color: "#000",
  };

  async function handleClick() {
      let url;
      if (number === '<') {
          if (currentPage - 1 === 0) return
          url = `http://localhost:3500/field_of_studies/?page=${currentPage - 1}&limit=10`;
      } else if (number === '>') {
        if (currentPage + 1 > totallPage) return
        url = `http://localhost:3500/field_of_studies/?page=${currentPage + 1}&limit=10`;
      } else {
        url = `http://localhost:3500/field_of_studies/?page=${number}&limit=10`;
      }
    const res = await fetch(url);
      const dt = await res.json();
      setData(dt.result);
      settotall(dt);
  }

  return (
    <button
      style={
        (currentPage === number)
          ? styles
          : hasNext || hasPrev || number === "..."
          ? { cursor: "no-drop", backgroundColor: "rgb(218, 218, 218)" }
          : {}
      }
      onClick={handleClick}
    >
      {number}
    </button>
  );
}

export default Link;
