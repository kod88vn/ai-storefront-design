import { defaultConfig } from "./store/defaults";
import { useStudioStore } from "./store";

function cloneConfig() {
  return JSON.parse(JSON.stringify(defaultConfig));
}

describe("studio store mutation safety", () => {
  beforeEach(() => {
    localStorage.clear();
    useStudioStore.setState({
      config: cloneConfig(),
      auditLog: [],
      configHistory: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("updates theme fields without clobbering hero or section state", () => {
    const before = cloneConfig();

    useStudioStore.getState().updateTheme({
      primaryColor: "#123456",
      navStyle: "filled",
    });

    const { config } = useStudioStore.getState();

    expect(config.theme.primaryColor).toBe("#123456");
    expect(config.theme.navStyle).toBe("filled");
    expect(config.hero).toEqual(before.hero);
    expect(config.sections).toEqual(before.sections);
    expect(config.productGrid).toEqual(before.productGrid);
  });

  it("preserves product-grid layout metadata when columns change", () => {
    useStudioStore.setState((state) => ({
      config: {
        ...state.config,
        productGrid: {
          ...state.config.productGrid,
          layout: "list",
          heading: "Best Sellers",
          showRatings: true,
        },
      },
    }));

    useStudioStore.getState().setProductGridColumns(4);

    const { productGrid } = useStudioStore.getState().config;

    expect(productGrid.columns).toBe(4);
    expect(productGrid.layout).toBe("list");
    expect(productGrid.heading).toBe("Best Sellers");
    expect(productGrid.showRatings).toBe(true);
  });

  it("merges product-grid patches without wiping unrelated merchandising fields", () => {
    useStudioStore.setState((state) => ({
      config: {
        ...state.config,
        productGrid: {
          ...state.config.productGrid,
          columns: 3,
          layout: "grid",
          heading: "Featured Finds",
          showRatings: true,
        },
      },
    }));

    useStudioStore.getState().updateProductGrid({
      layout: "list",
      buttonText: "Compare options",
    });

    const { productGrid } = useStudioStore.getState().config;

    expect(productGrid.layout).toBe("list");
    expect(productGrid.buttonText).toBe("Compare options");
    expect(productGrid.columns).toBe(3);
    expect(productGrid.heading).toBe("Featured Finds");
    expect(productGrid.showRatings).toBe(true);
  });

  it("supports undo and redo for debounced config changes", () => {
    jest.useFakeTimers();

    useStudioStore.getState().updateTheme({ primaryColor: "#ff0000" });
    jest.advanceTimersByTime(1100);

    useStudioStore.getState().updateTheme({ primaryColor: "#00ff00" });
    jest.advanceTimersByTime(1100);

    expect(useStudioStore.getState().canUndo).toBe(true);
    expect(useStudioStore.getState().config.theme.primaryColor).toBe("#00ff00");

    useStudioStore.getState().undo();
    expect(useStudioStore.getState().config.theme.primaryColor).toBe("#ff0000");

    useStudioStore.getState().redo();
    expect(useStudioStore.getState().config.theme.primaryColor).toBe("#00ff00");
  });
});
