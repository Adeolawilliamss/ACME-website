const Message = require('../models/messageModel');

exports.saveMessage = async ({ sender, roomId, message }) => {
  try {
    const newMessage = await Message.create({ sender, roomId, message });
    return newMessage;
  } catch (err) {
    console.error('❌ Error saving message:', err);
  }
};

exports.getMessagesByRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
