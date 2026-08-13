const https = require("node:https");

const verifyRecaptcha = (token, remoteIp) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return resolve(false);
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return reject(new Error("reCAPTCHA is not configured"));
    }

    const params = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const request = https.request(
      process.env.RECAPTCHA_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(params.toString()),
        },
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
          console.log(data)
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(data);
            console.log(result)
            resolve(result.success === true);
          } catch (error) {
            console.log(error)
            reject(new Error("Invalid reCAPTCHA verification response"));
          }
        });
      }
    );

    request.on("error", () => {
      reject(new Error("Unable to verify reCAPTCHA"));
    });

    request.write(params.toString());
    request.end();
  });
};

module.exports = { verifyRecaptcha };
