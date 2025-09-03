// TodoTableInfinite.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";

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
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Todo List</h1>
      <div className="overflow-x-auto w-full max-w-4xl">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Completed</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr
                key={todo.id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="py-2 px-4">{todo.id}</td>
                <td className="py-2 px-4">{todo.title}</td>
                <td className="py-2 px-4">
                  {todo.completed ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Loader div */}
        {visibleCount < allTodos.length && (
          <div ref={loaderRef} className="py-4 text-center text-gray-500">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoTable;
