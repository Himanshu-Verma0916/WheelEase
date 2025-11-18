// we put user data when user sign up or login using clerk
// with help of clerkweb hooks
const { Webhook, messageInRaw } = require('svix');
const User = require('../models/userModel');

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

module.exports ={clerkWebHooks};

