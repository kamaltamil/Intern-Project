const test = require("node:test");
const assert = require("node:assert/strict");

const authService = require("../src/services/authService");

function createResponse() {
  const response = {
    statusCode: 200,
    body: null,
  };

  response.status = (code) => {
    response.statusCode = code;
    return response;
  };

  response.json = (payload) => {
    response.body = payload;
    return response;
  };

  return response;
}

test("changeUserData allows a partial admin update when only name is provided", async () => {
  const originalChangeUserDetails = authService.changeUserDetails;
  authService.changeUserDetails = async (id, updates) => ({ _id: id, ...updates });

  delete require.cache[require.resolve("../src/controllers/authController")];
  const { changeUserData } = require("../src/controllers/authController");

  const req = {
    body: { name: "Updated Name" },
    params: { id: "user-1" },
  };
  const res = createResponse();

  await changeUserData(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.name, "Updated Name");

  authService.changeUserDetails = originalChangeUserDetails;
});
