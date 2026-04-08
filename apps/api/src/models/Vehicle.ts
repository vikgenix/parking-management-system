import mongoose, { Schema } from "mongoose";

const VehicleSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plate_number: { type: String, required: true, unique: true },
    vehicle_type: { type: String, required: true },
    model: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
