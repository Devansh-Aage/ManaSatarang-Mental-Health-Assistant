require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);
const url = process.env.BASE_URL;

router.post("/checkout", async (req, res) => {
  const { formstate } = req.body;
  console.log("Received Form State: ", formstate);  // Log the received form state

  const lineItems = [{
    price_data: {
      currency: "inr",
      product_data: {
        name: "Online Therapy Session",
      },
      unit_amount: parseInt(formstate.fee) * 100,  // Ensure this is an integer
    },
    quantity: 1,
  }];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${url}/success`,
      cancel_url: `${url}/`,
    });

    console.log("Session Created: ", session);  // Log the created session

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
