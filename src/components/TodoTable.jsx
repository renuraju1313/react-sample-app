// TodoTableInfinite.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import "./TodoTable.css";

const TodoTable = () => {
  const [todos, setTodos] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const loaderRef = useRef(null);

  // Fetch all data once
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((res) => res.json())
      .then((data) => {
        setAllTodos(data);
        setTodos(data.slice(0, 20)); // Load first 20 rows
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  // Load more data when scrolling to bottom
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        const nextCount = visibleCount + 20;
        const nextTodos = allTodos.slice(0, nextCount);
        setTodos(nextTodos);
        setVisibleCount(nextCount);
      }
    },
    [visibleCount, allTodos]
  );

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="todo-container">
      <h1 className="todo-heading">Todo List</h1>
      <div className="todo-wrapper">
        <table className="todo-table">
          <thead>
            <tr>
              <th>Apswrs</th>
              <th>Raju loves simi</th>
              <th>Bindu Loves Raju</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.title}</td>
                <td>
                  {todo.completed ? (
                    <span className="todo-status-yes">Yes</span>
                  ) : (
                    <span className="todo-status-no">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Loader div */}
        {visibleCount < allTodos.length && (
          <div ref={loaderRef} className="todo-loader">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoTable;
