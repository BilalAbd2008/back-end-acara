import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

import {
  EMAIL_SMTP_SERVICE_NAME,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_SECURE,
} from "../env";
import { StringMappingType } from "typescript";

const transporter = nodemailer.createTransport({
  service: EMAIL_SMTP_SERVICE_NAME,
  host: EMAIL_SMTP_HOST,
  port: EMAIL_SMTP_PORT,
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
  requireTLS: true,
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

export interface ISendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ ...mailParams }: ISendMail) => {
  try {
    console.log("Attempting to send email to:", mailParams.to);
    const result = await transporter.sendMail({
      ...mailParams,
    });
    console.log("Email sent successfully:", result.response);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const renderMailHtml = async (
  template: string,
  data: any
): Promise<string> => {
  try {
    const content = await ejs.renderFile(
      path.join(__dirname, `templates/${template}`),
      data
    );
    return content as string;
  } catch (error) {
    console.error("Error rendering email template:", error);
    throw error;
  }
};
