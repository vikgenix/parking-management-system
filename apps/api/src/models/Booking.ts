import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slot_id: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    vehicle_id: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "expired",
      ],
      default: "pending",
    },
    total_amount: { type: Number, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
