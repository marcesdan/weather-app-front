class NavigationService {
  private navigate: ((path: string) => void) | null = null;

  setNavigate(navigate: (path: string) => void) {
    this.navigate = navigate;
  }

  navigateTo(path: string) {
    if (this.navigate) {
      this.navigate(path);
    }
  }
}

const navigationService = new NavigationService();

export default navigationService;
