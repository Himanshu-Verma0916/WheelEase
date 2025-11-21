// we put user data when user sign up or login using clerk
// with help of clerkweb hooks
const { Webhook } = require('svix');
const User = require('../models/userModel');
require('dotenv').config();
const axios = require('axios');

const clerkWebHooks = async (req, res) => {
    try {
        // create a svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body; // ✅ Clerk verified event
        console.log("🟢 Verified event:", type);
        console.log("data:", data);

        switch (type) {
            case "user.created":
                // create new user in database
                const newUser = {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address || `no-email-${data.id}@clerk.com`,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };
                await User.create(newUser);
                res.json({ success: true, message: "User created successfully" });
                break;

            case "user.deleted":
                // delete user from database
                await User.findOneAndDelete({ clerkId: data.id });
                res.json({ success: true, message: "User deleted successfully" });
                break;

            case "user.updated":
                // update user in database
                const updatedData = {
                    email: data.email_addresses?.[0]?.email_address || `no-email-${data.id}@clerk.com`,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };
                await User.findOneAndUpdate({ clerkId: data.id }, updatedData);
                res.json({ success: true, message: "User updated successfully" });
                break;

            default:
                res.json({ success: true, message: `Unhandled event type: ${type}` });
        }

    } catch (err) {
        console.log(err.message);
        res.json({ success: false, message: err.message });
    }
}

//  controller function for sending sos alert
// const sendSOS = async (req, res) => {
//     try {
//         const clerkId = req.user.clerkId;

//         const {message} =req.body;

//         if (!clerkId) {
//             return res.status(400).json({ error: "User ID required" });
//         }

//         // fetch the user details
//         const user = await User.findOne({clerkId});

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         // Example: store alert in DB (optional)
//         // or send SMS / email  
//         console.log("🚨 SOS Triggered by:", user.email);
//         console.log("Message:", message);

//         res.status(200).json({success: true, message: "SOS triggered successfully!"});

//     } catch (error) {
//         console.log("error sos",error.message);
//         res.status(500).json({success :false , message: error.message});
//     }
// };

// const sendSOS = async (req, res) => {
//   try {
//     const clerkId = req.user.clerkId;
//     const { message, location } = req.body;

//     if (!clerkId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // WhatsApp API variables
//     const waPhoneId = process.env.META_WA_PHONE_NUMBER_ID;
//     const waToken = process.env.META_WA_ACCESS_TOKEN;

//     const url = `https://graph.facebook.com/v22.0/${waPhoneId}/messages`;

//     const body = {
//       messaging_product: "whatsapp",
//       to: process.env.ADMIN_PHONE, // your real number with country code
//       type: "text",
//       text: {
//         body: `🚨 SOS ALERT 🚨\nMessage: ${message}\nLocation: Lat ${location.lat}, Lng ${location.lng}`
//       }
//     };

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${waToken}`,  // <<< IMPORTANT
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(body)
//     });

//     const data = await response.json();
//     console.log("WHO SENT TO META:", data);

//     if (data.error) {
//       return res.json({ success: false, error: data.error });
//     }

//     res.json({ success: true, message: "SOS sent successfully!" });

//   } catch (error) {
//     console.error("SOS backend error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const sendSOS = async (req, res) => {
  try {
    const clerkId = req.user.clerkId;

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { message, name, location } = req.body;

    const textMessage = `
🚨 *EMERGENCY SOS ALERT* 🚨
Name: ${name}
Message: ${message}

📍 *Location*
Latitude: ${location.lat}
Longitude: ${location.lng}

Please respond immediately!
    `;

    const whatsappURL = `https://graph.facebook.com/v22.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(whatsappURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.ADMIN_PHONE,
        type: "text",
        text: {
          body: textMessage
        }
      })
    });

    const data = await response.json();
    console.log("WHATSAPP API RESPONSE:", data);

    res.json({ success: true, message: "SOS sent successfully", data });

  } catch (error) {
    console.log("SOS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { clerkWebHooks, sendSOS };
