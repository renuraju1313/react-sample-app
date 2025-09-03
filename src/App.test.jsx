// App.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import TodoTable from "./components/TodoTable";

// Optional: mock TodoTable if you don't want to test its internal behavior here
jest.mock("./components/TodoTable", () => () => <div>Mocked TodoTable</div>);

describe("App component", () => {
  test("renders without crashing", () => {
    render(<App />);
    // Check that the mocked TodoTable is rendered
    expect(screen.getByText("Mocked TodoTable")).toBeInTheDocument();
  });
});
