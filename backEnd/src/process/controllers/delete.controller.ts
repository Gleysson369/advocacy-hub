import { RequestHandler } from "express";
import { deleteService } from "../../process/services/delete.service";

export const deleteController: RequestHandler = async (req, res) => {
  try {
    const  id  = String (req.params.id)

    if (!id) {
      return res.status(400).json({ error: "Process ID is required." });
    }

    await deleteService(id);

    return res.status(200).json({
      message: "Process deleted successfully."
    });

  } catch (error: any) {
    return res.status(400).json({
      error: error.message || "Error deleting process."
    });
  }
};
