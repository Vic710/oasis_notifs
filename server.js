const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.user,
      pass: process.env.APP_PASSWORD,
    },
});

// HTML template for email
const generateEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
            background-image: url('https://d10gf95rxwihx0.cloudfront.net/city-pixel-art-8ptr08abde3xvuh4.webp');
            background-size: cover;
            background-position: center;
        }
        .header {
            text-align: center;
            padding: 10px;
        }
        .header img {
            width: 150px;
            height: auto;
        }
        .content {
            background-color: rgba(0, 0, 0, 0.7); /* Dark semi-transparent background */
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            margin: 20px 0;
            color: #ffffff; /* White text color */
            font-size: 18px; /* Larger font size */
            line-height: 1.6; /* Improved line height for readability */
        }
        .button-container {
            text-align: center;
            margin-top: 20px;
        }
        .button {
            background-color: #6ea5e1; /* Lighter blue */
            color: #fff; /* White text color */
            padding: 12px 24px; /* Increased padding */
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            font-weight: 700; /* Even bolder font weight */
        }

        .button:hover {
            background-color: #004185; /* Darker blue on hover */
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://res.cloudinary.com/dzhpx2alw/image/upload/v1718634994/20240617_200413_lq8ly4.png" alt="Oasis Social Logo">
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="button-container">
            <a href="https://oasissocial.in/" class="button">Visit Oasis Social</a>
        </div>
        <div class="footer">
            This is an automated message from Oasis Social. Please do not reply.
        </div>
    </div>
</body>
</html>
`;

app.post('/notify', async (req, res) => {
    const { email, notificationType, data } = req.body;

    let subject, text, htmlContent;

    // Customize email content based on notification type
    switch (notificationType) {
        case 'comment':
            subject = 'Somebody commented on your post';
            text = `${data.username} commented on your post: ${data.comment}`;
            htmlContent = `<p><strong>${data.username}</strong> commented on your post:</p><p>${data.comment}</p>`;
            break;
        case 'reply':
            subject = 'Somebody replied to your post';
            text = `${data.username} replied to your post: ${data.reply}`;
            htmlContent = `<p><strong>${data.username}</strong> replied to your post:</p><p>${data.reply}</p>`;
            break;
        case 'like':
            subject = 'Somebody liked your post';
            text = `${data.username} liked your post.`;
            htmlContent = `<p><strong>${data.username}</strong> liked your post.</p>`;
            break;
        case 'subscribe':
            subject = 'Somebody subscribed to your community';
            text = `${data.username} subscribed to your community: ${data.community}.`;
            htmlContent = `<p><strong>${data.username}</strong> subscribed to your community: <strong>${data.community}</strong>.</p>`;
            break;
        case 'follow':
            subject = 'Somebody followed you';
            text = `${data.username} followed you.`;
            htmlContent = `<p><strong>${data.username}</strong> followed you.</p>`;
            break;
        default:
            res.status(400).send('Invalid notification type');
            return;
    }

    // Generate HTML email content
    const html = generateEmailTemplate(htmlContent);

    // Define mail options
    const mailOptions = {
        from: {
            name: 'Oasis Social',
            address: process.env.user,
        },
        to: email,
        subject: subject,
        text: text,
        html: html,
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error sending email');
    }
});

app.listen(port, () => {
    console.log(`Notification server running at http://localhost:${port}`);
});
