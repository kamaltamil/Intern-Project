import appTheme from "../theme";

describe("theme.js", () => {
  test("should export theme with token", () => {
    expect(appTheme).toBeDefined();
    expect(appTheme.token).toBeDefined();
  });

  test("should have correct primary color", () => {
    expect(appTheme.token.colorPrimary).toBe("#5F4791");
  });

  test("should have correct info color", () => {
    expect(appTheme.token.colorInfo).toBe("#5F4791");
  });

  test("should have correct success color", () => {
    expect(appTheme.token.colorSuccess).toBe("#62C370");
  });

  test("should have correct warning color", () => {
    expect(appTheme.token.colorWarning).toBe("#E8A064");
  });

  test("should have correct error color", () => {
    expect(appTheme.token.colorError).toBe("#F06A6A");
  });

  test("should have correct background layout color", () => {
    expect(appTheme.token.colorBgLayout).toBe("#FCFCFE");
  });

  test("should have correct container background color", () => {
    expect(appTheme.token.colorBgContainer).toBe("#FFFFFF");
  });

  test("should have correct border color", () => {
    expect(appTheme.token.colorBorder).toBe("#E7E3EF");
  });

  test("should have correct text color", () => {
    expect(appTheme.token.colorText).toBe("#2D2534");
  });

  test("should have correct secondary text color", () => {
    expect(appTheme.token.colorTextSecondary).toBe("#8A8395");
  });

  test("should have correct border radius", () => {
    expect(appTheme.token.borderRadius).toBe(12);
  });

  test("should have algorithm array", () => {
    expect(Array.isArray(appTheme.algorithm)).toBe(true);
    expect(appTheme.algorithm).toHaveLength(1);
  });
});
