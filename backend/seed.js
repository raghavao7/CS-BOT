/**
 * seed.js — Recreates the CS-BOT database from reference data.
 *
 * Run with:
 *   node seed.js
 *
 * Make sure your .env is populated with a valid MONGO_URI before running.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

/* ─────────────────────────────── Connection ─────────────────────────────── */
await mongoose.connect(process.env.MONGO_URI);
console.log("✅  Connected to MongoDB");

/* ─────────────────────────────── Schemas ─────────────────────────────────── */
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  orders: [
    {
      orderId: String,
      status: String,
      totalAmount: Number,
      paymentMethod: String,
      orderDate: Date,
      delivery: {
        address: String,
        pincode: String,
        expectedDeliveryDate: Date,
      },
      products: [
        {
          name: String,
          quantity: Number,
          price: Number,
          domain: {
            type: String,
            enum: ["E-commerce", "Travel", "Telecommunications", "Banking Services"],
            required: true,
          },
        },
      ],
    },
  ],
});
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);

const caseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true },
  productIndex: { type: Number, required: true },
  description: { type: String, required: true },
  domain: {
    type: String,
    enum: ["E-commerce", "Travel", "Telecommunications", "Banking Services"],
    required: true,
  },
  priority: { type: String, default: "low", enum: ["high", "low"] },
  status: { type: String, default: "open", enum: ["open", "in-progress", "resolved"] },
  productChanges: { name: String, price: Number, quantity: Number },
  responses: [
    {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
caseSchema.index({ userId: 1, orderId: 1, productIndex: 1 }, { unique: true });
const Case = mongoose.model("Case", caseSchema);

const faqSchema = new mongoose.Schema({
  domain: {
    type: String,
    enum: ["E-commerce", "Travel", "Telecommunications", "Banking Services"],
    required: true,
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
});
const FAQ = mongoose.model("FAQ", faqSchema);

/* ──────────────────────────────── Wipe ──────────────────────────────────── */
console.log("\n🗑️   Dropping existing collections...");
await Promise.all([
  User.deleteMany({}),
  Case.deleteMany({}),
  FAQ.deleteMany({}),   // wipe stale FAQs — re-seeded via addFaq.js below
]);
console.log("   Collections cleared.");

/* ──────────────────────────────── Users ─────────────────────────────────── */
console.log("\n👤  Seeding users...");

// Passwords from the reference data (already bcrypt-hashed, we re-hash new ones
// to avoid key-strength issues; keeping original plain-text equivalents below).
// admin  → password: "Admin@123"   (matches original hash pattern)
// user   → password: "User@123"
const adminHash = await bcrypt.hash("Admin@123", 10);
const userHash  = await bcrypt.hash("User@123", 10);

const [adminUser, regularUser] = await User.insertMany([
  {
    // _id intentionally not forced — let Mongo generate a fresh one.
    name: "raghava",
    email: "aa@gmail.com",
    password: adminHash,
    role: "admin",
    orders: [],
  },
  {
    name: "vignesh",
    email: "aaa@gmail.com",
    password: userHash,
    role: "user",
    // Orders are embedded — matches reference data from the old "orders" collection
    // mapped to the current embedded schema.
    orders: [
      {
        orderId: "ORD001",
        status: "Delivered",
        totalAmount: 999.99,
        paymentMethod: "Credit Card",
        orderDate: new Date("2025-09-01T10:00:00Z"),
        delivery: {
          address: "123 Main Street, Chennai",
          pincode: "600001",
          expectedDeliveryDate: new Date("2025-09-10T10:00:00Z"),
        },
        products: [
          {
            name: "Laptop",
            quantity: 1,
            price: 999.99,
            domain: "E-commerce",
          },
        ],
      },
      {
        orderId: "ORD002",
        status: "Shipped",
        totalAmount: 1399.98,
        paymentMethod: "PayPal",
        orderDate: new Date("2025-09-15T14:30:00Z"),
        delivery: {
          address: "456 Park Avenue, Bangalore",
          pincode: "560001",
          expectedDeliveryDate: new Date("2025-09-25T10:00:00Z"),
        },
        products: [
          {
            name: "Smartphone",
            quantity: 2,
            price: 699.99,
            domain: "E-commerce",
          },
        ],
      },
      {
        orderId: "ORD003",
        status: "Processing",
        totalAmount: 449.97,
        paymentMethod: "Debit Card",
        orderDate: new Date("2025-10-01T09:00:00Z"),
        delivery: {
          address: "789 Lake Road, Hyderabad",
          pincode: "500001",
          expectedDeliveryDate: new Date("2025-10-12T10:00:00Z"),
        },
        products: [
          {
            name: "Headphones",
            quantity: 3,
            price: 149.99,
            domain: "E-commerce",
          },
        ],
      },
      {
        orderId: "ORD004",
        status: "Delivered",
        totalAmount: 89.99,
        paymentMethod: "Credit Card",
        orderDate: new Date("2025-08-20T16:45:00Z"),
        delivery: {
          address: "321 Hill Street, Mumbai",
          pincode: "400001",
          expectedDeliveryDate: new Date("2025-08-30T10:00:00Z"),
        },
        products: [
          {
            name: "Coffee Maker",
            quantity: 1,
            price: 89.99,
            domain: "E-commerce",
          },
        ],
      },
      {
        orderId: "ORD005",
        status: "Pending",
        totalAmount: 199.96,
        paymentMethod: "Cash on Delivery",
        orderDate: new Date("2025-10-05T12:15:00Z"),
        delivery: {
          address: "654 River Lane, Pune",
          pincode: "411001",
          expectedDeliveryDate: new Date("2025-10-18T10:00:00Z"),
        },
        products: [
          {
            name: "Backpack",
            quantity: 4,
            price: 49.99,
            domain: "E-commerce",
          },
        ],
      },
      // Travel domain orders (from reference ticket data)
      {
        orderId: "tick001",
        status: "Confirmed",
        totalAmount: 900,
        paymentMethod: "Debit Card",
        orderDate: new Date("2025-10-15T14:30:00Z"),
        delivery: {
          address: "London Heathrow Airport",
          pincode: "",
          expectedDeliveryDate: new Date("2025-11-01T08:00:00Z"),
        },
        products: [
          {
            name: "Flight to New York (Round-trip economy, London → New York)",
            quantity: 2,
            price: 450,
            domain: "Travel",
          },
        ],
      },
      {
        orderId: "tick002",
        status: "Confirmed",
        totalAmount: 120.5,
        paymentMethod: "PayPal",
        orderDate: new Date("2025-10-18T09:15:00Z"),
        delivery: {
          address: "London St. Pancras Station",
          pincode: "",
          expectedDeliveryDate: new Date("2025-11-05T07:00:00Z"),
        },
        products: [
          {
            name: "Train to Paris (Eurostar high-speed, London → Paris)",
            quantity: 1,
            price: 120.5,
            domain: "Travel",
          },
        ],
      },
    ],
  },
]);

console.log(`   ✓ Admin  : ${adminUser.email}  (password: Admin@123)`);
console.log(`   ✓ User   : ${regularUser.email}  (password: User@123)`);

/* ──────────────────────────────── Cases ─────────────────────────────────── */
console.log("\n📋  Seeding cases...");

const userId = regularUser._id;

const cases = await Case.insertMany([
  // ORD001 — Laptop delivered but broken (escalated, in-progress)
  {
    userId,
    orderId: "ORD001",
    productIndex: 0,
    description: "Laptop arrived broken/defective on delivery.",
    domain: "E-commerce",
    priority: "low",
    status: "in-progress",
    responses: [
      {
        adminId: adminUser._id,
        message:
          "Hi! I can see your laptop arrived damaged. We've created a replacement request. Please provide photos of the damage and we'll dispatch a new unit within 2 business days.",
        timestamp: new Date("2025-10-13T14:30:00Z"),
      },
    ],
    createdAt: new Date("2025-10-13T14:29:11Z"),
    updatedAt: new Date("2025-10-13T14:30:00Z"),
  },

  // ORD003 — Headphones, quantity reduction request (in-progress, escalated)
  {
    userId,
    orderId: "ORD003",
    productIndex: 0,
    description:
      "Customer wants to reduce quantity of headphones from 3 to 2 after placing order.",
    domain: "E-commerce",
    priority: "low",
    status: "in-progress",
    responses: [
      {
        adminId: adminUser._id,
        message:
          "Hello! I've processed your quantity reduction from 3 to 2 headphones. The adjusted total of $299.98 will be reflected on your invoice.",
        timestamp: new Date("2025-10-10T09:10:00Z"),
      },
    ],
    createdAt: new Date("2025-10-10T07:24:00Z"),
    updatedAt: new Date("2025-10-10T09:10:00Z"),
  },

  // ORD004 — Coffee Maker wrong item received
  {
    userId,
    orderId: "ORD004",
    productIndex: 0,
    description:
      "Customer received a C-pin charger instead of the Coffee Maker they ordered.",
    domain: "E-commerce",
    priority: "low",
    status: "open",
    responses: [],
    createdAt: new Date("2025-10-07T19:23:44Z"),
    updatedAt: new Date("2025-10-07T19:23:44Z"),
  },

  // ORD005 — Backpack damaged on delivery (escalated)
  {
    userId,
    orderId: "ORD005",
    productIndex: 0,
    description: "Customer received the backpack damaged / defective.",
    domain: "E-commerce",
    priority: "low",
    status: "in-progress",
    responses: [
      {
        adminId: adminUser._id,
        message:
          "Hi! I'm sorry to hear your backpack arrived damaged. Please share photos of the damage and we'll arrange a replacement or full refund within 3 business days.",
        timestamp: new Date("2025-10-13T14:35:00Z"),
      },
    ],
    createdAt: new Date("2025-10-13T14:23:10Z"),
    updatedAt: new Date("2025-10-13T14:35:00Z"),
  },
]);

console.log(`   ✓ Seeded ${cases.length} cases.`);

/* ─────────────────────────────── FAQs ──────────────────────────────────── */
// FAQs are NOT seeded here because each entry requires a Gemini embedding vector.
// Run the dedicated script AFTER this seed completes:
//
//   node addFaq.js
//
// That script generates proper embeddings for all 16 FAQ entries so that
// the FAQ similarity search (checkFaq) works correctly at runtime.
console.log("\n❓  FAQs skipped — run: node addFaq.js to embed & populate them.");

const faqs = []; // placeholder so the Done block below still shows the count
if (false) await FAQ.insertMany([
  // ── E-commerce ──────────────────────────────────────────────────────────
  {
    domain: "E-commerce",
    question: "How do I track my order?",
    answer:
      "You can track your order by visiting the 'My Orders' section in your account and clicking on the tracking link next to your order.",
  },
  {
    domain: "E-commerce",
    question: "What is the return policy?",
    answer:
      "We accept returns within 30 days of delivery. The item must be unused and in its original packaging. Visit our returns portal to initiate a return.",
  },
  {
    domain: "E-commerce",
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 5–7 business days. Express delivery (2–3 business days) is available at checkout for an additional fee.",
  },
  {
    domain: "E-commerce",
    question: "Can I cancel my order?",
    answer:
      "Orders can be cancelled within 1 hour of placing them. After that, please wait for delivery and use our return portal.",
  },
  {
    domain: "E-commerce",
    question: "How do I request a refund?",
    answer:
      "To request a refund, initiate a return through our returns portal. Once we receive and inspect the item, refunds are processed within 5–7 business days to your original payment method.",
  },
  {
    domain: "E-commerce",
    question: "What payment methods are accepted?",
    answer:
      "We accept Credit Cards, Debit Cards, PayPal, and Cash on Delivery (COD) for eligible orders.",
  },
  {
    domain: "E-commerce",
    question: "My item arrived damaged. What should I do?",
    answer:
      "We apologise for the inconvenience. Please take photos of the damaged item and contact our support team within 48 hours of delivery. We'll arrange a replacement or refund promptly.",
  },
  {
    domain: "E-commerce",
    question: "Can I change the quantity after placing an order?",
    answer:
      "Quantity changes are only possible within 1 hour of placing the order and before the item enters the processing stage. Contact our support team immediately.",
  },

  // ── Travel ───────────────────────────────────────────────────────────────
  {
    domain: "Travel",
    question: "How do I check my booking status?",
    answer:
      "Log in to your account and go to 'My Bookings' to see the current status of all your travel bookings.",
  },
  {
    domain: "Travel",
    question: "Can I cancel my flight booking?",
    answer:
      "Yes, cancellations are possible up to 24 hours before departure for a full refund. Cancellations within 24 hours may incur a fee depending on your fare type.",
  },
  {
    domain: "Travel",
    question: "How do I get my boarding pass?",
    answer:
      "You can download your boarding pass from the 'My Bookings' section in your account 24 hours before your flight, or check in online through the airline's website.",
  },
  {
    domain: "Travel",
    question: "What is the baggage allowance?",
    answer:
      "Economy class includes 23 kg checked baggage and 7 kg cabin baggage. Business class allows 32 kg checked and 12 kg cabin baggage.",
  },
  {
    domain: "Travel",
    question: "Can I change my travel date?",
    answer:
      "Date changes are allowed up to 48 hours before departure subject to fare difference and a change fee. Contact support or manage your booking online.",
  },

  // ── Telecommunications ───────────────────────────────────────────────────
  {
    domain: "Telecommunications",
    question: "How do I check my remaining data balance?",
    answer:
      "Dial *123# or log in to your account on the app/website to see your current data, call, and SMS balances.",
  },
  {
    domain: "Telecommunications",
    question: "My internet is not working. What should I do?",
    answer:
      "First, restart your device and toggle airplane mode on and off. If the issue persists, check for network outages in your area on our website, or contact support.",
  },
  {
    domain: "Telecommunications",
    question: "How do I activate international roaming?",
    answer:
      "Log in to your account, go to 'Add-ons', and select the international roaming pack that suits your destination. Activation takes up to 2 hours.",
  },
  {
    domain: "Telecommunications",
    question: "How do I upgrade my plan?",
    answer:
      "Go to 'My Plan' in your account dashboard, select 'Upgrade', and choose a new plan. The change takes effect from the next billing cycle unless you opt for an immediate upgrade.",
  },

  // ── Banking Services ─────────────────────────────────────────────────────
  {
    domain: "Banking Services",
    question: "How do I block my lost or stolen card?",
    answer:
      "You can block your card instantly by logging into your banking app, going to 'Card Services', and selecting 'Block Card'. Alternatively, call our 24/7 helpline.",
  },
  {
    domain: "Banking Services",
    question: "How do I dispute an unauthorised transaction?",
    answer:
      "Go to 'Transaction History' in your app, select the suspicious transaction, and tap 'Dispute'. Our fraud team will investigate within 5–7 business days.",
  },
  {
    domain: "Banking Services",
    question: "How long does an international transfer take?",
    answer:
      "International wire transfers typically take 1–3 business days depending on the destination country and intermediary banks.",
  },
  {
    domain: "Banking Services",
    question: "How do I reset my banking PIN?",
    answer:
      "Visit 'Settings → Security → Reset PIN' in your banking app. You'll need to verify your identity via OTP sent to your registered mobile number.",
  },
]);

console.log(`   ✓ Seeded ${faqs.length} FAQs.`);

/* ──────────────────────────────── Done ──────────────────────────────────── */
console.log("\n🎉  Seed complete!");
console.log("─────────────────────────────────────────────");
console.log("  Admin  login → aa@gmail.com  / Admin@123");
console.log("  User   login → aaa@gmail.com / User@123");
console.log("─────────────────────────────────────────────\n");

await mongoose.disconnect();
process.exit(0);
