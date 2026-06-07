import { Resend } from "resend";

let resend;

const getResend = () => {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
};

export const getMailFrom = () => process.env.SENDER_EMAIL;

export const sendEmail = async (mailOptions) => {
  const { data, error } = await getResend().emails.send(mailOptions);

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
};
