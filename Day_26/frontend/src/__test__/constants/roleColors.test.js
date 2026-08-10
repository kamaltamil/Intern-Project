import ROLE_COLORS, { ROLE_COLORS as named } from "../../constants/roleColors";

test("exports the role color presets", () => {
  expect(ROLE_COLORS).toBe(named);
  expect(ROLE_COLORS.length).toBe(9);
  expect(ROLE_COLORS[0]).toEqual({ label: "Purple", value: "#722ed1" });
  expect(ROLE_COLORS.every((item) => item.label && item.value)).toBe(true);
});
