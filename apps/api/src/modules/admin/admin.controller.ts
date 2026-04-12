import type { RequestHandler } from "express";

import { IAdminService } from "@/modules/admin/admin.service";
import {
  createFloorSchema,
  createParkingLotSchema,
  createSlotSchema,
  idSchema,
} from "@/modules/admin/admin.schemas";
import { CREATED, OK } from "@/constants/httpStatusCodes";

class AdminController {
  public constructor(private adminServce: IAdminService) {}

  public getUsers: RequestHandler = async (_req, res) => {
    const users = await this.adminServce.handleGetUsers();
    res.json({ users });
  };

  public getDashboardStats: RequestHandler = async (_req, res) => {
    const stats = await this.adminServce.handleGetDashboardStats();
    res.json({ stats });
  };

  public getRecentBookings: RequestHandler = async (req, res) => {
    const limit = Number(req.query["limit"]) || 10;
    const bookings = await this.adminServce.handleGetRecentBookings(limit);
    res.json({ bookings });
  };

  public createFloor: RequestHandler = async (req, res) => {
    const { name } = createFloorSchema.parse(req.body);

    const newFloor = await this.adminServce.handleCreateFloor({ name });

    res
      .status(CREATED)
      .json({ floor: newFloor, message: "Created new floor successfully" });
  };

  public deleteFloor: RequestHandler = async (req, res) => {
    const { id } = idSchema.parse(req.body);

    await this.adminServce.handleDeleteFloor(id);

    res.status(OK).json({ message: "Deleted floor successfully" });
  };

  public createSlot: RequestHandler = async (req, res) => {
    const { slotCode, slotType, status, floorId } = createSlotSchema.parse(
      req.body,
    );

    const newSlot = await this.adminServce.handleCreateSlot({
      slotCode,
      slotType,
      status,
      floorId,
    });

    res
      .status(CREATED)
      .json({ slot: newSlot, message: "Created new slot successfully" });
  };

  public deleteSlot: RequestHandler = async (req, res) => {
    const { id } = idSchema.parse(req.body);

    await this.adminServce.handleDeleteSlot(id);

    res.status(OK).json({ message: "Deleted slot successfully" });
  };

  public createParkingLot: RequestHandler = async (req, res) => {
    const { name, address } = createParkingLotSchema.parse(req.body);

    const newParkingLot = await this.adminServce.handleCreateParkingLot({
      name,
      address,
    });

    res.status(CREATED).json({
      parkingLot: newParkingLot,
      message: "Created new parking lot successfully",
    });
  };

  public deleteParkingLot: RequestHandler = async (req, res) => {
    const { id } = idSchema.parse(req.body);

    await this.adminServce.handleDeleteParkingLot(id);

    res.status(OK).json({ message: "Deleted slot successfully" });
  };
}

export default AdminController;
