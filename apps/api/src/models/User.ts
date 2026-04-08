import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ["driver", "admin"],
      required: true,
      default: "driver",
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
