import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    stripe_payment_id: { type: String, required: false },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paid_at: { type: Date, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
