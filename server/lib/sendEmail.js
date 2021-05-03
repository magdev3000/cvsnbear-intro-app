const config = require("../config");
const sendgrid = require("@sendgrid/mail");

const { sendgridTransactionalApiKey } = config;
module.exports = async function sendEmail(email, templateId, dynamicData) {
  console.log(`sending email to: ${email} with template: ${templateId}`);
  sendgrid.setApiKey(sendgridTransactionalApiKey);
  const msg = {
    to: email,
    from: {
      email: "lynda@cvsnbear.com",
      name: "Lynda Southorn"
    },
    templateId: templateId,
    dynamic_template_data: {
      ...dynamicData
    }
  };

  return sendgrid
    .send(msg)
    .then(() => {
      console.log(`email sent succesfully`);
    })
    .catch(error => console.error(error.toString()));
};
