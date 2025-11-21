// we put user data when user sign up or login using clerk
// with help of clerkweb hooks
const { Webhook} = require('svix');
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

const sendSOS = async (req, res) => {
    try {
        const clerkId = req.user.clerkId;
        const { message, lat, lng } = req.body;

        if (!clerkId) {
            return res.status(400).json({ error: "User ID required" });
        }

        // fetch the user details
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("🚨 SOS Triggered by:", user.email);

        // -----------------------------
        //  WHATSAPP CLOUD API MESSAGE
        // -----------------------------
        const fullMessage = 
`🚨 *SOS ALERT* 🚨

User: ${user.firstName || "Unknown"} ${user.lastName || ""}
Email: ${user.email}
Message: ${message}

Location:
https://www.google.com/maps?q=${lat},${lng}

Please respond immediately!`;

        await axios.post(
            `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: process.env.SOS_RECEIVER_NUMBER,
                type: "text",
                text: { body: fullMessage }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "🚨 SOS sent via WhatsApp successfully!"
        });

    } catch (error) {
        console.log("WhatsApp SOS Error:", error.response?.data || error.message);

        res.status(500).json({
            success: false,
            message: "Failed to send SOS",
            error: error.response?.data || error.message
        });
    }
};

module.exports ={clerkWebHooks,sendSOS };
