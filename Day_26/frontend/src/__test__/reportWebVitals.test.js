import reportWebVitals from "../reportWebVitals";

test("does nothing when no callback is supplied", () => {
 expect(() => reportWebVitals()).not.toThrow();
});

test("does nothing for non-function callback", () => {
 expect(() => reportWebVitals("not-a-function")).not.toThrow();
});

test("loads web-vitals when callback is supplied", async () => {
 const callback = jest.fn();
 jest.mock("web-vitals", () => ({
   getCLS: (cb) => cb({name:"CLS"}),
   getFID: (cb) => cb({name:"FID"}),
   getFCP: (cb) => cb({name:"FCP"}),
   getLCP: (cb) => cb({name:"LCP"}),
   getTTFB: (cb) => cb({name:"TTFB"}),
 }), { virtual: true });
 reportWebVitals(callback);
 await Promise.resolve();
});
