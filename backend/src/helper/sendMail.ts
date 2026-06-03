import transporter from "./sendVerificationMail.ts";
import { Verification_Email_Template } from "../template/verificationEmailOtp.ts";
import { Welcome_Email_Template } from "../template/welcomeEmailTemplate.ts";

export const SendVerificationCode = async (
  email: string,
  verificationCode: number,
) => {
  try {
    const html =
      typeof Verification_Email_Template === "function"
        ? Verification_Email_Template(verificationCode)
        : String(Verification_Email_Template);

    const response = await transporter.sendMail({
      from: `"EventCraft" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html,
    });

    // console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Error sending verification", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const WellcomeEmail = async (
  email: string,
  firstname: string,
  lastname: string,
) => {
  try {
    const template =
      typeof Welcome_Email_Template === "function"
        ? Welcome_Email_Template()
        : String(Welcome_Email_Template);

    const html = template
      .replace("{firstname}", firstname)
      .replace("{lastname}", lastname);

    const response = await transporter.sendMail({
      from: `"EventCraft" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Wellcome To Our Community",
      text: "Wellcome To Our Community",
      html,
    });

    // console.log("Email send Successfully", response);
  } catch (error) {
    console.log("Email Error", error);
  }
};
