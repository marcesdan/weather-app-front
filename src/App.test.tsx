import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "@/store";
describe("App", () => {
  it("renders Home page by default", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Próximas horas")).toBeInTheDocument();
    expect(screen.getByText("Otras ciudades")).toBeInTheDocument();
  });

  it("renders Ciudades page when /ciudades route is visited", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/ciudades"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Ciudades")).toBeInTheDocument();
  });

  it("renders NotFound page when non-existent route is visited", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/non-existent-route"]}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });
});
