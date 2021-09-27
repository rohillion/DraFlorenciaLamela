// Firebase Config
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as corsModule from "cors";
import axios from "axios";
const cors = corsModule(({origin: true}));
admin.initializeApp();
// const db = admin.firestore();

// Sendgrid Config
import * as sgMail from "@sendgrid/mail";

const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_KEY);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const contact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const data = req.body;

    if (!data.reCaptchaToken) {
      throw new functions.https.HttpsError(
          "failed-precondition", "reCAPTCHA token must be provided"
      );
    }

    verifyReCaptchaToken(data.reCaptchaToken)
        .then(async (reCaptchaValidationResponse) => {
          if (!reCaptchaValidationResponse.data.success) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Failed reCAPTCHA. Something wrong with implementation."
            );
          }

          if (reCaptchaValidationResponse.data.score < 0.5) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "reCAPTCHA under the threshold. Submission looks like a bot."
            );
          }

          const msg = {
            to: "florlamdor@hotmail.com",
            from: "contact@dentactical.com",
            templateId: TEMPLATE_ID,
            dynamic_template_data: {
              name: data.name,
              email_address: data.email_address,
              message: data.message,
            },
          };

          await sgMail.send(msg)
              .then((sgResArr) => {
                return res.status(sgResArr[0].statusCode).send({success: true});
              })
              .catch((e) => {
                console.log(
                    "Sengrid Error (printing e.response.body): ",
                    e.response.body
                );
                return res.status(e.code).send({success: false});
              });
        })
        .catch((error) => {
          console.error(`reCAPtCHA validation ${error}`);
          return res.status(401).send({success: false});
        });
  });
});

const verifyReCaptchaToken = async (token:string) => {
  return axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=6Ldm85AcAAAAAPXRI6EK_OLb48EY8JD4kbCaEcBA&response=${token}`);
};
