import CustomDemand from '../models/CustomDemand.js';

export const createDemand = async (req, res) => {
  try {
    const demand = new CustomDemand(req.body);
    await demand.save();
    res.status(201).json({ success: true, data: demand });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllDemands = async (req, res) => {
  try {
    const demands = await CustomDemand.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: demands });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDemandStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const demand = await CustomDemand.findByIdAndUpdate(id, { status }, { new: true });
    if (!demand) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: demand });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDemand = async (req, res) => {
  try {
    const { id } = req.params;
    await CustomDemand.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
