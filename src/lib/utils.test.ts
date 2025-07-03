import { cn } from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
