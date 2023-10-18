import nodemailer from 'nodemailer';

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "alaaadham861@gmail.com",
    pass: "efhh tzjo aoat aciw",
  },
});

// Initialize a variable to track button press
// Initialize a variable to store the result of button click
let buttonResult = '';

// Send the email
async function sendEmail(email,code) {
  try {
    const info = await transporter.sendMail({
      from: `"Marham" <alaaadham861@gmail.com>`,
      to: email,
      subject: "[Marham]",
      text: "Update Password using Email Address",
      html: `
        <table width="100%" bgcolor="#f0f0f0">
          <tr>
            <td align="center">
              <p style="font-size: 28px; font-weight: bold;">
                Hi ${email},<br><br>
                Sorry to hear you're having trouble logging into Marham.<br><br>
                We got a message that you forgot your password.<br><br>
                If this was you, you can Enter this code ${code}
              </p>
          </tr>
        </table>
      `
    });
    console.log("Email sent:", info.response);

    // Check the result of the button click
 
  } catch (error) {
    console.error("Error sending email:", error);
  }

  // If the button was not pressed, return false
  console.log("Button was not pressed, returning false.");
  return false;
}
export {sendEmail};
