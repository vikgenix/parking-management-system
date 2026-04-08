import mongoose, { Schema } from "mongoose";

const FloorSchema = new Schema(
  {
    lot_id: { type: Schema.Types.ObjectId, ref: "ParkingLot", required: true },
    floor_number: { type: Number, required: true },
    label: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.Floor || mongoose.model("Floor", FloorSchema);
