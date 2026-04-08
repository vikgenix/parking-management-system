import mongoose, { Schema } from "mongoose";

const SlotSchema = new Schema(
  {
    floor_id: { type: Schema.Types.ObjectId, ref: "Floor", required: true },
    slot_code: { type: String, required: true },
    slot_type: {
      type: String,
      enum: ["standard", "compact", "handicapped", "ev_charging"],
      required: true,
      default: "standard",
    },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "inactive"],
      default: "available",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
