const generateComplaintId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `CMP-${timestamp}-${randomStr}`.toUpperCase();
};

module.exports = { generateComplaintId };
