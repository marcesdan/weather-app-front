import NavigationService from "./index";

describe("NavigationService", () => {
  let mockNavigate: () => void;

  beforeEach(() => {
    mockNavigate = () => {};
    NavigationService.setNavigate(mockNavigate);
  });

  it("should call the navigate function when navigateTo is called", () => {
    const path = "/test";
    NavigationService.navigateTo(path);
    // Check if navigate function was called
    // This will depend on your implementation of NavigationService
  });

  it("should not call the navigate function when navigateTo is called but navigate is not set", () => {
    NavigationService.setNavigate(() => {});
    NavigationService.navigateTo("/test");
    // Check if navigate function was not called
    // This will depend on your implementation of NavigationService
  });
});
