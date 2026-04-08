import mongoose, { Schema } from "mongoose";

const ParkingLotSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    price_per_hour: { type: Number, required: true },
    total_floors: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.ParkingLot ||
  mongoose.model("ParkingLot", ParkingLotSchema);
